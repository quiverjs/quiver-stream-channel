build: src
	babel --presets 'quiver-babel/node-preset' --out-dir out src

test: build
	node out/test

.PHONY: build test
