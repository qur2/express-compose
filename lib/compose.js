var _ = require('underscore');
var exports = module.exports = {};
exports.version = '0.0.2';

// Wraps a response in a object providing repeat and decorate methods.
// Wrapping allows to cleanly separate options of the module from the
// rendering options.
function wrap(res, options) {
	var defaults = _.extend({
		compose: 'content'
	}, options);

	return {
		repeat: function(template, opts, fn) {
			repeat(res, template, opts, fn);
		},

		decorate: function(templates, opts, fn) {
			opts = _.extend({}, defaults, opts);
			decorate(res, templates, opts, fn);
		},

		render: function(template, opts, fn) {
			// Make sure the original opts array is not broken when
			// extending it.
			opts = _.defaults(_.clone(opts), defaults);
			render(res, template, opts, fn);
		}
	};
}

// Combines repeat and decorate in order, if needed.
// The action of this method depends wether template and options parameters
// are arrays or not.
function render(res, template, options, fn) {
	var needRepeat = _.isArray(options);
	var needDecorate = _.isArray(template);
	if (needRepeat && needDecorate) {
		var repeatTpl = _.first(template);
		var decorateTpl = _.tail(template);
		var compose = options.compose || 'content';
		repeat(res, repeatTpl, options, function(err, rendered) {
			var opts = {};
			opts[compose] = rendered;
			decorate(res, decorateTpl, opts, fn);
		});
	} else if (needRepeat) {
		repeat(res, template, options, fn);
	} else {
		decorate(res, template, options, fn);
	}
}

// Renders a view multiple times, as long as options are available, and concatenates
// the results.
function repeat(res, template, options, fn) {
	var next = _.bind(res.req.next, res.req),
		render = _.bind(res.render, res),
		buff = [];

	var nextCallback = function() {
		var opts = options.length ? options.shift() : false;
		return function(err, rendered) {
			if (err) return next(err);
			buff.push(rendered);
			if (opts)
				render(template, opts, nextCallback());
			else {
				var content = buff.join('');
				fn ? fn(null, content) : res.send(content);
			}
		};
	};

	_.isArray(options) || (options = [options]);
	var opts = options.shift();
	var callback = nextCallback();
	render(template, opts, callback);
}

// Decorate a view recursively. It passes the rendered stuff to the next template
// along with the original options until no templates are available.
function decorate(res, templates, opts, fn) {
	var next = _.bind(res.req.next, res.req),
		render = _.bind(res.render, res),
		compose = opts.compose || 'content';

	var nextCallback = function() {
		if (!templates.length)
			return fn;
		var template = templates.shift();
		return function(err, rendered) {
			if (err) return next(err);
			var updatedOpts = _.clone(opts);
			updatedOpts[compose] = rendered;
			render(template, updatedOpts, nextCallback());
		};
	};

	_.isArray(templates) || (templates = [templates]);
	var template = templates.shift();
	var callback = nextCallback();
	render(template, opts, callback);
}

_.extend(exports, {
	repeat: repeat,
	decorate: decorate,
	render: render,
	wrap: wrap
});
