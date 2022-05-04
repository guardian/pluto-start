.PHONY: menuvalidator bundle.js build

all: menuvalidator bundle.js build

menuvalidator:
	make -C menuvalidator

bundle.js: package.json
	yarn && yarn devbuild

build: menuvalidator bundle.js
	make -C build

clean:
	make -C menuvalidator clean
	make -C build clean

distclean: clean
	rm -rf node_modules
