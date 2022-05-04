.PHONY: menuvalidator bundle.js build localrestart

all: menuvalidator bundle.js build

localdeploy: menuvalidator bundle.js build localrestart

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

localrestart: build
	kubectl delete pod $(kubectl get pods | grep pluto-start | awk '{print $1}')
