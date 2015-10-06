build: src
	babel src --out-dir out

test: build
	node out/test

.PHONY: build test
