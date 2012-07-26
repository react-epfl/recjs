
REPORTER = dot

all: build-recoms test-recoms

build-recoms:
	@cd ./node_modules/recoms; node-gyp configure build
test-recoms:
	@NODE_ENV=test ./node_modules/.bin/mocha ./node_modules/recoms/test

check: test

test: test-unit test-acceptance

test-unit: test-unit-client test-unit-server

test-unit-client:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--recursive \
		--globals jQuery,window,document,location,navigator \
		--bail \
		test/unit-client

test-unit-server:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--recursive \
		--ignore-leaks \
		--bail \
		test/unit-server

test-acceptance:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--bail \
		test/acceptance/*.js

test-cov: lib-cov
	@EXPRESS_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

docclean:
	rm -fr docs

benchmark:
	@./support/bench

.PHONY: docs docclean test test-unit test-acceptance benchmark

# --growl
#
#test: test-unit

#test-all: test-bdd test-tdd test-qunit test-exports test-unit test-grep test-jsapi test-compilers

#test-jsapi:
	#@node test/jsapi

#test-unit:
	#@./bin/mocha \
		#--reporter $(REPORTER) \
		#test/acceptance/*.js \
		#test/*.js

#test-compilers:
	#@./bin/mocha \
		#--reporter $(REPORTER) \
		#--compilers coffee:coffee-script,foo:./test/compiler/foo \
		#test/acceptance/test.coffee \
		#test/acceptance/test.foo
