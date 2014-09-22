all: build test

build:
	node_modules/.bin/traceur --dir lib es5/lib --modules commonjs
	node_modules/.bin/traceur --dir test es5/test --modules commonjs

test: build
	@NODE_ENV=test ./node_modules/.bin/mocha es5/test;

.PHONY: build test
