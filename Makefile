all: build test

build:
	./node_modules/.bin/gulp

test: build
	@NODE_ENV=test ./node_modules/.bin/mocha es5/test;

.PHONY: build test
