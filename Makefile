TRACEUR_FLAGS=--modules commonjs --generators parse --block-binding parse

build: src
	traceur --dir src/ out/ $(TRACEUR_FLAGS)

unit-test: build
	mocha out/test

.PHONY: build build-lib build-test test