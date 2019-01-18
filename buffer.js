'use strict';

var Buffer = function(capacity, dtype) {
	this.len = 0;
	this.capacity = capacity;
	if (dtype == "uint8") {
		this.buffer = new Uint8Array(capacity);
	} else if (dtype == "uint16") {
		this.buffer = new Uint16Array(capacity);
	}
}

Buffer.prototype.append = function(buf) {
	if (this.len + buf.byteLength >= this.capacity) {
		var newCap = Math.floor(this.capacity * 1.5);
		var tmp = new (this.buffer.constructor)(newCap);
		tmp.set(this.buffer);

		this.capacity = newCap;
		this.buffer = tmp;
	}
	this.buffer.set(buf, this.len);
	this.len += buf.length;
}

Buffer.prototype.clear = function(buf) {
	this.len = 0;
}

