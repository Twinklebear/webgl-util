// Various utilities that don't really fit anywhere else

var hexToRGB = function(hex) {
	var val = parseInt(hex.substr(1), 16);
	var r = (val >> 16) & 255;
	var g = (val >> 8) & 255;
	var b = val & 255;
	return [r, g, b];
}

// Append the typed arrays, will append b to a and
// return the new array. a and b must be the same type
// See: https://stackoverflow.com/questions/33702838/how-to-append-bytes-multi-bytes-and-buffer-to-arraybuffer-in-javascript
var appendTypedArray = function(a, b) {
	var c = new (a.constructor)(a.length + b.length);
	c.set(a, 0);
	c.set(b, a.length);
	return c;
}

