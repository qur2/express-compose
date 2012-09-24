# express-compose

Engine agnostic view rendering helpers for express. [![Build Status](https://secure.travis-ci.org/qur2/express-compose.png)](http://travis-ci.org/qur2/express-compose)


## Why?

This module helps you to keep your templates simple by allowing to repeat and decorate them. It will avoid useless templates that are basically just a loop. It will also help to cleanly cut your design in separate and reusable templates.
* If you want to print a list of items, only one template is needed: the template of a single item.
* If you want to decorate, say, a user profile in a box, reuse your user template and decorate it with your box layout.

Those features are part of the **engine** instead of your template. Plus, everything is achieved using render callbacks. This module offers handy helpers for native express features.


## I'm convinced, how do I install it?

Easily:
```bash
npm install express-compose
```


## How to use it?

There are two ways of using it:
* Call the methods directly from the module. They have almost the same signature than the express `render()` method: they're fed with a route result as an extra parameter in first position.
* Wrap the route result using the `wrap()` method. Then the object provide the same methods and preserve the signature of the original express `render()` method.


```js
// mandatory step: require the module
var compose = require('express-compose');

// simple way: pass the result when calling the helper
compose.repeat(res, template, options, callback);

// elegant way: wrap the result and use with the original signature
compose.wrap(res).repeat(template, options, callback);
```

The interest of the elegant way is that you can provide some options to the wrapper itself. Then the usage is:

```js
compose.wrap(res, wrapOptions).repeat(template, viewOptions, callback);
```


## What helpers are available?

As of version 0.0.2, the module provides 3 helpers:
* `repeat()` allows easy repetition of a template.
* `decorate()` allows easy decoration of a template.
* `render()` combine both: template repetition and result decoration.


### Repeat

It's similar to rendering, the difference being that instead of providing a option hash, you provide an array of hashes. The view will be rendered for each hash and the results will be concatenated.

```js
// ...
// setup of the app, some paths and rendering engine
// ...
var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
app.use(function(req, res) {
  compose.wrap(res).repeat('views/user', users);
});
```


### Decorate

It's similar to rendering, the difference being that instead of providing a single template, you provide an array of them. The first template will be rendered, passed along with original options to the second one, which in turn will be ... until all templates are rendered.

```js
// ...
// setup of the app, some paths and rendering engine
// ...
var user = { name: 'tobi' };
app.use(function(req, res) {
  compose.wrap(res).decorate(['views/user', 'views/box'], user);
});

// The `box` template gets the following object:
{ name: 'tobi', content: res.render('view/user', user) }
```

Propagation of the original options to outer templates is very handy: It makes dead easy to set a title in a layout using the user properties, for example.

And if you don't like the default key name, you can change it when wrapping the result:

```js
// ...
// setup of the app, some paths and rendering engine
// ...
var user = { name: 'tobi' };
app.use(function(req, res) {
  compose.wrap(res, { compose: 'rendered' }).decorate(['views/user', 'views/box'], user);
});

// The `box` template now gets the following object, with the customized key:
{ name: 'tobi', rendered: res.render('view/user', user) }
```


### Render

Render combine both repeat and decorate helpers:

```js
// ...
// setup of the app, some paths and rendering engine
// ...
var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
app.use(function(req, res) {
  compose.wrap(res).decorate(['views/user', 'views/box'], users);
});

// The `box` template now gets the following object:
{
  name: 'tobi',
  content: res.render('view/user', { name: 'tobi' })
           + res.render('view/user', { name: 'paul' })
           + res.render('view/user', { name: 'aure' })
}
```


## Running tests

Install jscoverage by following the instructions on https://github.com/visionmedia/node-jscoverage and install dev deps:

```bash
npm install -d
```

Run the tests:

```bash
make test
```


## License 

(The MIT License)

Copyright (c) 2012 Aurélien Scoubeau

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
