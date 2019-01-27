FILES=$(filter-out webgl-util.js, $(wildcard *.js))

webgl-util.js: $(FILES)
	echo "'use strict';" > $@
	cat $^ >> $@

.PHONY: clean
clean:
	rm webgl-util.js

