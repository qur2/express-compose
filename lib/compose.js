if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore'], function(_) {
	var exports = {};

	// Wraps a response in a object providing repeat and decorate methods.
	// Wrapping allows to cleanly separate options of the module from the
	// rendering options.
	var wrap = function(res, options) {
		return {
			repeat: function(template, opts, fn) {
				repeat(res, template, opts, fn);
			},

			decorate: function(templates, opts, fn) {
				var defaults = _.extend({
					compose: 'content',
					callback: false
				}, options);
				opts = _.extend({}, defaults, opts);
				decorate(res, templates, opts, fn);
			}
		};
	};

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

	return {
		repeat: repeat,
		decorate: decorate,
		wrap: wrap
	};
});
