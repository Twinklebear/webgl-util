// Compute the view frustum in world space from the provided
// column major projection * view matrix
var Frustum = function(projView) {
    var rows = [vec4.create(), vec4.create(), vec4.create(), vec4.create()];
    for (var i = 0; i < rows.length; ++i) {
        rows[i] = vec4.set(rows[i], projView[i], projView[4 + i],
            projView[8 + i], projView[12 + i]);
    }

    this.planes = [
        // -x plane
        vec4.add(vec4.create(), rows[3], rows[0]),
        // +x plane
        vec4.sub(vec4.create(), rows[3], rows[0]),
        // -y plane
        vec4.add(vec4.create(), rows[3], rows[1]),
        // +y plane
        vec4.sub(vec4.create(), rows[3], rows[1]),
        // -z plane
        vec4.add(vec4.create(), rows[3], rows[2]),
        // +z plane
        vec4.sub(vec4.create(), rows[3], rows[2])
    ];

    // Normalize the planes
    for (var i = 0; i < this.planes.length; ++i) {
        var s = 1.0 / Math.sqrt(this.planes[i][0] * this.planes[i][0] +
            this.planes[i][1] * this.planes[i][1] + this.planes[i][2] * this.planes[i][2]);
        this.planes[i][0] *= s;
        this.planes[i][1] *= s;
        this.planes[i][2] *= s;
        this.planes[i][3] *= s;
    }

    // Compute the frustum points as well
    var invProjView = mat4.invert(mat4.create(), projView);
    this.points = [
        // x_l, y_l, z_l
        vec4.set(vec4.create(), -1, -1, -1, 1),
        // x_h, y_l, z_l
        vec4.set(vec4.create(), 1, -1, -1, 1),
        // x_l, y_h, z_l
        vec4.set(vec4.create(), -1, 1, -1, 1),
        // x_h, y_h, z_l
        vec4.set(vec4.create(), 1, 1, -1, 1),
        // x_l, y_l, z_h
        vec4.set(vec4.create(), -1, -1, 1, 1),
        // x_h, y_l, z_h
        vec4.set(vec4.create(), 1, -1, 1, 1),
        // x_l, y_h, z_h
        vec4.set(vec4.create(), -1, 1, 1, 1),
        // x_h, y_h, z_h
        vec4.set(vec4.create(), 1, 1, 1, 1)
    ];
    for (var i = 0; i < 8; ++i) {
        this.points[i] = vec4.transformMat4(this.points[i], this.points[i], invProjView);
        this.points[i][0] /= this.points[i][3];
        this.points[i][1] /= this.points[i][3];
        this.points[i][2] /= this.points[i][3];
        this.points[i][3] = 1.0;
    }
}

// Check if the box is contained in the Frustum
// The box should be [x_lower, y_lower, z_lower, x_upper, y_upper, z_upper]
// This is done using Inigo Quilez's approach to help with large
// bounds: https://www.iquilezles.org/www/articles/frustumcorrect/frustumcorrect.htm
Frustum.prototype.containsBox = function(box) {
    // Test the box against each plane
    var vec = vec4.create();
    var out = 0;
    for (var i = 0; i < this.planes.length; ++i) {
        out = 0;
        // x_l, y_l, z_l
        vec4.set(vec, box[0], box[1], box[2], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;
        // x_h, y_l, z_l
        vec4.set(vec, box[3], box[1], box[2], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;
        // x_l, y_h, z_l
        vec4.set(vec, box[0], box[4], box[2], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;
        // x_h, y_h, z_l
        vec4.set(vec, box[3], box[4], box[2], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;
        // x_l, y_l, z_h
        vec4.set(vec, box[0], box[1], box[5], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;
        // x_h, y_l, z_h
        vec4.set(vec, box[3], box[1], box[5], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;
        // x_l, y_h, z_h
        vec4.set(vec, box[0], box[4], box[5], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;
        // x_h, y_h, z_h
        vec4.set(vec, box[3], box[4], box[5], 1.0);
        out += vec4.dot(this.planes[i], vec) < 0.0 ? 1 : 0;

        if (out == 8) {
            return false;
        }
    }

    // Test the frustum against the box
    out = 0;
    for (var i = 0; i < 8; ++i) {
        out += this.points[i][0] > box[3] ? 1 : 0;
    }
    if (out == 8) {
        return false;
    }

    out = 0;
    for (var i = 0; i < 8; ++i) {
        out += this.points[i][0] < box[0] ? 1 : 0;
    }
    if (out == 8) {
        return false;
    }

    out = 0;
    for (var i = 0; i < 8; ++i) {
        out += this.points[i][1] > box[4] ? 1 : 0;
    }
    if (out == 8) {
        return false;
    }

    out = 0;
    for (var i = 0; i < 8; ++i) {
        out += this.points[i][1] < box[1] ? 1 : 0;
    }
    if (out == 8) {
        return false;
    }

    out = 0;
    for (var i = 0; i < 8; ++i) {
        out += this.points[i][2] > box[5] ? 1 : 0;
    }
    if (out == 8) {
        return false;
    }

    out = 0;
    for (var i = 0; i < 8; ++i) {
        out += this.points[i][2] < box[2] ? 1 : 0;
    }
    if (out == 8) {
        return false;
    }
    return true;
}


