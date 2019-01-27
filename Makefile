FILES=$(filter-out webgl-util.js, $(wildcard *.js))

webgl-util.js: $(FILES)
	cat $^ > $@

.PHONY: clean
clean:
	rm webgl-util.js

