var Vector = require('./vector.js');
var CartesianRect = require('./cartesian.js');


var unscaleStrokeAndFill = function (ctx) {
    var stroke = ctx.stroke;
    var fill = ctx.fill;
    ctx.stroke = function () {
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        stroke.call(ctx);
        ctx.restore();
    };
    ctx.fill = function () {
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        fill.call(ctx);
        ctx.restore();
    };
    return function () {
        ctx.stroke = stroke;
        ctx.fill = fill;
    };
};

var Rect = function (ctx, w, h, x, y) {
    this.ctx = ctx;
    this.x = Math.round(x || 0);
    this.y = Math.round(y || 0);
    this.w = Math.round(w);
    this.h = Math.round(h);
};

Rect.fromCanvas = function (canvasElement) {
    canvasElement.getContext('2d'),
    canvasElement.width,
    canvasElement.height
};
//return a new rect of given width and height,
//with it's top left corner at the given offset.
//relative to my top left corner.
Rect.prototype.rect = Vector.vectorizeArgs(function (d, o) {
    o = o || Vector.zero;
    o = o.add(this.x, this.y);
    return new Rect(this.ctx, d.x, d.y, o.x, o.y);
});

Rect.prototype.height = function (h) {
    return this.rect(this.w, h);
};

Rect.prototype.width = function (w) {
    return this.rect(w, this.h);
};

Rect.prototype.fill = function () {
    this.ctx.fillRect(this.x, this.y, this.w, this.h);
    return this;
};

Rect.prototype.mapDrawing = function (fn) {
    var ctx = this.ctx;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.translate(0.5, 0.5);
    var restoreStrokeAndFill = unscaleStrokeAndFill(ctx);
    fn(ctx, this.w, this.h);
    restoreStrokeAndFill();
    ctx.restore();
};

Rect.prototype.projectDrawing = function (fn, w, h, a) {

    w = w || this.w;
    h = h || this.h;
    a = a || 0;

    var self = this;
    var transform = function (ctx) {
        ctx.translate(self.w/2, self.h/2 );
        var A = a;
        while (A < 0) A += 2 * Math.PI;
        if (A > Math.PI) A = A - Math.PI;
        if (A > Math.PI / 2) A = Math.PI - A;
        ctx.scale(
            self.w / (self.w*Math.cos(A) + self.h * Math.sin(A)),
            self.h / (self.w*Math.sin(A) + self.h * Math.cos(A))
        );
        ctx.rotate(a);
        ctx.translate(-self.w/2, -self.h/2);
        ctx.scale(self.w/w, self.h/h);
    }

    this.mapDrawing(function (ctx) {
        transform(ctx);
        fn.call(null, ctx);
    });
};



Rect.prototype.hline = function (y, color) {
    if (color) this.ctx.strokeStyle = color;
    y = Math.round(y || 0);
    this.mapDrawing(function (ctx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.w, y);
        ctx.stroke();
    }.bind(this));
    return this;
};

Rect.prototype.vline = function (x, color) {
    if (color) this.ctx.strokeStyle = color;
    x = Math.round((x || 0));
    this.mapDrawing(function (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.h);
        ctx.stroke();
    }.bind(this));
    return this;
};
Rect.prototype.text = function (text) {
    this.ctx.fillText(text, this.x, this.y);
    return this;
}
Rect.prototype.cartesian = function (minx, maxx, miny, maxy) {
    return new CartesianRect(this, minx, maxx, miny, maxy);
};

Rect.prototype.offset = Vector.vectorizeArgs(function (o) {
    return this.rect(this.w, this.h, o.x, o.y);
});

Rect.prototype.rel = Vector.vectorizeArgs(function (steps) {
   return this.offset(steps.mul(this.w, this.h));
});

Rect.prototype.part = Vector.vectorizeArgs(function (d, o) {
    o = o || Vector.zero;
   return this.rect(d.mul(this.w, this.h), o.mul(this.w, this.h));
});
//return a new rect of given delta-width and offset
//relative current corner
Rect.prototype.delta  = Vector.vectorizeArgs(function (dd, o) {
    return this.rect(dd.add(this.w, this.h), o);
});


//return a rect with the edges altered in their
//respective directions
Rect.prototype.edges = function (l, t, r, b) {
    return this.delta(l + r, t + b, -l, -t);
};

//rect that is inset a certain number of pixels
//from each edge of the original.
Rect.prototype.inset = function (i) {
    return this.edges(-i, -i, -i, -i);
};
//rect that is outset a certain number of pixels
//from each edge of the original
Rect.prototype.outset = function (o) {
    return this.edges(o,o,o,o);
};

// return function that gets the rect
// of a canvas.
module.exports = Rect;
