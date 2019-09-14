/* The arcball camera will be placed at the position 'eye', rotating
 * around the point 'center', with the up vector 'up'. 'screenDims'
 * should be the dimensions of the canvas or region taking mouse input
 * so the mouse positions can be normalized into [-1, 1] from the pixel
 * coordinates.
 */
var ArcballCamera = function(eye, center, up, zoomSpeed, screenDims) {
    var veye = vec3.set(vec3.create(), eye[0], eye[1], eye[2]);
    var vcenter = vec3.set(vec3.create(), center[0], center[1], center[2]);
    var vup = vec3.set(vec3.create(), up[0], up[1], up[2]);
    vec3.normalize(vup, vup);

    var zAxis = vec3.sub(vec3.create(), vcenter, veye);
    var viewDist = vec3.len(zAxis);
    vec3.normalize(zAxis, zAxis);

    var xAxis = vec3.cross(vec3.create(), zAxis, vup);
    vec3.normalize(xAxis, xAxis);

    var yAxis = vec3.cross(vec3.create(), xAxis, zAxis);
    vec3.normalize(yAxis, yAxis);

    vec3.cross(xAxis, zAxis, yAxis);
    vec3.normalize(xAxis, xAxis);

    this.zoomSpeed = zoomSpeed;
    this.invScreen = [1.0 / screenDims[0], 1.0 / screenDims[1]];

    this.centerTranslation = mat4.fromTranslation(mat4.create(), center);
    mat4.invert(this.centerTranslation, this.centerTranslation);

    var vt = vec3.set(vec3.create(), 0, 0, -1.0 * viewDist);
    this.translation = mat4.fromTranslation(mat4.create(), vt);

    var rotMat = mat3.fromValues(xAxis[0], xAxis[1], xAxis[2],
        yAxis[0], yAxis[1], yAxis[2],
        -zAxis[0], -zAxis[1], -zAxis[2]);
    mat3.transpose(rotMat, rotMat);
    this.rotation = quat.fromMat3(quat.create(), rotMat);
    quat.normalize(this.rotation, this.rotation);

    this.camera = mat4.create();
    this.invCamera = mat4.create();
    this.updateCameraMatrix();
}

ArcballCamera.prototype.rotate = function(prevMouse, curMouse) {
    var mPrev = vec2.set(vec2.create(),
        clamp(prevMouse[0] * 2.0 * this.invScreen[0] - 1.0, -1.0, 1.0),
        clamp(1.0 - prevMouse[1] * 2.0 * this.invScreen[1], -1.0, 1.0));

    var mCur = vec2.set(vec2.create(),
        clamp(curMouse[0] * 2.0 * this.invScreen[0] - 1.0, -1.0, 1.0),
        clamp(1.0 - curMouse[1] * 2.0 * this.invScreen[1], -1.0, 1.0));

    var mPrevBall = screenToArcball(mPrev);
    var mCurBall = screenToArcball(mCur);
    // rotation = curBall * prevBall * rotation
    this.rotation = quat.mul(this.rotation, mPrevBall, this.rotation);
    this.rotation = quat.mul(this.rotation, mCurBall, this.rotation);

    this.updateCameraMatrix();
}

ArcballCamera.prototype.zoom = function(amount) {
    var vt = vec3.set(vec3.create(), 0.0, 0.0, amount * this.invScreen[1] * this.zoomSpeed);
    var t = mat4.fromTranslation(mat4.create(), vt);
    this.translation = mat4.mul(this.translation, t, this.translation);
    if (this.translation[14] >= -0.2) {
        this.translation[14] = -0.2;
    }
    this.updateCameraMatrix();
}

ArcballCamera.prototype.pan = function(mouseDelta) {
    var delta = vec4.set(vec4.create(), mouseDelta[0] * this.invScreen[0] * Math.abs(this.translation[14]),
        mouseDelta[1] * this.invScreen[1] * Math.abs(this.translation[14]), 0, 0);
    var worldDelta = vec4.transformMat4(vec4.create(), delta, this.invCamera);
    var translation = mat4.fromTranslation(mat4.create(), worldDelta);
    this.centerTranslation = mat4.mul(this.centerTranslation, translation, this.centerTranslation);
    this.updateCameraMatrix();
}

ArcballCamera.prototype.updateCameraMatrix = function() {
    // camera = translation * rotation * centerTranslation
    var rotMat = mat4.fromQuat(mat4.create(), this.rotation);
    this.camera = mat4.mul(this.camera, rotMat, this.centerTranslation);
    this.camera = mat4.mul(this.camera, this.translation, this.camera);
    this.invCamera = mat4.invert(this.invCamera, this.camera);
}

ArcballCamera.prototype.eyePos = function() {
    return [camera.invCamera[12], camera.invCamera[13], camera.invCamera[14]];
}

ArcballCamera.prototype.eyeDir = function() {
    var dir = vec4.set(vec4.create(), 0.0, 0.0, -1.0, 0.0);
    dir = vec4.transformMat4(dir, dir, this.invCamera);
    dir = vec4.normalize(dir, dir);
    return [dir[0], dir[1], dir[2]];
}

ArcballCamera.prototype.upDir = function() {
    var dir = vec4.set(vec4.create(), 0.0, 1.0, 0.0, 0.0);
    dir = vec4.transformMat4(dir, dir, this.invCamera);
    dir = vec4.normalize(dir, dir);
    return [dir[0], dir[1], dir[2]];
}

var screenToArcball = function(p) {
    var dist = vec2.dot(p, p);
    if (dist <= 1.0) {
        return quat.set(quat.create(), p[0], p[1], Math.sqrt(1.0 - dist), 0);
    } else {
        var unitP = vec2.normalize(vec2.create(), p);
        // cgmath is w, x, y, z
        // glmatrix is x, y, z, w
        return quat.set(quat.create(), unitP[0], unitP[1], 0, 0);
    }
}
var clamp = function(a, min, max) {
    return a < min ? min : a > max ? max : a;
}

var pointDist = function(a, b) {
    var v = [b[0] - a[0], b[1] - a[1]];
    return Math.sqrt(Math.pow(v[0], 2.0) + Math.pow(v[1], 2.0));
}

