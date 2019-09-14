FILES=$(filter-out webgl-util.js webgl-util.min.js, $(wildcard *.js))

all: webgl-util.min.js

webgl-util.js: $(FILES)
	echo "'use strict';" > $@
	cat $^ >> $@

webgl-util.min.js: webgl-util.js
	minify $^ -o $@

.PHONY: clean
clean:
	rm webgl-util.js webgl-util.min.js

