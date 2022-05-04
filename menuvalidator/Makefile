all: menu-validator

menu-validator: main.go
	GOOS=linux CGO_ENABLED=0 go build
	cp menu-validator ../build

clean:
	rm -f menu-validator
