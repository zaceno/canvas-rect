
var Vector = function (x, y) {
    if (!(this instanceof Vector)) {
        return new Vector(x, y);
    }
    this.x = x;
    this.y = y;
};

Vector.vectorizeArgs  = (function () {
    var pairArgs = function () {
        var i = 0, args = [];
        if (arguments[0] instanceof Vector){
            return arguments;
        }
        while (i < arguments.length - 1) {
            args.push(new Vector(arguments[i++], arguments[i++]));
        }
        return args;
    };
    return function (fn) {
        return function () {
            return fn.apply(this, pairArgs.apply(null, arguments));
        };
    };
})();

Vector.mapper = Vector.vectorizeArgs(function (fromMin, fromMax, toMin, toMax) {
    var scale = toMax.sub(toMin).div(fromMax.sub(fromMin)),
        offset = toMin.sub(fromMin.mul(scale));
    return Vector.vectorizeArgs(function (p) {
       return p.mul(scale).add(offset);
    });
});


Vector.prototype = {
    pairwise: function (fn, v) {
        return new Vector(fn(this.x, v.x), fn(this.y, v.y));
    },
    neg: function () { return Vector.zero.sub(this); },
    inv: function () { return Vector.unit.div(this); },
    eq:  Vector.vectorizeArgs(function (v) {
        return this.x === v.x && this.y === v.y;
    }),
    rot: function (a) {
        return new Vector(
            this.x * Math.cos(a) - this.y * Math.sin(a),
            this.x * Math.sin(a) + this.y * Math.cos(a)
        );
    },
    angle: function () {
        return Math.atan(this.y/this.x);
    }
};
(function (ops) {
    Object.keys(ops).forEach(function (n) {
        Vector.prototype[n] = Vector.vectorizeArgs(function (v) {
            return this.pairwise(ops[n], v);
        });
    });
})({
    add: function (a, b) { return a + b; },
    sub: function (a, b) { return a - b; },
    mul: function (a, b) { return a * b; },
    div: function (a, b) { return a / b; },
    del: function (a, b) { return Math.abs(a-b); }
});

Vector.unit = new Vector(1, 1);
Vector.zero = new Vector(0, 0);

module.exports = Vector;
