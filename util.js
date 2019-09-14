// Various utilities that don't really fit anywhere else

// Parse the hex string to RGB values in [0, 255]
var hexToRGB = function(hex) {
    var val = parseInt(hex.substr(1), 16);
    var r = (val >> 16) & 255;
    var g = (val >> 8) & 255;
    var b = val & 255;
    return [r, g, b];
}

// Parse the hex string to RGB values in [0, 1]
var hexToRGBf = function(hex) {
    var c = hexToRGB(hex);
    return [c[0] / 255.0, c[1] / 255.0, c[2] / 255.0];
}

