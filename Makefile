REPORTER = dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER)

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--watch

test-cov: lib-cov
	@COMPOSE_COV=1 $(MAKE) test REPORTER=html-cov > results/coverage.html
	@rm -rf lib-cov

lib-cov:
	@jscoverage lib lib-cov

.PHONY: test test-w test-cov
