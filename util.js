'use strict';

// Various utilities that don't really fit anywhere else

var hexToRGB = function(hex) {
	var val = parseInt(hex.substr(1), 16);
	var r = (val >> 16) & 255;
	var g = (val >> 8) & 255;
	var b = val & 255;
	return [r, g, b];
}

