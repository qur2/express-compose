var expect = require('chai').expect;
var request = require('supertest');
var express = require('express');
var compose = require(__dirname + '/../');

describe('compose', function() {
	var app;

	describe('is able to decorate', function() {
		beforeEach(function() {
			app = express();
			app.get('/');
		});

		it('a view', function(done) {
			var user = { name: 'tobi' };

			app.use(function(req, res) {
				compose.decorate(res, [
					__dirname + '/fixtures/user.jade',
					__dirname + '/fixtures/deco-simple.jade',
					__dirname + '/fixtures/deco-simple.jade'
				], user);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p><p>'+user.name+'</p></p></p>');
					done();
				});
		});

		it('with params propagation', function(done) {
			var user = { name: 'tobi' };
			app.use(function(req, res) {
				compose.decorate(res, [
					__dirname + '/fixtures/user.jade',
					__dirname + '/fixtures/deco-params.jade',
					__dirname + '/fixtures/deco-simple.jade'
				], user);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p><p>'+user.name+'</p>'+user.name+'</p></p>');
					done();
				});
		});

		it('with post-render callback', function(done) {
			var postRender = false;
			var user = { name: 'tobi' };
			app.use(function(req, res) {
				compose.decorate(res, [
					__dirname + '/fixtures/user.jade',
					__dirname + '/fixtures/deco-params.jade',
					__dirname + '/fixtures/deco-simple.jade'
				], user, function(err, str) {
					postRender = true;
					res.send(str);
				});
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(postRender).to.be.true;
					done();
				});
		});
	});

	describe('is able to repeat', function() {
		beforeEach(function() {
			app = express();
			app.get('/');
		});

		it('a view', function(done) {
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			app.use(function(req, res) {
				compose.repeat(res, __dirname + '/fixtures/user.jade', users);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p>tobi</p><p>paul</p><p>aure</p>');
					done();
				});
		});

		it('with post-render callback', function(done) {
			var postRender = false;
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			app.use(function(req, res) {
				compose.repeat(res, __dirname + '/fixtures/user.jade', users, function(err, str) {
					postRender = true;
					res.send(str);
				});
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p>tobi</p><p>paul</p><p>aure</p>');
					done();
				});
		});
	});

	describe('surcharges render', function() {
		beforeEach(function() {
			app = express();
			app.get('/');
		});

		it('with usual signature', function(done) {
			var user = { name: 'tobi' };
			var template = __dirname + '/fixtures/user.jade';
			app.use(function(req, res) {
				compose.render(res, template, user);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p>tobi</p>');
					done();
				});
		});

		it('with multiple options', function(done) {
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			var template = __dirname + '/fixtures/user.jade';
			app.use(function(req, res) {
				compose.render(res, template, users);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p>tobi</p><p>paul</p><p>aure</p>');
					done();
				});
		});

		it('with multiple templates', function(done) {
			var user = { name: 'tobi' };
			var templates = [
				__dirname + '/fixtures/user.jade',
				__dirname + '/fixtures/deco-simple.jade'
			];
			app.use(function(req, res) {
				compose.render(res, templates, user);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p>tobi</p></p>');
					done();
				});
		});

		it('with multiple templates and options', function(done) {
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			var templates = [
				__dirname + '/fixtures/user.jade',
				__dirname + '/fixtures/deco-simple.jade'
			];
			app.use(function(req, res) {
				compose.render(res, templates, users);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p>tobi</p><p>paul</p><p>aure</p></p>');
					done();
				});
		});

		it('with multiple templates and options and callback', function(done) {
			var postRender = false;
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			var templates = [
				__dirname + '/fixtures/user.jade',
				__dirname + '/fixtures/deco-simple.jade'
			];
			app.use(function(req, res) {
				compose.render(res, templates, users, function(err, rendered) {
					postRender = true;
					res.send(rendered);
				});
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p>tobi</p><p>paul</p><p>aure</p></p>');
					expect(postRender).to.be.true;
					done();
				});
		});
	});

	describe('wrapped resource', function() {
		beforeEach(function() {
			app = express();
			app.get('/');
		});


		it('decorates', function(done) {
			var user = { name: 'tobi' };
			var templates = [
				__dirname + '/fixtures/user.jade',
				__dirname + '/fixtures/deco-simple.jade',
				__dirname + '/fixtures/deco-simple.jade'
			];
			app.use(function(req, res) {
				compose.wrap(res).decorate(templates, user);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p><p>'+user.name+'</p></p></p>');
					done();
				});
		});

		it('decorates with post-render callback', function(done) {
			var postRender = false;
			var user = { name: 'tobi' };
			app.use(function(req, res) {
				compose.wrap(res).decorate([
					__dirname + '/fixtures/user.jade',
					__dirname + '/fixtures/deco-params.jade',
					__dirname + '/fixtures/deco-simple.jade'
				], user, function(err, str) {
					postRender = true;
					res.send(str);
				});
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(postRender).to.be.true;
					done();
				});
		});

		it('decorates with wrapping options', function(done) {
			var user = { name: 'tobi' };
			app.use(function(req, res) {
				compose.wrap(res, {compose: 'customKey'}).decorate([
					__dirname + '/fixtures/user.jade',
					__dirname + '/fixtures/deco-custom.jade'
				], user);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p>'+user.name+'</p></p>');
					done();
				});
		});

		it('repeats', function(done) {
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			app.use(function(req, res) {
				compose.wrap(res).repeat(__dirname + '/fixtures/user.jade', users);
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p>tobi</p><p>paul</p><p>aure</p>');
					done();
				});
		});

		it('repeats with post-render callback', function(done) {
			var postRender = false;
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			app.use(function(req, res) {
				compose.wrap(res).repeat(__dirname + '/fixtures/user.jade', users, function(err, str) {
					postRender = true;
					res.send(str);
				});
			});

			request(app)
				.get('/')
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p>tobi</p><p>paul</p><p>aure</p>');
					done();
				});
		});

		it('renders with wrapping options', function(done) {
			var postRender = false;
			var users = [{ name: 'tobi' }, { name: 'paul' }, { name: 'aure' }];
			var templates = [
				__dirname + '/fixtures/user.jade',
				__dirname + '/fixtures/deco-custom.jade'
			];
			app.use(function(req, res) {
				compose.wrap(res, {
					compose: 'customKey'
				}).render(templates, users, function(err, rendered) {
					postRender = true;
					res.send(rendered);
				});
			});

			request(app)
				.get('/')
				// .expect(200)
				.end(function(err, res) {
					if (err) throw err;
					expect(res.text).to.equal('<p><p>tobi</p><p>paul</p><p>aure</p></p>');
					expect(postRender).to.be.true;
					done();
				});
		});
	});
});
