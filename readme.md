# compose

Engine agnostic view rendering helpers for express.


## Installation

```bash
npm install express-compose
```


## How to use it?

There are two ways of using it. The simplest way is to call the methods `repeat()` and `decorate()`. They have almost the same signature than the express `render()` method: they're fed with a route result as an extra parameter in first position.

The second way is more elegant and preserves the express `render()` signature. It happens in two times: first the result is embedded in an object using the `wrap()` method. Then the object `repeat()` and `decorate()` methods can be used to achieve the same results.


```js
// madatory step: require the module
var compose = require('express-compose');

// simple way
compose.repeat(res, template, options, callback);

// elegant way
compose.wrap(res).repeat(template, options, callback);
```

The interest of the elegant way is that you can provide some options to the wrapper itself. Then the usage is:

```js
compose.wrap(res, wrapOptions).repeat(template, viewOptions, callback);
```


## How does repeat work?

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


## How does decorate work?

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


## Running tests

Install jscoverage:

```bash
# Something like
sudo apt-get install jscoverage
# or
brew install jscoverage
```
Install dev deps:

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
