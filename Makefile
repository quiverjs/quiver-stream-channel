TRACEUR_FLAGS=--modules commonjs --generators parse --block-binding parse

build: build-lib build-test

build-lib: lib
	traceur --dir lib out/lib $(TRACEUR_FLAGS)

build-test: test
	traceur --dir test out/test $(TRACEUR_FLAGS)

unit-test: build
	mocha out/test

.PHONY: build build-lib build-test test