var Vector = require('./vector.js');

var CartesianRect = function (rect, minx, maxx, miny, maxy) {
    this._o = new Vector(minx, miny);
    this._d = this._o.del(maxx, maxy);
    this._map = Vector.mapper(minx, miny, maxx, maxy, 0, rect.h, rect.w, 0);
    this._rect = rect;
    this.ctx = this._rect.ctx;
};
CartesianRect.prototype.context = function (key, val) {
    this._rect.context(key, val);
    return this;
}
CartesianRect.prototype.rect = Vector.vectorizeArgs(function (o, d) {
    o = o || this._o;
    d = o.add(d || this._d);
    var mo = this._map(o.x, d.y);
    return this._rect.rect(this._map(d.x, o.y).del(mo), mo);
});
CartesianRect.prototype.fill = function () {
    this._rect.fill();
    return this;
};
CartesianRect.prototype.hline = function (y) {
    this._rect.hline(this._map(0,y).y);
    return this;
};
CartesianRect.prototype.vline = function (x) {
    this._rect.vline(this._map(x, 0).x);
    return this;
};

CartesianRect.prototype.mapDrawing = function (fn) {
    var self = this,
        sx = this._rect.w/this._d.x,
        sy = -this._rect.h/this._d.y;
    this.pixelDraw(0,0, function (ctx) {
        ctx.save();
        ctx.translate(-0.5, -0.5);
        ctx.scale(sx, sy);
        fn(ctx, self._d.x, self._d.y);
        ctx.restore();
    });
    return this;
};

CartesianRect.prototype.pixelDraw = function (ox, oy, fn) {
    var o = this._map(ox, oy);
    this._rect.mapDrawing(function (ctx) {
        ctx.save();
        ctx.translate(o.x, o.y);
        fn(ctx);
        ctx.restore();
    });
    return this;
};

module.exports = CartesianRect;
