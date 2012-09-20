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

	describe('res-bound resource', function() {
		beforeEach(function() {
			app = express();
			app.get('/');
		});

		it('decorates', function(done) {
			var user = { name: 'tobi' };
			app.use(function(req, res) {
				compose.wrap(res).decorate([
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

		it('decorates with custom decoration key', function(done) {
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
	});
});
