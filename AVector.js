function AVector(x, y) {    //help: https://gist.github.com/winduptoy/a1aa09c3499e09edbd33
    this.x = x;
    this.y = y;
}

// Instance methods
AVector.prototype = {
    angle: function(type=0) {
        // goes to negative angles for negative y's (max is PI/2 to each side)
        // alternative writing (until now it has the same effect i think): -atan2(-y, x)
        let a = Math.atan2(this.y, this.x);
        switch (type) {
            case 1: return a/2/Math.PI*360;
            case 2: return a/Math.PI;
            default: return a;
        }
    },
    angleFull: function(type=0) {
        let a;
        a = Math.atan(this.y / this.x);
        if (this.x < 0)
            a += Math.PI;
        if (a < 0)
            a = Math.PI*2 + a;
        switch (type) {
            case 1: return a/2/Math.PI*360;
            case 2: return a/Math.PI;
            default: return a;
        }
    },
    setAngle: function(a) {
        let l = this.length();
        this.x = Math.cos(a);
        this.y = Math.sin(a);
        if (l != null || l > 0)
            this.mult(l);
        return this;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    add: function(v, a="add_y") {
        if (v instanceof AVector) {
            this.x += v.x;
            this.y += v.y;
        } else if (typeof v == "number") {
            if (typeof a == "number") {
                this.x += v;
                this.y += a;
            } else {
                this.x += v;
                this.y += v;
            }
        }
        return this;
    },
    sub: function(v, a="sub_y") {
        if (v instanceof AVector) {
            this.x -= v.x;
            this.y -= v.y;
        } else if (typeof v == "number") {
            if (typeof a == "number") {
                this.x -= v;
                this.y -= a;
            } else {
                this.x -= v;
                this.y -= v;
            }
        }
        return this;
    },
    mult: function(a, b="mult_y") {
        if (typeof a == "number") {
            if (typeof b == "number") {
                this.x *= a;
                this.y *= b;
            } else {
                this.x *= a;
                this.y *= a;
            }
        }
        return this;
    },
    div: function(a, b="div_y") {
        if (typeof a == "number") {
            if (typeof b == "number") {
                this.x /= a;
                this.y /= b;
            } else {
                this.x /= a;
                this.y /= a;
            }
        }
        return this;
    },
    negative: function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },
    normalize: function() {
        let a = this.length();
        this.x /= a;
        this.y /= a;
        return this;
    },
    limit: function(a) {
        if (typeof a == "number" && this.length() > a) {
            this.normalize();
            this.mult(a);
        }
        return this;
    },
    limitX: function(a) {
        if (typeof a == "number" && Math.abs(this.x) > Math.abs(a)) {
            this.x = a * Math.sign(this.x);
        }
        return this;
    },
    limitY: function(a) {
        if (typeof a == "number" && Math.abs(this.y) > Math.abs(a)) {
            this.y = a * Math.sign(this.y);
        }
        return this;
    },
    dot: function(v, a="manual_y") {
        if (v instanceof AVector) {
            return this.x * v.x + this.y * v.y;
        } else if (typeof v == "number" && typeof a == "number") {
            return this.x * v + this.y * a;
        }
    },
    angleTo: function(v, type=0) {
        if (v instanceof AVector) {
            /*let a = Math.abs(v.angle() - this.angle());
            if (a > Math.PI)
                a = 2*Math.PI - a;*/
            let a = Math.acos(this.dot(v) / (this.length() * v.length()));
            switch (type) {
                case 1: return a/2/Math.PI*360;
                case 2: return a/Math.PI;
                default: return a;
            }
        }
    },
    dist: function(v, a="manual_y") {
        if (v instanceof AVector) {
            return new AVector(this.x - v.x, this.y - v.y).length();
        } else if (typeof v == "number" && typeof a == "number") {
            return new AVector(this.x - v, this.y - a).length();
        }
    },

    set: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    },
    setX: function(x) {
        this.x = x;
        return this;
    },
    setY: function(y) {
        this.y = y;
        return this;
    },
    equals: function(v, a="manual_y") {
        if (v instanceof AVector) {
            return this.x === v.x && this.y === v.y;
        } else if (typeof v == "number" && typeof a == "number") {
            return this.x === v && this.y === a;
        }
    },
    clone: function() {
        return new AVector(this.x, this.y);
    }
}

// Static methods
AVector.negative = function(v) {
    return new AVector(-v.x, -v.y);
};
AVector.add = function(v, a, b="add_y") {
    if (a instanceof AVector) {
        return new AVector(v.x + a.x, v.y + a.y);
    } else if (typeof a == "number") {
        if (typeof b == "number") {
            return new AVector(v.x + a, v.y + b);
        } else {
            return new AVector(v.x + a, v.y + a);
        }
    }
};
AVector.sub = function(v, a, b="sub_y") {
    if (a instanceof AVector) {
        return new AVector(v.x - a.x, v.y - a.y);
    } else if (typeof a == "number") {
        if (typeof b == "number") {
            return new AVector(v.x - a, v.y - b);
        } else {
            return new AVector(v.x - a, v.y - a);
        }
    }
};
AVector.mult = function(v, a, b="mult_y") {
    if (a instanceof AVector) {
        return new AVector(v.x * a.x, v.y * a.y);
    } else if (typeof a == "number") {
        if (typeof b == "number") {
            return new AVector(v.x * a, v.y * b);
        } else {
            return new AVector(v.x * a, v.y * a);
        }
    }
};
AVector.div = function(v, a, b="div_y") {
    if (a instanceof AVector) {
        return new AVector(v.x / a.x, v.y / a.y);
    } else if (typeof a == "number") {
        if (typeof b == "number") {
            return new AVector(v.x / a, v.y / b);
        } else {
            return new AVector(v.x / a, v.y / a);
        }
    }
};
AVector.dist = function(v, a) {
    return new AVector(v.x - a.x, v.y - a.y).length();
};