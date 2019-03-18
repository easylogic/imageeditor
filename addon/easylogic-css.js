(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var EasyLogicCSS = (function () {
'use strict';

function each$1(len, callback) {
    for (var i = 0; i < len; i += 4) {
        callback(i);
    }
}

function pack$1(bitmap, callback) {

    each$1(bitmap.pixels.length, function (i) {
        callback(bitmap.pixels, i);
    });
}

var Canvas = {
    create: function create(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width || 0;
        canvas.height = height || 0;

        return canvas;
    },
    drawPixels: function drawPixels(bitmap) {
        var canvas = this.create(bitmap.width, bitmap.height);

        var context = canvas.getContext('2d');
        var imagedata = context.getImageData(0, 0, canvas.width, canvas.height);

        imagedata.data.set(bitmap.pixels);

        context.putImageData(imagedata, 0, 0);

        return canvas;
    },
    createHistogram: function createHistogram(width, height, histogram, callback) {
        var opt = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : { black: true, red: false, green: false, blue: false };

        var canvas = this.create(width, height);
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);
        context.globalAlpha = 0.7;

        var omit = { black: false };
        if (opt.black) {
            omit.black = false;
        } else {
            omit.black = true;
        }
        if (opt.red) {
            omit.red = false;
        } else {
            omit.red = true;
        }
        if (opt.green) {
            omit.green = false;
        } else {
            omit.green = true;
        }
        if (opt.blue) {
            omit.blue = false;
        } else {
            omit.blue = true;
        }

        Object.keys(histogram).forEach(function (color) {

            if (!omit[color]) {

                var array = histogram[color];
                var ymax = Math.max.apply(Math, array);
                var unitWith = width / array.length;

                context.fillStyle = color;
                array.forEach(function (it, index) {
                    var currentHeight = height * (it / ymax);
                    var x = index * unitWith;

                    context.fillRect(x, height - currentHeight, unitWith, currentHeight);
                });
            }
        });

        if (isFunction(callback)) callback(canvas);
    },
    getHistogram: function getHistogram(bitmap) {
        var black = new Array(256);
        var red = new Array(256);
        var green = new Array(256);
        var blue = new Array(256);
        for (var i = 0; i < 256; i++) {
            black[i] = 0;
            red[i] = 0;
            green[i] = 0;
            blue[i] = 0;
        }

        pack$1(bitmap, function (pixels, i) {
            // gray scale 
            var grayIndex = Math.round(Color$1.brightness(pixels[i], pixels[i + 1], pixels[i + 2]));
            black[grayIndex]++;

            red[pixels[i]]++;
            green[pixels[i + 1]]++;
            blue[pixels[i + 2]]++;
        });

        return { black: black, red: red, green: green, blue: blue };
    },
    getBitmap: function getBitmap(bitmap, area) {
        var canvas = this.drawPixels(bitmap);

        var context = canvas.getContext('2d');
        var pixels = context.getImageData(area.x || 0, area.y || 0, area.width || canvas.width, area.height || canvas.height).data;

        return { pixels: pixels, width: area.width, height: area.height };
    },
    putBitmap: function putBitmap(bitmap, subBitmap, area) {

        var canvas = this.drawPixels(bitmap);
        var subCanvas = this.drawPixels(subBitmap);

        var context = canvas.getContext('2d');
        context.drawImage(subCanvas, area.x, area.y);

        bitmap.pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;

        return bitmap;
    }
};

var CONSTANT = {
    identity: function identity() {
        return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    },
    stretching: function stretching(k) {
        return [k, 0, 0, 0, 1, 0, 0, 0, 1];
    },
    squeezing: function squeezing(k) {
        return [k, 0, 0, 0, 1 / k, 0, 0, 0, 1];
    },
    scale: function scale() {
        var sx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var sy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        sx = sx || sx === 0 ? sx : 1;
        sy = sy || sy === 0 ? sy : 1;
        return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
    },
    scaleX: function scaleX(sx) {
        return this.scale(sx);
    },
    scaleY: function scaleY(sy) {
        return this.scale(1, sy);
    },
    translate: function translate(tx, ty) {
        return [1, 0, tx, 0, 1, ty, 0, 0, 1];
    },
    rotate: function rotate(angle) {
        var r = this.radian(angle);
        return [Math.cos(r), -Math.sin(r), 0, Math.sin(r), Math.cos(r), 0, 0, 0, 1];
    },
    rotate90: function rotate90() {
        return [0, -1, 0, 1, 0, 0, 0, 0, 1];
    },
    rotate180: function rotate180() {
        return [-1, 0, 0, 0, -1, 0, 0, 0, 1];
    },
    rotate270: function rotate270() {
        return [0, 1, 0, -1, 0, 0, 0, 0, 1];
    },
    radian: function radian(degree) {
        return degree * Math.PI / 180;
    },
    skew: function skew(degreeX, degreeY) {
        var radianX = this.radian(degreeX);
        var radianY = this.radian(degreeY);
        return [1, Math.tan(radianX), 0, Math.tan(radianY), 1, 0, 0, 0, 1];
    },
    skewX: function skewX(degreeX) {
        var radianX = this.radian(degreeX);

        return [1, Math.tan(radianX), 0, 0, 1, 0, 0, 0, 1];
    },
    skewY: function skewY(degreeY) {
        var radianY = this.radian(degreeY);

        return [1, 0, 0, Math.tan(radianY), 1, 0, 0, 0, 1];
    },
    shear1: function shear1(angle) {
        return [1, -Math.tan(this.radian(angle) / 2), 0, 0, 1, 0, 0, 0, 1];
    },
    shear2: function shear2(angle) {
        return [1, 0, 0, Math.sin(this.radian(angle)), 1, 0, 0, 0, 1];
    }
};

var Matrix = {
    CONSTANT: CONSTANT,

    radian: function radian(angle) {
        return CONSTANT.radian(angle);
    },
    multiply: function multiply(A, C) {
        // console.log(JSON.stringify(A), JSON.stringify(C))
        return [A[0] * C[0] + A[1] * C[1] + A[2] * C[2], A[3] * C[0] + A[4] * C[1] + A[5] * C[2], A[6] * C[0] + A[7] * C[1] + A[8] * C[2]];
    },
    identity: function identity(B) {
        return this.multiply(CONSTANT.identity(), B);
    },
    translate: function translate(x, y, B) {
        return this.multiply(CONSTANT.translate(x, y), B);
    },
    rotate: function rotate(angle, B) {
        return this.multiply(CONSTANT.rotate(angle), B);
    },
    shear1: function shear1(angle, B) {
        return this.multiply(CONSTANT.shear1(angle), B);
    },
    shear2: function shear2(angle, B) {
        return this.multiply(CONSTANT.shear2(angle), B);
    },
    rotateShear: function rotateShear(angle, B) {

        var arr = B;

        arr = this.shear1(angle, arr);
        arr = this.shear2(angle, arr);
        arr = this.shear1(angle, arr);

        return arr;
    }
};

function crop() {
    var startX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var startY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var width = arguments[2];
    var height = arguments[3];


    var newBitmap = createBitmap(width * height * 4, width, height);

    return function (bitmap, done) {
        for (var y = startY, realY = 0; y < height; y++, realY++) {
            for (var x = startX, realX = 0; x < width; x++, realX++) {
                newBitmap.pixels[realY * width * realX] = bitmap.pixels[y * width * x];
            }
        }

        done(newBitmap);
    };
}

function resize(dstWidth, dstHeight) {
    return function (bitmap, done) {
        var c = Canvas.drawPixels(bitmap);
        var context = c.getContext('2d');

        c.width = dstWidth;
        c.height = dstHeight;

        done({
            pixels: new Uint8ClampedArray(context.getImageData(0, 0, dstWidth, dstHeight).data),
            width: dstWidth,
            height: dstHeight
        });
    };
}

function flipV() {
    return function (bitmap, done) {
        var width = bitmap.width;
        var height = bitmap.height;
        var isCenter = height % 2 == 1 ? 1 : 0;

        var halfHeight = isCenter ? Math.floor(height / 2) : height / 2;

        for (var y = 0; y < halfHeight; y++) {
            for (var x = 0; x < width; x++) {

                var startIndex = y * width + x << 2;
                var endIndex = (height - 1 - y) * width + x << 2;
                swapColor(bitmap.pixels, startIndex, endIndex);
            }
        }

        done(bitmap);
    };
}

function flipH() {
    return function (bitmap, done) {
        var width = bitmap.width;
        var height = bitmap.height;
        var isCenter = width % 2 == 1 ? 1 : 0;

        var halfWidth = isCenter ? Math.floor(width / 2) : width / 2;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < halfWidth; x++) {

                var startIndex = y * width + x << 2;
                var endIndex = y * width + (width - 1 - x) << 2;
                swapColor(bitmap.pixels, startIndex, endIndex);
            }
        }

        done(bitmap);
    };
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get$1 = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();



var taggedTemplateLiteral = function (strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
};







var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function rotateDegree(angle) {
    var cx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : POSITION_CENTER;
    var cy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : POSITION_CENTER;

    // const r = F.radian(angle)

    return function (bitmap, done) {
        var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var newBitmap = createBitmap(bitmap.pixels.length, bitmap.width, bitmap.height);
        var width = bitmap.width;
        var height = bitmap.height;

        if (cx == POSITION_CENTER) {
            cx = Math.floor(width / 2);
        }

        if (cy == POSITION_CENTER) {
            cy = Math.floor(height / 2);
        }

        var translateMatrix = Matrix.CONSTANT.translate(-cx, -cy);
        var translateMatrix2 = Matrix.CONSTANT.translate(cx, cy);
        var shear1Matrix = Matrix.CONSTANT.shear1(angle);
        var shear2Matrix = Matrix.CONSTANT.shear2(angle);

        packXY(function (pixels, i, x, y) {
            // console.log(x, y, i)
            var arr = Matrix.multiply(translateMatrix, [x, y, 1]);

            arr = Matrix.multiply(shear1Matrix, arr).map(Math.round);
            arr = Matrix.multiply(shear2Matrix, arr).map(Math.round);
            arr = Matrix.multiply(shear1Matrix, arr).map(Math.round);
            arr = Matrix.multiply(translateMatrix2, arr);

            var _arr = arr,
                _arr2 = slicedToArray(_arr, 2),
                x1 = _arr2[0],
                y1 = _arr2[1];

            if (x1 < 0) return;
            if (y1 < 0) return;
            if (x1 > width - 1) return;
            if (y1 > height - 1) return;

            var endIndex = y1 * width + x1 << 2; //  bit 2 shift is  * 4  

            fillPixelColor(pixels, endIndex, bitmap.pixels, i);
        })(newBitmap, function () {
            done(newBitmap);
        }, opt);
    };
}

function rotate() {
    var degree = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    degree = parseParamNumber$1(degree);
    degree = degree % 360;
    return function (bitmap, done) {
        var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


        if (degree == 0) return bitmap;

        if (degree == 90 || degree == 270) {
            var newBitmap = createBitmap(bitmap.pixels.length, bitmap.height, bitmap.width);
        } else if (degree == 180) {
            var newBitmap = createBitmap(bitmap.pixels.length, bitmap.width, bitmap.height);
        } else {
            return rotateDegree(degree)(bitmap, done, opt);
        }
        packXY(function (pixels, i, x, y) {

            if (degree == 90) {
                var endIndex = x * newBitmap.width + (newBitmap.width - 1 - y) << 2; //  << 2 is equals to (multiply)* 4 
            } else if (degree == 270) {
                var endIndex = (newBitmap.height - 1 - x) * newBitmap.width + y << 2;
            } else if (degree == 180) {
                var endIndex = (newBitmap.height - 1 - y) * newBitmap.width + (newBitmap.width - 1 - x) << 2;
            }

            fillPixelColor(newBitmap.pixels, endIndex, bitmap.pixels, i);
        })(bitmap, function () {
            done(newBitmap);
        }, opt);
    };
}

function histogram() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'gray';
    var points = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var $realPoints = [];

    for (var i = 0; i < points.length - 1; i++) {
        var sp = points[i];
        var ep = points[i + 1];

        var distX = ep[0] - sp[0];
        var distY = ep[1] - sp[1];

        var rate = distY / distX;

        for (var realIndex = 0, start = sp[0]; realIndex < distX; realIndex++, start++) {
            $realPoints[start] = sp[1] + realIndex * rate;
        }
    }

    $realPoints[255] = 255;

    if (type === 'red') {
        return pixel(function () {
            $r = $realPoints[$r];
        }, {}, { $realPoints: $realPoints });
    } else if (type === 'green') {
        return pixel(function () {
            $g = $realPoints[$g];
        }, {}, { $realPoints: $realPoints });
    } else if (type === 'blue') {
        return pixel(function () {
            $b = $realPoints[$b];
        }, {}, { $realPoints: $realPoints });
    } else {
        return pixel(function () {

            var l = Color.RGBtoYCrCb($r, $g, $b);
            var c = Color.YCrCbtoRGB(clamp($realPoints[clamp(l.y)]), l.cr, l.cb, 0);
            $r = c.r;
            $g = c.g;
            $b = c.b;
        }, {}, { $realPoints: $realPoints });
    }
}

var image$1 = {
    crop: crop,
    resize: resize,
    flipH: flipH,
    flipV: flipV,
    rotate: rotate,
    rotateDegree: rotateDegree,
    histogram: histogram,
    'rotate-degree': rotateDegree
};

function bitonal(darkColor, lightColor) {
    var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

    var $darkColor = Color$1.parse(darkColor);
    var $lightColor = Color$1.parse(lightColor);
    var $threshold = threshold;

    return pixel(function () {
        var thresholdColor = $r + $g + $b <= $threshold ? $darkColor : $lightColor;

        $r = thresholdColor.r;
        $g = thresholdColor.g;
        $b = thresholdColor.b;
    }, {
        $threshold: $threshold
    }, {
        $darkColor: $darkColor,
        $lightColor: $lightColor
    });
}

function brightness() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    amount = parseParamNumber$1(amount);
    var $C = Math.floor(255 * (amount / 100));

    return pixel(function () {
        $r += $C;
        $g += $C;
        $b += $C;
    }, { $C: $C });
}

function brownie() {

    var $matrix = [0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, 0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, 0, 0, 0, 1];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function clip() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    amount = parseParamNumber$1(amount);
    var $C = Math.abs(amount) * 2.55;

    return pixel(function () {

        $r = $r > 255 - $C ? 255 : 0;
        $g = $g > 255 - $C ? 255 : 0;
        $b = $b > 255 - $C ? 255 : 0;
    }, { $C: $C });
}

function contrast() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    amount = parseParamNumber$1(amount);
    var $C = Math.max((128 + amount) / 128, 0);

    return pixel(function () {
        $r *= $C;
        $g *= $C;
        $b *= $C;
    }, { $C: $C });
}

function gamma() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var $C = parseParamNumber$1(amount);
    return pixel(function () {
        $r = Math.pow($r / 255, $C) * 255;
        $g = Math.pow($g / 255, $C) * 255;
        $b = Math.pow($b / 255, $C) * 255;
    }, { $C: $C });
}

function gradient() {
    // 전체 매개변수 기준으로 파싱 
    // 색이 아닌 것 기준으로 scale 변수로 인식 

    var params = [].concat(Array.prototype.slice.call(arguments));

    if (params.length === 1 && isString(params[0])) {
        params = Color$1.convertMatchesArray(params[0]);
    }

    params = params.map(function (arg) {
        var res = Color$1.matches(arg);

        if (!res.length) {
            return { type: 'scale', value: arg };
        }

        return { type: 'param', value: arg };
    });

    var $scale = params.filter(function (it) {
        return it.type == 'scale';
    })[0];
    $scale = $scale ? +$scale.value : 256;

    params = params.filter(function (it) {
        return it.type == 'param';
    }).map(function (it) {
        return it.value;
    }).join(',');

    var $colors = Color$1.gradient(params, $scale).map(function (c) {
        var _Color$parse = Color$1.parse(c),
            r = _Color$parse.r,
            g = _Color$parse.g,
            b = _Color$parse.b,
            a = _Color$parse.a;

        return { r: r, g: g, b: b, a: a };
    });

    return pixel(function () {
        var colorIndex = clamp(Math.ceil($r * 0.2126 + $g * 0.7152 + $b * 0.0722));
        var newColorIndex = clamp(Math.floor(colorIndex * ($scale / 256)));
        var color = $colors[newColorIndex];

        $r = color.r;
        $g = color.g;
        $b = color.b;
        $a = clamp(Math.floor(color.a * 256));
    }, {}, { $colors: $colors, $scale: $scale });
}

function grayscale() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    var C = amount / 100;

    if (C > 1) C = 1;

    var $matrix = [0.2126 + 0.7874 * (1 - C), 0.7152 - 0.7152 * (1 - C), 0.0722 - 0.0722 * (1 - C), 0, 0.2126 - 0.2126 * (1 - C), 0.7152 + 0.2848 * (1 - C), 0.0722 - 0.0722 * (1 - C), 0, 0.2126 - 0.2126 * (1 - C), 0.7152 - 0.7152 * (1 - C), 0.0722 + 0.9278 * (1 - C), 0, 0, 0, 0, 1];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function hue() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 360;

    var $C = parseParamNumber$1(amount);
    return pixel(function () {
        var hsv = Color.RGBtoHSV($r, $g, $b);

        // 0 ~ 360 
        var h = hsv.h;
        h += Math.abs($amount);
        h = h % 360;
        hsv.h = h;

        var rgb = Color.HSVtoRGB(hsv);

        $r = rgb.r;
        $g = rgb.g;
        $b = rgb.b;
    }, {
        $C: $C
    });
}

function invert() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    var $C = amount / 100;

    return pixel(function () {
        $r = (255 - $r) * $C;
        $g = (255 - $g) * $C;
        $b = (255 - $b) * $C;
    }, {
        $C: $C
    });
}

function kodachrome() {

    var $matrix = [1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 0, 0, 0, 1];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function matrix() {
    var $a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var $b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var $c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var $d = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var $e = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var $f = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var $g = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
    var $h = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
    var $i = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 0;
    var $j = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 0;
    var $k = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 0;
    var $l = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 0;
    var $m = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : 0;
    var $n = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : 0;
    var $o = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : 0;
    var $p = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : 0;


    var $matrix = [$a, $b, $c, $d, $e, $f, $g, $h, $i, $j, $k, $l, $m, $n, $o, $p];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function noise() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var $C = parseParamNumber$1(amount);
    return pixel(function () {
        var C = Math.abs($C) * 5;
        var min = -C;
        var max = C;
        var noiseValue = Math.round(min + Math.random() * (max - min));

        $r += noiseValue;
        $g += noiseValue;
        $b += noiseValue;
    }, {
        $C: $C
    });
}

function opacity() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    var $C = amount / 100;

    return pixel(function () {
        $a *= $C;
    }, { $C: $C });
}

function polaroid() {

    var $matrix = [1.438, -0.062, -0.062, 0, -0.122, 1.378, -0.122, 0, -0.016, -0.016, 1.483, 0, 0, 0, 0, 1];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function saturation() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    var C = amount / 100;
    var L = 1 - Math.abs(C);

    var $matrix = [L, 0, 0, 0, 0, L, 0, 0, 0, 0, L, 0, 0, 0, 0, L];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function sepia() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = parseParamNumber$1(amount);
    if (C > 1) C = 1;

    var $matrix = [0.393 + 0.607 * (1 - C), 0.769 - 0.769 * (1 - C), 0.189 - 0.189 * (1 - C), 0, 0.349 - 0.349 * (1 - C), 0.686 + 0.314 * (1 - C), 0.168 - 0.168 * (1 - C), 0, 0.272 - 0.272 * (1 - C), 0.534 - 0.534 * (1 - C), 0.131 + 0.869 * (1 - C), 0, 0, 0, 0, 1];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function shade() {
    var redValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var greenValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var blueValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    var $redValue = parseParamNumber$1(redValue);
    var $greenValue = parseParamNumber$1(greenValue);
    var $blueValue = parseParamNumber$1(blueValue);

    return pixel(function () {
        $r *= $redValue;
        $g *= $greenValue;
        $b *= $blueValue;
    }, {
        $redValue: $redValue,
        $greenValue: $greenValue,
        $blueValue: $blueValue
    });
}

function shift() {

    var $matrix = [1.438, -0.062, -0.062, 0, -0.122, 1.378, -0.122, 0, -0.016, -0.016, 1.483, 0, 0, 0, 0, 1];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function solarize(redValue, greenValue, blueValue) {
    var $redValue = parseParamNumber$1(redValue);
    var $greenValue = parseParamNumber$1(greenValue);
    var $blueValue = parseParamNumber$1(blueValue);
    return pixel(function () {
        $r = $r < $redValue ? 255 - $r : $r;
        $g = $g < $greenValue ? 255 - $g : $g;
        $b = $b < $blueValue ? 255 - $b : $b;
    }, {
        $redValue: $redValue, $greenValue: $greenValue, $blueValue: $blueValue
    });
}

function technicolor() {

    var $matrix = [1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 0, 0, 0, 1];

    return pixel(function () {
        $r = $matrix[0] * $r + $matrix[1] * $g + $matrix[2] * $b + $matrix[3] * $a;
        $g = $matrix[4] * $r + $matrix[5] * $g + $matrix[6] * $b + $matrix[7] * $a;
        $b = $matrix[8] * $r + $matrix[9] * $g + $matrix[10] * $b + $matrix[11] * $a;
        $a = $matrix[12] * $r + $matrix[13] * $g + $matrix[14] * $b + $matrix[15] * $a;
    }, {
        $matrix: $matrix
    });
}

function thresholdColor() {
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
    var hasColor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var $scale = parseParamNumber$1(scale);
    amount = parseParamNumber$1(amount);
    var $C = amount / 100;
    var $hasColor = hasColor;

    return pixel(function () {
        // refer to Color.brightness 
        var v = $C * Math.ceil($r * 0.2126 + $g * 0.7152 + $b * 0.0722) >= $scale ? 255 : 0;

        if ($hasColor) {

            if (v == 0) {
                $r = 0;
                $g = 0;
                $b = 0;
            }
        } else {
            var value = Math.round(v);
            $r = value;
            $g = value;
            $b = value;
        }
    }, {
        $C: $C, $scale: $scale, $hasColor: $hasColor
    });
}

function threshold() {
  var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
  var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  return thresholdColor(scale, amount, false);
}

function tint () {
    var redTint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var greenTint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var blueTint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    var $redTint = parseParamNumber(redTint);
    var $greenTint = parseParamNumber(greenTint);
    var $blueTint = parseParamNumber(blueTint);
    return pixel(function () {

        $r += (255 - $r) * $redTint;
        $g += (255 - $g) * $greenTint;
        $b += (255 - $b) * $blueTint;
    }, {
        $redTint: $redTint,
        $greenTint: $greenTint,
        $blueTint: $blueTint
    });
}

var pixel$1 = {
    bitonal: bitonal,
    brightness: brightness,
    brownie: brownie,
    clip: clip,
    contrast: contrast,
    gamma: gamma,
    gradient: gradient,
    grayscale: grayscale,
    hue: hue,
    invert: invert,
    kodachrome: kodachrome,
    matrix: matrix,
    noise: noise,
    opacity: opacity,
    polaroid: polaroid,
    saturation: saturation,
    sepia: sepia,
    shade: shade,
    shift: shift,
    solarize: solarize,
    technicolor: technicolor,
    threshold: threshold,
    'threshold-color': thresholdColor,
    tint: tint
};

function blur () {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;
    amount = parseParamNumber$1(amount);

    return convolution(createBlurMatrix(amount));
}

function emboss() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

    amount = parseParamNumber$1(amount);
    return convolution([amount * -2.0, -amount, 0.0, -amount, 1.0, amount, 0.0, amount, amount * 2.0]);
}

function gaussianBlur() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    var C = amount / 100;

    return convolution(weight([1, 2, 1, 2, 4, 2, 1, 2, 1], 1 / 16 * C));
}

function gaussianBlur5x() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    var C = amount / 100;
    return convolution(weight([1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, 36, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1], 1 / 256 * C));
}

function grayscale2() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    return convolution(weight([0.3, 0.3, 0.3, 0, 0, 0.59, 0.59, 0.59, 0, 0, 0.11, 0.11, 0.11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], amount / 100));
}

function identity() {
    return convolution([0, 0, 0, 0, 1, 0, 0, 0, 0]);
}

function kirschHorizontal() {
    var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    count = parseParamNumber$1(count);
    return convolution([5, 5, 5, -3, 0, -3, -3, -3, -3]);
}

function kirschVertical() {
    var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    count = parseParamNumber$1(count);
    return convolution([5, -3, -3, 5, 0, -3, 5, -3, -3]);
}

function laplacian() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    return convolution(weight([-1, -1, -1, -1, 8, -1, -1, -1, -1], amount / 100));
}

function laplacian5x() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    return convolution(weight([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], amount / 100));
}

function motionBlur() {
    return convolution(weight([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 1 / 9));
}

function motionBlur2() {
    return convolution(weight([1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], 1 / 9));
}

function motionBlur3() {
    return convolution(weight([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], 1 / 9));
}

function negative() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    return convolution(weight([-1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1], amount / 100));
}

function sepia2() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    return convolution(weight([0.393, 0.349, 0.272, 0, 0, 0.769, 0.686, 0.534, 0, 0, 0.189, 0.168, 0.131, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], amount / 100));
}

function sharpen() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    return convolution(weight([0, -1, 0, -1, 5, -1, 0, -1, 0], amount / 100));
}

function sobelHorizontal() {
    return convolution([-1, -2, -1, 0, 0, 0, 1, 2, 1]);
}

function sobelVertical() {
    return convolution([-1, 0, 1, -2, 0, 2, -1, 0, 1]);
}

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version: 	0.5
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/StackBlurForCanvas
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

function BlurStack() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.next = null;
}

function stackBlurImage(bitmap, radius, blurAlphaChannel) {

    if (blurAlphaChannel) return stackBlurCanvasRGBA(bitmap, 0, 0, radius);else return stackBlurCanvasRGB(bitmap, 0, 0, radius);
}

function stackBlurCanvasRGBA(bitmap, top_x, top_y, radius) {
    if (isNaN(radius) || radius < 1) return bitmap;
    radius |= 0;

    var pixels = bitmap.pixels,
        width = bitmap.width,
        height = bitmap.height;

    var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;

    var div = radius + radius + 1;
    var widthMinus1 = width - 1;
    var heightMinus1 = height - 1;
    var radiusPlus1 = radius + 1;
    var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

    var stackStart = new BlurStack();
    var stack = stackStart;
    for (i = 1; i < div; i++) {
        stack = stack.next = new BlurStack();
        if (i == radiusPlus1) var stackEnd = stack;
    }
    stack.next = stackStart;
    var stackIn = null;
    var stackOut = null;

    yw = yi = 0;

    var mul_sum = mul_table[radius];
    var shg_sum = shg_table[radius];

    for (y = 0; y < height; y++) {
        r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;

        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }

        for (i = 1; i < radiusPlus1; i++) {
            p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
            r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
            a_sum += (stack.a = pa = pixels[p + 3]) * rbs;

            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;

            stack = stack.next;
        }

        stackIn = stackStart;
        stackOut = stackEnd;
        for (x = 0; x < width; x++) {
            pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
            if (pa != 0) {
                pa = 255 / pa;
                pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
                pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
                pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
            } else {
                pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
            }

            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;

            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;

            p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

            r_in_sum += stackIn.r = pixels[p];
            g_in_sum += stackIn.g = pixels[p + 1];
            b_in_sum += stackIn.b = pixels[p + 2];
            a_in_sum += stackIn.a = pixels[p + 3];

            r_sum += r_in_sum;
            g_sum += g_in_sum;
            b_sum += b_in_sum;
            a_sum += a_in_sum;

            stackIn = stackIn.next;

            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;
            a_out_sum += pa = stackOut.a;

            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;

            stackOut = stackOut.next;

            yi += 4;
        }
        yw += width;
    }

    for (x = 0; x < width; x++) {
        g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;

        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }

        yp = width;

        for (i = 1; i <= radius; i++) {
            yi = yp + x << 2;

            r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
            a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;

            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;

            stack = stack.next;

            if (i < heightMinus1) {
                yp += width;
            }
        }

        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (y = 0; y < height; y++) {
            p = yi << 2;
            pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;
            if (pa > 0) {
                pa = 255 / pa;
                pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
                pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
                pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
            } else {
                pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
            }

            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;

            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;

            p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

            r_sum += r_in_sum += stackIn.r = pixels[p];
            g_sum += g_in_sum += stackIn.g = pixels[p + 1];
            b_sum += b_in_sum += stackIn.b = pixels[p + 2];
            a_sum += a_in_sum += stackIn.a = pixels[p + 3];

            stackIn = stackIn.next;

            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;
            a_out_sum += pa = stackOut.a;

            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;

            stackOut = stackOut.next;

            yi += width;
        }
    }

    return bitmap;
}

function stackBlurCanvasRGBA(bitmap, top_x, top_y, radius) {
    if (isNaN(radius) || radius < 1) return bitmap;
    radius |= 0;

    var pixels = bitmap.pixels,
        width = bitmap.width,
        height = bitmap.height;

    var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;

    var div = radius + radius + 1;
    var widthMinus1 = width - 1;
    var heightMinus1 = height - 1;
    var radiusPlus1 = radius + 1;
    var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

    var stackStart = new BlurStack();
    var stack = stackStart;
    for (i = 1; i < div; i++) {
        stack = stack.next = new BlurStack();
        if (i == radiusPlus1) var stackEnd = stack;
    }
    stack.next = stackStart;
    var stackIn = null;
    var stackOut = null;

    yw = yi = 0;

    var mul_sum = mul_table[radius];
    var shg_sum = shg_table[radius];

    for (y = 0; y < height; y++) {
        r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;

        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack = stack.next;
        }

        for (i = 1; i < radiusPlus1; i++) {
            p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
            r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[p + 2]) * rbs;

            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;

            stack = stack.next;
        }

        stackIn = stackStart;
        stackOut = stackEnd;
        for (x = 0; x < width; x++) {
            pixels[yi] = r_sum * mul_sum >> shg_sum;
            pixels[yi + 1] = g_sum * mul_sum >> shg_sum;
            pixels[yi + 2] = b_sum * mul_sum >> shg_sum;

            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;

            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;

            p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

            r_in_sum += stackIn.r = pixels[p];
            g_in_sum += stackIn.g = pixels[p + 1];
            b_in_sum += stackIn.b = pixels[p + 2];

            r_sum += r_in_sum;
            g_sum += g_in_sum;
            b_sum += b_in_sum;

            stackIn = stackIn.next;

            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;

            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;

            stackOut = stackOut.next;

            yi += 4;
        }
        yw += width;
    }

    for (x = 0; x < width; x++) {
        g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;

        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack = stack.next;
        }

        yp = width;

        for (i = 1; i <= radius; i++) {
            yi = yp + x << 2;

            r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;

            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;

            stack = stack.next;

            if (i < heightMinus1) {
                yp += width;
            }
        }

        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (y = 0; y < height; y++) {
            p = yi << 2;
            pixels[p] = r_sum * mul_sum >> shg_sum;
            pixels[p + 1] = g_sum * mul_sum >> shg_sum;
            pixels[p + 2] = b_sum * mul_sum >> shg_sum;

            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;

            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;

            p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

            r_sum += r_in_sum += stackIn.r = pixels[p];
            g_sum += g_in_sum += stackIn.g = pixels[p + 1];
            b_sum += b_in_sum += stackIn.b = pixels[p + 2];

            stackIn = stackIn.next;

            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;

            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;

            stackOut = stackOut.next;

            yi += width;
        }
    }

    return bitmap;
}

function stackBlur () {
    var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
    var hasAlphaChannel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    radius = parseParamNumber$1(radius);

    return function (bitmap, done) {
        var newBitmap = stackBlurImage(bitmap, radius, hasAlphaChannel);

        done(newBitmap);
    };
}

function transparency() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    amount = parseParamNumber$1(amount);
    return convolution(weight([1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0, 0, 1], amount / 100));
}

function unsharpMasking() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 256;

    amount = parseParamNumber$1(amount);
    return convolution(weight([1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, -476, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1], -1 / amount));
}

var matrix$1 = {
     blur: blur,
     emboss: emboss,
     gaussianBlur: gaussianBlur,
     'gaussian-blur': gaussianBlur,
     gaussianBlur5x: gaussianBlur5x,
     'gaussian-blur-5x': gaussianBlur5x,
     grayscale2: grayscale2,
     normal: identity,
     kirschHorizontal: kirschHorizontal,
     'kirsch-horizontal': kirschHorizontal,
     kirschVertical: kirschVertical,
     'kirsch-vertical': kirschVertical,
     laplacian: laplacian,
     laplacian5x: laplacian5x,
     'laplacian-5x': laplacian5x,
     motionBlur: motionBlur,
     'motion-blur': motionBlur,
     motionBlur2: motionBlur2,
     'motion-blur-2': motionBlur2,
     motionBlur3: motionBlur3,
     'motion-blur-3': motionBlur3,
     negative: negative,
     sepia2: sepia2,
     sharpen: sharpen,
     sobelHorizontal: sobelHorizontal,
     'sobel-horizontal': sobelHorizontal,
     sobelVertical: sobelVertical,
     'sobel-vertical': sobelVertical,
     stackBlur: stackBlur,
     'stack-blur': stackBlur,
     transparency: transparency,
     unsharpMasking: unsharpMasking,
     'unsharp-masking': unsharpMasking
};

function kirsch() {
    return filter('kirsch-horizontal kirsch-vertical');
}

function sobel() {
    return filter('sobel-horizontal sobel-vertical');
}

function vintage() {
    return filter('brightness(15) saturation(-20) gamma(1.8)');
}

var multi$1 = {
    kirsch: kirsch,
    sobel: sobel,
    vintage: vintage
};

var FilterList = _extends({}, image$1, pixel$1, matrix$1, multi$1);

function round(n, k) {
    k = isUndefined$1(k) ? 1 : k;
    return Math.round(n * k) / k;
}

function degreeToRadian(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * 
 * convert radian to degree 
 * 
 * @param {*} radian 
 * @returns {Number} 0..360
 */
function radianToDegree(radian) {
    var angle = radian * 180 / Math.PI;

    if (angle < 0) {
        // 각도가 0보다 작으면 360 에서 반전시킨다. 
        angle = 360 + angle;
    }

    return angle;
}

function getXInCircle(angle, radius) {
    var centerX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    return centerX + radius * Math.cos(degreeToRadian(angle));
}

function getYInCircle(angle, radius) {
    var centerY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    return centerY + radius * Math.sin(degreeToRadian(angle));
}

function getXYInCircle(angle, radius) {
    var centerX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var centerY = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    return {
        x: getXInCircle(angle, radius, centerX),
        y: getYInCircle(angle, radius, centerY)
    };
}

function getDist(x, y) {
    var centerX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var centerY = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    return Math.sqrt(Math.pow(Math.abs(centerX - x), 2) + Math.pow(Math.abs(centerY - y), 2));
}

function calculateAngle(rx, ry) {
    return radianToDegree(Math.atan2(ry, rx));
}

function uuid() {
    var dt = new Date().getTime();
    var uuid = 'xxx12-xx-34xx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
}

function uuidShort() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
}

var bezierCalc = {
    B1: function B1(t) {
        return t * t * t;
    },
    B2: function B2(t) {
        return 3 * t * t * (1 - t);
    },
    B3: function B3(t) {
        return 3 * t * (1 - t) * (1 - t);
    },
    B4: function B4(t) {
        return (1 - t) * (1 - t) * (1 - t);
    }
};

function cubicBezier(x1, y1, x2, y2) {
    var C2 = { x: x1, y: y1 };
    var C3 = { x: x2, y: y2 };
    return function (progress) {
        // var x = C1.x * bezierCalc.B1(p) + C2.x*bezierCalc.B2(p) + C3.x*bezierCalc.B3(p) + C4.x*bezierCalc.B4(p);
        // var y = C1.y * bezierCalc.B1(progress) + C2.y*bezierCalc.B2(progress) + C3.y*bezierCalc.B3(progress) + C4.y*bezierCalc.B4(progress);

        var y = C2.y * bezierCalc.B2(progress) + C3.y * bezierCalc.B3(progress) + bezierCalc.B4(progress);

        return 1 - y;
    };
}

function getGradientLine(angle, box) {
    var length = Math.abs(box.width * Math.sin(angle)) + Math.abs(box.height * Math.cos(angle));
    var center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
    };

    var yDiff = Math.sin(angle - Math.PI / 2) * length / 2;
    var xDiff = Math.cos(angle - Math.PI / 2) * length / 2;

    return {
        length: length,
        center: center,
        start: {
            x: center.x - xDiff,
            y: center.y - yDiff
        },
        end: {
            x: center.x + xDiff,
            y: center.y + yDiff
        }
    };
}

var math = Object.freeze({
	round: round,
	degreeToRadian: degreeToRadian,
	radianToDegree: radianToDegree,
	getXInCircle: getXInCircle,
	getYInCircle: getYInCircle,
	getXYInCircle: getXYInCircle,
	getDist: getDist,
	calculateAngle: calculateAngle,
	uuid: uuid,
	uuidShort: uuidShort,
	cubicBezier: cubicBezier,
	getGradientLine: getGradientLine
});

var _functions;

var makeId = 0;

var functions = (_functions = {
    partial: partial,
    multi: multi,
    merge: merge,
    weight: weight,
    repeat: repeat$1,
    colorMatrix: colorMatrix,
    each: each,
    eachXY: eachXY,
    createRandomCount: createRandomCount,
    createRandRange: createRandRange,
    createBitmap: createBitmap,
    createBlurMatrix: createBlurMatrix,
    pack: pack,
    packXY: packXY,
    pixel: pixel,
    getBitmap: getBitmap,
    putBitmap: putBitmap,
    radian: radian,
    convolution: convolution,
    parseParamNumber: parseParamNumber$1,
    px2em: px2em,
    px2percent: px2percent,
    em2percent: em2percent,
    em2px: em2px,
    percent2em: percent2em,
    percent2px: percent2px,
    filter: filter,
    clamp: clamp$1,
    fillColor: fillColor,
    fillPixelColor: fillPixelColor
}, defineProperty(_functions, 'multi', multi), defineProperty(_functions, 'merge', merge), defineProperty(_functions, 'matches', matches), defineProperty(_functions, 'parseFilter', parseFilter), defineProperty(_functions, 'partial', partial), _functions);

var LocalFilter = functions;

var ROUND_MAX = 1000;

function weight(arr) {
    var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return arr.map(function (i) {
        return i * num;
    });
}

function repeat$1(value$$1, num) {
    var arr = new Array(num);
    for (var i = 0; i < num; i++) {
        arr[i] = value$$1;
    }
    return arr;
}

function colorMatrix(pixels, i, matrix) {
    var r = pixels[i],
        g = pixels[i + 1],
        b = pixels[i + 2],
        a = pixels[i + 3];

    fillColor(pixels, i, matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3] * a, matrix[4] * r + matrix[5] * g + matrix[6] * b + matrix[7] * a, matrix[8] * r + matrix[9] * g + matrix[10] * b + matrix[11] * a, matrix[12] * r + matrix[13] * g + matrix[14] * b + matrix[15] * a);
}

function makeFilter$1(filter) {

    if (isFunction(filter)) {
        return filter;
    }

    if (isString(filter)) {
        filter = [filter];
    }

    var filterName = filter.shift();

    if (isFunction(filterName)) {
        return filterName;
    }

    var params = filter;

    var filterFunction = FilterList[filterName] || LocalFilter[filterName];

    if (!filterFunction) {
        throw new Error(filterName + ' is not filter. please check filter name.');
    }
    return filterFunction.apply(filterFunction, params);
}

function forLoop(max) {
    var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var callback = arguments[3];
    var done = arguments[4];
    var functionDumpCount = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 10000;
    var frameTimer = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'full';
    var loopCount = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 50;

    var runIndex = index;
    var timer = function timer(callback) {
        setTimeout(callback, 0);
    };

    if (frameTimer == 'requestAnimationFrame') {
        timer = requestAnimationFrame;
        functionDumpCount = 1000;
    }

    if (frameTimer == 'full') {
        /* only for loop  */
        timer = null;
        functionDumpCount = max;
    }

    function makeFunction() {
        var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;

        var arr = [].concat(toConsumableArray(Array(count)));

        var functionStrings = arr.map(function (countIndex) {
            return 'cri = ri + i * s; if (cri >= mx) return {currentRunIndex: cri, i: null}; c(cri); i++;';
        }).join('\n');

        var smallLoopFunction = new Function('ri', 'i', 's', 'mx', 'c', '\n            let cri = ri;\n            \n            ' + functionStrings + '\n            \n            return {currentRunIndex: cri, i: i} \n        ');

        return smallLoopFunction;
    }

    function runCallback() {

        var smallLoopFunction = makeFunction(loopCount); // loop is call  20 callbacks at once 

        var currentRunIndex = runIndex;
        var ret = {};
        var i = 0;
        while (i < functionDumpCount) {
            ret = smallLoopFunction(runIndex, i, step, max, callback);

            if (ret.i == null) {
                currentRunIndex = ret.currentRunIndex;
                break;
            }

            i = ret.i;
            currentRunIndex = ret.currentRunIndex;
        }

        nextCallback(currentRunIndex);
    }

    function nextCallback(currentRunIndex) {
        if (currentRunIndex) {
            runIndex = currentRunIndex;
        } else {
            runIndex += step;
        }

        if (runIndex >= max) {
            done();
            return;
        }

        if (timer) timer(runCallback);else runCallback();
    }

    runCallback();
}

function each(len, callback, done) {
    var opt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


    forLoop(len, 0, 4, function (i) {
        callback(i, i >> 2 /* xyIndex */);
    }, function () {
        done();
    }, opt.functionDumpCount, opt.frameTimer, opt.loopCount);
}

function eachXY(len, width, callback, done) {
    var opt = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};


    forLoop(len, 0, 4, function (i) {
        var xyIndex = i >> 2;
        callback(i, xyIndex % width, Math.floor(xyIndex / width));
    }, function () {
        done();
    }, opt.functionDumpCount, opt.frameTimer, opt.loopCount);
}

function createRandRange(min, max, count) {
    var result = [];

    for (var i = 1; i <= count; i++) {
        var num = Math.random() * (max - min) + min;
        var sign = Math.floor(Math.random() * 10) % 2 == 0 ? -1 : 1;
        result.push(sign * num);
    }

    result.sort();

    var centerIndex = Math.floor(count >> 1);
    var a = result[centerIndex];
    result[centerIndex] = result[0];
    result[0] = a;

    return result;
}

function createRandomCount() {
    return [3 * 3, 4 * 4, 5 * 5, 6 * 6, 7 * 7, 8 * 8, 9 * 9, 10 * 10].sort(function (a, b) {
        return 0.5 - Math.random();
    })[0];
}

function createBitmap(length, width, height) {
    return { pixels: new Uint8ClampedArray(length), width: width, height: height };
}

function putPixel(dstBitmap, srcBitmap, startX, startY) {

    var len = srcBitmap.pixels.length / 4;
    var dstX = 0,
        dstY = 0,
        x = 0,
        y = 0,
        srcIndex = 0,
        dstIndex = 0;
    for (var i = 0; i < len; i++) {
        x = i % srcBitmap.width, y = Math.floor(i / srcBitmap.width);

        dstX = startX + x;
        dstY = startY + y;

        if (dstX > dstBitmap.width) continue;
        if (dstY > dstBitmap.height) continue;

        srcIndex = y * srcBitmap.width + x << 2;
        dstIndex = dstY * dstBitmap.width + dstX << 2;

        dstBitmap.pixels[dstIndex] = srcBitmap.pixels[srcIndex];
        dstBitmap.pixels[dstIndex + 1] = srcBitmap.pixels[srcIndex + 1];
        dstBitmap.pixels[dstIndex + 2] = srcBitmap.pixels[srcIndex + 2];
        dstBitmap.pixels[dstIndex + 3] = srcBitmap.pixels[srcIndex + 3];
    }
}

function getPixel(srcBitmap, dstBitmap, startX, startY) {
    var len = dstBitmap.pixels.length >> 2;
    var srcX = 0,
        srcY = 0,
        x = 0,
        y = 0,
        srcIndex = 0,
        dstIndex = 0;
    for (var i = 0; i < len; i++) {
        var x = i % dstBitmap.width,
            y = Math.floor(i / dstBitmap.width);

        srcX = startX + x;
        srcY = startY + y;

        if (srcX > srcBitmap.width) continue;
        if (srcY > srcBitmap.height) continue;

        srcIndex = srcY * srcBitmap.width + srcX << 2;
        dstIndex = y * dstBitmap.width + x << 2;

        dstBitmap.pixels[dstIndex] = srcBitmap.pixels[srcIndex];
        dstBitmap.pixels[dstIndex + 1] = srcBitmap.pixels[srcIndex + 1];
        dstBitmap.pixels[dstIndex + 2] = srcBitmap.pixels[srcIndex + 2];
        dstBitmap.pixels[dstIndex + 3] = srcBitmap.pixels[srcIndex + 3];
    }
}

function cloneBitmap(bitmap) {
    var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


    var width = bitmap.width + padding;
    var height = bitmap.height + padding;

    var newBitmap = { pixels: new Uint8ClampedArray(width * height * 4), width: width, height: height };

    return newBitmap;
}

function getBitmap(bitmap, area) {
    return Canvas.getBitmap(bitmap, area);
}

function putBitmap(bitmap, subBitmap, area) {
    return Canvas.putBitmap(bitmap, subBitmap, area);
}

function parseParamNumber$1(param, callback) {
    if (isString(param)) {
        param = param.replace(/deg|px|\%|em/g, EMPTY_STRING);
    }
    if (isFunction(callback)) {
        return callback(+param);
    }
    return +param;
}







function px2percent(px$$1, maxValue) {
    return round(px$$1 / maxValue * 100, ROUND_MAX);
}

function px2em(px$$1, maxValue) {
    var fontSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;

    return round(px$$1 / fontSize, ROUND_MAX);
}

function em2px(em$$1, maxValue) {
    var fontSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;

    return round(em$$1 * fontSize, ROUND_MAX);
}

function em2percent(em$$1, maxValue) {
    return px2percent(em2px(em$$1), maxValue);
}

function percent2px(percent$$1, maxValue) {
    return round(maxValue * (percent$$1 / 100), ROUND_MAX);
}

function percent2em(percent$$1, maxValue) {
    return px2em(percent2px(percent$$1, maxValue), maxValue);
}

var filter_regexp = /(([\w_\-]+)(\(([^\)]*)\))?)+/gi;
function pack(callback) {
    return function (bitmap, done) {
        each(bitmap.pixels.length, function (i, xyIndex) {
            callback(bitmap.pixels, i, xyIndex, bitmap.pixels[i], bitmap.pixels[i + 1], bitmap.pixels[i + 2], bitmap.pixels[i + 3]);
        }, function () {
            done(bitmap);
        });
    };
}

function makePrebuildUserFilterList(arr) {

    var codeString = arr.map(function (it) {
        return ' \n            ' + it.userFunction.$preContext + '\n\n            ' + it.userFunction.$preCallbackString + '\n\n            $r = clamp($r); $g = clamp($g); $b = clamp($b); $a = clamp($a);\n        ';
    }).join('\n\n');

    var rootContextObject = { clamp: clamp$1, Color: Color$1 };
    arr.forEach(function (it) {
        rootContextObject = _extends({}, rootContextObject, it.userFunction.rootContextObject);
    });

    var rootContextDefine = 'const ' + keyMap(rootContextObject, function (key) {
        return ' ' + key + ' = $rc.' + key + ' ';
    }).join(',');

    var FunctionCode = ' \n    let $r = $p[$pi], $g = $p[$pi+1], $b = $p[$pi+2], $a = $p[$pi+3];\n    \n    ' + rootContextDefine + '\n\n    ' + codeString + '\n    \n    $p[$pi] = $r; $p[$pi+1] = $g; $p[$pi+2] = $b; $p[$pi+3] = $a;\n    ';

    var userFunction = new Function('$p', '$pi', '$rc', FunctionCode);

    return function ($pixels, $pixelIndex) {
        userFunction($pixels, $pixelIndex, rootContextObject);
    };
}

function makeUserFilterFunctionList(arr) {
    var rootContextObject = {};
    var list = arr.map(function (it) {
        var newKeys = [];

        keyEach(it.context, function (key) {
            newKeys[key] = 'n$' + makeId++ + key + '$';
        });

        keyEach(it.rootContext, function (key, value$$1) {
            newKeys[key] = 'r$' + makeId++ + key + '$';

            rootContextObject[newKeys[key]] = value$$1;
        });

        var preContext = Object.keys(it.context).filter(function (key) {
            if (isNumber(it.context[key]) || isString(it.context[key])) {
                return false;
            } else if (isArray(it.context[key])) {
                if (isNumber(it.context[key][0]) || isString(it.context[key][0])) {
                    return false;
                }
            }

            return true;
        }).map(function (key, i) {
            return [newKeys[key], JSON.stringify(it.context[key])].join(' = ');
        });

        var preCallbackString = it.callback.toString().split("{");

        preCallbackString.shift();
        preCallbackString = preCallbackString.join("{");
        preCallbackString = preCallbackString.split("}");
        preCallbackString.pop();
        preCallbackString = preCallbackString.join("}");

        keyEach(newKeys, function (key, newKey) {
            if (isNumber(it.context[key]) || isString(it.context[key])) {
                preCallbackString = preCallbackString.replace(new RegExp("\\" + key, "g"), it.context[key]);
            } else if (isArray(it.context[key])) {
                if (isNumber(it.context[key][0]) || isString(it.context[key][0])) {
                    it.context[key].forEach(function (item, index) {
                        preCallbackString = preCallbackString.replace(new RegExp("\\" + key + '\\[' + index + '\\]', "g"), item);
                    });
                } else {
                    preCallbackString = preCallbackString.replace(new RegExp("\\" + key, "g"), newKey);
                }
            } else {
                preCallbackString = preCallbackString.replace(new RegExp("\\" + key, "g"), newKey);
            }
        });

        return { preCallbackString: preCallbackString, preContext: preContext };
    });

    var preContext = list.map(function (it, i) {
        return it.preContext.length ? 'const ' + it.preContext + ';' : "";
    }).join('\n\n');

    var preCallbackString = list.map(function (it) {
        return it.preCallbackString;
    }).join('\n\n');

    var FunctionCode = ' \n    let $r = $pixels[$pixelIndex], $g = $pixels[$pixelIndex+1], $b = $pixels[$pixelIndex+2], $a = $pixels[$pixelIndex+3];\n\n    ' + preContext + '\n\n    ' + preCallbackString + '\n    \n    $pixels[$pixelIndex] = $r\n    $pixels[$pixelIndex+1] = $g \n    $pixels[$pixelIndex+2] = $b   \n    $pixels[$pixelIndex+3] = $a   \n    ';

    var userFunction = new Function('$pixels', '$pixelIndex', '$clamp', '$Color', FunctionCode);

    userFunction.$preCallbackString = preCallbackString;
    userFunction.$preContext = preContext;
    userFunction.rootContextObject = rootContextObject;

    return userFunction;
}

function makeUserFilterFunction(callback) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var rootContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return makeUserFilterFunctionList([{ callback: callback, context: context, rootContext: rootContext }]);
}

function pixel(callback) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var rootContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var userFunction = makeUserFilterFunction(callback, context, rootContext);

    var returnCallback = function returnCallback(bitmap, done) {};

    returnCallback.userFunction = userFunction;

    return returnCallback;
}

var ColorListIndex = [0, 1, 2, 3];

function swapColor(pixels, startIndex, endIndex) {

    ColorListIndex.forEach(function (i) {
        var temp = pixels[startIndex + i];
        pixels[startIndex + i] = pixels[endIndex + i];
        pixels[endIndex + i] = temp;
    });
}

function packXY(callback) {
    return function (bitmap, done) {
        var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        eachXY(bitmap.pixels.length, bitmap.width, function (i, x, y) {
            callback(bitmap.pixels, i, x, y);
        }, function () {
            done(bitmap);
        }, opt);
    };
}

function radian(degree) {
    return Matrix.CONSTANT.radian(degree);
}

function createBlurMatrix() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

    var count = Math.pow(amount, 2);
    var value$$1 = 1 / count;
    return repeat$1(value$$1, count);
}

function fillColor(pixels, i, r, g, b, a) {
    if (arguments.length == 3) {
        var _arguments$ = arguments[2],
            r = _arguments$.r,
            g = _arguments$.g,
            b = _arguments$.b,
            a = _arguments$.a;
    }

    if (isNumber(r)) {
        pixels[i] = r;
    }
    if (isNumber(g)) {
        pixels[i + 1] = g;
    }
    if (isNumber(b)) {
        pixels[i + 2] = b;
    }
    if (isNumber(a)) {
        pixels[i + 3] = a;
    }
}

function fillPixelColor(targetPixels, targetIndex, sourcePixels, sourceIndex) {
    fillColor(targetPixels, targetIndex, sourcePixels[sourceIndex], sourcePixels[sourceIndex + 1], sourcePixels[sourceIndex + 2], sourcePixels[sourceIndex + 3]);
}



function createWeightTable(weights) {
    var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 255;

    var weightTable = [];

    weightTable = weights.map(function (w, i) {
        return [];
    });

    weights.forEach(function (w, i) {

        if (w != 0) {
            var data = weightTable[i];

            for (var i = min; i <= max; i++) {
                data[i] = w * i;
            }
        }
    });

    return weightTable;
}

function createSubPixelWeightFunction(weights, weightTable, width, height, opaque) {

    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
    var alphaFac = opaque ? 1 : 0;

    var FunctionCode = 'let r = 0, g = 0, b = 0, a = 0, scy = 0, scx =0, si = 0; ';
    var R = [];
    var G = [];
    var B = [];
    var A = [];
    weights.forEach(function (wt, index) {
        var cy = Math.floor(index / side);
        var cx = index % side;
        var distY = cy - halfSide;
        var distX = cx - halfSide;

        if (wt == 0) {
            return;
        }

        R.push('$t[' + index + '][$sp[(($sy + (' + distY + ')) * ' + width + ' + ($sx + (' + distX + '))) * 4]]');
        G.push('$t[' + index + '][$sp[(($sy + (' + distY + ')) * ' + width + ' + ($sx + (' + distX + '))) * 4 + 1]]');
        B.push('$t[' + index + '][$sp[(($sy + (' + distY + ')) * ' + width + ' + ($sx + (' + distX + '))) * 4 + 2]]');
        A.push('$t[' + index + '][$sp[(($sy + (' + distY + ')) * ' + width + ' + ($sx + (' + distX + '))) * 4 + 3]]');
    });

    FunctionCode += 'r = ' + R.join(' + ') + '; g = ' + G.join(' + ') + '; b = ' + B.join(' + ') + '; a = ' + A.join(' + ') + ';';
    FunctionCode += '$dp[$di] = r; $dp[$di+1] = g;$dp[$di+2] = b;$dp[$di+3] = a + (' + alphaFac + ')*(255-a); ';

    // console.log(FunctionCode)

    var subPixelFunction = new Function('$dp', '$sp', '$di', '$sx', '$sy', '$t', FunctionCode);

    return function ($dp, $sp, $di, $sx, $sy) {
        subPixelFunction($dp, $sp, $di, $sx, $sy, weightTable);
    };
}

function convolution(weights) {
    var opaque = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var weightTable = createWeightTable(weights);
    return function (bitmap, done) {
        var side = Math.round(Math.sqrt(weights.length));
        var padding = side * 2;

        // 원본 크기를 늘림 
        var sourceBitmap = cloneBitmap(bitmap, padding);

        // 원본 데이타 복사 
        putPixel(sourceBitmap, bitmap, side, side);

        // 최종 아웃풋 
        var newBitmap = createBitmap(sourceBitmap.pixels.length, sourceBitmap.width, sourceBitmap.height);

        // 마지막 원본 아웃풋 
        var returnBitmap = createBitmap(bitmap.pixels.length, bitmap.width, bitmap.height);

        var subPixelWeightFunction = createSubPixelWeightFunction(weights, weightTable, sourceBitmap.width, sourceBitmap.height, opaque);

        var len = bitmap.pixels.length / 4;
        for (var i = 0; i < len; i++) {
            var xyIndex = i,
                x = xyIndex % bitmap.width + side,
                y = Math.floor(xyIndex / bitmap.width) + side;

            subPixelWeightFunction(newBitmap.pixels, sourceBitmap.pixels, (y * sourceBitmap.width + x) * 4, x, y);
        }

        getPixel(newBitmap, returnBitmap, side, side);
        done(returnBitmap);
    };
}

function matches(str) {
    var ret = Color$1.convertMatches(str);
    var matches = ret.str.match(filter_regexp);
    var result = [];

    if (!matches) {
        return result;
    }

    result = matches.map(function (it) {
        return { filter: it, origin: Color$1.reverseMatches(it, ret.matches) };
    });

    var pos = { next: 0 };
    result = result.map(function (item) {

        var startIndex = str.indexOf(item.origin, pos.next);

        item.startIndex = startIndex;
        item.endIndex = startIndex + item.origin.length;

        item.arr = parseFilter(item.origin);

        pos.next = item.endIndex;

        return item;
    }).filter(function (it) {
        if (!it.arr.length) return false;
        return true;
    });

    return result;
}

/**
 * Filter Parser 
 * 
 * F.parseFilter('blur(30)') == ['blue', '30']
 * F.parseFilter('gradient(white, black, 3)') == ['gradient', 'white', 'black', '3']
 * 
 * @param {String} filterString 
 */
function parseFilter(filterString) {

    var ret = Color$1.convertMatches(filterString);
    var matches = ret.str.match(filter_regexp);

    if (!matches[0]) {
        return [];
    }

    var arr = matches[0].split('(');

    var filterName = arr.shift();
    var filterParams = [];

    if (arr.length) {
        filterParams = arr.shift().split(')')[0].split(',').map(function (f) {
            return Color$1.reverseMatches(f, ret.matches);
        });
    }

    var result = [filterName].concat(toConsumableArray(filterParams)).map(Color$1.trim);

    return result;
}

function clamp$1(num) {
    return Math.min(255, num);
}

function filter(str) {
    return merge(matches(str).map(function (it) {
        return it.arr;
    }));
}

function makeGroupedFilter() {
    var filters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var groupedFilter = [];
    var group = [];
    for (var i = 0, len = filters.length; i < len; i++) {
        var f = filters[i];

        if (f.userFunction) {
            group.push(f);
        } else {
            if (group.length) {
                groupedFilter.push([].concat(toConsumableArray(group)));
            }
            groupedFilter.push(f);
            group = [];
        }
    }

    if (group.length) {
        groupedFilter.push([].concat(toConsumableArray(group)));
    }

    groupedFilter.forEach(function (filter, index) {
        if (Array.isArray(filter)) {
            groupedFilter[index] = function () {
                var userFunction = makePrebuildUserFilterList(filter);
                // console.log(userFunction)
                return function (bitmap, done) {

                    for (var i = 0, len = bitmap.pixels.length; i < len; i += 4) {
                        userFunction(bitmap.pixels, i);
                    }

                    done(bitmap);
                    // forLoop(bitmap.pixels.length, 0, 4, function (i) {
                    //     userFunction(bitmap.pixels, i)
                    // }, function () {
                    //     done(bitmap)
                    // })
                };
            }();
        }
    });

    return groupedFilter;
}

/** 
 * 
 * multiply filters
 * 
 * ImageFilter.multi('blur', 'grayscale', 'sharpen', ['blur', 3], function (bitmap) {  return bitmap });
 * 
 */
function multi() {
    for (var _len = arguments.length, filters = Array(_len), _key = 0; _key < _len; _key++) {
        filters[_key] = arguments[_key];
    }

    filters = filters.map(function (filter) {
        return makeFilter$1(filter);
    }).filter(function (f) {
        return f;
    });

    filters = makeGroupedFilter(filters);

    var max = filters.length;

    return function (bitmap, done) {
        var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


        var currentBitmap = bitmap;
        var index = 0;

        function runFilter() {
            filters[index].call(null, currentBitmap, function (nextBitmap) {
                currentBitmap = nextBitmap;

                nextFilter();
            }, opt);
        }

        function nextFilter() {
            index++;

            if (index >= max) {
                done(currentBitmap);
                return;
            }

            runFilter();
        }

        runFilter();
    };
}

function merge(filters) {
    return multi.apply(undefined, toConsumableArray(filters));
}

/**
 * apply filter into special area
 * 
 * F.partial({x,y,width,height}, filter, filter, filter )
 * F.partial({x,y,width,height}, 'filter' )
 * 
 * @param {{x, y, width, height}} area 
 * @param {*} filters   
 */
function partial(area) {
    var allFilter = null;

    for (var _len2 = arguments.length, filters = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        filters[_key2 - 1] = arguments[_key2];
    }

    if (filters.length == 1 && isString(filters[0])) {
        allFilter = filter(filters[0]);
    } else {
        allFilter = merge(filters);
    }

    return function (bitmap, done) {
        var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        allFilter(getBitmap(bitmap, area), function (newBitmap) {
            done(putBitmap(bitmap, newBitmap, area));
        }, opt);
    };
}

var _UNIT_STRINGS;
var _PROPERTY_LIST;

var EMPTY_STRING = '';
var WHITE_STRING$1 = ' ';

var UNIT_VALUE = 'value';
var UNIT_PX = 'px';
var UNIT_EM = 'em';
var UNIT_PERCENT = 'percent';
var UNIT_DEG = 'deg';
var UNIT_COLOR = 'color';

var UNIT_VALUE_STRING = EMPTY_STRING;
var UNIT_PX_STRING = 'px';
var UNIT_EM_STRING = 'em';
var UNIT_PERCENT_STRING = '%';

var UNIT_COLOR_STRING = EMPTY_STRING;

var UNIT_STRINGS = (_UNIT_STRINGS = {}, defineProperty(_UNIT_STRINGS, UNIT_VALUE, UNIT_VALUE_STRING), defineProperty(_UNIT_STRINGS, UNIT_PX, UNIT_PX_STRING), defineProperty(_UNIT_STRINGS, UNIT_EM, UNIT_EM_STRING), defineProperty(_UNIT_STRINGS, UNIT_PERCENT, UNIT_PERCENT_STRING), defineProperty(_UNIT_STRINGS, UNIT_DEG, UNIT_DEG), defineProperty(_UNIT_STRINGS, UNIT_COLOR, UNIT_COLOR_STRING), _UNIT_STRINGS);


function px(value) {
    return value + UNIT_PX_STRING;
}





function isPX(unit) {
    return unit === UNIT_PX;
}
function isEM(unit) {
    return unit === UNIT_EM;
}
function isPercent(unit) {
    return unit === UNIT_PERCENT;
}



function unitString(unit) {
    var defaultString = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_STRING;

    return UNIT_STRINGS[unit] || defaultString;
}

function unit(value, unit) {
    return value + unitString(unit);
}

function stringUnit() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : pxUnit(0);

    return unit(obj.value, obj.unit);
}

function unitValue() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : pxUnit(0);

    if (isNumber(obj)) return obj;
    return obj.value;
}

function isUnit(obj, unit) {
    return obj && obj.unit == unit;
}

function isPxUnit(obj) {
    return isUnit(obj, UNIT_PX);
}

function isPercentUnit(obj) {
    return isUnit(obj, UNIT_PERCENT);
}

function isEmUnit(obj) {
    return isUnit(obj, UNIT_EM);
}

function isColorUnit(obj) {
    return isUnit(obj, UNIT_COLOR);
}





function unitObject(value, unit) {
    return { unit: unit, value: value };
}



function percentUnit(value) {
    return { unit: UNIT_PERCENT, value: value };
}

function pxUnit(value) {
    return { unit: UNIT_PX, value: value };
}

function degUnit(value) {
    return { unit: UNIT_DEG, value: value };
}

function emUnit(value) {
    return { unit: UNIT_EM, value: value };
}



function string2unit(str) {
    if (isNotString(str)) return str;
    if (str.includes(UNIT_PX)) {
        return pxUnit(parseParamNumber$1(str));
    } else if (str.includes(UNIT_PERCENT_STRING)) {
        return percentUnit(parseParamNumber$1(str));
    } else if (str.includes(UNIT_EM)) {
        return emUnit(parseParamNumber$1(str));
    } else if (str.includes(UNIT_DEG)) {
        return degUnit(parseParamNumber$1(str));
    }

    return pxUnit(parseParamNumber$1(str));
}










var ITEM_TYPE_LAYER = 'layer';



var ITEM_TYPE_IMAGE = 'image'; // background-image
var ITEM_TYPE_MASK_IMAGE = 'mask-image'; // mask image
var ITEM_TYPE_BORDER_IMAGE = 'border-image'; // border image
var ITEM_TYPE_BOX_IMAGE = 'box-image'; // box image






var IS_OBJECT = 'object';
var IS_ATTRIBUTE = 'attribute';

var SHAPE_TYPE_RECT = 'rect';
var SHAPE_TYPE_CIRCLE = 'circle';
var SHAPE_TYPE_POLYGON = 'polygon';

var IMAGE_ITEM_TYPE_LINEAR = 'linear';
var IMAGE_ITEM_TYPE_REPEATING_LINEAR = 'repeating-linear';
var IMAGE_ITEM_TYPE_RADIAL = 'radial';
var IMAGE_ITEM_TYPE_REPEATING_RADIAL = 'repeating-radial';
var IMAGE_ITEM_TYPE_CONIC = 'conic';
var IMAGE_ITEM_TYPE_REPEATING_CONIC = 'repeating-conic';
var IMAGE_ITEM_TYPE_STATIC = 'static';



var CLIP_PATH_TYPE_NONE = 'none';
var CLIP_PATH_TYPE_CIRCLE = 'circle';
var CLIP_PATH_TYPE_ELLIPSE = 'ellipse';
var CLIP_PATH_TYPE_INSET = 'inset';
var CLIP_PATH_TYPE_POLYGON = 'polygon';
var CLIP_PATH_TYPE_SVG = 'svg';

var CLIP_PATH_SIDE_TYPE_NONE = 'none';
var CLIP_PATH_SIDE_TYPE_CLOSEST = 'closest-side';
var CLIP_PATH_SIDE_TYPE_FARTHEST = 'farthest-side';

var POSITION_TOP = 'top';
var POSITION_LEFT = 'left';
var POSITION_RIGHT = 'right';
var POSITION_BOTTOM = 'bottom';
var POSITION_CENTER = 'center';









var LAYER_TRANSFORM_PROPERTY = ['translateX', 'translateY', 'rotate', 'skewX', 'skewY', 'scale'];

var LAYER_TRANSFORM_3D_PROPERTY = ['translateZ', 'perspective', 'rotateX', 'rotateY', 'rotateZ', 'scaleX', 'scaleY', 'scaleZ'];

var IMAGE_LINEAR_PRROPERTY = ['angle', 'backgroundPositionX', 'backgroundPositionY', 'backgroundSizeWidth', 'backgroundSizeHeight'];

var IMAGE_CONIC_PRROPERTY = ['angle', 'backgroundPositionX', 'backgroundPositionY', 'backgroundSizeWidth', 'backgroundSizeHeight'];

var IMAGE_RADIAL_PRROPERTY = ['backgroundPositionX', 'backgroundPositionY', 'backgroundSizeWidth', 'backgroundSizeHeight'];

var IMAGE_STATIC_PRROPERTY = ['color', 'backgroundPositionX', 'backgroundPositionY', 'backgroundSizeWidth', 'backgroundSizeHeight'];

var PROPERTY_LIST = (_PROPERTY_LIST = {}, defineProperty(_PROPERTY_LIST, ITEM_TYPE_LAYER, [{ key: 'transform', title: 'Transform', properties: LAYER_TRANSFORM_PROPERTY }, { key: 'transform3d', title: 'Transform 3D', properties: LAYER_TRANSFORM_3D_PROPERTY }]), defineProperty(_PROPERTY_LIST, ITEM_TYPE_IMAGE + '_' + IMAGE_ITEM_TYPE_LINEAR, [{ key: 'linear', title: 'Linear Gradient', properties: IMAGE_LINEAR_PRROPERTY }]), defineProperty(_PROPERTY_LIST, ITEM_TYPE_IMAGE + '_' + IMAGE_ITEM_TYPE_RADIAL, [{ key: 'linear', title: 'Radial Gradient', properties: IMAGE_RADIAL_PRROPERTY }]), defineProperty(_PROPERTY_LIST, ITEM_TYPE_IMAGE + '_' + IMAGE_ITEM_TYPE_CONIC, [{ key: 'linear', title: 'Conic Gradient', properties: IMAGE_CONIC_PRROPERTY }]), defineProperty(_PROPERTY_LIST, ITEM_TYPE_IMAGE + '_' + IMAGE_ITEM_TYPE_REPEATING_LINEAR, [{ key: 'linear', title: 'Repeating Linear Gradient', properties: IMAGE_LINEAR_PRROPERTY }]), defineProperty(_PROPERTY_LIST, ITEM_TYPE_IMAGE + '_' + IMAGE_ITEM_TYPE_REPEATING_RADIAL, [{ key: 'linear', title: 'Repeating Radial Gradient', properties: IMAGE_RADIAL_PRROPERTY }]), defineProperty(_PROPERTY_LIST, ITEM_TYPE_IMAGE + '_' + IMAGE_ITEM_TYPE_REPEATING_CONIC, [{ key: 'linear', title: 'Repeating Conic Gradient', properties: IMAGE_CONIC_PRROPERTY }]), defineProperty(_PROPERTY_LIST, ITEM_TYPE_IMAGE + '_' + IMAGE_ITEM_TYPE_STATIC, [{ key: 'linear', title: 'Static Gradient', properties: IMAGE_STATIC_PRROPERTY }]), _PROPERTY_LIST);

var PROPERTY_DEFAULT_VALUE = {

    // layer property 
    'translateX': { type: 'number', defaultValue: 0, min: -10000, max: 10000, unit: UNIT_PX },
    'translateY': { type: 'number', defaultValue: 0, min: -10000, max: 10000, unit: UNIT_PX },
    'rotate': { type: 'number', defaultValue: 0, min: -360, max: 360, step: 0.1, unit: UNIT_DEG },
    'skewX': { type: 'number', defaultValue: 0, min: -1000, max: 1000, unit: UNIT_PX },
    'skewY': { type: 'number', defaultValue: 0, min: -1000, max: 1000, unit: UNIT_PX },
    'scale': { type: 'number', defaultValue: 1, min: -10, max: 10, step: 0.01, unit: UNIT_PX },
    'translateZ': { type: 'number', defaultValue: 0, min: -10000, max: 10000, unit: UNIT_PX },
    'perspective': { type: 'number', defaultValue: 0, min: -10000, max: 10000, unit: UNIT_PX },
    'rotateX': { type: 'number', defaultValue: 0, min: -360, max: 360, step: 0.1, unit: UNIT_PX },
    'rotateY': { type: 'number', defaultValue: 0, min: -360, max: 360, step: 0.1, unit: UNIT_PX },
    'rotateZ': { type: 'number', defaultValue: 0, min: -360, max: 360, step: 0.1, unit: UNIT_PX },
    'scaleX': { type: 'number', defaultValue: 1, min: -10, max: 10, step: 0.01, unit: UNIT_PX },
    'scaleY': { type: 'number', defaultValue: 1, min: -10, max: 10, step: 0.01, unit: UNIT_PX },
    'scaleZ': { type: 'number', defaultValue: 1, min: -10, max: 10, step: 0.01, unit: UNIT_PX },

    // image property 
    'angle': { type: 'number', defaultValue: 0, min: -360, max: 360, step: 1, unit: UNIT_DEG },
    'color': { type: 'color', defaultValue: 'rgba(0, 0, 0, 0)', unit: UNIT_COLOR },
    'backgroundPositionX': { type: 'number', defaultValue: 0, min: -100, max: 100, step: 1, unit: UNIT_PX },
    'backgroundPositionY': { type: 'number', defaultValue: 0, min: -100, max: 100, step: 1, unit: UNIT_PX },
    'backgroundSizeWidth': { type: 'number', defaultValue: 0, min: -10000, max: 10000, step: 1, unit: UNIT_PX },
    'backgroundSizeHeight': { type: 'number', defaultValue: 0, min: -10000, max: 10000, step: 1, unit: UNIT_PX },

    '': {}
};

function debounce(callback, delay) {

    var t = undefined;

    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (t) {
            clearTimeout(t);
        }

        t = setTimeout(function () {
            callback.apply(undefined, args);
        }, delay || 300);
    };
}

// refer to https://jbee.io/web/optimize-scroll-event/
function fit(callback) {
    var tick = false;

    return function () {
        if (tick) {
            return;
        }

        tick = true;
        return requestAnimationFrame(function () {
            tick = false;
            return callback();
        });
    };
}

function keyEach(obj, callback) {
    Object.keys(obj).forEach(function (key, index) {
        callback(key, obj[key], index);
    });
}

function keyMap(obj, callback) {
    return Object.keys(obj).map(function (key, index) {
        return callback(key, obj[key], index);
    });
}

function get(obj, key, callback) {

    var returnValue = defaultValue(obj[key], key);

    if (isFunction(callback)) {
        return callback(returnValue);
    }

    return returnValue;
}

function defaultValue(value$$1, defaultValue) {
    return typeof value$$1 == 'undefined' ? defaultValue : value$$1;
}

function isUndefined$1(value$$1) {
    return typeof value$$1 == 'undefined' || value$$1 == null;
}

function isNotUndefined(value$$1) {
    return isUndefined$1(value$$1) === false;
}

function isArray(value$$1) {
    return Array.isArray(value$$1);
}

function isBoolean(value$$1) {
    return typeof value$$1 == 'boolean';
}

function isString(value$$1) {
    return typeof value$$1 == 'string';
}

function isNotString(value$$1) {
    return isString(value$$1) === false;
}

function isObject(value$$1) {
    return (typeof value$$1 === "undefined" ? "undefined" : _typeof(value$$1)) == 'object' && !isArray(value$$1) && value$$1 !== null;
}

function isFunction(value$$1) {
    return typeof value$$1 == 'function';
}

function isNumber(value$$1) {
    return typeof value$$1 == 'number';
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function cleanObject(obj) {
    var realObject = {};
    Object.keys(obj).filter(function (key) {
        return !!obj[key];
    }).forEach(function (key) {
        realObject[key] = obj[key];
    });

    return realObject;
}

function combineKeyArray(obj) {
    Object.keys(obj).forEach(function (key) {
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].join(', ');
        }
    });

    return obj;
}

function flatKeyValue(obj) {
    var rootKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_STRING;

    var values = {};

    Object.keys(obj).forEach(function (key) {
        var realKey = key;
        if (rootKey !== EMPTY_STRING) {
            realKey = rootKey + "." + key;
        }

        if (isObject(obj[key])) {
            values = _extends({}, values, flatKeyValue(obj[key], realKey));
        } else {
            values[realKey] = obj[key];
        }
    });

    return values;
}

function repeat(count) {
    return [].concat(toConsumableArray(Array(count)));
}

var short_tag_regexp = /\<(\w*)([^\>]*)\/\>/gim;

var HTML_TAG = {
    'image': true,
    'input': true
};

var html = function html(strings) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
    }

    var results = strings.map(function (it, index) {

        var results = args[index] || EMPTY_STRING;

        if (isFunction(results)) {
            results = results();
        }

        if (!isArray(results)) {
            results = [results];
        }

        results = results.map(function (r) {
            if (isObject(r)) {
                return Object.keys(r).map(function (key) {
                    return key + "=\"" + r[key] + "\"";
                }).join(WHITE_STRING$1);
            }

            return r;
        }).join(EMPTY_STRING);

        return it + results;
    }).join(EMPTY_STRING);

    results = results.replace(short_tag_regexp, function (match, p1) {
        if (HTML_TAG[p1.toLowerCase()]) {
            return match;
        } else {
            return match.replace('/>', "></" + p1 + ">");
        }
    });

    return results;
};



var func = Object.freeze({
	debounce: debounce,
	fit: fit,
	keyEach: keyEach,
	keyMap: keyMap,
	get: get,
	defaultValue: defaultValue,
	isUndefined: isUndefined$1,
	isNotUndefined: isNotUndefined,
	isArray: isArray,
	isBoolean: isBoolean,
	isString: isString,
	isNotString: isNotString,
	isObject: isObject,
	isFunction: isFunction,
	isNumber: isNumber,
	clone: clone,
	cleanObject: cleanObject,
	combineKeyArray: combineKeyArray,
	flatKeyValue: flatKeyValue,
	repeat: repeat,
	html: html
});

function format(obj, type) {
    var defaultColor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'rgba(0, 0, 0, 0)';


    if (Array.isArray(obj)) {
        obj = { r: obj[0], g: obj[1], b: obj[2], a: obj[3] };
    }

    if (type == 'hex') {
        return hex(obj);
    } else if (type == 'rgb') {
        return rgb(obj, defaultColor);
    } else if (type == 'hsl') {
        return hsl(obj);
    }

    return obj;
}

function hex(obj) {
    if (Array.isArray(obj)) {
        obj = { r: obj[0], g: obj[1], b: obj[2], a: obj[3] };
    }

    var r = obj.r.toString(16);
    if (obj.r < 16) r = "0" + r;

    var g = obj.g.toString(16);
    if (obj.g < 16) g = "0" + g;

    var b = obj.b.toString(16);
    if (obj.b < 16) b = "0" + b;

    return '#' + r + g + b;
}

function rgb(obj) {
    var defaultColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'rgba(0, 0, 0, 0)';

    if (isArray(obj)) {
        obj = { r: obj[0], g: obj[1], b: obj[2], a: obj[3] };
    }

    if (isUndefined$1(obj)) {
        return undefined;
    }

    if (obj.a == 1 || isUndefined$1(obj.a)) {
        if (isNaN(obj.r)) {
            return defaultColor;
        }
        return 'rgb(' + obj.r + ',' + obj.g + ',' + obj.b + ')';
    } else {
        return 'rgba(' + obj.r + ',' + obj.g + ',' + obj.b + ',' + obj.a + ')';
    }
}

function hsl(obj) {
    if (isArray(obj)) {
        obj = { r: obj[0], g: obj[1], b: obj[2], a: obj[3] };
    }

    if (obj.a == 1 || isUndefined$1(obj.a)) {
        return 'hsl(' + obj.h + ',' + obj.s + '%,' + obj.l + '%)';
    } else {
        return 'hsla(' + obj.h + ',' + obj.s + '%,' + obj.l + '%,' + obj.a + ')';
    }
}

var formatter = Object.freeze({
	format: format,
	hex: hex,
	rgb: rgb,
	hsl: hsl
});

function ReverseXyz(n) {
    return Math.pow(n, 3) > 0.008856 ? Math.pow(n, 3) : (n - 16 / 116) / 7.787;
}

function ReverseRGB(n) {
    return n > 0.0031308 ? 1.055 * Math.pow(n, 1 / 2.4) - 0.055 : 12.92 * n;
}

function XYZtoRGB(x, y, z) {
    if (arguments.length == 1) {
        var _arguments$ = arguments[0],
            x = _arguments$.x,
            y = _arguments$.y,
            z = _arguments$.z;
    }
    //X, Y and Z input refer to a D65/2° standard illuminant.
    //sR, sG and sB (standard RGB) output range = 0 ÷ 255

    var X = x / 100.0;
    var Y = y / 100.0;
    var Z = z / 100.0;

    var R = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
    var G = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
    var B = X * 0.0557 + Y * -0.2040 + Z * 1.0570;

    R = ReverseRGB(R);
    G = ReverseRGB(G);
    B = ReverseRGB(B);

    var r = round(R * 255);
    var g = round(G * 255);
    var b = round(B * 255);

    return { r: r, g: g, b: b };
}

function LABtoXYZ(l, a, b) {
    if (arguments.length == 1) {
        var _arguments$2 = arguments[0],
            l = _arguments$2.l,
            a = _arguments$2.a,
            b = _arguments$2.b;
    }
    //Reference-X, Y and Z refer to specific illuminants and observers.
    //Common reference values are available below in this same page.

    var Y = (l + 16) / 116;
    var X = a / 500 + Y;
    var Z = Y - b / 200;

    Y = ReverseXyz(Y);
    X = ReverseXyz(X);
    Z = ReverseXyz(Z);

    var x = X * 95.047;
    var y = Y * 100.000;
    var z = Z * 108.883;

    return { x: x, y: y, z: z };
}

function PivotXyz(n) {
    return n > 0.008856 ? Math.pow(n, 1 / 3) : (7.787 * n + 16) / 116;
}

function XYZtoLAB(x, y, z) {
    if (arguments.length == 1) {
        var _arguments$3 = arguments[0],
            x = _arguments$3.x,
            y = _arguments$3.y,
            z = _arguments$3.z;
    }

    //Reference-X, Y and Z refer to specific illuminants and observers.
    //Common reference values are available below in this same page.
    // Observer= 2°, Illuminant= D65

    var X = x / 95.047;
    var Y = y / 100.00;
    var Z = z / 108.883;

    X = PivotXyz(X);
    Y = PivotXyz(Y);
    Z = PivotXyz(Z);

    var l = 116 * Y - 16;
    var a = 500 * (X - Y);
    var b = 200 * (Y - Z);

    return { l: l, a: a, b: b };
}

function LABtoRGB(l, a, b) {
    if (arguments.length == 1) {
        var _arguments$4 = arguments[0],
            l = _arguments$4.l,
            a = _arguments$4.a,
            b = _arguments$4.b;
    }
    return XYZtoRGB(LABtoXYZ(l, a, b));
}

var fromLAB = Object.freeze({
	ReverseXyz: ReverseXyz,
	ReverseRGB: ReverseRGB,
	XYZtoRGB: XYZtoRGB,
	LABtoXYZ: LABtoXYZ,
	PivotXyz: PivotXyz,
	XYZtoLAB: XYZtoLAB,
	LABtoRGB: LABtoRGB
});

function RGBtoHSV(r, g, b) {

    if (arguments.length == 1) {
        var _arguments$ = arguments[0],
            r = _arguments$.r,
            g = _arguments$.g,
            b = _arguments$.b;
    }

    var R1 = r / 255;
    var G1 = g / 255;
    var B1 = b / 255;

    var MaxC = Math.max(R1, G1, B1);
    var MinC = Math.min(R1, G1, B1);

    var DeltaC = MaxC - MinC;

    var H = 0;

    if (DeltaC == 0) {
        H = 0;
    } else if (MaxC == R1) {
        H = 60 * ((G1 - B1) / DeltaC % 6);
    } else if (MaxC == G1) {
        H = 60 * ((B1 - R1) / DeltaC + 2);
    } else if (MaxC == B1) {
        H = 60 * ((R1 - G1) / DeltaC + 4);
    }

    if (H < 0) {
        H = 360 + H;
    }

    var S = 0;

    if (MaxC == 0) S = 0;else S = DeltaC / MaxC;

    var V = MaxC;

    return { h: H, s: S, v: V };
}

function RGBtoCMYK(r, g, b) {

    if (arguments.length == 1) {
        var _arguments$2 = arguments[0],
            r = _arguments$2.r,
            g = _arguments$2.g,
            b = _arguments$2.b;
    }

    var R1 = r / 255;
    var G1 = g / 255;
    var B1 = b / 255;

    var K = 1 - Math.max(R1, G1, B1);
    var C = (1 - R1 - K) / (1 - K);
    var M = (1 - G1 - K) / (1 - K);
    var Y = (1 - B1 - K) / (1 - K);

    return { c: C, m: M, y: Y, k: K };
}

function RGBtoHSL(r, g, b) {

    if (arguments.length == 1) {
        var _arguments$3 = arguments[0],
            r = _arguments$3.r,
            g = _arguments$3.g,
            b = _arguments$3.b;
    }

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h,
        s,
        l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);break;
            case g:
                h = (b - r) / d + 2;break;
            case b:
                h = (r - g) / d + 4;break;
        }
        h /= 6;
    }

    return { h: round(h * 360), s: round(s * 100), l: round(l * 100) };
}

function c(r, g, b) {

    if (arguments.length == 1) {
        var _arguments$4 = arguments[0],
            r = _arguments$4.r,
            g = _arguments$4.g,
            b = _arguments$4.b;
    }
    return gray((r + g + b) / 3 > 90 ? 0 : 255);
}

function gray(gray) {
    return { r: gray, g: gray, b: gray };
}

function RGBtoSimpleGray(r, g, b) {

    if (arguments.length == 1) {
        var _arguments$5 = arguments[0],
            r = _arguments$5.r,
            g = _arguments$5.g,
            b = _arguments$5.b;
    }
    return gray(Math.ceil((r + g + b) / 3));
}

function RGBtoGray(r, g, b) {

    if (arguments.length == 1) {
        var _arguments$6 = arguments[0],
            r = _arguments$6.r,
            g = _arguments$6.g,
            b = _arguments$6.b;
    }
    return gray(RGBtoYCrCb(r, g, b).y);
}

function brightness$1(r, g, b) {
    return Math.ceil(r * 0.2126 + g * 0.7152 + b * 0.0722);
}

function RGBtoYCrCb(r, g, b) {

    if (arguments.length == 1) {
        var _arguments$7 = arguments[0],
            r = _arguments$7.r,
            g = _arguments$7.g,
            b = _arguments$7.b;
    }
    var Y = brightness$1(r, g, b);
    var Cb = 0.564 * (b - Y);
    var Cr = 0.713 * (r - Y);

    return { y: Y, cr: Cr, cb: Cb };
}

function PivotRGB(n) {
    return (n > 0.04045 ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92) * 100;
}

function RGBtoXYZ(r, g, b) {
    //sR, sG and sB (Standard RGB) input range = 0 ÷ 255
    //X, Y and Z output refer to a D65/2° standard illuminant.
    if (arguments.length == 1) {
        var _arguments$8 = arguments[0],
            r = _arguments$8.r,
            g = _arguments$8.g,
            b = _arguments$8.b;
    }

    var R = r / 255;
    var G = g / 255;
    var B = b / 255;

    R = PivotRGB(R);
    G = PivotRGB(G);
    B = PivotRGB(B);

    var x = R * 0.4124 + G * 0.3576 + B * 0.1805;
    var y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    var z = R * 0.0193 + G * 0.1192 + B * 0.9505;

    return { x: x, y: y, z: z };
}

function RGBtoLAB(r, g, b) {
    if (arguments.length == 1) {
        var _arguments$9 = arguments[0],
            r = _arguments$9.r,
            g = _arguments$9.g,
            b = _arguments$9.b;
    }
    return XYZtoLAB(RGBtoXYZ(r, g, b));
}

var fromRGB = Object.freeze({
	RGBtoHSV: RGBtoHSV,
	RGBtoCMYK: RGBtoCMYK,
	RGBtoHSL: RGBtoHSL,
	c: c,
	gray: gray,
	RGBtoSimpleGray: RGBtoSimpleGray,
	RGBtoGray: RGBtoGray,
	brightness: brightness$1,
	RGBtoYCrCb: RGBtoYCrCb,
	PivotRGB: PivotRGB,
	RGBtoXYZ: RGBtoXYZ,
	RGBtoLAB: RGBtoLAB
});

function CMYKtoRGB(c, m, y, k) {

    if (arguments.length == 1) {
        var _arguments$ = arguments[0],
            c = _arguments$.c,
            m = _arguments$.m,
            y = _arguments$.y,
            k = _arguments$.k;
    }

    var R = 255 * (1 - c) * (1 - k);
    var G = 255 * (1 - m) * (1 - k);
    var B = 255 * (1 - y) * (1 - k);

    return { r: R, g: G, b: B };
}

var fromCMYK = Object.freeze({
	CMYKtoRGB: CMYKtoRGB
});

function HSVtoRGB(h, s, v) {

    if (arguments.length == 1) {
        var _arguments$ = arguments[0],
            h = _arguments$.h,
            s = _arguments$.s,
            v = _arguments$.v;
    }

    var H = h;
    var S = s;
    var V = v;

    if (H >= 360) {
        H = 0;
    }

    var C = S * V;
    var X = C * (1 - Math.abs(H / 60 % 2 - 1));
    var m = V - C;

    var temp = [];

    if (0 <= H && H < 60) {
        temp = [C, X, 0];
    } else if (60 <= H && H < 120) {
        temp = [X, C, 0];
    } else if (120 <= H && H < 180) {
        temp = [0, C, X];
    } else if (180 <= H && H < 240) {
        temp = [0, X, C];
    } else if (240 <= H && H < 300) {
        temp = [X, 0, C];
    } else if (300 <= H && H < 360) {
        temp = [C, 0, X];
    }

    return {
        r: round((temp[0] + m) * 255),
        g: round((temp[1] + m) * 255),
        b: round((temp[2] + m) * 255)
    };
}

function HSVtoHSL(h, s, v) {

    if (arguments.length == 1) {
        var _arguments$2 = arguments[0],
            h = _arguments$2.h,
            s = _arguments$2.s,
            v = _arguments$2.v;
    }

    var rgb = HSVtoRGB(h, s, v);

    return RGBtoHSL(rgb.r, rgb.g, rgb.b);
}

var fromHSV = Object.freeze({
	HSVtoRGB: HSVtoRGB,
	HSVtoHSL: HSVtoHSL
});

function HUEtoRGB(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

function HSLtoHSV(h, s, l) {

    if (arguments.length == 1) {
        var _arguments$ = arguments[0],
            h = _arguments$.h,
            s = _arguments$.s,
            l = _arguments$.l;
    }
    var rgb = HSLtoRGB(h, s, l);

    return RGBtoHSV(rgb.r, rgb.g, rgb.b);
}

function HSLtoRGB(h, s, l) {

    if (arguments.length == 1) {
        var _arguments$2 = arguments[0],
            h = _arguments$2.h,
            s = _arguments$2.s,
            l = _arguments$2.l;
    }

    var r, g, b;

    h /= 360;
    s /= 100;
    l /= 100;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = HUEtoRGB(p, q, h + 1 / 3);
        g = HUEtoRGB(p, q, h);
        b = HUEtoRGB(p, q, h - 1 / 3);
    }

    return { r: round(r * 255), g: round(g * 255), b: round(b * 255) };
}

var fromHSL = Object.freeze({
	HUEtoRGB: HUEtoRGB,
	HSLtoHSV: HSLtoHSV,
	HSLtoRGB: HSLtoRGB
});

function YCrCbtoRGB(y, cr, cb, bit) {

    if (arguments.length == 1) {
        var _arguments$ = arguments[0],
            y = _arguments$.y,
            cr = _arguments$.cr,
            cb = _arguments$.cb,
            bit = _arguments$.bit;

        bit = bit || 0;
    }
    var R = y + 1.402 * (cr - bit);
    var G = y - 0.344 * (cb - bit) - 0.714 * (cr - bit);
    var B = y + 1.772 * (cb - bit);

    return { r: Math.ceil(R), g: Math.ceil(G), b: Math.ceil(B) };
}

var fromYCrCb = Object.freeze({
	YCrCbtoRGB: YCrCbtoRGB
});

var color_names = { aliceblue: "rgb(240, 248, 255)", antiquewhite: "rgb(250, 235, 215)", aqua: "rgb(0, 255, 255)", aquamarine: "rgb(127, 255, 212)", azure: "rgb(240, 255, 255)", beige: "rgb(245, 245, 220)", bisque: "rgb(255, 228, 196)", black: "rgb(0, 0, 0)", blanchedalmond: "rgb(255, 235, 205)", blue: "rgb(0, 0, 255)", blueviolet: "rgb(138, 43, 226)", brown: "rgb(165, 42, 42)", burlywood: "rgb(222, 184, 135)", cadetblue: "rgb(95, 158, 160)", chartreuse: "rgb(127, 255, 0)", chocolate: "rgb(210, 105, 30)", coral: "rgb(255, 127, 80)", cornflowerblue: "rgb(100, 149, 237)", cornsilk: "rgb(255, 248, 220)", crimson: "rgb(237, 20, 61)", cyan: "rgb(0, 255, 255)", darkblue: "rgb(0, 0, 139)", darkcyan: "rgb(0, 139, 139)", darkgoldenrod: "rgb(184, 134, 11)", darkgray: "rgb(169, 169, 169)", darkgrey: "rgb(169, 169, 169)", darkgreen: "rgb(0, 100, 0)", darkkhaki: "rgb(189, 183, 107)", darkmagenta: "rgb(139, 0, 139)", darkolivegreen: "rgb(85, 107, 47)", darkorange: "rgb(255, 140, 0)", darkorchid: "rgb(153, 50, 204)", darkred: "rgb(139, 0, 0)", darksalmon: "rgb(233, 150, 122)", darkseagreen: "rgb(143, 188, 143)", darkslateblue: "rgb(72, 61, 139)", darkslategray: "rgb(47, 79, 79)", darkslategrey: "rgb(47, 79, 79)", darkturquoise: "rgb(0, 206, 209)", darkviolet: "rgb(148, 0, 211)", deeppink: "rgb(255, 20, 147)", deepskyblue: "rgb(0, 191, 255)", dimgray: "rgb(105, 105, 105)", dimgrey: "rgb(105, 105, 105)", dodgerblue: "rgb(30, 144, 255)", firebrick: "rgb(178, 34, 34)", floralwhite: "rgb(255, 250, 240)", forestgreen: "rgb(34, 139, 34)", fuchsia: "rgb(255, 0, 255)", gainsboro: "rgb(220, 220, 220)", ghostwhite: "rgb(248, 248, 255)", gold: "rgb(255, 215, 0)", goldenrod: "rgb(218, 165, 32)", gray: "rgb(128, 128, 128)", grey: "rgb(128, 128, 128)", green: "rgb(0, 128, 0)", greenyellow: "rgb(173, 255, 47)", honeydew: "rgb(240, 255, 240)", hotpink: "rgb(255, 105, 180)", indianred: "rgb(205, 92, 92)", indigo: "rgb(75, 0, 130)", ivory: "rgb(255, 255, 240)", khaki: "rgb(240, 230, 140)", lavender: "rgb(230, 230, 250)", lavenderblush: "rgb(255, 240, 245)", lawngreen: "rgb(124, 252, 0)", lemonchiffon: "rgb(255, 250, 205)", lightblue: "rgb(173, 216, 230)", lightcoral: "rgb(240, 128, 128)", lightcyan: "rgb(224, 255, 255)", lightgoldenrodyellow: "rgb(250, 250, 210)", lightgreen: "rgb(144, 238, 144)", lightgray: "rgb(211, 211, 211)", lightgrey: "rgb(211, 211, 211)", lightpink: "rgb(255, 182, 193)", lightsalmon: "rgb(255, 160, 122)", lightseagreen: "rgb(32, 178, 170)", lightskyblue: "rgb(135, 206, 250)", lightslategray: "rgb(119, 136, 153)", lightslategrey: "rgb(119, 136, 153)", lightsteelblue: "rgb(176, 196, 222)", lightyellow: "rgb(255, 255, 224)", lime: "rgb(0, 255, 0)", limegreen: "rgb(50, 205, 50)", linen: "rgb(250, 240, 230)", magenta: "rgb(255, 0, 255)", maroon: "rgb(128, 0, 0)", mediumaquamarine: "rgb(102, 205, 170)", mediumblue: "rgb(0, 0, 205)", mediumorchid: "rgb(186, 85, 211)", mediumpurple: "rgb(147, 112, 219)", mediumseagreen: "rgb(60, 179, 113)", mediumslateblue: "rgb(123, 104, 238)", mediumspringgreen: "rgb(0, 250, 154)", mediumturquoise: "rgb(72, 209, 204)", mediumvioletred: "rgb(199, 21, 133)", midnightblue: "rgb(25, 25, 112)", mintcream: "rgb(245, 255, 250)", mistyrose: "rgb(255, 228, 225)", moccasin: "rgb(255, 228, 181)", navajowhite: "rgb(255, 222, 173)", navy: "rgb(0, 0, 128)", oldlace: "rgb(253, 245, 230)", olive: "rgb(128, 128, 0)", olivedrab: "rgb(107, 142, 35)", orange: "rgb(255, 165, 0)", orangered: "rgb(255, 69, 0)", orchid: "rgb(218, 112, 214)", palegoldenrod: "rgb(238, 232, 170)", palegreen: "rgb(152, 251, 152)", paleturquoise: "rgb(175, 238, 238)", palevioletred: "rgb(219, 112, 147)", papayawhip: "rgb(255, 239, 213)", peachpuff: "rgb(255, 218, 185)", peru: "rgb(205, 133, 63)", pink: "rgb(255, 192, 203)", plum: "rgb(221, 160, 221)", powderblue: "rgb(176, 224, 230)", purple: "rgb(128, 0, 128)", rebeccapurple: "rgb(102, 51, 153)", red: "rgb(255, 0, 0)", rosybrown: "rgb(188, 143, 143)", royalblue: "rgb(65, 105, 225)", saddlebrown: "rgb(139, 69, 19)", salmon: "rgb(250, 128, 114)", sandybrown: "rgb(244, 164, 96)", seagreen: "rgb(46, 139, 87)", seashell: "rgb(255, 245, 238)", sienna: "rgb(160, 82, 45)", silver: "rgb(192, 192, 192)", skyblue: "rgb(135, 206, 235)", slateblue: "rgb(106, 90, 205)", slategray: "rgb(112, 128, 144)", slategrey: "rgb(112, 128, 144)", snow: "rgb(255, 250, 250)", springgreen: "rgb(0, 255, 127)", steelblue: "rgb(70, 130, 180)", tan: "rgb(210, 180, 140)", teal: "rgb(0, 128, 128)", thistle: "rgb(216, 191, 216)", tomato: "rgb(255, 99, 71)", turquoise: "rgb(64, 224, 208)", violet: "rgb(238, 130, 238)", wheat: "rgb(245, 222, 179)", white: "rgb(255, 255, 255)", whitesmoke: "rgb(245, 245, 245)", yellow: "rgb(255, 255, 0)", yellowgreen: "rgb(154, 205, 50)", transparent: "rgba(0, 0, 0, 0)" };

function isColorName(name) {
    return !!color_names[name];
}

function getColorByName(name) {
    return color_names[name];
}

var ColorNames = {
    isColorName: isColorName,
    getColorByName: getColorByName
};

var color_regexp = /(#(?:[\da-f]{3}){1,2}|rgb\((?:\s*\d{1,3},\s*){2}\d{1,3}\s*\)|rgba\((?:\s*\d{1,3},\s*){3}\d*\.?\d+\s*\)|hsl\(\s*\d{1,3}(?:,\s*\d{1,3}%){2}\s*\)|hsla\(\s*\d{1,3}(?:,\s*\d{1,3}%){2},\s*\d*\.?\d+\s*\)|([\w_\-]+))/gi;
function matches$1(str) {
    var matches = str.match(color_regexp);
    var result = [];

    if (!matches) {
        return result;
    }

    for (var i = 0, len = matches.length; i < len; i++) {

        if (matches[i].indexOf('#') > -1 || matches[i].indexOf('rgb') > -1 || matches[i].indexOf('hsl') > -1) {
            result.push({ color: matches[i] });
        } else {
            var nameColor = ColorNames.getColorByName(matches[i]);

            if (nameColor) {
                result.push({ color: matches[i], nameColor: nameColor });
            }
        }
    }

    var pos = { next: 0 };
    result.forEach(function (item) {
        var startIndex = str.indexOf(item.color, pos.next);

        item.startIndex = startIndex;
        item.endIndex = startIndex + item.color.length;

        pos.next = item.endIndex;
    });

    return result;
}

function convertMatches(str) {
    var m = matches$1(str);

    m.forEach(function (it, index) {
        str = str.replace(it.color, '@' + index);
    });

    return { str: str, matches: m };
}

function convertMatchesArray(str) {
    var splitStr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ',';

    var ret = convertMatches(str);
    return ret.str.split(splitStr).map(function (it, index) {
        it = trim(it);

        if (ret.matches[index]) {
            it = it.replace('@' + index, ret.matches[index].color);
        }

        return it;
    });
}

function reverseMatches(str, matches) {
    matches.forEach(function (it, index) {
        str = str.replace('@' + index, it.color);
    });

    return str;
}

function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

/**
 * @method rgb
 *
 * parse string to rgb color
 *
 * 		color.parse("#FF0000") === { r : 255, g : 0, b : 0 }
 *
 * 		color.parse("rgb(255, 0, 0)") == { r : 255, g : 0, b :0 }
 * 		color.parse(0xff0000) == { r : 255, g : 0, b : 0 }
 * 		color.parse(0xff000000) == { r : 255, g : 0, b : 0, a: 0 }
 *
 * @param {String} str color string
 * @returns {Object}  rgb object
 */
function parse(str) {
    if (isString(str)) {

        if (ColorNames.isColorName(str)) {
            str = ColorNames.getColorByName(str);
        }

        if (str.indexOf("rgb(") > -1) {
            var arr = str.replace("rgb(", "").replace(")", "").split(",");

            for (var i = 0, len = arr.length; i < len; i++) {
                arr[i] = parseInt(trim(arr[i]), 10);
            }

            var obj = { type: 'rgb', r: arr[0], g: arr[1], b: arr[2], a: 1 };

            obj = _extends({}, obj, RGBtoHSL(obj));

            return obj;
        } else if (str.indexOf("rgba(") > -1) {
            var arr = str.replace("rgba(", "").replace(")", "").split(",");

            for (var i = 0, len = arr.length; i < len; i++) {

                if (len - 1 == i) {
                    arr[i] = parseFloat(trim(arr[i]));
                } else {
                    arr[i] = parseInt(trim(arr[i]), 10);
                }
            }

            var obj = { type: 'rgb', r: arr[0], g: arr[1], b: arr[2], a: arr[3] };

            obj = _extends({}, obj, RGBtoHSL(obj));

            return obj;
        } else if (str.indexOf("hsl(") > -1) {
            var arr = str.replace("hsl(", "").replace(")", "").split(",");

            for (var i = 0, len = arr.length; i < len; i++) {
                arr[i] = parseFloat(trim(arr[i]));
            }

            var obj = { type: 'hsl', h: arr[0], s: arr[1], l: arr[2], a: 1 };

            obj = _extends({}, obj, HSLtoRGB(obj));

            return obj;
        } else if (str.indexOf("hsla(") > -1) {
            var arr = str.replace("hsla(", "").replace(")", "").split(",");

            for (var i = 0, len = arr.length; i < len; i++) {

                if (len - 1 == i) {
                    arr[i] = parseFloat(trim(arr[i]));
                } else {
                    arr[i] = parseInt(trim(arr[i]), 10);
                }
            }

            var obj = { type: 'hsl', h: arr[0], s: arr[1], l: arr[2], a: arr[3] };

            obj = _extends({}, obj, HSLtoRGB(obj));

            return obj;
        } else if (str.indexOf("#") == 0) {

            str = str.replace("#", "");

            var arr = [];
            if (str.length == 3) {
                for (var i = 0, len = str.length; i < len; i++) {
                    var char = str.substr(i, 1);
                    arr.push(parseInt(char + char, 16));
                }
            } else {
                for (var i = 0, len = str.length; i < len; i += 2) {
                    arr.push(parseInt(str.substr(i, 2), 16));
                }
            }

            var obj = { type: 'hex', r: arr[0], g: arr[1], b: arr[2], a: 1 };

            obj = _extends({}, obj, RGBtoHSL(obj));

            return obj;
        }
    } else if (isNumber(str)) {
        if (0x000000 <= str && str <= 0xffffff) {
            var r = (str & 0xff0000) >> 16;
            var g = (str & 0x00ff00) >> 8;
            var b = (str & 0x0000ff) >> 0;

            var obj = { type: 'hex', r: r, g: g, b: b, a: 1 };
            obj = _extends({}, obj, RGBtoHSL(obj));
            return obj;
        } else if (0x00000000 <= str && str <= 0xffffffff) {
            var _r = (str & 0xff000000) >> 24;
            var _g = (str & 0x00ff0000) >> 16;
            var _b = (str & 0x0000ff00) >> 8;
            var a = (str & 0x000000ff) / 255;

            var obj = { type: 'hex', r: _r, g: _g, b: _b, a: a };
            obj = _extends({}, obj, RGBtoHSL(obj));

            return obj;
        }
    }

    return str;
}

function parseGradient(colors) {
    if (isString(colors)) {
        colors = convertMatchesArray(colors);
    }

    colors = colors.map(function (it) {
        if (isString(it)) {
            var ret = convertMatches(it);
            var arr = trim(ret.str).split(WHITE_STRING$1);

            if (arr[1]) {
                if (arr[1].includes('%')) {
                    arr[1] = parseFloat(arr[1].replace(/%/, '')) / 100;
                } else {
                    arr[1] = parseFloat(arr[1]);
                }
            } else {
                arr[1] = '*';
            }

            arr[0] = reverseMatches(arr[0], ret.matches);

            return arr;
        } else if (Array.isArray(it)) {

            if (!it[1]) {
                it[1] = '*';
            } else if (isString(it[1])) {
                if (it[1].includes('%')) {
                    it[1] = parseFloat(it[1].replace(/%/, '')) / 100;
                } else {
                    it[1] = +it[1];
                }
            }

            return [].concat(toConsumableArray(it));
        }
    });

    var count = colors.filter(function (it) {
        return it[1] === '*';
    }).length;

    if (count > 0) {
        var sum = colors.filter(function (it) {
            return it[1] != '*' && it[1] != 1;
        }).map(function (it) {
            return it[1];
        }).reduce(function (total, cur) {
            return total + cur;
        }, 0);

        var dist = (1 - sum) / count;
        colors.forEach(function (it, index) {
            if (it[1] == '*' && index > 0) {
                if (colors.length - 1 == index) {
                    // it[1] = 1 
                } else {
                    it[1] = dist;
                }
            }
        });
    }

    return colors;
}



var parser = Object.freeze({
	matches: matches$1,
	convertMatches: convertMatches,
	convertMatchesArray: convertMatchesArray,
	reverseMatches: reverseMatches,
	trim: trim,
	parse: parse,
	parseGradient: parseGradient
});

function interpolateRGB(startColor, endColor) {
    var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;
    var exportFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'hex';

    var obj = interpolateRGBObject(startColor, endColor, t);

    return format(obj, obj.a < 1 ? 'rgb' : exportFormat);
}

function interpolateRGBObject(startColor, endColor) {
    var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

    return {
        r: round(startColor.r + (endColor.r - startColor.r) * t),
        g: round(startColor.g + (endColor.g - startColor.g) * t),
        b: round(startColor.b + (endColor.b - startColor.b) * t),
        a: round(startColor.a + (endColor.a - startColor.a) * t, 100)
    };
}

function scale(scale) {
    var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

    if (!scale) return [];

    if (isString(scale)) {
        scale = convertMatchesArray(scale);
    }

    scale = scale || [];
    var len = scale.length;

    var colors = [];
    for (var i = 0; i < len - 1; i++) {
        for (var index = 0; index < count; index++) {
            colors.push(blend(scale[i], scale[i + 1], index / count));
        }
    }
    return colors;
}

function blend(startColor, endColor) {
    var ratio = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;
    var format$$1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'hex';

    var s = parse(startColor);
    var e = parse(endColor);

    return interpolateRGB(s, e, ratio, format$$1);
}

function mix(startcolor, endColor) {
    var ratio = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;
    var format$$1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'hex';

    return blend(startcolor, endColor, ratio, format$$1);
}

/**
 * 
 * @param {Color|String} c 
 */
function contrast$1(c$$1) {
    c$$1 = parse(c$$1);
    return (Math.round(c$$1.r * 299) + Math.round(c$$1.g * 587) + Math.round(c$$1.b * 114)) / 1000;
}

function contrastColor(c$$1) {
    return contrast$1(c$$1) >= 128 ? 'black' : 'white';
}

function gradient$1(colors) {
    var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    colors = parseGradient(colors);

    var newColors = [];
    var maxCount = count - (colors.length - 1);
    var allCount = maxCount;

    for (var i = 1, len = colors.length; i < len; i++) {

        var startColor = colors[i - 1][0];
        var endColor = colors[i][0];

        // if it is second color
        var rate = i == 1 ? colors[i][1] : colors[i][1] - colors[i - 1][1];

        // if it is last color 
        var colorCount = i == colors.length - 1 ? allCount : Math.floor(rate * maxCount);

        newColors = newColors.concat(scale([startColor, endColor], colorCount), [endColor]);

        allCount -= colorCount;
    }
    return newColors;
}

function scaleHSV(color) {
    var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'h';
    var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 9;
    var exportFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'rgb';
    var min = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var max = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    var dist = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 100;

    var colorObj = parse(color);
    var hsv = RGBtoHSV(colorObj);
    var unit = (max - min) * dist / count;

    var results = [];
    for (var i = 1; i <= count; i++) {
        hsv[target] = Math.abs((dist - unit * i) / dist);
        results.push(format(HSVtoRGB(hsv), exportFormat));
    }

    return results;
}

function scaleH(color) {
    var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 9;
    var exportFormat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'rgb';
    var min = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var max = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 360;

    return scaleHSV(color, 'h', count, exportFormat, min, max, 1);
}

function scaleS(color) {
    var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 9;
    var exportFormat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'rgb';
    var min = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var max = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

    return scaleHSV(color, 's', count, exportFormat, min, max, 100);
}

function scaleV(color) {
    var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 9;
    var exportFormat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'rgb';
    var min = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var max = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

    return scaleHSV(color, 'v', count, exportFormat, min, max, 100);
}

/* predefined scale colors */
scale.parula = function (count) {
    return scale(['#352a87', '#0f5cdd', '#00b5a6', '#ffc337', '#fdff00'], count);
};

scale.jet = function (count) {
    return scale(['#00008f', '#0020ff', '#00ffff', '#51ff77', '#fdff00', '#ff0000', '#800000'], count);
};

scale.hsv = function (count) {
    return scale(['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'], count);
};

scale.hot = function (count) {
    return scale(['#0b0000', '#ff0000', '#ffff00', '#ffffff'], count);
};
scale.pink = function (count) {
    return scale(['#1e0000', '#bd7b7b', '#e7e5b2', '#ffffff'], count);
};

scale.bone = function (count) {
    return scale(['#000000', '#4a4a68', '#a6c6c6', '#ffffff'], count);
};

scale.copper = function (count) {
    return scale(['#000000', '#3d2618', '#9d623e', '#ffa167', '#ffc77f'], count);
};

var mixin = Object.freeze({
	interpolateRGB: interpolateRGB,
	interpolateRGBObject: interpolateRGBObject,
	scale: scale,
	blend: blend,
	mix: mix,
	contrast: contrast$1,
	contrastColor: contrastColor,
	gradient: gradient$1,
	scaleHSV: scaleHSV,
	scaleH: scaleH,
	scaleS: scaleS,
	scaleV: scaleV
});

function array_equals(v1, v2) {
    if (v1.length !== v2.length) return false;
    for (var i = 0, len = v1.length; i < len; ++i) {
        if (v1[i] !== v2[i]) return false;
    }
    return true;
}

function euclidean(v1, v2) {
    var total = 0;

    for (var i = 0, len = v1.length; i < len; i++) {
        total += Math.pow(v2[i] - v1[i], 2);
    }

    return Math.sqrt(total);
}

function manhattan(v1, v2) {
    var total = 0;

    for (var i = 0, len = v1.length; i < len; i++) {
        total += Math.abs(v2[i] - v1[i]);
    }

    return total;
}

function max(v1, v2) {
    var max = 0;
    for (var i = 0, len = v1.length; i < len; i++) {
        max = Math.max(max, Math.abs(v2[i] - v1[i]));
    }

    return max;
}

var distances = {
    euclidean: euclidean,
    manhattan: manhattan,
    max: max
};

var create_random_number = {
    linear: function linear(num, count) {
        var centeroids = [];
        var start = Math.round(Math.random() * num);
        var dist = Math.floor(num / count);

        do {

            centeroids.push(start);

            start = (start + dist) % num;
        } while (centeroids.length < count);

        return centeroids;
    },

    shuffle: function shuffle(num, count) {
        var centeroids = [];

        while (centeroids.length < count) {

            var index = Math.round(Math.random() * num);

            if (centeroids.indexOf(index) == -1) {
                centeroids.push(index);
            }
        }

        return centeroids;
    }

};

function randomCentroids(points, k) {
    var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'linear';


    var centeroids = create_random_number[method](points.length, k);

    return centeroids.map(function (i) {
        return points[i];
    });

    // var centeroids = points.slice(0);

    // centeroids.sort(function () {
    //     return (Math.round(Math.random()) - 0.5);
    // })

    // return centeroids.slice(0, k); 
}

function closestCenteroid(point, centeroids, distance) {
    var min = Infinity,
        kIndex = 0;

    centeroids.forEach(function (center, i) {
        var dist = distance(point, center);

        if (dist < min) {
            min = dist;
            kIndex = i;
        }
    });

    return kIndex;
}

function getCenteroid(assigned) {

    if (!assigned.length) return [];

    // initialize centeroid list 
    var centeroid = new Array(assigned[0].length);
    for (var i = 0, len = centeroid.length; i < len; i++) {
        centeroid[i] = 0;
    }

    for (var index = 0, len = assigned.length; index < len; index++) {
        var it = assigned[index];

        var last = index + 1;

        for (var j = 0, jLen = it.length; j < jLen; j++) {
            centeroid[j] += (it[j] - centeroid[j]) / last;
        }
    }

    centeroid = centeroid.map(function (it) {
        return Math.floor(it);
    });

    return centeroid;
}

function unique_array(arrays) {
    return arrays;
    // var set = {};
    // var count = arrays.length;
    // let it = null;
    // while (count--) {
    //     it = arrays[count];
    //     set[JSON.stringify(it)] = it;
    // }

    // return Object.values(set);
}

function splitK(k, points, centeroids, distance) {
    var assignment = new Array(k);

    for (var i = 0; i < k; i++) {
        assignment[i] = [];
    }

    for (var idx = 0, pointLength = points.length; idx < pointLength; idx++) {
        var point = points[idx];
        var index = closestCenteroid(point, centeroids, distance);
        assignment[index].push(point);
    }

    return assignment;
}

function setNewCenteroid(k, points, assignment, centeroids, movement, randomFunction) {

    for (var i = 0; i < k; i++) {
        var assigned = assignment[i];

        var centeroid = centeroids[i];
        var newCenteroid = new Array(centeroid.length);

        if (assigned.length > 0) {
            newCenteroid = getCenteroid(assigned);
        } else {
            var idx = Math.floor(randomFunction() * points.length);
            newCenteroid = points[idx];
        }

        if (array_equals(newCenteroid, centeroid)) {
            movement = false;
        } else {
            movement = true;
        }

        centeroids[i] = newCenteroid;
    }

    return movement;
}

function kmeans(points, k, distanceFunction) {
    var period = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
    var initialRandom = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'linear';

    points = unique_array(points);

    k = k || Math.max(2, Math.ceil(Math.sqrt(points.length / 2)));

    var distance = distanceFunction || 'euclidean';
    if (isString(distance)) {
        distance = distances[distance];
    }

    var rng_seed = 0;
    var random = function random() {
        rng_seed = (rng_seed * 9301 + 49297) % 233280;
        return rng_seed / 233280;
    };

    var centeroids = randomCentroids(points, k, initialRandom);

    var movement = true;
    var iterations = 0;
    while (movement) {
        var assignment = splitK(k, points, centeroids, distance);

        movement = setNewCenteroid(k, points, assignment, centeroids, false, random);

        iterations++;

        if (iterations % period == 0) {
            break;
        }
    }

    return centeroids;
}

var ImageLoader = function () {
    function ImageLoader(url) {
        var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, ImageLoader);

        this.isLoaded = false;
        this.imageUrl = url;
        this.opt = opt;
        this.initialize();
    }

    createClass(ImageLoader, [{
        key: 'initialize',
        value: function initialize() {
            this.canvas = this.createCanvas();
            this.context = this.canvas.getContext('2d');
        }
    }, {
        key: 'createCanvas',
        value: function createCanvas() {
            return document.createElement('canvas');
        }
    }, {
        key: 'load',
        value: function load(callback) {
            this.loadImage(callback);
        }
    }, {
        key: 'loadImage',
        value: function loadImage(callback) {
            var _this = this;

            this.getImage(function (img) {
                var ctx = _this.context;
                var ratio = img.height / img.width;

                if (_this.opt.canvasWidth && _this.opt.canvasHeight) {
                    _this.canvas.width = _this.opt.canvasWidth;
                    _this.canvas.height = _this.opt.canvasHeight;
                } else {
                    _this.canvas.width = _this.opt.maxWidth ? _this.opt.maxWidth : img.width;
                    _this.canvas.height = _this.canvas.width * ratio;
                }

                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, _this.canvas.width, _this.canvas.height);
                _this.isLoaded = true;
                callback && callback();
            });
        }
    }, {
        key: 'getImage',
        value: function getImage(callback) {

            this.newImage = new Image();
            var img = this.newImage;
            img.onload = function () {
                callback && callback(img);
            };

            img.onerror = function (e) {
                console.log(e, img.src);
            };

            this.getImageUrl(function (url) {
                img.src = url;
            });
        }
    }, {
        key: 'load',
        value: function load(callback) {
            var _this2 = this;

            this.newImage = new Image();
            var img = this.newImage;
            img.crossOrigin = "Anonymous";
            img.onload = function () {
                _this2.isLoaded = true;
                callback && callback();
            };

            this.getImageUrl(function (url) {
                img.src = url;
            });
        }
    }, {
        key: 'getImageUrl',
        value: function getImageUrl(callback) {
            if (isString(this.imageUrl)) {
                return callback(this.imageUrl);
            } else if (this.imageUrl instanceof Blob) {
                var reader = new FileReader();

                reader.onload = function (ev) {
                    callback(ev.target.result);
                };

                reader.readAsDataURL(this.imageUrl);
            }
        }
    }, {
        key: 'getRGBA',
        value: function getRGBA(r, g, b, a) {
            return [r, g, b, a];
        }
    }, {
        key: 'toArray',
        value: function toArray$$1(filter, callback) {
            var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var imagedata = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var width = imagedata.width;
            var height = imagedata.height;

            var pixels = new Uint8ClampedArray(imagedata.data);

            var bitmap = { pixels: pixels, width: width, height: height };

            if (!filter) {
                filter = function () {
                    return function (bitmap, done) {
                        done(bitmap);
                    };
                }();
            }

            filter(bitmap, function (newBitmap) {
                var tmpCanvas = Canvas.drawPixels(newBitmap);

                if (opt.returnTo == 'canvas') {
                    callback(tmpCanvas);
                } else {
                    callback(tmpCanvas.toDataURL(opt.outputFormat || 'image/png'));
                }
            }, opt);
        }
    }, {
        key: 'toHistogram',
        value: function toHistogram(opt) {
            var imagedata = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var width = imagedata.width;
            var height = imagedata.height;

            var pixels = new Uint8ClampedArray(imagedata.data);

            var bitmap = { pixels: pixels, width: width, height: height };

            return Canvas.getHistogram(bitmap);
        }
    }, {
        key: 'toRGB',
        value: function toRGB() {
            var imagedata = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

            var rgba = imagedata.data;
            var results = [];
            for (var i = 0, len = rgba.length; i < len; i += 4) {
                results[results.length] = [rgba[i + 0], rgba[i + 1], rgba[i + 2], rgba[i + 3]];
            }

            return results;
        }
    }]);
    return ImageLoader;
}();

function parseParamNumber$2(param) {
    if (isString(param)) {
        param = param.replace(/deg/, '');
        param = param.replace(/px/, '');
        param = param.replace(/em/, '');
        param = param.replace(/%/, '');
    }
    return +param;
}

function weight$1(arr) {
    var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return arr.map(function (i) {
        return i * num;
    });
}

var SHADER_INDEX = 0;

function convolutionString(count) {

    var width = Math.sqrt(count);
    var half = Math.floor(width / 2);

    return [].concat(toConsumableArray(Array(count))).map(function (it, index) {
        var y = Math.floor(index / width) - half;
        var x = index % width - half;

        return 'texture(u_image, v_texCoord + onePixel * vec2(' + x + ', ' + y + ')) * u_kernel' + count + '[' + index + ']';
    }).join(' + \n');
}

function multi$3(str) {
    return [].concat(Array.prototype.slice.call(arguments));
}

function convolution$1(arr) {

    return {
        type: 'convolution',
        length: arr.length,
        content: arr
    };
}

function makeShader(str, index) {
    return '\n        if (u_filterIndex == ' + index + '.0) {\n            ' + str + '\n        }\n    ';
}

function shader(str, options) {
    return {
        type: 'shader',
        index: SHADER_INDEX,
        options: options,
        content: makeShader(str, SHADER_INDEX++)
    };
}

function makeVertexShaderSource() {
    return '#version 300 es \n\n        in vec2 a_position;\n        in vec2 a_texCoord; \n\n        uniform vec2 u_resolution;\n        uniform float u_flipY;\n\n        out vec2 v_texCoord; \n\n        void main() {\n            vec2 zeroToOne = a_position / u_resolution;\n\n            vec2 zeroToTwo = zeroToOne * 2.0;\n\n            vec2 clipSpace = zeroToTwo - 1.0;\n\n            gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);\n\n            v_texCoord = a_texCoord;\n\n        }\n    ';
}

function makeConvolution(count) {

    return '\n    \n    if (u_kernelSelect == ' + count + '.0) {\n        vec4 colorSum = ' + convolutionString(count) + '; \n\n        outColor = vec4((colorSum / u_kernel' + count + 'Weight).rgb, 1);\n        \n    }\n    ';
}

function makeFragmentShaderSource(filterShaderList) {

    var filterContent = filterShaderList.filter(function (f) {
        return f.type == 'shader';
    }).map(function (f) {
        return f.content;
    }).join('\n\n');

    var weightTable = { '9': true };

    filterShaderList.filter(function (f) {
        return f.type == 'convolution';
    }).forEach(function (f) {
        weightTable[f.length] = true;
    });

    var convolutionString = Object.keys(weightTable).map(function (len) {
        return makeConvolution(+len);
    }).join('\n');

    return '#version 300 es\n\n    precision highp int;\n    precision mediump float;\n    \n    uniform sampler2D u_image;\n\n    // 3 is 3x3 matrix kernel \n    uniform float u_kernelSelect;\n    uniform float u_filterIndex;\n\n    uniform float u_kernel9[9];\n    uniform float u_kernel9Weight;\n    uniform float u_kernel25[25];\n    uniform float u_kernel25Weight;\n    uniform float u_kernel49[49];\n    uniform float u_kernel49Weight;\n    uniform float u_kernel81[81];\n    uniform float u_kernel81Weight;    \n\n    in vec2 v_texCoord;\n    \n    out vec4 outColor;\n\n    float random (vec2 st) {\n        return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);\n    } \n\n    // \n    vec3 rgb2hsv(vec3 c)\n    {\n        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n        vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);\n        vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);\n\n        float d = q.x - min(q.w, q.y);\n        float e = 1.0e-10;\n        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n    }\n\n    vec3 hsv2rgb(vec3 c)\n    {\n        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n    }\n    \n    void main() {\n        vec4 pixelColor = texture(u_image, v_texCoord);\n        vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));                \n\n        ' + filterContent + '\n\n        ' + convolutionString + '\n\n    }';
}

function colorToVec4(color) {
    color = [color.r / 255, color.g / 255, color.b / 255, color.a || 0].map(toFloatString);
    return 'vec4(' + color + ')';
}

function toFloatString(number) {
    if (number == Math.floor(number)) {
        return number + '.0';
    }

    return number;
}

function blur$1 () {
    return convolution$1([1, 1, 1, 1, 1, 1, 1, 1, 1]);
}

function normal () {
    return convolution$1([0, 0, 0, 0, 1, 0, 0, 0, 0]);
}

function emboss$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

    amount = parseParamNumber$2(amount);
    return convolution$1([amount * -2.0, -amount, 0.0, -amount, 1.0, amount, 0.0, amount, amount * 2.0]);
}

function gaussianBlur$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = parseParamNumber$2(amount) * (1 / 16);

    return convolution$1(weight$1([1, 2, 1, 2, 4, 2, 1, 2, 1], C));
}

function gaussianBlur5x$1() {
    return convolution$1([1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, 36, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1]);
}

function grayscale2$1() {
    return convolution$1([0.3, 0.3, 0.3, 0, 0, 0.59, 0.59, 0.59, 0, 0, 0.11, 0.11, 0.11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}

function kirschHorizontal$1() {
    return convolution$1([5, 5, 5, -3, 0, -3, -3, -3, -3]);
}

function kirschVertical$1() {
    return convolution$1([5, -3, -3, 5, 0, -3, 5, -3, -3]);
}

function laplacian$1() {
    return convolution$1([-1, -1, -1, -1, 8, -1, -1, -1, -1]);
}

function laplacian5x$1() {
    return convolution$1([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
}

function motionBlur$1() {
    return convolution$1([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
}

function motionBlur2$1() {
    return convolution$1([1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]);
}

function motionBlur3$1() {
    return convolution$1([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
}

function negative$1() {
    return convolution$1([-1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1]);
}

function sepia2$1() {
    return convolution$1([0.393, 0.349, 0.272, 0, 0, 0.769, 0.686, 0.534, 0, 0, 0.189, 0.168, 0.131, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}

function sharpen$1() {
    return convolution$1([0, -1, 0, -1, 5, -1, 0, -1, 0]);
}

function sobelHorizontal$1() {
    return convolution$1([-1, -2, -1, 0, 0, 0, 1, 2, 1]);
}

function sobelVertical$1() {
    return convolution$1([-1, 0, 1, -2, 0, 2, -1, 0, 1]);
}

function transparency$1() {
    return convolution$1([1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0, 0, 1]);
}

function unsharpMasking$1() {
    return convolution$1(weight$1([1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, -476, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1], -1 / 256));
}

var matrix$2 = {
     blur: blur$1,
     normal: normal,
     emboss: emboss$1,
     gaussianBlur: gaussianBlur$1,
     'gaussian-blur': gaussianBlur$1,
     gaussianBlur5x: gaussianBlur5x$1,
     'gaussian-blur-5x': gaussianBlur5x$1,
     grayscale2: grayscale2$1,
     kirschHorizontal: kirschHorizontal$1,
     'kirsch-horizontal': kirschHorizontal$1,
     kirschVertical: kirschVertical$1,
     'kirsch-vertical': kirschVertical$1,
     laplacian: laplacian$1,
     laplacian5x: laplacian5x$1,
     'laplacian-5x': laplacian5x$1,
     motionBlur: motionBlur$1,
     'motion-blur': motionBlur$1,
     motionBlur2: motionBlur2$1,
     'motion-blur-2': motionBlur2$1,
     motionBlur3: motionBlur3$1,
     'motion-blur-3': motionBlur3$1,
     negative: negative$1,
     sepia2: sepia2$1,
     sharpen: sharpen$1,
     sobelHorizontal: sobelHorizontal$1,
     'sobel-horizontal': sobelHorizontal$1,
     sobelVertical: sobelVertical$1,
     'sobel-vertical': sobelVertical$1,
     transparency: transparency$1,
     unsharpMasking: unsharpMasking$1,
     'unsharp-masking': unsharpMasking$1
};

function bitonal$1(darkColor, lightColor) {
    var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

    var checkVlue = toFloatString(threshold);
    var darkColorString = colorToVec4(Color$1.parse(darkColor));
    var lightColorString = colorToVec4(Color$1.parse(lightColor));

    return shader('\n        if ((pixelColor.r + pixelColor.g + pixelColor.b) > ' + checkVlue + ') {\n            outColor = vec4(' + lightColorString + '.rgb, pixelColor.a);\n        } else {\n            outColor = vec4(' + darkColorString + '.rgb, pixelColor.a);\n        }\n    ');
}

function brightness$2() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        outColor = pixelColor + (' + C + ');\n    ');
}

function matrix$3() {
    var $a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var $b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var $c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var $d = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var $e = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var $f = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var $g = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
    var $h = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
    var $i = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 0;
    var $j = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 0;
    var $k = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 0;
    var $l = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 0;
    var $m = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : 0;
    var $n = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : 0;
    var $o = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : 0;
    var $p = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : 0;


    var matrix = [$a, $b, $c, $d, $e, $f, $g, $h, $i, $j, $k, $l, $m, $n, $o, $p].map(toFloatString);

    return shader('\n\n        outColor = vec4(\n            ' + matrix[0] + ' * pixelColor.r + ' + matrix[1] + ' * pixelColor.g + ' + matrix[2] + ' * pixelColor.b + ' + matrix[3] + ' * pixelColor.a,\n            ' + matrix[4] + ' * pixelColor.r + ' + matrix[5] + ' * pixelColor.g + ' + matrix[6] + ' * pixelColor.b + ' + matrix[7] + ' * pixelColor.a,\n            ' + matrix[8] + ' * pixelColor.r + ' + matrix[9] + ' * pixelColor.g + ' + matrix[10] + ' * pixelColor.b + ' + matrix[11] + ' * pixelColor.a,\n            ' + matrix[12] + ' * pixelColor.r + ' + matrix[13] + ' * pixelColor.g + ' + matrix[14] + ' * pixelColor.b + ' + matrix[15] + ' * pixelColor.a\n        ); \n    ');
}

function brownie$1() {

    return matrix$3(0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, 0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, 0, 0, 0, 1);
}

function clip$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        outColor = vec4(\n            (pixelColor.r > 1.0 - ' + C + ') ? 1.0 : 0.0,\n            (pixelColor.g > 1.0 - ' + C + ') ? 1.0 : 0.0,\n            (pixelColor.b > 1.0 - ' + C + ') ? 1.0 : 0.0,\n            pixelColor.a \n        );\n    ');
}

function chaos() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        vec2 st = pixelColor.st;\n        st *= ' + C + ';\n        \n        vec2 ipos = floor(st);  // get the integer coords\n\n        vec3 color = vec3(random( ipos ));\n\n        outColor = vec4(color, pixelColor.a);\n    ');
}

function contrast$2() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        outColor = pixelColor * ' + C + ';\n    ');
}

function gamma$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        outColor = vec4(pow(pixelColor.r, ' + C + '), pow(pixelColor.g, ' + C + '), pow(pixelColor.b, ' + C + '), pixelColor.a );\n    ');
}

function gradient$2() {
    // 전체 매개변수 기준으로 파싱 
    // 색이 아닌 것 기준으로 scale 변수로 인식 

    var params = [].concat(Array.prototype.slice.call(arguments));

    if (params.length === 1 && isString(params[0])) {
        params = Color$1.convertMatchesArray(params[0]);
    }

    params = params.map(function (arg) {
        return arg;
    }).join(', ');

    var colors = Color$1.parseGradient(params);

    colors[0][1] = 0;
    colors[colors.length - 1][1] = 1;

    colors = colors.map(function (c) {
        var _Color$parse = Color$1.parse(c[0]),
            r = _Color$parse.r,
            g = _Color$parse.g,
            b = _Color$parse.b,
            a = _Color$parse.a;

        return [{ r: r, g: g, b: b, a: a }, c[1]];
    });

    var temp = [];

    for (var i = 0, len = colors.length; i < len - 1; i++) {
        var start = colors[i];
        var end = colors[i + 1];

        var startColor = colorToVec4(start[0]);
        var endColor = colorToVec4(end[0]);

        var startRate = toFloatString(start[1]);
        var endRate = toFloatString(end[1]);

        temp.push('\n            if (' + startRate + ' <= rate && rate < ' + endRate + ') {\n                outColor = mix(' + startColor + ', ' + endColor + ', (rate - ' + startRate + ')/(' + endRate + ' - ' + startRate + '));\n            }\n        ');
    }

    return shader('\n        float rate = (pixelColor.r * 0.2126 + pixelColor.g * 0.7152 + pixelColor.b * 0.0722); \n\n        ' + temp.join('\n') + '        \n    ');
}

function grayscale$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = parseParamNumber$2(amount);

    if (C > 1) C = 1;

    return matrix$3(0.2126 + 0.7874 * (1 - C), 0.7152 - 0.7152 * (1 - C), 0.0722 - 0.0722 * (1 - C), 0, 0.2126 - 0.2126 * (1 - C), 0.7152 + 0.2848 * (1 - C), 0.0722 - 0.0722 * (1 - C), 0, 0.2126 - 0.2126 * (1 - C), 0.7152 - 0.7152 * (1 - C), 0.0722 + 0.9278 * (1 - C), 0, 0, 0, 0, 1);
}

//http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
function hue$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        vec3 hsv = rgb2hsv(pixelColor.rgb);\n        hsv.x += ' + C + ';\n        outColor = vec4(hsv2rgb(hsv).rgb, pixelColor.a);\n    ');
}

function invert$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        outColor = vec4(\n            (1.0 - pixelColor.r) * ' + C + ',\n            (1.0 - pixelColor.g) * ' + C + ',\n            (1.0 - pixelColor.b) * ' + C + ',\n            pixelColor.a\n        );\n    ');
}

function kodachrome$1() {

    return matrix$3(1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 0, 0, 0, 1);
}

function noise$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;


    var C = Math.abs(parseParamNumber$2(amount));
    var min = toFloatString(-C);
    var max = toFloatString(C);
    return shader('\n        float rnd = ' + min + ' + random( pixelColor.st ) * (' + max + ' - ' + min + ');\n\n        outColor = vec4(pixelColor.rgb + rnd, 1.0);\n    ');
}

function opacity$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = toFloatString(parseParamNumber$2(amount));

    return shader('\n        outColor = vec4(pixelColor.rgb, pixelColor.a * ' + C + ');\n    ');
}

function polaroid$1() {

    return matrix$3(1.438, -0.062, -0.062, 0, -0.122, 1.378, -0.122, 0, -0.016, -0.016, 1.483, 0, 0, 0, 0, 1);
}

function saturation$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var L = 1 - Math.abs(parseParamNumber$2(amount));

    return matrix$3(L, 0, 0, 0, 0, L, 0, 0, 0, 0, L, 0, 0, 0, 0, L);
}

function sepia$1() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var C = parseParamNumber$2(amount);
    if (C > 1) C = 1;

    return matrix$3(0.393 + 0.607 * (1 - C), 0.769 - 0.769 * (1 - C), 0.189 - 0.189 * (1 - C), 0, 0.349 - 0.349 * (1 - C), 0.686 + 0.314 * (1 - C), 0.168 - 0.168 * (1 - C), 0, 0.272 - 0.272 * (1 - C), 0.534 - 0.534 * (1 - C), 0.131 + 0.869 * (1 - C), 0, 0, 0, 0, 1);
}

function shade$1() {
    var redValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var greenValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var blueValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    var r = toFloatString(parseParamNumber$2(redValue) / 255);
    var g = toFloatString(parseParamNumber$2(greenValue) / 255);
    var b = toFloatString(parseParamNumber$2(blueValue) / 255);

    return shader('\n        outColor = vec4(\n            pixelColor.r * ' + r + ',\n            pixelColor.g * ' + g + ',\n            pixelColor.b * ' + b + ',\n            pixelColor.a\n        );\n    ');
}

function shift$1() {

    return matrix$3(1.438, -0.062, -0.062, 0, -0.122, 1.378, -0.122, 0, -0.016, -0.016, 1.483, 0, 0, 0, 0, 1);
}

function solarize$1(redValue, greenValue, blueValue) {
    var r = toFloatString(parseParamNumber$2(redValue));
    var g = toFloatString(parseParamNumber$2(greenValue));
    var b = toFloatString(parseParamNumber$2(blueValue));

    return shader('\n        outColor = vec4(\n            (pixelColor.r < ' + r + ') ? 1.0 - pixelColor.r: pixelColor.r,\n            (pixelColor.g < ' + g + ') ? 1.0 - pixelColor.g: pixelColor.g,\n            (pixelColor.b < ' + b + ') ? 1.0 - pixelColor.b: pixelColor.b,\n            pixelColor.a\n        );\n    ');
}

function technicolor$1() {

    return matrix$3(1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 0, 0, 0, 1);
}

function thresholdColor$1() {
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    scale = toFloatString(parseParamNumber$2(scale));

    return shader('\n        float c = ( (pixelColor.r * 0.2126 + pixelColor.g * 0.7152 + pixelColor.b * 0.0722) ) >= ' + scale + ' ? 1.0 : 0.0;\n\n        outColor = vec4(c, c, c, pixelColor.a);\n    ');
}

function threshold$1() {
  var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
  var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  return thresholdColor$1(scale, amount, false);
}

function tint$1 () {
    var redTint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var greenTint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var blueTint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var r = parseParamNumber$2(redTint);
    var g = parseParamNumber$2(greenTint);
    var b = parseParamNumber$2(blueTint);

    return shader('\n        outColor = vec4(\n            pixelColor.r += (1 - pixelColor.r) * ' + r + ',\n            pixelColor.g += (1 - pixelColor.g) * ' + g + ',\n            pixelColor.b += (1 - pixelColor.b) * ' + b + ',\n            pixelColor.a\n        );\n    ');
}

var pixel$2 = {
    bitonal: bitonal$1,
    brightness: brightness$2,
    brownie: brownie$1,
    clip: clip$1,
    chaos: chaos,
    contrast: contrast$2,
    gamma: gamma$1,
    gradient: gradient$2,
    grayscale: grayscale$1,
    hue: hue$1,
    invert: invert$1,
    kodachrome: kodachrome$1,
    matrix: matrix$3,
    noise: noise$1,
    opacity: opacity$1,
    polaroid: polaroid$1,
    saturation: saturation$1,
    sepia: sepia$1,
    shade: shade$1,
    shift: shift$1,
    solarize: solarize$1,
    technicolor: technicolor$1,
    threshold: threshold$1,
    'threshold-color': thresholdColor$1,
    tint: tint$1
};

function kirsch$1() {
    return multi$3('kirsch-horizontal kirsch-vertical');
}

function sobel$1() {
    return multi$3('sobel-horizontal sobel-vertical');
}

function vintage$1() {
    return multi$3('brightness(0.15) saturation(-0.2) gamma(1.8)');
}

var multi$4 = {
    kirsch: kirsch$1,
    sobel: sobel$1,
    vintage: vintage$1
};

var GLFilter = _extends({}, matrix$2, pixel$2, multi$4);

var TEXTURE_INDEX = 0;

var GLCanvas = function () {
    function GLCanvas() {
        var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
            width: '400px',
            height: '300px'
        };
        classCallCheck(this, GLCanvas);

        this.img = opt.img;
        this.width = parseFloat(this.img.width || opt.width || px(400));
        this.height = parseFloat(this.img.height || opt.height || px(300));
        this.init();
    }

    createClass(GLCanvas, [{
        key: 'resize',
        value: function resize() {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.width = px(this.width);
            this.canvas.style.height = px(this.height);

            this.viewport();
        }

        /* Canvas 비우기, 비울 때 색 지정하기  */

    }, {
        key: 'clear',
        value: function clear() {
            var r = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var g = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var b = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            var gl = this.gl;

            gl.clearColor(r, g, b, a);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        /* viewport 설정, 기본적으로 canvas 의 크기로 고정  */

    }, {
        key: 'viewport',
        value: function viewport(x, y, width, height) {
            var gl = this.gl;

            gl.viewport(x || 0, y || 0, width || gl.canvas.width, height || gl.canvas.height);
        }

        // canvas 초기화 
        // gl context 구하기 

    }, {
        key: 'initCanvas',
        value: function initCanvas(vertexSource, fragmentSource) {
            this.canvas = document.createElement('canvas');

            this.gl = this.canvas.getContext('webgl2');

            if (!this.gl) {
                throw new Error("you need webgl2 support");
            }

            // program 생성 
            this.program = this.createProgram(vertexSource, fragmentSource);

            // this.clear()
            this.resize();

            // buffer 설정 
            this.initBuffer();
        }
    }, {
        key: 'draw',
        value: function draw() {
            var primitiveType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'TRIANGLES';
            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;

            var gl = this.gl;

            gl.drawArrays(gl[primitiveType], offset, count);
        }
    }, {
        key: 'triangles',
        value: function triangles() {
            var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;

            this.draw('TRIANGLES', offset, count);
        }
    }, {
        key: 'uniform2f',
        value: function uniform2f() {
            var _gl;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var key = args.shift();

            (_gl = this.gl).uniform2f.apply(_gl, [this.locations[key]].concat(args));
        }
    }, {
        key: 'uniform1f',
        value: function uniform1f() {
            var _gl2;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var key = args.shift();

            (_gl2 = this.gl).uniform1f.apply(_gl2, [this.locations[key]].concat(args));
        }
    }, {
        key: 'uniform1fv',
        value: function uniform1fv() {
            var _gl3;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            var key = args.shift();

            (_gl3 = this.gl).uniform1fv.apply(_gl3, [this.locations[key]].concat(args));
        }
    }, {
        key: 'uniform1i',
        value: function uniform1i() {
            var _gl4;

            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            var key = args.shift();

            (_gl4 = this.gl).uniform1i.apply(_gl4, [this.locations[key]].concat(args));
        }
    }, {
        key: 'useProgram',
        value: function useProgram() {
            var gl = this.gl;

            gl.useProgram(this.program);
        }
    }, {
        key: 'bindBuffer',
        value: function bindBuffer(key, data) {
            var drawType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'STATIC_DRAW';

            var gl = this.gl;

            if (!this.buffers[key]) {
                this.buffers[key] = gl.createBuffer();
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[key]);

            if (data) {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl[drawType]);
            }
        }
    }, {
        key: 'enable',
        value: function enable(key) {
            var gl = this.gl;

            // array attribute 를 활성화 시킴 
            gl.enableVertexAttribArray(this.locations[key]);
        }
    }, {
        key: 'location',
        value: function location(key) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "attribute";

            if (type === 'attribute') {
                this.locations[key] = this.gl.getAttribLocation(this.program, key);
            } else if (type === 'uniform') {
                this.locations[key] = this.gl.getUniformLocation(this.program, key);
            }
        }
    }, {
        key: 'a',
        value: function a(key) {
            return this.location(key);
        }
    }, {
        key: 'u',
        value: function u(key) {
            return this.location(key, "uniform");
        }
    }, {
        key: 'pointer',
        value: function pointer(key) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'FLOAT';
            var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
            var normalize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
            var stride = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
            var offset = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

            var gl = this.gl;

            gl.vertexAttribPointer(this.locations[key], size, gl[type], normalize, stride, offset);
        }
    }, {
        key: 'bufferData',
        value: function bufferData() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var gl = this.gl;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        }
    }, {
        key: 'isPowerOf2',
        value: function isPowerOf2(value$$1) {
            return (value$$1 & value$$1 - 1) == 0;
        }
    }, {
        key: 'bindTexture',
        value: function bindTexture(key) {
            var img = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
            var mipLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var internalFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'RGBA';
            var srcFormat = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'RGBA';
            var srcType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'UNSIGNED_BYTE';

            var gl = this.gl;

            if (arguments.length == 1) {
                gl.bindTexture(gl.TEXTURE_2D, this.textures[key]);
                return;
            }

            if (!this.textures[key]) {
                this.textures[key] = gl.createTexture();
            }

            this.textureIndex[key] = TEXTURE_INDEX++;
            // this.activeTexture(key)
            gl.bindTexture(gl.TEXTURE_2D, this.textures[key]);

            this.setTextureParameter();

            gl.texImage2D(gl.TEXTURE_2D, mipLevel, gl[internalFormat], gl[srcFormat], gl[srcType], img.newImage || img);
        }
    }, {
        key: 'bindColorTexture',
        value: function bindColorTexture(key, data) {
            var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 256;
            var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
            var mipLevel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
            var internalFormat = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'RGBA';
            var srcFormat = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'RGBA';
            var srcType = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'UNSIGNED_BYTE';

            var gl = this.gl;

            if (!this.textures[key]) {
                this.textures[key] = gl.createTexture();
            }

            this.textureIndex[key] = TEXTURE_INDEX++;
            gl.bindTexture(gl.TEXTURE_2D, this.textures[key]);

            this.setTextureParameter();

            gl.texImage2D(gl.TEXTURE_2D, mipLevel, gl[internalFormat], width, height, 0, gl[srcFormat], gl[srcType], new Uint8Array(data));
        }
    }, {
        key: 'bindEmptyTexture',
        value: function bindEmptyTexture(key, width, height) {
            var mipLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            var internalFormat = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'RGBA';
            var srcFormat = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'RGBA';
            var srcType = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'UNSIGNED_BYTE';

            var gl = this.gl;

            if (!this.textures[key]) {
                this.textures[key] = gl.createTexture();
            }

            this.textureIndex[key] = TEXTURE_INDEX++;
            gl.bindTexture(gl.TEXTURE_2D, this.textures[key]);

            this.setTextureParameter();

            var border = 0;
            var data = null;

            gl.texImage2D(gl.TEXTURE_2D, mipLevel, gl[internalFormat], width, height, border, gl[srcFormat], gl[srcType], data);
        }
    }, {
        key: 'setTextureParameter',
        value: function setTextureParameter() {
            var gl = this.gl;

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }, {
        key: 'bindFrameBufferWithTexture',
        value: function bindFrameBufferWithTexture(key, textureKey, width, height) {
            this.bindEmptyTexture(textureKey, width, height);
            this.bindFrameBuffer(key, textureKey);
        }
    }, {
        key: 'enumToString',
        value: function enumToString(value$$1) {
            var gl = this.gl;

            if (value$$1 === 0) {
                return "NONE";
            }
            for (var key in gl) {
                if (gl[key] === value$$1) {
                    return key;
                }
            }
            return "0x" + value$$1.toString(16);
        }
    }, {
        key: 'bindFrameBuffer',
        value: function bindFrameBuffer(key) {
            var textureKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var gl = this.gl;

            if (arguments.length === 1) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, key == null ? null : this.framebuffers[key]);
                return;
            }

            if (!this.framebuffers[key]) {
                // 프레임버퍼 생성하기 
                this.framebuffers[key] = gl.createFramebuffer();
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[key]);

            // framebuffer 에 texture2d 연결 
            var mipLevel = 0;
            var attachmentPoint = gl.COLOR_ATTACHMENT0; // framebuffer 를 attachmentPoint 에 연결한다. 
            // framebuffer 는 데이타를 가지고 있지 않고 연결 고리만 가지고 있다. 
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.textures[textureKey], mipLevel);

            // framebuffer 상태 체크 하기 
            // framebuffer 를 더 이상 할당 못할 수도 있음. 
            var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

            // console.log(this.enumToString(attachmentPoint), this.enumToString(status), key, this.textures[textureKey]);

            if (status !== gl.FRAMEBUFFER_COMPLETE) {
                return;
            }
        }
    }, {
        key: 'bindVA',
        value: function bindVA() {
            var gl = this.gl;

            if (!this.vao) {
                this.vao = gl.createVertexArray();
            }

            gl.bindVertexArray(this.vao);
        }
    }, {
        key: 'bindAttr',
        value: function bindAttr(key, data) {
            var drawType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'STATIC_DRAW';
            var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;

            // 버퍼를 만들고 데이타를 연결한다. 
            this.bindBuffer(key, data, drawType);

            //array 변수를 사용할 수 있도록 활성화 시킨다. 
            this.enable(key);

            // 포인터를 지정한다. 
            // array 변수가 어떻게 iteration 될지 지정한다. size 는 한번에 연산될 요소 개수 
            // size 가 2 라고 했을 때 2개씩 하나의 iteration 에 들어간다. 
            // 즉, (x, y) 가 한번에 들어감 
            this.pointer(key, 'FLOAT', size);
        }

        /* 
            shader 에서 사용하는 Attribute, Uniform 변수 설정 
            변수 설정을 간소화 할 필요도 있을 듯 하다. 
        */

    }, {
        key: 'initBuffer',
        value: function initBuffer() {
            var _canvas = this.canvas,
                width = _canvas.width,
                height = _canvas.height;

            // console.log(width, height)

            // 선언된 변수 location 지정 하기 
            // location 을 지정해야 GLSL 에서 해당 변수와 연결할 수 있다. 언제? 

            this.a("a_position");
            this.a("a_texCoord");
            this.u("u_resolution");
            this.u("u_image");
            this.u("u_flipY");

            this.u("u_kernelSelect");
            this.u("u_filterIndex");

            this.u("u_kernel9[0]");
            this.u("u_kernel9Weight");
            this.u("u_kernel25[0]");
            this.u("u_kernel25Weight");
            this.u("u_kernel49[0]");
            this.u("u_kernel49Weight");
            this.u("u_kernel81[0]");
            this.u("u_kernel81Weight");

            this.bindVA();

            // 단순 변수를 초기화 하고 
            this.bindAttr("a_position", [0, 0, width, 0, 0, height, 0, height, width, 0, width, height], 'STATIC_DRAW', 2 /* components for iteration */);

            // 변수에 데이타를 연결할다. 
            this.bindAttr("a_texCoord", [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0], 'STATIC_DRAW', 2 /* components for iteration */);

            // texture 는 img 로 할 수도 있고 
            this.bindTexture("u_image", this.img);

            // 비어있는 texture 도 만들 수 있다. 
            // 객체로 제어할까? 
            // texture 를 framebuffer 로 바로 대응시킨다. 
            // 이후 framebuffer 가 변경되면 img_texture 가 바뀐다. 
            this.bindFrameBufferWithTexture("frame_buffer_0", "img_texture_0", width, height);
            this.bindFrameBufferWithTexture("frame_buffer_1", "img_texture_1", width, height);
        }
    }, {
        key: 'activeTexture',
        value: function activeTexture() {
            var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            var gl = this.gl;

            gl.activeTexture(gl.TEXTURE0 + index);
        }
    }, {
        key: 'drawFilter',
        value: function drawFilter() {
            var _this = this;

            var gl = this.gl;

            this.resize();
            this.clear();

            this.useProgram();

            this.bindVA();

            this.activeTexture(0);
            this.bindTexture('u_image');

            this.uniform1i("u_image", 0);
            this.uniform1f("u_flipY", 1);

            var _gl$canvas = gl.canvas,
                width = _gl$canvas.width,
                height = _gl$canvas.height;


            this.eachFilter(function (f, index) {

                _this.bindFrameBuffer('frame_buffer_' + index % 2);
                _this.uniform2f("u_resolution", width, height);
                _this.viewport(0, 0, width, height);

                _this.effectFilter(f);

                // 다음 드로잉을 위해 방금 렌더링 한 텍스처를 사용합니다.
                _this.bindTexture('img_texture_' + index % 2);
            });

            this.uniform1f("u_flipY", -1);
            this.bindFrameBuffer(null);
            this.uniform2f("u_resolution", width, height);
            this.viewport(0, 0, width, height);

            // clear 가 있는 이유는? 
            this.clear();

            this.effectFilter("normal");
        }
    }, {
        key: 'effectFilter',
        value: function effectFilter(filterFunction) {

            if (isString(filterFunction)) {
                filterFunction = (GLFilter[filterFunction] || GLFilter.normal).call(GLFilter);
            }

            if (filterFunction.type == 'convolution') {
                this.uniform1f("u_kernelSelect", filterFunction.length);
                this.uniform1f("u_filterIndex", -1.0);
                this.uniform1fv('u_kernel' + filterFunction.length + '[0]', filterFunction.content);
                this.uniform1f('u_kernel' + filterFunction.length + 'Weight', this.computeKernelWeight(filterFunction.content));
            } else {

                this.uniform1f("u_kernelSelect", -1.0);
                this.uniform1f("u_filterIndex", filterFunction.index);
            }

            this.triangles(0 /* 시작 지점 */, 6 /* 좌표(vertex, 꼭지점) 개수 */); // 총 6개를 도는데 , triangles 니깐 3개씩 묶어서 2번 돈다. 
        }
    }, {
        key: 'computeKernelWeight',
        value: function computeKernelWeight(kernel) {
            var weight = kernel.reduce(function (prev, curr) {
                return prev + curr;
            });
            return weight <= 0 ? 1 : weight;
        }
    }, {
        key: 'createProgram',
        value: function createProgram(vertexSource, fragmentSource) {

            var gl = this.gl;

            var program = gl.createProgram();

            this.vertexShader = this.createVertexShader(vertexSource);
            this.fragmentShader = this.createFragmentShader(fragmentSource);

            // console.log(fragmentSource)      


            gl.attachShader(program, this.vertexShader);
            gl.attachShader(program, this.fragmentShader);

            gl.linkProgram(program);

            var success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {

                return program;
            }

            console.error(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        }
    }, {
        key: 'createShader',
        value: function createShader(type, source) {
            var gl = this.gl;

            var shader$$1 = gl.createShader(type);
            gl.shaderSource(shader$$1, source);
            gl.compileShader(shader$$1);

            var success = gl.getShaderParameter(shader$$1, gl.COMPILE_STATUS);

            if (success) {
                return shader$$1;
            }

            console.error(gl.getShaderInfoLog(shader$$1));
            gl.deleteShader(shader$$1);
        }
    }, {
        key: 'createVertexShader',
        value: function createVertexShader(vertexSource) {
            var gl = this.gl;

            return this.createShader(gl.VERTEX_SHADER, vertexSource);
        }
    }, {
        key: 'createFragmentShader',
        value: function createFragmentShader(fragmentSource) {
            var gl = this.gl;

            return this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
        }
    }, {
        key: 'eachFilter',
        value: function eachFilter(callback) {
            this.filterList.forEach(callback);
        }
    }, {
        key: 'init',
        value: function init() {
            this.locations = {};
            this.buffers = {};
            this.framebuffers = {};
            this.textures = {};
            this.textureIndex = {};
            this.hasTexParameter = {};
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            var gl = this.gl;

            this.init();

            gl.deleteProgram(this.program);
        }
    }, {
        key: 'filter',
        value: function filter(filterList, doneCallback) {

            this.filterList = filterList;

            this.initCanvas(makeVertexShaderSource(), makeFragmentShaderSource(this.filterList));

            this.drawFilter();

            if (isFunction(doneCallback)) {
                doneCallback(this);
            }
        }
    }]);
    return GLCanvas;
}();

var GL$1 = {
    GLCanvas: GLCanvas
};

var functions$1 = {
    filter: filter$1
};






function makeFilterFunction(filterObj) {
    var filterName = filterObj.arr[0];
    var f = GLFilter[filterName];

    var arr = filterObj.arr;
    arr.shift();

    var result = f.apply(this, arr);

    return result;
}

/**
 * 겹쳐져 있는 Filter 함수를 1차원으로 나열한다. 
 * ex)  ['sobel'] => ['sobel-horizontal', 'sobel-vertial'] 
 * 
 * @param {String|Array} filterString 
 */
function flatFilter(filterString) {

    var filter_list = [];

    if (isString(filterString)) {
        filter_list = matches(filterString);
    } else if (Array.isArray(filterString)) {
        filter_list = filterString;
    }

    var allFilter = [];

    filter_list.forEach(function (filterObj) {
        var filterName = filterObj.arr[0];

        if (GLFilter[filterName]) {
            var f = makeFilterFunction(filterObj);

            if (f.type == 'convolution' || f.type == 'shader') {
                allFilter.push(f);
            } else {
                f.forEach(function (subFilter) {
                    allFilter = allFilter.concat(flatFilter(subFilter));
                });
            }
        }
    });

    // console.log(filter_list, allFilter)

    return allFilter;
}

function filter$1(img, filterString, callback, opt) {

    var canvas = new GL$1.GLCanvas({
        width: opt.width || img.width,
        height: opt.height || img.height,
        img: img
    });

    canvas.filter(flatFilter(filterString), function done() {
        if (isFunction(callback)) {
            callback(canvas);
        }
    });
}

var GL = _extends({}, GL$1, functions$1);

function palette(colors) {
    var k = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;
    var exportFormat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'hex';


    if (colors.length > k) {
        colors = kmeans(colors, k);
    }

    return colors.map(function (c) {
        return format(c, exportFormat);
    });
}

function ImageToRGB(url) {
    var callbackOrOption = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var callback = arguments[2];


    if (!callback) {
        var img = new ImageLoader(url);
        img.loadImage(function () {
            if (isFunction(callbackOrOption)) {
                callbackOrOption(img.toRGB());
            }
        });
    } else if (callback) {
        var img = new ImageLoader(url, callbackOrOption);
        img.loadImage(function () {
            if (isFunction(callback)) {
                callback(img.toRGB());
            }
        });
    }
}

function ImageToCanvas(url, filter, callback) {
    var opt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { frameTimer: 'full' };

    ImageToURL(url, filter, callback, _extends({ returnTo: 'canvas' }, opt));
}

function ImageToURL(url, filter, callback) {
    var opt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { frameTimer: 'full' };

    var img = new ImageLoader(url);
    img.loadImage(function () {
        img.toArray(filter, function (datauri) {
            if (isFunction(callback)) {
                callback(datauri);
            }
        }, opt);
    });
}

function GLToCanvas(url, filter, callback) {
    var opt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var img = new ImageLoader(url);
    img.load(function () {
        GL.filter(img.newImage, filter, function done(datauri) {
            if (isFunction(callback)) {
                callback(datauri);
            }
        }, opt);
    });
}

function histogram$1(url, callback) {
    var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var img = new ImageLoader(url);
    img.loadImage(function () {
        if (isFunction(callback)) {
            callback(img.toHistogram(opt));
        }
    });
}

function histogramToPoints(points) {
    var tension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.2;


    var controlPoints = [];
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (i == 0) {
            controlPoints[i] = [];
            continue;
        }

        if (i == points.length - 1) {
            controlPoints[i] = [];
            continue;
        }

        var prevPoint = points[i - 1];
        var nextPoint = points[i + 1];

        // 기울기 
        var M = (nextPoint[1] - prevPoint[1]) / (nextPoint[0] - prevPoint[0]);

        var newControlPoint = [prevPoint[0] + (nextPoint[0] - prevPoint[0]) * tension, prevPoint[1] + (nextPoint[1] - prevPoint[1]) * tension];

        var controlPoint = [[].concat(toConsumableArray(prevPoint)), /* start */
        [].concat(newControlPoint) /* end */
        ];

        var P = Math.sqrt(Math.pow(p[0] - prevPoint[0], 2) + Math.pow(p[1] - prevPoint[1], 2));
        var N = Math.sqrt(Math.pow(nextPoint[0] - p[0], 2) + Math.pow(nextPoint[1] - p[1], 2));

        var rate = P / N;

        var dx = controlPoint[0][0] + (controlPoint[1][0] - controlPoint[0][0]) * rate;
        var dy = controlPoint[0][1] + (controlPoint[1][1] - controlPoint[0][1]) * rate;

        controlPoint[0][0] += p[0] - dx;
        controlPoint[0][1] += p[1] - dy;
        controlPoint[1][0] += p[0] - dx;
        controlPoint[1][1] += p[1] - dy;

        controlPoints[i] = controlPoint;
    }

    return controlPoints;
}

function ImageToHistogram(url, callback) {
    var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { width: 200, height: 100 };


    var img = new ImageLoader(url);
    img.loadImage(function () {
        Canvas.createHistogram(opt.width || 200, opt.height || 100, img.toHistogram(opt), function (canvas) {
            if (isFunction(callback)) callback(canvas.toDataURL('image/png'));
        }, opt);
    });
}



var image$2 = Object.freeze({
	palette: palette,
	ImageToRGB: ImageToRGB,
	ImageToCanvas: ImageToCanvas,
	ImageToURL: ImageToURL,
	GLToCanvas: GLToCanvas,
	histogram: histogram$1,
	histogramToPoints: histogramToPoints,
	ImageToHistogram: ImageToHistogram
});

var Color$1 = _extends({}, formatter, math, mixin, parser, fromYCrCb, fromRGB, fromCMYK, fromHSV, fromHSL, fromLAB, image$2, func);

var hue_color = [{ rgb: '#ff0000', start: .0 }, { rgb: '#ffff00', start: .17 }, { rgb: '#00ff00', start: .33 }, { rgb: '#00ffff', start: .50 }, { rgb: '#0000ff', start: .67 }, { rgb: '#ff00ff', start: .83 }, { rgb: '#ff0000', start: 1 }];

function checkHueColor(p) {
    var startColor, endColor;

    for (var i = 0; i < hue_color.length; i++) {
        if (hue_color[i].start >= p) {
            startColor = hue_color[i - 1];
            endColor = hue_color[i];
            break;
        }
    }

    if (startColor && endColor) {
        return Color$1.interpolateRGB(startColor, endColor, (p - startColor.start) / (endColor.start - startColor.start));
    }

    return hue_color[0].rgb;
}

function initHueColors() {
    for (var i = 0, len = hue_color.length; i < len; i++) {
        var hue = hue_color[i];

        var obj = Color$1.parse(hue.rgb);

        hue.r = obj.r;
        hue.g = obj.g;
        hue.b = obj.b;
    }
}

initHueColors();

var HueColor = {
    colors: hue_color,
    checkHueColor: checkHueColor
};

// TODO: worker run 
var ImageFilter = _extends({}, FilterList, functions);

var counter = 0;
var cached = [];

var Dom = function () {
    function Dom(tag, className, attr) {
        classCallCheck(this, Dom);


        if (isNotString(tag)) {
            this.el = tag;
        } else {

            var el = document.createElement(tag);
            this.uniqId = counter++;

            if (className) {
                el.className = className;
            }

            attr = attr || {};

            for (var k in attr) {
                el.setAttribute(k, attr[k]);
            }

            this.el = el;
        }
    }

    createClass(Dom, [{
        key: "attr",
        value: function attr(key, value$$1) {
            if (arguments.length == 1) {
                return this.el.getAttribute(key);
            }

            this.el.setAttribute(key, value$$1);

            return this;
        }
    }, {
        key: "attrs",
        value: function attrs() {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return args.map(function (key) {
                return _this.el.getAttribute(key);
            });
        }
    }, {
        key: "removeAttr",
        value: function removeAttr(key) {
            this.el.removeAttribute(key);

            return this;
        }
    }, {
        key: "is",
        value: function is(checkElement) {
            return this.el === (checkElement.el || checkElement);
        }
    }, {
        key: "closest",
        value: function closest(cls) {

            var temp = this;
            var checkCls = false;

            while (!(checkCls = temp.hasClass(cls))) {
                if (temp.el.parentNode) {
                    temp = new Dom(temp.el.parentNode);
                } else {
                    return null;
                }
            }

            if (checkCls) {
                return temp;
            }

            return null;
        }
    }, {
        key: "parent",
        value: function parent() {
            return new Dom(this.el.parentNode);
        }
    }, {
        key: "removeClass",
        value: function removeClass() {
            var _el$classList;

            (_el$classList = this.el.classList).remove.apply(_el$classList, arguments);

            /*
            if (this.el.className) {
                var className = this.el.className;
                 if ($1) { className = ((` ${className} `).replace(` ${$1} `, WHITE_STRING)).trim();    }
                if ($2) { className = ((` ${className} `).replace(` ${$2} `, WHITE_STRING)).trim();    }
                if ($3) { className = ((` ${className} `).replace(` ${$3} `, WHITE_STRING)).trim();    }
                if ($4) { className = ((` ${className} `).replace(` ${$4} `, WHITE_STRING)).trim();    }
                if ($5) { className = ((` ${className} `).replace(` ${$5} `, WHITE_STRING)).trim();    }
                 this.el.className = className;
            }
            */

            return this;
        }
    }, {
        key: "hasClass",
        value: function hasClass(cls) {
            if (!this.el.classList) return false;
            return this.el.classList.contains(cls);
        }
    }, {
        key: "addClass",
        value: function addClass() {
            var _el$classList2;

            (_el$classList2 = this.el.classList).add.apply(_el$classList2, arguments);

            return this;
        }
    }, {
        key: "toggleClass",
        value: function toggleClass(cls, isForce) {

            this.el.classList.toggle(cls, isForce);

            /*
            if (arguments.length == 2) {
                if (isForce) {
                    this.addClass(cls)
                } else {
                    this.removeClass(cls);
                }
            } else {
                if (this.hasClass(cls)) {
                    this.removeClass(cls);
                } else {
                    this.addClass(cls);
                }
            }
            */
        }
    }, {
        key: "html",
        value: function html$$1(_html) {

            if (isUndefined$1(_html)) {
                return this.el.innerHTML;
            }

            if (isString(_html)) {
                this.el.innerHTML = _html;
            } else {
                this.empty().append(_html);
            }

            return this;
        }
    }, {
        key: "find",
        value: function find(selector) {
            return this.el.querySelector(selector);
        }
    }, {
        key: "$",
        value: function $(selector) {
            var node = this.find(selector);
            return node ? new Dom(node) : null;
        }
    }, {
        key: "findAll",
        value: function findAll(selector) {
            return this.el.querySelectorAll(selector);
        }
    }, {
        key: "$$",
        value: function $$(selector) {
            return [].concat(toConsumableArray(this.findAll(selector))).map(function (node) {
                return new Dom(node);
            });
        }
    }, {
        key: "empty",
        value: function empty() {
            return this.html(EMPTY_STRING);
        }
    }, {
        key: "append",
        value: function append(el) {

            if (isString(el)) {
                this.el.appendChild(document.createTextNode(el));
            } else {
                this.el.appendChild(el.el || el);
            }

            return this;
        }
    }, {
        key: "appendHTML",
        value: function appendHTML(html$$1) {
            var $dom = new Dom("div").html(html$$1);

            this.append($dom.createChildrenFragment());
        }
    }, {
        key: "createChildrenFragment",
        value: function createChildrenFragment() {
            var list = this.children();

            var fragment = document.createDocumentFragment();
            list.forEach(function ($el) {
                return fragment.appendChild($el.el);
            });

            return fragment;
        }
    }, {
        key: "appendTo",
        value: function appendTo(target) {
            var t = target.el ? target.el : target;

            t.appendChild(this.el);

            return this;
        }
    }, {
        key: "remove",
        value: function remove() {
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }

            return this;
        }
    }, {
        key: "text",
        value: function text(value$$1) {
            if (isUndefined$1(value$$1)) {
                return this.el.textContent;
            } else {

                var tempText = value$$1;

                if (value$$1 instanceof Dom) {
                    tempText = value$$1.text();
                }

                this.el.textContent = tempText;
                return this;
            }
        }

        /**
         * 
         * $el.css`
         *  border-color: yellow;
         * `
         * 
         * @param {*} key 
         * @param {*} value 
         */

    }, {
        key: "css",
        value: function css(key, value$$1) {
            var _this2 = this;

            if (isNotUndefined(key) && isNotUndefined(value$$1)) {
                this.el.style[key] = value$$1;
            } else if (isNotUndefined(key)) {

                if (isString(key)) {
                    return getComputedStyle(this.el)[key];
                } else {
                    var keys = key || {};

                    keyEach(keys, function (k, value$$1) {
                        _this2.el.style[k] = value$$1;
                    });
                }
            }

            return this;
        }
    }, {
        key: "cssText",
        value: function cssText(value$$1) {
            if (isUndefined$1(value$$1)) {
                return this.el.style.cssText;
            }

            this.el.style.cssText = value$$1;

            return this;
        }
    }, {
        key: "cssArray",
        value: function cssArray(arr) {

            if (arr[0]) this.el.style[arr[0]] = arr[1];
            if (arr[2]) this.el.style[arr[2]] = arr[3];
            if (arr[4]) this.el.style[arr[4]] = arr[5];
            if (arr[6]) this.el.style[arr[6]] = arr[7];
            if (arr[8]) this.el.style[arr[8]] = arr[9];

            return this;
        }
    }, {
        key: "cssFloat",
        value: function cssFloat(key) {
            return parseFloat(this.css(key));
        }
    }, {
        key: "cssInt",
        value: function cssInt(key) {
            return parseInt(this.css(key));
        }
    }, {
        key: "px",
        value: function px$$1(key, value$$1) {
            return this.css(key, px(value$$1));
        }
    }, {
        key: "rect",
        value: function rect() {
            return this.el.getBoundingClientRect();
        }
    }, {
        key: "offset",
        value: function offset() {
            var rect = this.rect();

            var scrollTop = Dom.getScrollTop();
            var scrollLeft = Dom.getScrollLeft();

            return {
                top: rect.top + scrollTop,
                left: rect.left + scrollLeft
            };
        }
    }, {
        key: "offsetLeft",
        value: function offsetLeft() {
            return this.offset().left;
        }
    }, {
        key: "offsetTop",
        value: function offsetTop() {
            return this.offset().top;
        }
    }, {
        key: "position",
        value: function position() {

            if (this.el.style.top) {
                return {
                    top: parseFloat(this.css('top')),
                    left: parseFloat(this.css('left'))
                };
            } else {
                return this.rect();
            }
        }
    }, {
        key: "size",
        value: function size() {
            return [this.width(), this.height()];
        }
    }, {
        key: "width",
        value: function width() {
            return this.el.offsetWidth || this.rect().width;
        }
    }, {
        key: "contentWidth",
        value: function contentWidth() {
            return this.width() - this.cssFloat('padding-left') - this.cssFloat('padding-right');
        }
    }, {
        key: "height",
        value: function height() {
            return this.el.offsetHeight || this.rect().height;
        }
    }, {
        key: "contentHeight",
        value: function contentHeight() {
            return this.height() - this.cssFloat('padding-top') - this.cssFloat('padding-bottom');
        }
    }, {
        key: "dataKey",
        value: function dataKey(key) {
            return this.uniqId + '.' + key;
        }
    }, {
        key: "data",
        value: function data(key, value$$1) {
            if (arguments.length == 2) {
                cached[this.dataKey(key)] = value$$1;
            } else if (arguments.length == 1) {
                return cached[this.dataKey(key)];
            } else {
                var keys = Object.keys(cached);

                var uniqId = this.uniqId + ".";
                return keys.filter(function (key) {
                    if (key.indexOf(uniqId) == 0) {
                        return true;
                    }

                    return false;
                }).map(function (value$$1) {
                    return cached[value$$1];
                });
            }

            return this;
        }
    }, {
        key: "val",
        value: function val(value$$1) {
            if (isUndefined$1(value$$1)) {
                return this.el.value;
            } else if (isNotUndefined(value$$1)) {

                var tempValue = value$$1;

                if (value$$1 instanceof Dom) {
                    tempValue = value$$1.val();
                }

                this.el.value = tempValue;
            }

            return this;
        }
    }, {
        key: "realVal",
        value: function realVal() {
            switch (this.el.nodeType) {
                case 'INPUT':
                    var type = this.attr('type');
                    if (type == 'checkbox' || type == 'radio') {
                        return this.checked();
                    }
                case 'SELECT':
                case 'TEXTAREA':
                    return this.el.value;
            }

            return '';
        }
    }, {
        key: "int",
        value: function int() {
            return parseInt(this.val(), 10);
        }
    }, {
        key: "float",
        value: function float() {
            return parseFloat(this.val());
        }
    }, {
        key: "show",
        value: function show() {
            return this.css('display', 'block');
        }
    }, {
        key: "hide",
        value: function hide() {
            return this.css('display', 'none');
        }
    }, {
        key: "toggle",
        value: function toggle(isForce) {

            var currentHide = this.css('display') == 'none';

            if (arguments.length == 1) {
                if (currentHide && isForce) {
                    return this.show();
                } else {
                    return this.hide();
                }
            } else {
                if (currentHide) {
                    return this.show();
                } else {
                    return this.hide();
                }
            }
        }
    }, {
        key: "setScrollTop",
        value: function setScrollTop(scrollTop) {
            this.el.scrollTop = scrollTop;
            return this;
        }
    }, {
        key: "setScrollLeft",
        value: function setScrollLeft(scrollLeft) {
            this.el.scrollLeft = scrollLeft;
            return this;
        }
    }, {
        key: "scrollTop",
        value: function scrollTop() {
            if (this.el === document.body) {
                return Dom.getScrollTop();
            }

            return this.el.scrollTop;
        }
    }, {
        key: "scrollLeft",
        value: function scrollLeft() {
            if (this.el === document.body) {
                return Dom.getScrollLeft();
            }

            return this.el.scrollLeft;
        }
    }, {
        key: "scrollHeight",
        value: function scrollHeight() {
            return this.el.scrollHeight;
        }
    }, {
        key: "on",
        value: function on(eventName, callback, opt1, opt2) {
            this.el.addEventListener(eventName, callback, opt1, opt2);

            return this;
        }
    }, {
        key: "off",
        value: function off(eventName, callback) {
            this.el.removeEventListener(eventName, callback);

            return this;
        }
    }, {
        key: "getElement",
        value: function getElement() {
            return this.el;
        }
    }, {
        key: "createChild",
        value: function createChild(tag) {
            var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_STRING;
            var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var css = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            var $element = new Dom(tag, className, attrs);
            $element.css(css);

            this.append($element);

            return $element;
        }
    }, {
        key: "firstChild",
        value: function firstChild() {
            return new Dom(this.el.firstElementChild);
        }
    }, {
        key: "children",
        value: function children() {
            var element = this.el.firstElementChild;

            if (!element) {
                return [];
            }

            var results = [];

            do {
                results.push(new Dom(element));
                element = element.nextElementSibling;
            } while (element);

            return results;
        }
    }, {
        key: "childLength",
        value: function childLength() {
            return this.el.children.length;
        }
    }, {
        key: "replace",
        value: function replace(newElement) {

            this.el.parentNode.replaceChild(newElement.el || newElement, this.el);

            return this;
        }
    }, {
        key: "checked",
        value: function checked() {
            var isChecked = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


            if (arguments.length == 0) {
                return !!this.el.checked;
            }

            this.el.checked = !!isChecked;

            return this;
        }
    }, {
        key: "focus",
        value: function focus() {
            this.el.focus();

            return this;
        }

        // canvas functions 

    }, {
        key: "context",
        value: function context() {
            var contextType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '2d';


            if (!this._initContext) {
                this._initContext = this.el.getContext(contextType);
            }

            return this._initContext;
        }
    }, {
        key: "resize",
        value: function resize(_ref) {
            var width = _ref.width,
                height = _ref.height;


            // support hi-dpi for retina display 
            this._initContext = null;
            var ctx = this.context();
            var scale = window.devicePixelRatio || 1;

            this.px('width', width);
            this.px('height', height);

            this.el.width = width * scale;
            this.el.height = height * scale;

            ctx.scale(scale, scale);
        }
    }, {
        key: "clear",
        value: function clear() {
            this.context().clearRect(0, 0, this.el.width, this.el.height);
        }
    }, {
        key: "update",
        value: function update(callback) {
            this.clear();
            callback.call(this);
        }
    }, {
        key: "drawOption",
        value: function drawOption() {
            var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var ctx = this.context();

            Object.assign(ctx, option);
        }
    }, {
        key: "drawLine",
        value: function drawLine(x1, y1, x2, y2) {
            var ctx = this.context();

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.closePath();
        }
    }, {
        key: "drawPath",
        value: function drawPath() {
            var ctx = this.context();

            ctx.beginPath();

            for (var _len2 = arguments.length, path = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                path[_key2] = arguments[_key2];
            }

            path.forEach(function (p, index) {
                if (index == 0) {
                    ctx.moveTo(p[0], p[1]);
                } else {
                    ctx.lineTo(p[0], p[1]);
                }
            });
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    }, {
        key: "drawCircle",
        value: function drawCircle(cx, cy, r) {
            var ctx = this.context();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
        }
    }, {
        key: "drawText",
        value: function drawText(x, y, text) {
            this.context().fillText(text, x, y);
        }
    }], [{
        key: "getScrollTop",
        value: function getScrollTop() {
            return Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
        }
    }, {
        key: "getScrollLeft",
        value: function getScrollLeft() {
            return Math.max(window.pageXOffset, document.documentElement.scrollLeft, document.body.scrollLeft);
        }
    }]);
    return Dom;
}();

var EventChecker = function () {
    function EventChecker(value$$1) {
        var split = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHECK_SAPARATOR;
        classCallCheck(this, EventChecker);

        this.value = value$$1;
        this.split = split;
    }

    createClass(EventChecker, [{
        key: 'toString',
        value: function toString() {
            return ' ' + this.split + ' ' + this.value;
        }
    }]);
    return EventChecker;
}();

var EventAfterRunner = function () {
    function EventAfterRunner(value$$1) {
        var split = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHECK_SAPARATOR;
        classCallCheck(this, EventAfterRunner);

        this.value = value$$1;
        this.split = split;
    }

    createClass(EventAfterRunner, [{
        key: 'toString',
        value: function toString() {
            return ' ' + this.split + ' after(' + this.value + ')';
        }
    }]);
    return EventAfterRunner;
}();

var EventBeforeRunner = function () {
    function EventBeforeRunner(value$$1) {
        var split = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHECK_SAPARATOR;
        classCallCheck(this, EventBeforeRunner);

        this.value = value$$1;
        this.split = split;
    }

    createClass(EventBeforeRunner, [{
        key: 'toString',
        value: function toString() {
            return ' ' + this.split + ' before(' + this.value + ')';
        }
    }]);
    return EventBeforeRunner;
}();

// event name regular expression
var CHECK_LOAD_PATTERN = /^load (.*)/ig;

var CHECK_CLICK_PATTERN = 'click|dblclick';
var CHECK_MOUSE_PATTERN = 'mouse(down|up|move|over|out|enter|leave)';
var CHECK_POINTER_PATTERN = 'pointer(start|move|end)';
var CHECK_TOUCH_PATTERN = 'touch(start|move|end)';
var CHECK_KEY_PATTERN = 'key(down|up|press)';
var CHECK_DRAGDROP_PATTERN = 'drag|drop|drag(start|over|enter|leave|exit|end)';
var CHECK_CONTEXT_PATTERN = 'contextmenu';
var CHECK_INPUT_PATTERN = 'change|input';
var CHECK_CLIPBOARD_PATTERN = 'paste';
var CHECK_BEHAVIOR_PATTERN = 'resize|scroll|wheel|mousewheel|DOMMouseScroll';

var CHECK_PATTERN_LIST = [CHECK_CLICK_PATTERN, CHECK_MOUSE_PATTERN, CHECK_POINTER_PATTERN, CHECK_TOUCH_PATTERN, CHECK_KEY_PATTERN, CHECK_DRAGDROP_PATTERN, CHECK_CONTEXT_PATTERN, CHECK_INPUT_PATTERN, CHECK_CLIPBOARD_PATTERN, CHECK_BEHAVIOR_PATTERN].join('|');

var CHECK_PATTERN = new RegExp('^(' + CHECK_PATTERN_LIST + ')', "ig");

var NAME_SAPARATOR = ':';
var CHECK_SAPARATOR = '|';
var LOAD_SAPARATOR = 'load ';
var SAPARATOR = WHITE_STRING$1;

var DOM_EVENT_MAKE = function DOM_EVENT_MAKE() {
    for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
    }

    var key = keys.join(NAME_SAPARATOR);
    return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return [key].concat(args).join(SAPARATOR);
    };
};

var CUSTOM = DOM_EVENT_MAKE;
var CLICK = DOM_EVENT_MAKE('click');
var DOUBLECLICK = DOM_EVENT_MAKE('dblclick');
var MOUSEDOWN = DOM_EVENT_MAKE('mousedown');
var MOUSEUP = DOM_EVENT_MAKE('mouseup');
var MOUSEMOVE = DOM_EVENT_MAKE('mousemove');
var MOUSEOVER = DOM_EVENT_MAKE('mouseover');
var MOUSEOUT = DOM_EVENT_MAKE('mouseout');
var MOUSEENTER = DOM_EVENT_MAKE('mouseenter');
var MOUSELEAVE = DOM_EVENT_MAKE('mouseleave');
var TOUCHSTART = DOM_EVENT_MAKE('touchstart');
var TOUCHMOVE = DOM_EVENT_MAKE('touchmove');
var TOUCHEND = DOM_EVENT_MAKE('touchend');
var KEYDOWN = DOM_EVENT_MAKE('keydown');
var KEYUP = DOM_EVENT_MAKE('keyup');
var KEYPRESS = DOM_EVENT_MAKE('keypress');
var DRAG = DOM_EVENT_MAKE('drag');
var DRAGSTART = DOM_EVENT_MAKE('dragstart');
var DROP = DOM_EVENT_MAKE('drop');
var DRAGOVER = DOM_EVENT_MAKE('dragover');
var DRAGENTER = DOM_EVENT_MAKE('dragenter');
var DRAGLEAVE = DOM_EVENT_MAKE('dragleave');
var DRAGEXIT = DOM_EVENT_MAKE('dragexit');
var DRAGOUT = DOM_EVENT_MAKE('dragout');
var DRAGEND = DOM_EVENT_MAKE('dragend');
var CONTEXTMENU = DOM_EVENT_MAKE('contextmenu');
var CHANGE = DOM_EVENT_MAKE('change');
var INPUT = DOM_EVENT_MAKE('input');
var PASTE = DOM_EVENT_MAKE('paste');
var RESIZE = DOM_EVENT_MAKE('resize');
var SCROLL = DOM_EVENT_MAKE('scroll');
var SUBMIT = DOM_EVENT_MAKE('submit');
var POINTERSTART = CUSTOM('mousedown', 'touchstart');
var POINTERMOVE = CUSTOM('mousemove', 'touchmove');
var POINTEREND = CUSTOM('mouseup', 'touchend');
var CHANGEINPUT = CUSTOM('change', 'input');
var WHEEL = CUSTOM('wheel', 'mousewheel', 'DOMMouseScroll');

// Predefined CHECKER 
var CHECKER = function CHECKER(value$$1) {
    var split = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHECK_SAPARATOR;

    return new EventChecker(value$$1, split);
};

var AFTER = function AFTER(value$$1) {
    var split = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHECK_SAPARATOR;

    return new EventAfterRunner(value$$1, split);
};



var IF = CHECKER;






var KEY_ARROW_UP = 'ArrowUp';
var KEY_ARROW_DOWN = 'ArrowDown';
var KEY_ARROW_LEFT = 'ArrowLeft';
var KEY_ARROW_RIGHT = 'ArrowRight';
var KEY_ENTER = 'Enter';
var KEY_SPACE = 'Space';

var ARROW_UP = CHECKER(KEY_ARROW_UP);
var ARROW_DOWN = CHECKER(KEY_ARROW_DOWN);
var ARROW_LEFT = CHECKER(KEY_ARROW_LEFT);
var ARROW_RIGHT = CHECKER(KEY_ARROW_RIGHT);
var ENTER = CHECKER(KEY_ENTER);
var SPACE = CHECKER(KEY_SPACE);

var ALT = CHECKER('isAltKey');
var SHIFT = CHECKER('isShiftKey');
var META = CHECKER('isMetaKey');
var CONTROL = CHECKER('isCtrlKey');
var SELF = CHECKER('self');
var CAPTURE = CHECKER('capture');
var FIT = CHECKER('fit');
var PASSIVE = CHECKER('passive');
var PREVENT = CHECKER('preventDefault');
var STOP = CHECKER('stopPropagation');

var DEBOUNCE = function DEBOUNCE() {
    var debounce = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    return CHECKER('debounce(' + debounce + ')');
};

// after method 
var MOVE = function MOVE() {
    var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'move';

    return AFTER('bodyMouseMove ' + method);
};
var END = function END() {
    var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'end';

    return AFTER('bodyMouseUp ' + method);
};

// Predefined LOADER
var LOAD = function LOAD() {
    var value$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '$el';

    return LOAD_SAPARATOR + value$$1;
};

var Event = {
    addEvent: function addEvent(dom, eventName, callback) {
        var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (dom) {
            dom.addEventListener(eventName, callback, useCapture);
        }
    },
    removeEvent: function removeEvent(dom, eventName, callback) {
        if (dom) {
            dom.removeEventListener(eventName, callback);
        }
    },
    pos: function pos(e) {
        if (e.touches && e.touches[0]) {
            return e.touches[0];
        }

        return e;
    },
    posXY: function posXY(e) {
        var pos = this.pos(e);
        return {
            x: pos.pageX,
            y: pos.pageY
        };
    }
};

var TOOL_SET = 'tool/set';


var TOOL_SAVE_DATA = 'tool/save/data';
var TOOL_RESTORE_DATA = 'tool/restore/data';
var RESIZE_WINDOW = 'resize/window';
var RESIZE_TIMELINE = 'resize/timeline';
var CHANGE_HEIGHT_TIMELINE = 'change/height/timeline';
var INIT_HEIGHT_TIMELINE = 'init/height/timeline';
var SCROLL_LEFT_TIMELINE = 'scroll/left/timeline';
var TOGGLE_TIMELINE = 'toggle/timeline';
var MOVE_TIMELINE = 'move/timeline';

var ADD_BODY_MOUSEMOVE = 'add/body/mousemove';
var ADD_BODY_MOUSEUP = 'add/body/mouseup';

var GETTER_PREFIX = '*/';
var ACTION_PREFIX = '/';

function GETTER(str) {
    return GETTER_PREFIX + str;
}

function ACTION(str) {
    return ACTION_PREFIX + str;
}

var PREVENT$1 = 'PREVENT';

var BaseStore = function () {
    function BaseStore(opt) {
        classCallCheck(this, BaseStore);

        this.cachedCallback = {};
        this.callbacks = [];
        this.actions = [];
        this.getters = [];
        this.modules = opt.modules || [];
        this.standalone = {
            getters: {},
            actions: {},
            dispatches: {}
        };

        this.initialize();
    }

    createClass(BaseStore, [{
        key: "initialize",
        value: function initialize() {
            this.initializeModule();
        }
    }, {
        key: "initializeModule",
        value: function initializeModule() {
            var _this = this;

            this.modules.forEach(function (ModuleClass) {
                _this.addModule(ModuleClass);
            });
        }
    }, {
        key: "makeActionCallback",
        value: function makeActionCallback(context, action, actionName) {
            var _this2 = this;

            var func = function func($1, $2, $3, $4, $5) {
                return context[action].call(context, _this2, $1, $2, $3, $4, $5);
            };

            func.context = context;
            func.displayName = actionName;

            return func;
        }
    }, {
        key: "action",
        value: function action(_action, context) {
            var _this3 = this;

            var actionName = _action.substr(_action.indexOf(ACTION_PREFIX) + ACTION_PREFIX.length);

            this.actions[actionName] = this.makeActionCallback(context, _action, actionName);

            this.standalone.actions[actionName] = function ($1, $2, $3, $4, $5) {
                return _this3.run(actionName, $1, $2, $3, $4, $5);
            };
            this.standalone.dispatches[actionName] = function ($1, $2, $3, $4, $5) {
                return _this3.dispatch(actionName, $1, $2, $3, $4, $5);
            };
        }
    }, {
        key: "getter",
        value: function getter(action, context) {
            var _this4 = this;

            var actionName = action.substr(action.indexOf(GETTER_PREFIX) + GETTER_PREFIX.length);

            this.getters[actionName] = this.makeActionCallback(context, action, actionName);

            this.standalone.getters[actionName] = function ($1, $2, $3, $4, $5) {
                return _this4.read(actionName, $1, $2, $3, $4, $5);
            };
        }
    }, {
        key: "mapGetters",
        value: function mapGetters() {
            var _this5 = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return args.map(function (actionName) {
                return _this5.standalone.getters[actionName];
            });
        }
    }, {
        key: "mapActions",
        value: function mapActions() {
            var _this6 = this;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return args.map(function (actionName) {
                return _this6.standalone.actions[actionName];
            });
        }
    }, {
        key: "mapDispatches",
        value: function mapDispatches() {
            var _this7 = this;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return args.map(function (actionName) {
                return _this7.standalone.dispatches[actionName];
            });
        }
    }, {
        key: "dispatch",
        value: function dispatch(action, $1, $2, $3, $4, $5) {
            var actionCallback = this.actions[action];

            if (actionCallback) {
                var ret = actionCallback($1, $2, $3, $4, $5);

                if (ret != PREVENT$1) {
                    actionCallback.context.afterDispatch();
                }
            } else {
                throw new Error('action : ' + action + ' is not a valid.');
            }
        }
    }, {
        key: "run",
        value: function run(action, $1, $2, $3, $4, $5) {
            var actionCallback = this.actions[action];

            if (actionCallback) {
                return actionCallback($1, $2, $3, $4, $5);
            } else {
                throw new Error('action : ' + action + ' is not a valid.');
            }
        }
    }, {
        key: "read",
        value: function read(action, $1, $2, $3, $4, $5) {
            var getterCallback = this.getters[action];

            if (getterCallback) {
                return getterCallback($1, $2, $3, $4, $5);
            } else {
                throw new Error('getter : ' + action + ' is not a valid.');
            }
        }
    }, {
        key: "addModule",
        value: function addModule(ModuleClass) {
            return new ModuleClass(this);
        }
    }, {
        key: "on",
        value: function on(event, originalCallback, context) {
            var delay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            var callback = delay > 0 ? debounce(originalCallback, delay) : originalCallback;
            this.callbacks.push({ event: event, callback: callback, context: context, originalCallback: originalCallback });
        }
    }, {
        key: "off",
        value: function off(event, originalCallback) {

            if (arguments.length == 0) {
                this.callbacks = [];
                this.cachedCallback = {};
            } else if (arguments.length == 1) {
                this.callbacks = this.callbacks.filter(function (f) {
                    return f.event != event;
                });
                this.cachedCallback = {};
            } else if (arguments.length == 2) {
                this.callbacks = this.callbacks.filter(function (f) {
                    return !(f.event == event && f.originalCallback == originalCallback);
                });
                this.cachedCallback = {};
            }
        }
    }, {
        key: "sendMessage",
        value: function sendMessage(source, event, $2, $3, $4, $5) {
            var _this8 = this;

            setTimeout(function () {
                _this8.cachedCallback[event].forEach(function (f) {
                    if (f.originalCallback.source != source) {
                        f.callback($2, $3, $4, $5);
                    }
                });
            }, 0);
        }
    }, {
        key: "emit",
        value: function emit($1, $2, $3, $4, $5) {
            var event = $1;

            if (!this.cachedCallback[event]) {
                this.cachedCallback[event] = this.callbacks.filter(function (f) {
                    return f.event == event;
                });
            }

            this.sendMessage(this.source, $1, $2, $3, $4, $5);
        }
    }]);
    return BaseStore;
}();

var ITEM_SET = 'item/set';

var ITEM_CONVERT_STYLE = 'item/convert/style';











/* page is equal to artboard */

var FILTER_DEFAULT_OBJECT = {
    'filterBlur': { index: 0, value: 0, unit: UNIT_PX },
    'filterGrayscale': { index: 10, value: 0, unit: UNIT_PERCENT },
    'filterHueRotate': { index: 20, value: 0, unit: UNIT_DEG },
    'filterInvert': { index: 30, value: 0, unit: UNIT_PERCENT },
    'filterBrightness': { index: 40, value: 100, unit: UNIT_PERCENT },
    'filterContrast': { index: 50, value: 100, unit: UNIT_PERCENT },
    'filterDropshadow': { index: 60 },
    'filterDropshadowOffsetX': { value: 0, unit: UNIT_PX },
    'filterDropshadowOffsetY': { value: 0, unit: UNIT_PX },
    'filterDropshadowBlurRadius': { value: 0, unit: UNIT_PX },
    'filterDropshadowColor': { value: 'black', unit: UNIT_COLOR },
    'filterOpacity': { index: 70, value: 100, unit: UNIT_PERCENT },
    'filterSaturate': { index: 80, value: 100, unit: UNIT_PERCENT },
    'filterSepia': { index: 90, value: 0, unit: UNIT_PERCENT }
};

var FILTER_DEFAULT_OBJECT_KEYS = Object.keys(FILTER_DEFAULT_OBJECT).filter(function (key) {
    return isNotUndefined(FILTER_DEFAULT_OBJECT[key].index);
});

var BACKDROP_DEFAULT_OBJECT = {
    'backdropBlur': { index: 0, value: 0, unit: UNIT_PX },
    'backdropGrayscale': { index: 10, value: 0, unit: UNIT_PERCENT },
    'backdropHueRotate': { index: 20, value: 0, unit: UNIT_DEG },
    'backdropInvert': { index: 30, value: 0, unit: UNIT_PERCENT },
    'backdropBrightness': { index: 40, value: 100, unit: UNIT_PERCENT },
    'backdropContrast': { index: 50, value: 100, unit: UNIT_PERCENT },
    'backdropDropshadow': { index: 60 },
    'backdropDropshadowOffsetX': { value: 10, unit: UNIT_PX },
    'backdropDropshadowOffsetY': { value: 20, unit: UNIT_PX },
    'backdropDropshadowBlurRadius': { value: 30, unit: UNIT_PX },
    'backdropDropshadowColor': { value: 'black', unit: UNIT_COLOR },
    'backdropOpacity': { index: 70, value: 100, unit: UNIT_PERCENT },
    'backdropSaturate': { index: 80, value: 100, unit: UNIT_PERCENT },
    'backdropSepia': { index: 90, value: 0, unit: UNIT_PERCENT }
};

var BACKDROP_DEFAULT_OBJECT_KEYS = Object.keys(BACKDROP_DEFAULT_OBJECT).filter(function (key) {
    return isNotUndefined(BACKDROP_DEFAULT_OBJECT[key].index);
});

var CLIP_PATH_DEFAULT_OBJECT = {
    clipPathType: 'none',
    clipPathSideType: CLIP_PATH_SIDE_TYPE_NONE,
    clipPathSvg: EMPTY_STRING,
    fitClipPathSize: false,
    clipText: false,
    clipPathRadiusX: undefined,
    clipPathRadiusY: undefined,
    clipPathCenterX: undefined,
    clipPathCenterY: undefined

    /* layer can has children layers. */
};var LAYER_DEFAULT_OBJECT = _extends({
    itemType: ITEM_TYPE_LAYER,
    is: IS_OBJECT,
    type: SHAPE_TYPE_RECT,
    name: EMPTY_STRING,
    index: 0,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    parentId: EMPTY_STRING,
    mixBlendMode: 'normal',
    selected: true,
    visible: true,
    lock: false,
    x: pxUnit(0),
    y: pxUnit(0),
    width: pxUnit(200),
    height: pxUnit(200),
    rotate: 0,
    opacity: 1,
    fontFamily: 'serif',
    fontSize: '13px',
    fontWeight: 400,
    wordBreak: 'break-word',
    wordWrap: 'break-word',
    lineHeight: 1.6,
    content: EMPTY_STRING
}, CLIP_PATH_DEFAULT_OBJECT, FILTER_DEFAULT_OBJECT, BACKDROP_DEFAULT_OBJECT);

var CIRCLE_DEFAULT_OBJECT = _extends({}, LAYER_DEFAULT_OBJECT, {
    type: SHAPE_TYPE_CIRCLE,
    borderRadius: percentUnit(100),
    fixedRadius: true
});

var POLYGON_DEFAULT_OBJECT = _extends({}, LAYER_DEFAULT_OBJECT, {
    type: SHAPE_TYPE_POLYGON,
    fixedShape: true
});



var MASK_IMAGE_DEFAULT_OBJECT = {
    itemType: ITEM_TYPE_MASK_IMAGE,
    is: IS_ATTRIBUTE,
    type: IMAGE_ITEM_TYPE_STATIC,
    fileType: EMPTY_STRING, // select file type as imagefile,  png, gif, jpg, svg if type is image 
    index: 0,
    parentId: EMPTY_STRING,
    angle: 90,
    color: 'red',
    radialType: 'ellipse',
    radialPosition: POSITION_CENTER,
    visible: true,
    isClipPath: false
};

var BORDER_IMAGE_DEFAULT_OBJECT = _extends({}, MASK_IMAGE_DEFAULT_OBJECT, {
    itemType: ITEM_TYPE_BORDER_IMAGE
});

var BOX_IMAGE_DEFAULT_OBJECT = _extends({}, MASK_IMAGE_DEFAULT_OBJECT, {
    itemType: ITEM_TYPE_BOX_IMAGE
});

var DELEGATE_SPLIT = '.';

var State = function () {
  function State(masterObj) {
    var _this = this;

    var settingObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, State);


    this.masterObj = masterObj;
    this.settingObj = settingObj;

    window.addEventListener('resize', debounce(function () {
      _this.initialize();
    }, 300));
  }

  createClass(State, [{
    key: "initialize",
    value: function initialize() {
      this.settingObj = {};
    }
  }, {
    key: "set",
    value: function set$$1(key, value$$1) {
      var defaultValue$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      this.settingObj[key] = value$$1 || defaultValue$$1;
    }
  }, {
    key: "init",
    value: function init(key) {

      if (!this.has(key)) {

        var arr = key.split(DELEGATE_SPLIT);

        var obj = this.masterObj.refs[arr[0]] || this.masterObj[arr[0]] || this.masterObj;
        var method = arr.pop();

        if (obj[method]) {
          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var value$$1 = obj[method].apply(obj, args);

          this.set(key, value$$1);
        }
      }
    }
  }, {
    key: "get",
    value: function get$$1(key) {
      var defaultValue$$1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_STRING;


      this.init(key, defaultValue$$1);

      return this.settingObj[key] || defaultValue$$1;
    }
  }, {
    key: "has",
    value: function has(key) {
      return !!this.settingObj[key];
    }
  }]);
  return State;
}();

var _templateObject = taggedTemplateLiteral(['', ''], ['', '']);

var REFERENCE_PROPERTY = 'ref';
var TEMP_DIV = new Dom("div");
var QUERY_PROPERTY = '[' + REFERENCE_PROPERTY + ']';

var matchPath = function matchPath(el, selector) {
  if (el) {
    if (el.matches(selector)) {
      return el;
    }
    return matchPath(el.parentElement, selector);
  }
  return null;
};

var hasDelegate = function hasDelegate(e, eventObject) {
  return matchPath(e.target || e.srcElement, eventObject.delegate);
};

var makeCallback = function makeCallback(context, eventObject, callback) {

  if (eventObject.delegate) {
    return makeDelegateCallback(context, eventObject, callback);
  } else {
    return makeDefaultCallback(context, eventObject, callback);
  }
};

var makeDefaultCallback = function makeDefaultCallback(context, eventObject, callback) {
  return function (e) {
    var returnValue = runEventCallback(context, e, eventObject, callback);
    if (!isNotUndefined(returnValue)) return returnValue;
  };
};

var makeDelegateCallback = function makeDelegateCallback(context, eventObject, callback) {
  return function (e) {
    var delegateTarget = hasDelegate(e, eventObject);

    if (delegateTarget) {
      // delegate target 이 있는 경우만 callback 실행 
      e.$delegateTarget = new Dom(delegateTarget);

      var returnValue = runEventCallback(context, e, eventObject, callback);
      if (!isNotUndefined(returnValue)) return returnValue;
    }
  };
};

var runEventCallback = function runEventCallback(context, e, eventObject, callback) {
  e.xy = Event.posXY(e);

  eventObject.beforeMethods.every(function (before) {
    return context[before.target].call(context, before.param, e);
  });

  if (checkEventType(context, e, eventObject)) {
    var returnValue = callback(e, e.$delegateTarget, e.xy);

    if (eventObject.afterMethods.length) {
      eventObject.afterMethods.forEach(function (after) {
        return context[after.target].call(context, after.param, e);
      });
    }

    return returnValue;
  }
};

var checkEventType = function checkEventType(context, e, eventObject) {

  // 특정 keycode 를 가지고 있는지 체크 
  // keyup.pagedown  이라고 정의하면 pagedown 키를 눌렀을때만 동작 함 
  var hasKeyCode = true;
  if (eventObject.codes.length) {

    hasKeyCode = (e.code ? eventObject.codes.includes(e.code.toLowerCase()) : false) || (e.key ? eventObject.codes.includes(e.key.toLowerCase()) : false);
  }

  // 체크 메소드들은 모든 메소드를 다 적용해야한다. 
  var isAllCheck = true;
  if (eventObject.checkMethodList.length) {
    isAllCheck = eventObject.checkMethodList.every(function (field) {
      var fieldValue = context[field];
      if (isFunction(fieldValue) && fieldValue) {
        // check method 
        return fieldValue.call(context, e);
      } else if (isNotUndefined(fieldValue)) {
        // check field value
        return !!fieldValue;
      }
      return true;
    });
  }

  return hasKeyCode && isAllCheck;
};

var getDefaultDomElement = function getDefaultDomElement(context, dom) {
  var el = void 0;

  if (dom) {
    el = context.refs[dom] || context[dom] || window[dom];
  } else {
    el = context.el || context.$el || context.$root;
  }

  if (el instanceof Dom) {
    return el.getElement();
  }

  return el;
};

var getDefaultEventObject = function getDefaultEventObject(context, eventName, checkMethodFilters) {
  var arr = checkMethodFilters;
  var checkMethodList = arr.filter(function (code) {
    return !!context[code];
  });

  var afters = arr.filter(function (code) {
    return code.indexOf('after(') > -1;
  });

  var afterMethods = afters.map(function (code) {
    var _code$split$1$split$ = code.split('after(')[1].split(')')[0].trim().split(' '),
        _code$split$1$split$2 = slicedToArray(_code$split$1$split$, 2),
        target = _code$split$1$split$2[0],
        param = _code$split$1$split$2[1];

    return { target: target, param: param };
  });

  var befores = arr.filter(function (code) {
    return code.indexOf('before(') > -1;
  });

  var beforeMethods = befores.map(function (code) {
    var _code$split$1$split$3 = code.split('before(')[1].split(')')[0].trim().split(' '),
        _code$split$1$split$4 = slicedToArray(_code$split$1$split$3, 2),
        target = _code$split$1$split$4[0],
        param = _code$split$1$split$4[1];

    return { target: target, param: param };
  });

  // TODO: split debounce check code 
  var delay = arr.filter(function (code) {
    if (code.indexOf('debounce(') > -1) {
      return true;
    }
    return false;
  });

  var debounceTime = 0;
  if (delay.length) {
    debounceTime = getDebounceTime(delay[0]);
  }

  // capture 
  var capturing = arr.filter(function (code) {
    return code.indexOf('capture') > -1;
  });
  var useCapture = !!capturing.length;

  arr = arr.filter(function (code) {
    return checkMethodList.includes(code) === false && delay.includes(code) === false && afters.includes(code) === false && befores.includes(code) === false && capturing.includes(code) === false;
  }).map(function (code) {
    return code.toLowerCase();
  });

  // TODO: split debounce check code     

  return {
    eventName: eventName,
    codes: arr,
    useCapture: useCapture,
    afterMethods: afterMethods,
    beforeMethods: beforeMethods,
    debounce: debounceTime,
    checkMethodList: checkMethodList
  };
};

var getDebounceTime = function getDebounceTime(code) {
  var debounceTime = 0;
  if (code.indexOf('debounce(') > -1) {
    debounceTime = +code.replace('debounce(', EMPTY_STRING).replace(')', EMPTY_STRING);
  }

  return debounceTime;
};

var addEvent = function addEvent(context, eventObject, callback) {
  eventObject.callback = makeCallback(context, eventObject, callback);
  context.addBinding(eventObject);
  Event.addEvent(eventObject.dom, eventObject.eventName, eventObject.callback, eventObject.useCapture);
};

var bindingEvent = function bindingEvent(context, _ref, checkMethodFilters, callback) {
  var _ref2 = toArray(_ref),
      eventName = _ref2[0],
      dom = _ref2[1],
      delegate = _ref2.slice(2);

  var eventObject = getDefaultEventObject(context, eventName, checkMethodFilters);

  eventObject.dom = getDefaultDomElement(context, dom);
  eventObject.delegate = delegate.join(SAPARATOR);

  if (eventObject.debounce) {
    callback = debounce(callback, eventObject.debounce);
  }

  addEvent(context, eventObject, callback);
};

var getEventNames = function getEventNames(eventName) {
  var results = [];

  eventName.split(NAME_SAPARATOR).forEach(function (e) {
    var arr = e.split(NAME_SAPARATOR);

    results.push.apply(results, toConsumableArray(arr));
  });

  return results;
};

var parseEvent = function parseEvent(context, key) {
  var checkMethodFilters = key.split(CHECK_SAPARATOR).map(function (it) {
    return it.trim();
  });
  var eventSelectorAndBehave = checkMethodFilters.shift();

  var _eventSelectorAndBeha = eventSelectorAndBehave.split(SAPARATOR),
      _eventSelectorAndBeha2 = toArray(_eventSelectorAndBeha),
      eventName = _eventSelectorAndBeha2[0],
      params = _eventSelectorAndBeha2.slice(1);

  var eventNames = getEventNames(eventName);
  var callback = context[key].bind(context);

  eventNames.forEach(function (eventName) {
    bindingEvent(context, [eventName].concat(toConsumableArray(params)), checkMethodFilters, callback);
  });
};

var EventMachine = function () {
  function EventMachine() {
    classCallCheck(this, EventMachine);

    this.state = new State(this);
    this.refs = {};
    this.children = {};
    this._bindings = [];
    this.childComponents = this.components();
  }

  createClass(EventMachine, [{
    key: 'render',
    value: function render($container) {
      this.$el = this.parseTemplate(html(_templateObject, this.template()));
      this.refs.$el = this.$el;

      if ($container) $container.html(this.$el);

      this.load();

      this.afterRender();
    }
  }, {
    key: 'initialize',
    value: function initialize() {}
  }, {
    key: 'afterRender',
    value: function afterRender() {}
  }, {
    key: 'components',
    value: function components() {
      return {};
    }
  }, {
    key: 'parseTemplate',
    value: function parseTemplate(html$$1, isLoad) {
      var _this = this;

      if (isArray(html$$1)) {
        html$$1 = html$$1.join(EMPTY_STRING);
      }

      html$$1 = html$$1.trim();

      var list = TEMP_DIV.html(html$$1).children();

      list.forEach(function ($el) {
        // ref element 정리 
        if ($el.attr(REFERENCE_PROPERTY)) {
          _this.refs[$el.attr(REFERENCE_PROPERTY)] = $el;
        }
        var refs = $el.$$(QUERY_PROPERTY);
        refs.forEach(function ($dom) {
          var name = $dom.attr(REFERENCE_PROPERTY);
          _this.refs[name] = $dom;
        });
      });

      if (!isLoad) {
        return list[0];
      }

      return TEMP_DIV.createChildrenFragment();
    }
  }, {
    key: 'parseComponent',
    value: function parseComponent() {
      var _this2 = this;

      var $el = this.$el;
      keyEach(this.childComponents, function (ComponentName, Component) {
        var targets = $el.$$('' + ComponentName.toLowerCase());
        [].concat(toConsumableArray(targets)).forEach(function ($dom) {
          var props = {};

          [].concat(toConsumableArray($dom.el.attributes)).filter(function (t) {
            return [REFERENCE_PROPERTY].indexOf(t.nodeName) < 0;
          }).forEach(function (t) {
            props[t.nodeName] = t.nodeValue;
          });

          var refName = $dom.attr(REFERENCE_PROPERTY) || ComponentName;

          if (refName) {

            if (Component) {

              var instance = new Component(_this2, props);

              if (_this2.children[refName]) {
                refName = instance.id;
              }

              _this2.children[refName] = instance;
              _this2.refs[refName] = instance.$el;

              if (instance) {
                instance.render();

                $dom.replace(instance.$el);
              }
            }
          }
        });
      });
    }
  }, {
    key: 'load',
    value: function load() {
      var _this3 = this;

      if (!this._loadMethods) {
        this._loadMethods = this.filterProps(CHECK_LOAD_PATTERN);
      }

      this._loadMethods.forEach(function (callbackName) {
        var elName = callbackName.split(LOAD_SAPARATOR)[1];
        if (_this3.refs[elName]) {
          var fragment = _this3.parseTemplate(_this3[callbackName].call(_this3), true);
          _this3.refs[elName].html(fragment);
        }
      });

      this.parseComponent();
    }

    // 기본 템플릿 지정 

  }, {
    key: 'template',
    value: function template() {
      var className = this.templateClass();
      var classString = className ? 'class="' + className + '"' : EMPTY_STRING;

      return '<div ' + classString + '></div>';
    }
  }, {
    key: 'templateClass',
    value: function templateClass() {
      return null;
    }
  }, {
    key: 'eachChildren',
    value: function eachChildren(callback) {
      if (!isFunction(callback)) return;

      keyEach(this.children, function (_, Component) {
        callback(Component);
      });
    }

    /**
     * 이벤트를 초기화한다. 
     */

  }, {
    key: 'initializeEvent',
    value: function initializeEvent() {
      this.initializeEventMachin();

      // 자식 이벤트도 같이 초기화 한다. 
      // 그래서 이 메소드는 부모에서 한번만 불려도 된다. 
      this.eachChildren(function (Component) {
        Component.initializeEvent();
      });
    }

    /**
     * 자원을 해제한다. 
     * 이것도 역시 자식 컴포넌트까지 제어하기 때문에 가장 최상위 부모에서 한번만 호출되도 된다. 
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyEventMachin();
      // this.refs = {} 

      this.eachChildren(function (Component) {
        Component.destroy();
      });
    }
  }, {
    key: 'destroyEventMachin',
    value: function destroyEventMachin() {
      this.removeEventAll();
    }
  }, {
    key: 'initializeEventMachin',
    value: function initializeEventMachin() {
      var _this4 = this;

      this.filterProps(CHECK_PATTERN).forEach(function (key) {
        return parseEvent(_this4, key);
      });
    }

    /**
     * property 수집하기 
     * 상위 클래스의 모든 property 를 수집해서 리턴한다. 
     */

  }, {
    key: 'collectProps',
    value: function collectProps() {

      if (!this.collapsedProps) {
        var p = this.__proto__;
        var results = [];
        do {
          results.push.apply(results, toConsumableArray(Object.getOwnPropertyNames(p)));
          p = p.__proto__;
        } while (p);

        this.collapsedProps = results;
      }

      return this.collapsedProps;
    }
  }, {
    key: 'filterProps',
    value: function filterProps(pattern) {
      return this.collectProps().filter(function (key) {
        return key.match(pattern);
      });
    }

    /* magic check method  */

  }, {
    key: 'self',
    value: function self(e) {
      return e && e.$delegateTarget && e.$delegateTarget.is(e.target);
    }
  }, {
    key: 'isAltKey',
    value: function isAltKey(e) {
      return e.altKey;
    }
  }, {
    key: 'isCtrlKey',
    value: function isCtrlKey(e) {
      return e.ctrlKey;
    }
  }, {
    key: 'isShiftKey',
    value: function isShiftKey(e) {
      return e.shiftKey;
    }
  }, {
    key: 'isMetaKey',
    value: function isMetaKey(e) {
      return e.metaKey;
    }
  }, {
    key: 'preventDefault',
    value: function preventDefault(e) {
      e.preventDefault();
      return true;
    }
  }, {
    key: 'stopPropagation',
    value: function stopPropagation(e) {
      e.stopPropagation();
      return true;
    }

    /* magic check method */

    /* after check method */

  }, {
    key: 'bodyMouseMove',
    value: function bodyMouseMove(methodName) {
      if (this[methodName]) {
        this.emit(ADD_BODY_MOUSEMOVE, this[methodName], this);
      }
    }
  }, {
    key: 'bodyMouseUp',
    value: function bodyMouseUp(methodName) {
      if (this[methodName]) {
        this.emit(ADD_BODY_MOUSEUP, this[methodName], this);
      }
    }
    /* after check method */

  }, {
    key: 'getBindings',
    value: function getBindings() {

      if (!this._bindings) {
        this.initBindings();
      }

      return this._bindings;
    }
  }, {
    key: 'addBinding',
    value: function addBinding(obj) {
      this.getBindings().push(obj);
    }
  }, {
    key: 'initBindings',
    value: function initBindings() {
      this._bindings = [];
    }
  }, {
    key: 'removeEventAll',
    value: function removeEventAll() {
      var _this5 = this;

      this.getBindings().forEach(function (obj) {
        _this5.removeEvent(obj);
      });
      this.initBindings();
    }
  }, {
    key: 'removeEvent',
    value: function removeEvent(_ref3) {
      var eventName = _ref3.eventName,
          dom = _ref3.dom,
          callback = _ref3.callback;

      Event.removeEvent(dom, eventName, callback);
    }
  }]);
  return EventMachine;
}();

var CHECK_STORE_MULTI_PATTERN = /^ME@/;

var PREFIX = '@';
var MULTI_PREFIX = 'ME@';
var SPLITTER = '|';

var PIPE = function PIPE() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return args.join(SPLITTER);
};

var EVENT = function EVENT() {
    return MULTI_PREFIX + PIPE.apply(undefined, arguments);
};

var UIElement = function (_EventMachine) {
    inherits(UIElement, _EventMachine);

    function UIElement(opt, props) {
        classCallCheck(this, UIElement);

        var _this = possibleConstructorReturn(this, (UIElement.__proto__ || Object.getPrototypeOf(UIElement)).call(this, opt));

        _this.opt = opt || {};
        _this.parent = _this.opt;
        _this.props = props || {};
        _this.source = uuid();
        _this.sourceName = _this.constructor.name;
        // window[this.source] = this; 

        if (opt && opt.$store) {
            _this.$store = opt.$store;
        }

        _this.created();

        _this.initialize();

        _this.initializeStoreEvent();
        return _this;
    }

    createClass(UIElement, [{
        key: "created",
        value: function created() {}
    }, {
        key: "getRealEventName",
        value: function getRealEventName(e) {
            var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : PREFIX;

            var startIndex = e.indexOf(s);
            return e.substr(startIndex == 0 ? 0 : startIndex + s.length);
        }

        /**
         * initialize store event 
         * 
         * you can define '@xxx' method(event) in UIElement 
         * 
         * 
         */

    }, {
        key: "initializeStoreEvent",
        value: function initializeStoreEvent() {
            var _this2 = this;

            this.storeEvents = {};

            this.filterProps(CHECK_STORE_MULTI_PATTERN).forEach(function (key) {
                var events = _this2.getRealEventName(key, MULTI_PREFIX);

                events.split(SPLITTER).forEach(function (e) {
                    e = _this2.getRealEventName(e);
                    var callback = _this2[key].bind(_this2);
                    callback.displayName = e;
                    callback.source = _this2.source;
                    _this2.storeEvents[e] = callback;
                    _this2.$store.on(e, _this2.storeEvents[e], _this2);
                });
            });
        }
    }, {
        key: "destoryStoreEvent",
        value: function destoryStoreEvent() {
            var _this3 = this;

            keyEach(this.storeEvents, function (event, eventValue) {
                _this3.$store.off(event, eventValue);
            });
        }
    }, {
        key: "get",
        value: function get$$1(id) {
            return this.$store.items[id] || {};
        }
    }, {
        key: "read",
        value: function read($1, $2, $3, $4, $5) {
            return this.$store.read($1, $2, $3, $4, $5);
        }
    }, {
        key: "mapGetters",
        value: function mapGetters() {
            var _$store;

            return (_$store = this.$store).mapGetters.apply(_$store, arguments);
        }
    }, {
        key: "mapActions",
        value: function mapActions() {
            var _$store2;

            return (_$store2 = this.$store).mapActions.apply(_$store2, arguments);
        }
    }, {
        key: "mapDispatches",
        value: function mapDispatches() {
            var _$store3;

            return (_$store3 = this.$store).mapDispatches.apply(_$store3, arguments);
        }
    }, {
        key: "i18n",
        value: function i18n($1, $2, $3, $4, $5) {
            return this.read('i18n/get', $1, $2, $3, $4, $5);
        }
    }, {
        key: "config",
        value: function config($1, $2, $3, $4, $5) {
            if (arguments.length == 1) {
                return this.$store.tool[$1];
            }

            this.dispatch(TOOL_SET, $1, $2, $3, $4, $5);
        }
    }, {
        key: "initConfig",
        value: function initConfig($1, $2) {
            this.$store.tool[$1] = $2;
        }
    }, {
        key: "run",
        value: function run($1, $2, $3, $4, $5) {
            return this.$store.run($1, $2, $3, $4, $5);
        }
    }, {
        key: "dispatch",
        value: function dispatch($1, $2, $3, $4, $5) {
            this.$store.source = this.source;
            return this.$store.dispatch($1, $2, $3, $4, $5);
        }
    }, {
        key: "emit",
        value: function emit($1, $2, $3, $4, $5) {
            this.$store.source = this.source;
            this.$store.emit($1, $2, $3, $4, $5);
        }
    }, {
        key: "commit",
        value: function commit(eventType, $1, $2, $3, $4, $5) {
            this.run(ITEM_SET, $1, $2, $3, $4, $5);
            this.emit(eventType, $1, $2, $3, $4, $5);
        }
    }]);
    return UIElement;
}(EventMachine);

var config = new Map();

var Config = function () {
    function Config(editor) {
        classCallCheck(this, Config);

        this.editor = editor;
    }

    createClass(Config, [{
        key: "get",
        value: function get(key) {
            return config[key];
        }
    }, {
        key: "set",
        value: function set$$1(key, value) {
            config[key] = value;
        }
    }]);
    return Config;
}();

var _stringToPercent = {
    'center': 50,
    'top': 0,
    'left': 0,
    'right': 100,
    'bottom': 100
};

var Position$1 = function Position() {
    classCallCheck(this, Position);
};

Position$1.CENTER = 'center';
Position$1.TOP = 'top';
Position$1.RIGHT = 'right';
Position$1.LEFT = 'left';
Position$1.BOTTOM = 'bottom';

var CSS_UNIT_REG = /([\d.]+)(px|pt|em|deg|vh|vw|%)/ig;

var Length$1 = function () {
    function Length() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        classCallCheck(this, Length);

        this.value = value;
        this.unit = unit;
    }

    createClass(Length, [{
        key: Symbol.toPrimitive,
        value: function value(hint) {
            if (hint == 'number') {
                return this.value;
            }

            return this.toString();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.value + this.unit;
        }
    }, {
        key: 'isPercent',
        value: function isPercent() {
            return this.unit == '%';
        }
    }, {
        key: 'isPx',
        value: function isPx() {
            return this.unit == 'px';
        }
    }, {
        key: 'isEm',
        value: function isEm() {
            return this.unit == 'em';
        }
    }, {
        key: 'isDeg',
        value: function isDeg() {
            return this.unit == 'deg';
        }
    }, {
        key: 'isString',
        value: function isString$$1() {
            return this.unit === '';
        }
    }, {
        key: 'set',
        value: function set$$1(value) {
            this.value = value;
        }
    }, {
        key: 'add',
        value: function add(obj) {
            this.value += +obj;
            return this;
        }
    }, {
        key: 'sub',
        value: function sub(obj) {
            return this.add(-1 * obj);
        }
    }, {
        key: 'mul',
        value: function mul(obj) {
            this.value *= +obj;
            return this;
        }
    }, {
        key: 'div',
        value: function div(obj) {
            this.value /= +obj;
            return this;
        }
    }, {
        key: 'mod',
        value: function mod(obj) {
            this.value %= +obj;
            return this;
        }
    }, {
        key: 'clone',
        value: function clone$$1() {
            return new Length(this.value, this.unit);
        }
    }, {
        key: 'getUnitName',
        value: function getUnitName() {
            return this.unit === '%' ? 'percent' : this.unit;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return { value: this.value, unit: this.unit };
        }
    }, {
        key: 'rate',
        value: function rate(value) {
            return value / this.value;
        }
    }, {
        key: 'stringToPercent',
        value: function stringToPercent() {

            if (isNotUndefined(_stringToPercent[this.value])) {
                return Length.percent(_stringToPercent[this.value]);
            }

            return Length.percent(0);
        }
    }, {
        key: 'stringToEm',
        value: function stringToEm(maxValue) {
            return this.stringToPercent().toEm(maxValue);
        }
    }, {
        key: 'stringToPx',
        value: function stringToPx(maxValue) {
            return this.stringToPercent().toPx(maxValue);
        }
    }, {
        key: 'toPercent',
        value: function toPercent(maxValue) {
            var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;

            if (this.isPercent()) {
                return this;
            } else if (this.isPx()) {
                return Length.percent(this.value * 100 / maxValue);
            } else if (this.isEm()) {
                return Length.percent(this.value * fontSize * 100 / maxValue);
            } else if (this.isString()) {
                return this.stringToPercent(maxValue);
            }
        }
    }, {
        key: 'toEm',
        value: function toEm(maxValue) {
            var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;

            if (this.isPercent()) {
                return Length.em(this.value / 100 * maxValue / fontSize);
            } else if (this.isPx()) {
                return Length.em(this.value / fontSize);
            } else if (this.isEm()) {
                return this;
            } else if (this.isString()) {
                return this.stringToEm(maxValue);
            }
        }
    }, {
        key: 'toPx',
        value: function toPx(maxValue) {
            if (this.isPercent()) {
                return Length.px(this.value / 100 * maxValue);
            } else if (this.isPx()) {
                return this;
            } else if (this.isEm()) {
                return Length.px(this.value / 100 * maxValue / 16);
            } else if (this.isString()) {
                return this.stringToPx(maxValue);
            }
        }
    }], [{
        key: 'min',
        value: function min() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var min = args.shift();

            for (var i = 0, len = args.length; i < len; i++) {
                if (min.value > args[i].value) {
                    min = args[i];
                }
            }

            return min;
        }
    }, {
        key: 'max',
        value: function max() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var max = args.shift();

            for (var i = 0, len = args.length; i < len; i++) {
                if (max.value < args[i].value) {
                    max = args[i];
                }
            }

            return max;
        }
    }, {
        key: 'string',
        value: function string(value) {
            return new Length(value + "", '');
        }
    }, {
        key: 'px',
        value: function px(value) {
            return new Length(+value, 'px');
        }
    }, {
        key: 'em',
        value: function em(value) {
            return new Length(+value, 'em');
        }
    }, {
        key: 'percent',
        value: function percent(value) {
            return new Length(+value, '%');
        }
    }, {
        key: 'deg',
        value: function deg(value) {
            return new Length(+value, 'deg');
        }
    }, {
        key: 'parse',
        value: function parse(obj) {

            if (isString(obj)) {
                var arr = obj.replace(CSS_UNIT_REG, '$1 $2').split(' ');
                var isNumberString = +arr[0] == arr[0];
                if (isNumberString) {
                    return new Length(+arr[0], arr[1]);
                } else {
                    return new Length(arr[0]);
                }
            }

            if (obj instanceof Length) {
                return obj;
            } else if (obj.unit) {
                if (obj.unit == '%' || obj.unit == 'percent') {

                    var value = 0;

                    if (isNotUndefined(obj.percent)) {
                        value = obj.percent;
                    } else if (isNotUndefined(obj.value)) {
                        value = obj.value;
                    }

                    return Length.percent(value);
                } else if (obj.unit == 'px') {
                    var value = 0;

                    if (isNotUndefined(obj.px)) {
                        value = obj.px;
                    } else if (isNotUndefined(obj.value)) {
                        value = obj.value;
                    }

                    return Length.px(value);
                } else if (obj.unit == 'em') {
                    var value = 0;

                    if (isNotUndefined(obj.em)) {
                        value = obj.em;
                    } else if (isNotUndefined(obj.value)) {
                        value = obj.value;
                    }

                    return Length.em(value);
                } else if (obj.unit == 'deg') {
                    var value = 0;

                    if (isNotUndefined(obj.deg)) {
                        value = obj.deg;
                    } else if (isNotUndefined(obj.value)) {
                        value = obj.value;
                    }

                    return Length.deg(value);
                } else if (obj.unit === '' || obj.unit === 'string') {
                    var value = '';

                    if (isNotUndefined(obj.str)) {
                        value = obj.str;
                    } else if (isNotUndefined(obj.value)) {
                        value = obj.value;
                    }

                    return Length.string(value);
                }
            }

            return Length.string(obj);
        }
    }]);
    return Length;
}();

/* event trigger */

var CHANGE_TOOL = 'CHANGE_TOOL';



var CHANGE_TIMELINE = 'CHANGE_TIMELINE';
var CHANGE_SELECTION = 'CHANGE_SELECTION';
var CHANGE_KEYFRAME = 'CHANGE_KEYFRAME';
var CHANGE_KEYFRAME_SELECTION = 'CHANGE_KEYFRAME_SELECTION';

var CHANGE_EDITOR = 'CHANGE_EDITOR';

var CHANGE_ARTBOARD = 'CHANGE_ARTBOARD';

var CHANGE_LAYER = 'CHANGE_LAYER';
var CHANGE_RECT = 'CHANGE_RECT';
var CHANGE_IMAGE = 'CHANGE_IMAGE';




var CHANGE_BOXSHADOW = 'CHANGE_BOXSHADOW';
var CHANGE_TEXTSHADOW = 'CHANGE_TEXTSHADOW';
var CHANGE_COLORSTEP = 'CHANGE_COLORSTEP';

var ADD_TIMELINE = 'ADD_TIMELINE';


var SELECT_TAB_LAYER = 'SELECT_TAB_LAYER';
var SELECT_TAB_IMAGE = 'SELECT_TAB_IMAGE';

var Item = function () {
    function Item() {
        var _this = this;

        var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, Item);

        if (json instanceof Item) {
            json = json.toJSON();
        }
        this.json = this.convert(_extends({}, this.getDefaultObject(), json));

        return new Proxy(this, {
            get: function get$$1(target, key) {
                var originMethod = target[key];
                if (isFunction(originMethod)) {
                    // method tracking
                    return function () {
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                        }

                        return originMethod.apply(target, args);
                    };
                } else {
                    // getter or json property 
                    return originMethod || target.json[key];
                }
            },
            set: function set$$1(target, key, value) {

                // Dom 객체가 오면 자동으로 입력 해줌 
                if (value instanceof Dom) {
                    value = value.realVal();
                }

                if (_this.checkField(key, value)) {
                    target.json[key] = value;
                } else {
                    throw new Error(value + " is invalid as " + key + " property value.");
                }

                return true;
            }
        });
    }

    createClass(Item, [{
        key: "getDefaultTitle",
        value: function getDefaultTitle() {
            return 'Item';
        }

        /**
         * getter .name
         */

    }, {
        key: "isAttribute",


        /**
         * check attribute object 
         */
        value: function isAttribute() {
            return false;
        }

        /**
         * when json is loaded, json object is be a new instance 
         * 
         * @param {*} json 
         */

    }, {
        key: "convert",
        value: function convert(json) {
            if (isUndefined$1(json.id)) {
                json.id = uuidShort();
            }
            return json;
        }

        /**
         * defence to set invalid key-value  
         * 
         * @param {*} key 
         * @param {*} value 
         */

    }, {
        key: "checkField",
        value: function checkField(key, value) {
            return true;
        }

        /**
         * search children by searchObj
         * 
         * @param {object} searchObj 
         */

    }, {
        key: "search",
        value: function search() {
            var searchObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return editor$1.search(_extends({ parentId: this.id }, searchObj));
        }

        /**
         * search first one by searchObj 
         * @param {object} searchObj 
         */

    }, {
        key: "one",
        value: function one(searchObj) {
            return this.search(searchObj)[0];
        }

        /**
         * clone Item 
         */

    }, {
        key: "clone",
        value: function clone$$1() {
            var isNew = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var json = JSON.parse(JSON.stringify(this.json));
            if (isNew) delete json.id;

            var ItemClass = this.constructor;

            return new ItemClass(json);
        }

        /**
         * 
         * @param {string} itemType 
         * @param {Item} item   Item instance 
         * @param {string} sortType  sort parent's children by sortType 
         */

    }, {
        key: "addItem",
        value: function addItem(itemType, item, sortType) {
            if (item.itemType != itemType) {
                throw new Error("Only " + itemType + " is able to add in " + this.json.type);
            }

            var newItem = editor$1.add(this.id, item);

            if (isUndefined$1(sortType)) {
                this.sort();
            } else {
                this.sort(sortType);
            }

            return newItem;
        }

        /**
         * addItem alias 
         * 
         * @param {*} item 
         */

    }, {
        key: "add",
        value: function add(item) {
            return this.addItem(item.itemType, item, item.itemType);
        }

        /**
         * set json content 
         * 
         * @param {object} obj 
         */

    }, {
        key: "reset",
        value: function reset(obj) {
            this.json = this.convert(_extends({}, this.json, obj));
        }

        /**
         * select item 
         */

    }, {
        key: "select",
        value: function select() {
            editor$1.selection.select(this.id);
        }

        //////////////////////
        //
        // getters 
        //
        ///////////////////////

    }, {
        key: "getDefaultObject",


        /**
         * define defaut object for item 
         * 
         * @param {object} obj 
         */
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return _extends({
                id: uuidShort(),
                index: Number.MAX_SAFE_INTEGER,
                visible: true,
                lock: false
            }, obj);
        }

        /**
         * toggle item's attribute 
         * 
         * @param {*} field 
         * @param {*} toggleValue 
         */

    }, {
        key: "toggle",
        value: function toggle(field, toggleValue) {
            if (isUndefined$1(toggleValue)) {
                this.json[field] = !this.json[field];
            } else {
                this.json[field] = !!toggleValue;
            }
        }

        /**
         * convert to json 
         */

    }, {
        key: "toJSON",
        value: function toJSON() {
            return this.json;
        }

        /**
         * check item type 
         * 
         * @param {string} itemType 
         */

    }, {
        key: "is",
        value: function is(itemType) {
            return this.json.itemType == itemType;
        }

        /**
         * remove item 
         */

    }, {
        key: "remove",
        value: function remove() {
            var isDeleteChildren = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            editor$1.remove(this.id, isDeleteChildren);
        }

        /**
         * remove children for item 
         * 
         * @param {string} itemType 
         */

    }, {
        key: "clear",
        value: function clear(itemType) {

            if (isNotUndefined(itemType)) {
                this.search({ itemType: itemType }).forEach(function (c) {
                    return c.remove();
                });
            } else {
                editor$1.removeChildren(this.id, this);
            }
        }

        /**
         * get parent item instance 
         */

    }, {
        key: "parent",
        value: function parent() {
            return editor$1.get(this.parentId);
        }

        /**
         * sorting children 
         * 
         * @param {string} itemType 
         */

    }, {
        key: "sort",
        value: function sort(itemType) {
            var children = this.children;

            if (itemType) {
                children = children.filter(function (it) {
                    return it.itemType === itemType;
                });
            }

            children.sort(function (a, b) {
                if (a.index === b.index) return 0;
                return a.index > b.index ? 1 : -1;
            });

            children.forEach(function (it, index) {
                it.index = index * 100;
            });
        }
    }, {
        key: "copy",
        value: function copy() {
            return editor$1.copy(this.id);
        }
    }, {
        key: "insertLast",
        value: function insertLast(source) {

            var selfParent = this.parent();
            var sourceParent = source.parent();

            source.parentId = this.json.parentId;
            source.index = this.json.index + 1;

            selfParent.sort();
            sourceParent.sort();
        }

        /**
         * get hirachy path s
         */

    }, {
        key: "path",
        value: function path(parentId) {
            var path = [];
            var currentId = parentId || this.parentId;
            do {
                var item = editor$1.get(currentId);
                if (item) {
                    path.push(item);
                }

                currentId = item ? item.parentId : this.json.parentId;
            } while (currentId);

            return path;
        }
    }, {
        key: "checkInArea",
        value: function checkInArea(area) {

            if (area.width.value === 0) {
                return false;
            }
            if (area.height.value === 0) {
                return false;
            }
            if (area.x2.value < this.screenX.value) {
                return false;
            }
            if (area.y2.value < this.screenY.value) {
                return false;
            }
            if (area.x.value > this.screenX2.value) {
                return false;
            }
            if (area.y.value > this.screenY2.value) {
                return false;
            }

            return true;
        }
    }, {
        key: "toBoundCSS",
        value: function toBoundCSS() {
            return {
                top: "" + this.json.y,
                left: "" + this.json.x,
                width: "" + this.json.width,
                height: "" + this.json.height
            };
        }
    }, {
        key: "title",
        get: function get$$1() {
            return "" + (this.json.name || this.getDefaultTitle());
        }
    }, {
        key: "screenX",
        get: function get$$1() {
            return this.json.x;
        }
    }, {
        key: "screenY",
        get: function get$$1() {
            return this.json.y;
        }
    }, {
        key: "screenX2",
        get: function get$$1() {
            return Length$1.px(this.screenX.value + this.json.width.value);
        }
    }, {
        key: "screenY2",
        get: function get$$1() {
            return Length$1.px(this.screenY.value + this.json.height.value);
        }
    }, {
        key: "centerX",
        get: function get$$1() {
            var half = 0;
            if (this.json.width.value != 0) {
                half = Math.floor(this.json.width.value / 2);
            }
            return Length$1.px(this.screenX.value + half);
        }
    }, {
        key: "centerY",
        get: function get$$1() {
            var half = 0;
            if (this.json.height.value != 0) {
                half = Math.floor(this.json.height.value / 2);
            }

            return Length$1.px(this.screenY.value + half);
        }

        /**
         * check selection status for item  
         */

    }, {
        key: "selected",
        get: function get$$1() {
            return editor$1.selection.check(this.id);
        }
    }, {
        key: "selectedOne",
        get: function get$$1() {
            return editor$1.selection.checkOne(this.id);
        }

        /**
         * get id 
         */

    }, {
        key: "id",
        get: function get$$1() {
            return this.json.id;
        }

        /** get parentId */

    }, {
        key: "parentId",
        get: function get$$1() {
            return this.json.parentId;
        }

        /**
         * get children 
         */

    }, {
        key: "children",
        get: function get$$1() {
            var children = editor$1.children(this.id);
            children.sort(function (a, b) {
                if (a.index === b.index) return 0;

                return a.index > b.index ? 1 : -1;
            });
            return children;
        }
    }, {
        key: "childrenIds",
        get: function get$$1() {
            return editor$1.childrenIds(this.id);
        }
    }]);
    return Item;
}();

var RectItem = function (_Item) {
    inherits(RectItem, _Item);

    function RectItem() {
        classCallCheck(this, RectItem);
        return possibleConstructorReturn(this, (RectItem.__proto__ || Object.getPrototypeOf(RectItem)).apply(this, arguments));
    }

    createClass(RectItem, [{
        key: "convert",
        value: function convert(json) {
            json = get$1(RectItem.prototype.__proto__ || Object.getPrototypeOf(RectItem.prototype), "convert", this).call(this, json);

            json.width = Length$1.parse(json.width);
            json.height = Length$1.parse(json.height);
            json.x = Length$1.parse(json.x);
            json.y = Length$1.parse(json.y);

            return json;
        }
    }]);
    return RectItem;
}(Item);

var Selection = function () {
    function Selection(editor) {
        classCallCheck(this, Selection);

        this.editor = editor;

        this._mode = '';
        this._ids = [];
        this._idSet = new Set();
    }

    createClass(Selection, [{
        key: "initialize",
        value: function initialize() {
            this._mode = '';
            this._ids = [];
            this._idSet.clear();
        }

        /**
         * get id string list for selected items 
         */

    }, {
        key: "updateLayer",
        value: function updateLayer(event) {
            var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var layer = this.currentLayer;
            if (layer) {
                layer.reset(attrs);
            }
            (context || this.editor).emit(event, layer);
        }
    }, {
        key: "updateRect",
        value: function updateRect(event) {
            var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var rect = this.currentRect;
            if (rect) {
                rect.reset(attrs);
            }
            (context || this.editor).emit(event, rect);
        }
    }, {
        key: "updateArtBoard",
        value: function updateArtBoard(event) {
            var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var artboard = this.currentArtBoard;
            if (artboard) {
                artboard.reset(attrs);
            }
            (context || this.editor).emit(event, artboard);
        }
    }, {
        key: "updateDirectory",
        value: function updateDirectory(event) {
            var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var directory = this.currentDirectory;
            if (directory) {
                directory.reset(attrs);
            }
            (context || this.editor).emit(event, directory);
        }
    }, {
        key: "updateProject",
        value: function updateProject(event) {
            var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var project = this.currentProject;
            if (project) {
                project.reset(attrs);
            }
            (context || this.editor).emit(event, project);
        }
    }, {
        key: "check",
        value: function check(id) {
            var hasKey = this._idSet.has(id);

            if (!hasKey) {
                var isArtBoard = this._artboard && this._artboard.id == id;
                if (isArtBoard) {
                    return true;
                }

                var isProject = this._project && this._project.id == id;
                if (isProject) return true;

                return false;
            }

            return true;
        }
    }, {
        key: "checkOne",
        value: function checkOne(id) {
            return this._idSet.has(id);
        }
    }, {
        key: "isEmpty",
        value: function isEmpty() {
            return this._ids.length === 0;
        }
    }, {
        key: "isNotEmpty",
        value: function isNotEmpty() {
            return this._ids.length > 0;
        }
    }, {
        key: "unitValues",
        value: function unitValues() {
            return this.items.map(function (item) {

                var x = item.x.value;
                var y = item.y.value;
                var width = item.width.value;
                var height = item.height.value;
                var id = item.id;

                return {
                    id: id, x: x, y: y, width: width, height: height,
                    x2: x + width,
                    y2: y + height,
                    centerX: x + width / 2,
                    centerY: y + height / 2
                };
            });
        }
    }, {
        key: "search",
        value: function search(itemType) {
            return this.items.filter(function (item) {
                return item.itemType === itemType;
            });
        }
    }, {
        key: "is",
        value: function is(mode) {
            return this._mode === mode;
        }
    }, {
        key: "select",
        value: function select() {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var isAll = args.map(function (id) {
                return _this._idSet.has(id);
            }).every(function (it) {
                return it;
            });

            this._ids = args.map(function (it) {
                if (it instanceof Item) {
                    return it.id;
                }

                return it;
            }).filter(function (id) {
                return _this.editor.has(id);
            });
            this._idSet = new Set(this._ids);

            this.generateCache();

            if (!isAll) {
                this.editor.send(CHANGE_SELECTION);
            }
        }
    }, {
        key: "generateCache",
        value: function generateCache() {

            if (this._ids.length) {
                var parents = this.editor.get(this._ids[0]).path();
                this._colorstep = parents.filter(function (it) {
                    return it.itemType === 'colorstep';
                })[0];
                this._image = parents.filter(function (it) {
                    return it.itemType === 'image-resource';
                })[0];
                this._backgroundImage = parents.filter(function (it) {
                    return it.itemType === 'background-image';
                })[0];
                this._layer = parents.filter(function (it) {
                    return it.itemType === 'layer';
                })[0];
                this._directory = parents.filter(function (it) {
                    return it.itemType === 'directory';
                })[0];
                this._artboard = parents.filter(function (it) {
                    return it.itemType === 'artboard';
                })[0];
                this._project = parents.filter(function (it) {
                    return it.itemType === 'project';
                })[0];
            } else {
                this._colorstep = null;
                this._image = null;
                this._backgroundImage = null;
                this._layer = null;
                this._directory = null;
                this._artboard = null;
                this._project = null;
            }
        }
    }, {
        key: "focus",
        value: function focus(item) {
            // this.editor.send('focus', item);
        }
    }, {
        key: "area",
        value: function area(rect) {
            var selectItems = this.editor.layers.filter(function (layer) {
                return !layer.lock && layer.checkInArea(rect);
            }).map(function (it) {
                return it.id;
            });

            if (selectItems) {
                // FIXME: diff 를 매끄럽게 할 수 있는 방법이 필요하다. 
                var isChanged = JSON.stringify(this._ids) !== JSON.stringify(selectItems);
                if (isChanged && selectItems.length) {
                    this.select.apply(this, toConsumableArray(selectItems));
                } else {}
            } else {
                var project = this.currentProject;
                project && project.select();
            }
        }
    }, {
        key: "initRect",
        value: function initRect() {
            this.currentRect = this.rect();
        }
    }, {
        key: "rect",
        value: function rect() {
            var minX = Number.MAX_SAFE_INTEGER;
            var minY = Number.MAX_SAFE_INTEGER;
            var maxX = Number.MIN_SAFE_INTEGER;
            var maxY = Number.MIN_SAFE_INTEGER;

            this.items.forEach(function (item) {
                var x = item.screenX.value;
                var y = item.screenY.value;
                var x2 = item.screenX2.value;
                var y2 = item.screenY2.value;

                if (minX > x) minX = x;
                if (minY > y) minY = y;
                if (maxX < x2) maxX = x2;
                if (maxY < y2) maxY = y2;
            });

            var x = minX;
            var y = minY;
            var x2 = maxX;
            var y2 = maxY;

            var width = x2 - x;
            var height = y2 - y;

            x = Length$1.px(x);
            y = Length$1.px(y);
            width = Length$1.px(width);
            height = Length$1.px(height);

            return new RectItem({ x: x, y: y, width: width, height: height });
        }
    }, {
        key: "ids",
        get: function get() {
            return this._ids;
        }

        /**
         * get item instance 
         */

    }, {
        key: "items",
        get: function get() {
            var _this2 = this;

            return this._ids.map(function (id) {
                return _this2.editor.get(id);
            });
        }

        /**
         * get first item instance 
         */

    }, {
        key: "current",
        get: function get() {
            return this.editor.get(this.ids[0]);
        }

        /**
         * get colorstep list
         */

    }, {
        key: "colorsteps",
        get: function get() {
            return this.search('colorstep');
        }

        /**
         * get first colorstep 
         */

    }, {
        key: "colorstep",
        get: function get() {
            return this.colorsteps[0];
        }
    }, {
        key: "backgroundImages",
        get: function get() {
            return this.search('background-image');
        }
    }, {
        key: "backgroundImage",
        get: function get() {
            return this.backgroundImages[0];
        }
    }, {
        key: "images",
        get: function get() {
            return this.search('image-resource');
        }
    }, {
        key: "image",
        get: function get() {
            return this.images[0];
        }
    }, {
        key: "boxShadows",
        get: function get() {
            return this.search('box-shadow');
        }
    }, {
        key: "textShadows",
        get: function get() {
            return this.search('text-shadow');
        }
    }, {
        key: "layers",
        get: function get() {
            return this.search('layer');
        }
    }, {
        key: "layer",
        get: function get() {
            return this.layers[0];
        }
    }, {
        key: "artboards",
        get: function get() {
            return this.search('artboard');
        }
    }, {
        key: "artboard",
        get: function get() {
            return this.artboards[0];
        }
    }, {
        key: "projects",
        get: function get() {
            return this.search('project');
        }
    }, {
        key: "project",
        get: function get() {
            return this.projects[0];
        }
    }, {
        key: "directories",
        get: function get() {
            return this.search('directory');
        }
    }, {
        key: "directory",
        get: function get() {
            return this.directories[0];
        }
    }, {
        key: "currentColorStep",
        get: function get() {
            return this._colorstep;
        }
    }, {
        key: "currentImage",
        get: function get() {
            return this._imageResource;
        }
    }, {
        key: "currentBackgroundImage",
        get: function get() {
            return this._backgroundImage;
        }
    }, {
        key: "currentDirectory",
        get: function get() {
            return this._directory;
        }
    }, {
        key: "currentArtBoard",
        get: function get() {
            return this._artboard;
        }
    }, {
        key: "currentProject",
        get: function get() {
            return this._project;
        }
    }, {
        key: "currentLayer",
        get: function get() {
            return this._layer;
        }
    }, {
        key: "mode",
        get: function get() {
            return this._mode;
        },
        set: function set$$1(mode) {
            if (this._mode != mode) {
                this._mode = mode;
            }
        }
    }]);
    return Selection;
}();

var BasePropertyItem = function (_UIElement) {
    inherits(BasePropertyItem, _UIElement);

    function BasePropertyItem() {
        classCallCheck(this, BasePropertyItem);
        return possibleConstructorReturn(this, (BasePropertyItem.__proto__ || Object.getPrototypeOf(BasePropertyItem)).apply(this, arguments));
    }

    createClass(BasePropertyItem, [{
        key: "onToggleShow",
        value: function onToggleShow() {}
    }, {
        key: CLICK('$title'),
        value: function value(e) {
            var $dom = new Dom(e.target);

            if ($dom.hasClass('title')) {
                this.$el.toggleClass('show');
                this.onToggleShow();
            }
        }
    }, {
        key: "isPropertyShow",
        value: function isPropertyShow() {
            return this.$el.hasClass('show');
        }
    }]);
    return BasePropertyItem;
}(UIElement);

var Size = function (_BasePropertyItem) {
    inherits(Size, _BasePropertyItem);

    function Size() {
        classCallCheck(this, Size);
        return possibleConstructorReturn(this, (Size.__proto__ || Object.getPrototypeOf(Size)).apply(this, arguments));
    }

    createClass(Size, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item size show'>\n                <div class='items'>\n                    <div>\n                        <label><button type=\"button\" ref=\"$rect\">*</button>Width</label>\n                        <div>\n                            <div class='input two'> \n                                <input type='number' ref=\"$width\"> <span>" + UNIT_PX + "</span>\n                            </div>\n                        </div>\n                        <label class='second'>height</label>\n                        <div>\n                            <div class=\"input two\">\n                                <input type='number' ref=\"$height\"> <span>" + UNIT_PX + "</span>\n                            </div>\n                        </div>                        \n                    </div>   \n                    <div>\n                        <label>X</label>\n                        <div>\n                            <div class='input two'> \n                                <input type='number' ref=\"$x\"> <span>" + UNIT_PX + "</span>\n                            </div>\n                        </div>\n                        <label class='second'>Y</label>\n                        <div>\n                            <div class='input two'>\n                                <input type='number' ref=\"$y\"> <span>" + UNIT_PX + "</span>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var item = editor$1.selection.layer;
            if (!item) return;

            if (item.width) {
                this.refs.$width.val(+item.width);
            }

            if (item.height) {
                this.refs.$height.val(+item.height);
            }

            if (item.x) {
                this.refs.$x.val(+item.x);
            }

            if (item.y) {
                this.refs.$y.val(+item.y);
            }
        }
    }, {
        key: CLICK('$rect'),
        value: function value$$1(e) {
            var widthValue = this.refs.$width.int();
            this.refs.$height.val(widthValue);
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                width: Length$1.px(widthValue),
                height: Length$1.px(widthValue)
            }, this);
        }
    }, {
        key: INPUT('$width'),
        value: function value$$1() {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                width: Length$1.px(this.refs.$width.int())
            }, this);
        }
    }, {
        key: INPUT('$height'),
        value: function value$$1() {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                height: Length$1.px(this.refs.$height.int())
            }, this);
        }
    }, {
        key: INPUT('$x'),
        value: function value$$1() {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                x: Length$1.px(this.refs.$x.int())
            }, this);
        }
    }, {
        key: INPUT('$y'),
        value: function value$$1() {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                y: Length$1.px(this.refs.$y.int())
            }, this);
        }
    }]);
    return Size;
}(BasePropertyItem);

var Position$2 = function (_BasePropertyItem) {
    inherits(Position, _BasePropertyItem);

    function Position() {
        classCallCheck(this, Position);
        return possibleConstructorReturn(this, (Position.__proto__ || Object.getPrototypeOf(Position)).apply(this, arguments));
    }

    createClass(Position, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item position show'>\n                <div class='title' ref=\"$title\">Position</div>\n                <div class='items'>            \n                    <div>\n                        <label>X</label>\n                        <div>\n                            <input type='number' ref=\"$x\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                        <label>Y</label>\n                        <div>\n                            <input type='number' ref=\"$y\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>               \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_LAYER, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                this.refs.$x.val(+layer.x);
                this.refs.$y.val(+layer.y);
            }
        }
    }, {
        key: INPUT('$x'),
        value: function value$$1() {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.x = Length.px(this.refs.$x.int());
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: INPUT('$y'),
        value: function value$$1() {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.y = Length.px(this.refs.$y.int());
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }]);
    return Position;
}(BasePropertyItem);

var Radius = function (_BasePropertyItem) {
    inherits(Radius, _BasePropertyItem);

    function Radius() {
        classCallCheck(this, Radius);
        return possibleConstructorReturn(this, (Radius.__proto__ || Object.getPrototypeOf(Radius)).apply(this, arguments));
    }

    createClass(Radius, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item radius show'>\n                <div class='items'>         \n                    <div>\n                        <label >Top Left</label>\n                        <div>\n                            <input type='range' ref=\"$topLeftRadiusRange\" min=\"0\" max=\"500\">                        \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$topLeftRadius\"> <span>px</span>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Top Right</label>\n                        <div>\n                            <input type='range' ref=\"$topRightRadiusRange\" min=\"0\" max=\"500\">                                                \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$topRightRadius\"> <span>px</span>\n                        </div>\n                    </div>          \n                    <div>\n                        <label>Btm Left</label>\n                        <div>\n                            <input type='range' ref=\"$bottomLeftRadiusRange\" min=\"0\" max=\"500\">                                                \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$bottomLeftRadius\"> <span>px</span>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Btm Right</label>\n                        <div>\n                            <input type='range' ref=\"$bottomRightRadiusRange\" min=\"0\" max=\"500\">                                                \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$bottomRightRadius\"> <span>px</span>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                var maxWidth = +layer.width;

                if (layer.fixedRadius) {
                    var borderRadius = defaultValue(layer.borderRadius, Length$1.px(0));
                    var radius = +borderRadius.toPx(maxWidth);
                    this.refs.$topLeftRadiusRange.val(radius);
                    this.refs.$topRightRadiusRange.val(radius);
                    this.refs.$bottomLeftRadiusRange.val(radius);
                    this.refs.$bottomRightRadiusRange.val(radius);
                    this.refs.$topLeftRadius.val(radius);
                    this.refs.$topRightRadius.val(radius);
                    this.refs.$bottomLeftRadius.val(radius);
                    this.refs.$bottomRightRadius.val(radius);
                } else {

                    if (layer.borderTopLeftRadius) {
                        var value = +layer.borderTopLeftRadius.toPx(maxWidth);
                        this.refs.$topLeftRadius.val(value);
                        this.refs.$topLeftRadiusRange.val(value);
                    }
                    if (layer.borderTopRightRadius) {
                        var value = layer.borderTopRightRadius.toPx(maxWidth);
                        this.refs.$topRightRadius.val(+value);
                        this.refs.$topRightRadiusRange.val(+value);
                    }
                    if (layer.borderBottomLeftRadius) {
                        var value = +layer.borderBottomLeftRadius.toPx(maxWidth);
                        this.refs.$bottomLeftRadius.val(value);
                        this.refs.$bottomLeftRadiusRange.val(value);
                    }
                    if (layer.borderBottomRightRadius) {
                        var value = +layer.borderBottomRightRadius.toPx(maxWidth);
                        this.refs.$bottomRightRadius.val(value);
                        this.refs.$bottomRightRadiusRange.val(value);
                    }
                }
            }
        }
    }, {
        key: "refreshValue",
        value: function refreshValue() {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.reset({
                    borderTopLeftRadius: Length$1.px(this.refs.$topLeftRadius.val()),
                    borderTopRightRadius: Length$1.px(this.refs.$topRightRadius.val()),
                    borderBottomLeftRadius: Length$1.px(this.refs.$bottomLeftRadius.val()),
                    borderBottomRightRadius: Length$1.px(this.refs.$bottomRightRadius.val()),
                    fixedRadius: false
                });
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: CHANGEINPUT('$topLeftRadiusRange'),
        value: function value() {
            this.refs.$topLeftRadius.val(this.refs.$topLeftRadiusRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$topRightRadiusRange'),
        value: function value() {
            this.refs.$topRightRadius.val(this.refs.$topRightRadiusRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$bottomLeftRadiusRange'),
        value: function value() {
            this.refs.$bottomLeftRadius.val(this.refs.$bottomLeftRadiusRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$bottomRightRadiusRange'),
        value: function value() {
            this.refs.$bottomRightRadius.val(this.refs.$bottomRightRadiusRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$topLeftRadius'),
        value: function value() {
            this.refs.$topLeftRadiusRange.val(this.refs.$topLeftRadius);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$topRightRadius'),
        value: function value() {
            this.refs.$topRightRadiusRange.val(this.refs.$topRightRadius);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$bottomLeftRadius'),
        value: function value() {
            this.refs.$bottomLeftRadiusRange.val(this.refs.$bottomLeftRadius);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$bottomRightRadius'),
        value: function value() {
            this.refs.$bottomRightRadiusRange.val(this.refs.$bottomRightRadius);
            this.refreshValue();
        }
    }, {
        key: EVENT('toggleRadius'),
        value: function value() {
            this.$el.toggleClass('show');
        }
    }]);
    return Radius;
}(BasePropertyItem);

var Clip = function (_UIElement) {
    inherits(Clip, _UIElement);

    function Clip() {
        classCallCheck(this, Clip);
        return possibleConstructorReturn(this, (Clip.__proto__ || Object.getPrototypeOf(Clip)).apply(this, arguments));
    }

    createClass(Clip, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item show'>\n                <div class='items'>            \n                    <div>\n                        <label>Clip</label>\n                        <div>\n                            <input type='checkbox' ref=\"$check\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_ARTBOARD, CHANGE_EDITOR),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var artboard = editor$1.selection.currentArtBoard;
            if (artboard) {
                this.refs.$check.checked(artboard.clip);
            }
        }
    }, {
        key: CLICK('$check'),
        value: function value() {
            editor$1.selection.updateArtBoard(CHANGE_ARTBOARD, {
                clip: this.refs.$check.checked()
            });
        }
    }]);
    return Clip;
}(UIElement);

var Name = function (_BasePropertyItem) {
    inherits(Name, _BasePropertyItem);

    function Name() {
        classCallCheck(this, Name);
        return possibleConstructorReturn(this, (Name.__proto__ || Object.getPrototypeOf(Name)).apply(this, arguments));
    }

    createClass(Name, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item name show'>\n                <div class='items'>            \n                    <div>\n                        <label>Name</label>\n                        <div><input type='text' ref=\"$name\" class='full'></div>\n                    </div>\n                    <div>\n                        <label>ID</label>\n                        <div><input type='text' ref=\"$id\" class='full'></div>\n                    </div>                                        \n                    <div>\n                        <label>Class</label>\n                        <div><input type='text' ref=\"$class\" class='full'></div>\n                    </div>                    \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var item = editor$1.selection.layer;

            var name = EMPTY_STRING;
            var idString = EMPTY_STRING;
            var className = EMPTY_STRING;
            if (item) {
                name = item.name;
                idString = item.idString || EMPTY_STRING;
                className = item.className || EMPTY_STRING;
            }

            this.refs.$name.val(name);
            this.refs.$id.val(idString);
            this.refs.$class.val(className);
        }
    }, {
        key: INPUT('$name'),
        value: function value$$1() {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.name = this.refs.$name.val();
                this.commit(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: INPUT('$class'),
        value: function value$$1() {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.className = this.refs.$class.val();
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: INPUT('$id'),
        value: function value$$1() {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.idString = this.refs.$id.val();
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }]);
    return Name;
}(BasePropertyItem);

var bezierList = [[0, 0, 1, 1, 'linear'], [0.25, 0.1, 0.25, 1, 'ease'], [0.42, 0, 1, 1, 'ease-in'], [0.47, 0, 0.745, 0.715, 'ease-in-sine'], [0.55, 0.085, 0.68, 0.53, 'ease-in-quad'], [0.55, 0.055, 0.675, 0.19, 'ease-in-cubic'], [0.895, 0.03, 0.685, 0.22, 'ease-in-quart'], [0.755, 0.05, 0.855, 0.06, 'ease-in-quint'], [0.95, 0.05, 0.795, 0.035, 'ease-in-expo'], [0.60, 0.04, 0.98, 0.335, 'ease-in-circ'], [0.60, -0.28, 0.735, 0.045, 'ease-in-back'], [0.42, 0, 0.58, 1, 'ease-in-out'], [0.445, 0.05, 0.55, 0.95, 'ease-in-out-sine'], [0.455, 0.03, 0.515, 0.955, 'ease-in-out-quad'], [0.645, 0.045, 0.355, 1, 'ease-in-out-cubic'], [0.77, 0, 0.175, 1, 'ease-in-out-quart'], [0.86, 0, 0.07, 1, 'ease-in-out-quint'], [1, 0, 0, 1, 'ease-in-out-expo'], [0.785, 0.135, 0.15, 0.86, 'ease-in-out-circ'], [0.68, -0.55, 0.265, 1.55, 'ease-in-out-back'], [0, 0, 0.58, 1, 'ease-out'], [0.39, 0.575, 0.565, 1, 'ease-out-sine'], [0.25, 0.46, 0.45, 0.94, 'ease-out-quad'], [0.215, 0.61, 0.355, 1, 'ease-out-cubic'], [0.165, 0.84, 0.44, 1, 'ease-out-quart'], [0.23, 1, 0.32, 1, 'ease-out-quint'], [0.19, 1, 0.22, 1, 'ease-out-expo'], [0.075, 0.82, 0.165, 1, 'ease-out-circ'], [0.175, 0.885, 0.32, 1.275, 'ease-out-back']];

var stepTimingFunction = function stepTimingFunction() {
    var step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'end';

    return function (progress) {
        var stepDist = 1 / step;

        if (position == 'start') {
            return stepDist * Math.ceil(progress / stepDist);
        } else if (position == 'end') {
            return stepDist * Math.floor(progress / stepDist);
        }
    };
};

var Timing = {
    'ease-out-elastic': function easeOutElastic(progress, duration, start, end) {
        return Math.pow(2, -10 * progress) * Math.sin((progress - .1) * 5 * Math.PI) + 1;
    },
    'cubic-bezier': function cubicBezier$$1(x1, y1, x2, y2) {
        return cubicBezier(x1, y1, x2, y2);
    },
    'step': function step() {
        var _step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

        var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'end';

        return stepTimingFunction(_step, position);
    },
    'step-start': function stepStart(progress) {
        return stepTimingFunction(1, 'start')(progress);
    },
    'step-end': function stepEnd(progress) {
        return stepTimingFunction(1, 'end')(progress);
    }
};

// setup bezier functions
bezierList.forEach(function (arr) {
    Timing[arr[4]] = cubicBezier(arr[0], arr[1], arr[2], arr[3]);
});

var _DEFINED_POSITIONS;



var LAYER_NAME = function LAYER_NAME(item) {
    var index = item.index,
        name = item.name;

    if (index == Number.MAX_SAFE_INTEGER) index = 0;
    return 1 + index / 100 + ". " + (name || 'Layer');
};




function IS_LAYER(item) {
    return item.itemType == ITEM_TYPE_LAYER;
}



function IS_IMAGE(item) {
    switch (item.itemType) {
        case ITEM_TYPE_IMAGE:
        case ITEM_TYPE_BORDER_IMAGE:
        case ITEM_TYPE_MASK_IMAGE:
        case ITEM_TYPE_BOX_IMAGE:
            return true;
        default:
            return false;
    }
}



























function CSS_FILTERING(style) {
    var newStyle = style;

    if (newStyle['background-blend-mode'] == 'normal') {
        delete newStyle['background-blend-mode'];
    }

    if (newStyle['mix-blend-mode'] == 'normal') {
        delete newStyle['mix-blend-mode'];
    }

    if (newStyle['background-size'] == 'auto') {
        delete newStyle['background-size'];
    }

    if (newStyle['background-position'] == 'center center') {
        delete newStyle['background-position'];
    }

    if (parseParamNumber$1(newStyle.opacity) == 1) {
        delete newStyle.opacity;
    }

    if (parseParamNumber$1(newStyle.left) == 0) {
        delete newStyle.left;
    }

    if (parseParamNumber$1(newStyle.top) == 0) {
        delete newStyle.top;
    }

    if (newStyle.transform == 'none') {
        delete newStyle.transform;
    }

    if (newStyle['transform-style'] == 'float') {
        delete newStyle['transform-style'];
    }

    if (newStyle['clip-path'] == 'none') {
        delete newStyle['clip-path'];
    }

    return newStyle;
}



var ordering = {
    'position': 1,
    'left': 2,
    'top': 2,
    'right': 2,
    'bottom': 2,
    'width': 3,
    'height': 3,

    'font-size': 4,
    'font-family': 4,

    'opacity': 10,
    'border-radius': 10,

    'box-shadow': 15,
    'text-shadow': 15,
    'filter': 15,

    'background-clip': 50,
    '-webkit-background-clip': 50,

    'background-repeat': 100,
    'background-blend-mode': 100,
    'background-image': 100,
    'background-size': 100,
    'background-position': 100,

    'transform': 1000

};

var CSS_SORTING_FUNCTION = function CSS_SORTING_FUNCTION(a, b) {
    var aN = ordering[a] || Number.MAX_SAFE_INTEGER;
    var bN = ordering[b] || Number.MAX_SAFE_INTEGER;

    if (aN == bN) return 0;

    return aN < bN ? -1 : 1;
};

function CSS_SORTING(style) {

    style = CSS_FILTERING(style);

    var keys = Object.keys(style);

    keys.sort(CSS_SORTING_FUNCTION);

    var newStyle = {};
    keys.forEach(function (key) {
        newStyle[key] = style[key];
    });

    return newStyle;
}

function CSS_TO_STRING(style) {
    var newStyle = CSS_SORTING(style);

    return Object.keys(newStyle).filter(function (key) {
        return !!newStyle[key];
    }).map(function (key) {
        return key + ": " + newStyle[key];
    }).join(';');
}



















var DEFINED_POSITIONS = (_DEFINED_POSITIONS = {}, defineProperty(_DEFINED_POSITIONS, 'center', true), defineProperty(_DEFINED_POSITIONS, 'top', true), defineProperty(_DEFINED_POSITIONS, 'left', true), defineProperty(_DEFINED_POSITIONS, 'right', true), defineProperty(_DEFINED_POSITIONS, 'bottom', true), _DEFINED_POSITIONS);

































function PATTERN_GET(item, patternName) {
    var pattern = item.pattern || {};

    return pattern[patternName] || {};
}











function PROPERTY_GET_DEFAULT_VALUE(property) {
    return PROPERTY_DEFAULT_VALUE[property] || { defaultValue: 0, step: 1, min: -1000, max: 1000 };
}



function GET_PROPERTY_LIST(item) {

    if (IS_LAYER(item)) {
        return PROPERTY_LIST[item.itemType] || [];
    } else if (IS_IMAGE(item)) {
        return PROPERTY_LIST[item.itemType + "_" + item.type] || [];
    }
}

var Property = function (_Item) {
    inherits(Property, _Item);

    function Property() {
        classCallCheck(this, Property);
        return possibleConstructorReturn(this, (Property.__proto__ || Object.getPrototypeOf(Property)).apply(this, arguments));
    }

    createClass(Property, [{
        key: "isAttribute",
        value: function isAttribute() {
            return true;
        }
    }, {
        key: "toCSS",
        value: function toCSS() {
            return {};
        }
    }, {
        key: "toString",
        value: function toString() {
            return CSS_TO_STRING(this.toCSS());
        }
    }]);
    return Property;
}(Item);

var ImageResource = function (_Property) {
    inherits(ImageResource, _Property);

    function ImageResource() {
        classCallCheck(this, ImageResource);
        return possibleConstructorReturn(this, (ImageResource.__proto__ || Object.getPrototypeOf(ImageResource)).apply(this, arguments));
    }

    createClass(ImageResource, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(ImageResource.prototype.__proto__ || Object.getPrototypeOf(ImageResource.prototype), "getDefaultObject", this).call(this, _extends({ itemType: 'image-resource' }, obj));
        }
    }, {
        key: "isGradient",
        value: function isGradient() {
            return false;
        }
    }, {
        key: "isLinear",
        value: function isLinear() {
            return false;
        }
    }, {
        key: "isRadial",
        value: function isRadial() {
            return false;
        }
    }, {
        key: "isConic",
        value: function isConic() {
            return false;
        }
    }, {
        key: "isStatic",
        value: function isStatic() {
            return false;
        }
    }, {
        key: "isImage",
        value: function isImage() {
            return false;
        }
    }, {
        key: "hasAngle",
        value: function hasAngle() {
            return false;
        }
    }, {
        key: "isUrl",
        value: function isUrl() {
            return false;
        }
    }, {
        key: "isFile",
        value: function isFile() {
            return false;
        }
    }, {
        key: "isAttribute",
        value: function isAttribute() {
            return true;
        }
    }]);
    return ImageResource;
}(Property);

var ColorStep = function (_Item) {
    inherits(ColorStep, _Item);

    function ColorStep() {
        classCallCheck(this, ColorStep);
        return possibleConstructorReturn(this, (ColorStep.__proto__ || Object.getPrototypeOf(ColorStep)).apply(this, arguments));
    }

    createClass(ColorStep, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(ColorStep.prototype.__proto__ || Object.getPrototypeOf(ColorStep.prototype), "getDefaultObject", this).call(this, {
                cut: false,
                percent: 0,
                unit: '%',
                px: 0,
                em: 0,
                color: 'rgba(0, 0, 0, 0)'
            });
        }
    }, {
        key: "on",
        value: function on() {
            this.json.cut = true;
        }
    }, {
        key: "off",
        value: function off() {
            this.json.cut = false;
        }
    }, {
        key: "toggle",
        value: function toggle() {
            this.json.cut = !this.json.cut;
        }
    }, {
        key: "changeUnit",
        value: function changeUnit(unit, maxValue) {
            this.json.unit = unit;
            this.reset(this.getUnitValue(maxValue));
        }
    }, {
        key: "getUnit",
        value: function getUnit() {
            return this.json.unit == '%' ? 'percent' : this.json.unit;
        }
    }, {
        key: "getUnitValue",
        value: function getUnitValue(maxValue) {
            if (this.isPX) {
                return {
                    px: this.json.px,
                    percent: +Length$1.px(this.json.px).toPercent(maxValue),
                    em: +Length$1.px(this.json.px).toEm(maxValue)
                };
            } else if (this.isEm) {
                return {
                    em: this.json.em,
                    percent: +Length$1.em(this.json.em).toPercent(maxValue),
                    px: +Length$1.em(this.json.em).toPx(maxValue)
                };
            }

            return {
                percent: this.json.percent,
                px: +Length$1.percent(this.json.percent).toPx(maxValue),
                em: +Length$1.percent(this.json.percent).toEm(maxValue)
            };
        }
    }, {
        key: "add",
        value: function add(num) {
            var unit = this.getUnit();
            this.json[unit] += +num;

            return this;
        }
    }, {
        key: "sub",
        value: function sub(num) {
            var unit = this.getUnit();
            this.json[unit] -= +num;

            return this;
        }
    }, {
        key: "mul",
        value: function mul(num) {
            var unit = this.getUnit();
            this.json[unit] *= +num;

            return this;
        }
    }, {
        key: "div",
        value: function div(num) {
            var unit = this.getUnit();
            this.json[unit] /= +num;

            return this;
        }
    }, {
        key: "mod",
        value: function mod(num) {
            var unit = this.getUnit();
            this.json[unit] %= +num;

            return this;
        }
    }, {
        key: "toLength",


        /**
         * convert Length instance 
         * @return {Length}
         */
        value: function toLength(maxValue) {
            // TODO: apply maxValue
            return Length$1.parse(this.json);
        }

        /**
         * get color string 
         * 
         * return {string}
         */

    }, {
        key: "toString",
        value: function toString() {
            return this.json.color + " " + this.toLength();
        }
    }, {
        key: "reset",
        value: function reset(json) {
            get$1(ColorStep.prototype.__proto__ || Object.getPrototypeOf(ColorStep.prototype), "reset", this).call(this, json);
            if (this.parent()) {
                this.parent().sortColorStep();
            }
        }
    }, {
        key: "isPx",
        get: function get() {
            return this.json.unit == 'px';
        }
    }, {
        key: "isPercent",
        get: function get() {
            return this.json.unit == '%' || this.json.unit === 'percent';
        }
    }, {
        key: "isEm",
        get: function get() {
            return this.json.unit == 'em';
        }
    }]);
    return ColorStep;
}(Item);

var DEFINED_ANGLES = {
    'to top': 0,
    'to top right': 45,
    'to right': 90,
    'to bottom right': 135,
    'to bottom': 180,
    'to bottom left': 225,
    'to left': 270,
    'to top left': 315

};

var Gradient = function (_ImageResource) {
    inherits(Gradient, _ImageResource);

    function Gradient() {
        classCallCheck(this, Gradient);
        return possibleConstructorReturn(this, (Gradient.__proto__ || Object.getPrototypeOf(Gradient)).apply(this, arguments));
    }

    createClass(Gradient, [{
        key: "isGradient",
        value: function isGradient() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {
            return "none";
        }

        /**
         * colorsteps = [ 
         *    new ColorStep({color: 'red', percent: 0}),
         *    new ColorStep({color: 'red', percent: 0}) 
         * ] 
         * 
         * @param {*} obj 
         */

    }, {
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(Gradient.prototype.__proto__ || Object.getPrototypeOf(Gradient.prototype), "getDefaultObject", this).call(this, _extends({
                type: 'gradient',
                colorsteps: []
            }, obj));
        }
    }, {
        key: "convert",
        value: function convert(json) {

            json.colorsteps = json.colorsteps.map(function (c) {
                return new ColorStep(c);
            });

            return json;
        }
    }, {
        key: "calculateAngle",
        value: function calculateAngle() {
            var angle = this.json.angle;
            return isUndefined$1(DEFINED_ANGLES[angle]) ? angle : DEFINED_ANGLES[angle] || 0;
        }

        /**
         * add ColorStep 
         * 
         * @param {ColorStep} colorstep 
         * @param {boolean} isSort 
         */

    }, {
        key: "addColorStep",
        value: function addColorStep(colorstep) {
            var isSort = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            this.json.colorsteps.push(colorstep);

            if (isSort) this.sortColorStep();

            return colorstep;
        }
    }, {
        key: "insertColorStep",
        value: function insertColorStep(percent$$1) {
            var startColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'rgba(216,216,216,0)';
            var endColor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'rgba(216,216,216,1)';


            var colorsteps = this.colorsteps;
            if (!colorsteps.length) {

                this.addColorStepList([new ColorStep({ color: startColor, percent: percent$$1, index: 0 }), new ColorStep({ color: endColor, percent: 100, index: 100 })]);
                return;
            }

            if (percent$$1 < colorsteps[0].percent) {
                colorsteps[0].index = 1;

                this.addColorStep(new ColorStep({ index: 0, color: colorsteps[0].color, percent: percent$$1 }));
                return;
            }

            var lastIndex = colorsteps.length - 1;
            if (colorsteps[lastIndex].percent < percent$$1) {
                var color$$1 = colorsteps[lastIndex].color;
                var index = colorsteps[lastIndex].index + 1;

                this.addColorStep(new ColorStep({ index: index, color: color$$1, percent: percent$$1 }));

                return;
            }

            for (var i = 0, len = colorsteps.length - 1; i < len; i++) {
                var step = colorsteps[i];
                var nextStep = colorsteps[i + 1];

                if (step.percent <= percent$$1 && percent$$1 <= nextStep.percent) {
                    var color$$1 = Color$1.mix(step.color, nextStep.color, (percent$$1 - step.percent) / (nextStep.percent - step.percent), 'rgb');

                    this.addColorStep(new ColorStep({ index: step.index + 1, color: color$$1, percent: percent$$1 }));

                    return;
                }
            }
        }
    }, {
        key: "sortColorStep",
        value: function sortColorStep() {

            var children = this.colorsteps;

            children.sort(function (a, b) {

                if (a.percent > b.percent) return 1;
                if (a.percent < b.percent) return -1;
                if (a.percent == b.percent) {
                    if (a.index === b.index) return 0;
                    return a.index > b.index ? 1 : -1;
                }
            });

            children.forEach(function (it, index) {
                it.index = index * 100;
            });
        }

        /**
         * add ColorStep List 
         * @param {Array<ColorStep>} colorstepList 
         */

    }, {
        key: "addColorStepList",
        value: function addColorStepList() {
            var _this2 = this;

            var colorstepList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            colorstepList.forEach(function (c) {
                _this2.addColorStep(c, false);
            });

            this.sortColorStep();
        }

        /**
         * get color step by id 
         * 
         * @param {string} id 
         */

    }, {
        key: "getColorStep",
        value: function getColorStep(id) {
            return this.json.colorsteps.filter(function (c) {
                return c.id == id;
            })[0];
        }
    }, {
        key: "clear",
        value: function clear() {
            if (arguments.length) {
                this.json.colorsteps.splice(+(arguments.length <= 0 ? undefined : arguments[0]), 1);
            } else {
                this.json.colorsteps = [];
            }
        }

        /**
         * get colorstep list 
         * 
         * @return {Array<ColorStep>}
         */

    }, {
        key: "getColorString",


        /**
         * get color string 
         * 
         * @return {string}
         */
        value: function getColorString() {

            var colorsteps = this.colorsteps;
            if (!colorsteps.length) return EMPTY_STRING;

            var newColors = [];
            colorsteps.forEach(function (c, index) {
                if (c.cut && index > 0) {
                    var prevItem = colorsteps[index - 1];
                    newColors.push(new ColorStep({
                        color: c.color,
                        unit: prevItem.unit,
                        percent: prevItem.percent,
                        px: prevItem.px,
                        em: prevItem.em
                    }));
                }

                newColors.push(c);
            });

            return newColors.map(function (f) {
                return "" + f;
            }).join(',');
        }
    }, {
        key: "colorsteps",
        get: function get$$1() {
            return this.json.colorsteps;
        }
    }]);
    return Gradient;
}(ImageResource);

var DEFINED_DIRECTIONS = {
    '0': 'to top',
    '45': 'to top right',
    '90': 'to right',
    '135': 'to bottom right',
    '180': 'to bottom',
    '225': 'to bottom left',
    '270': 'to left',
    '315': 'to top left'
};

var LinearGradient = function (_Gradient) {
    inherits(LinearGradient, _Gradient);

    function LinearGradient() {
        classCallCheck(this, LinearGradient);
        return possibleConstructorReturn(this, (LinearGradient.__proto__ || Object.getPrototypeOf(LinearGradient)).apply(this, arguments));
    }

    createClass(LinearGradient, [{
        key: "getDefaultObject",
        value: function getDefaultObject(obj) {
            return get$1(LinearGradient.prototype.__proto__ || Object.getPrototypeOf(LinearGradient.prototype), "getDefaultObject", this).call(this, _extends({
                type: 'linear-gradient',
                angle: 0
            }, obj));
        }
    }, {
        key: "isLinear",
        value: function isLinear() {
            return true;
        }
    }, {
        key: "hasAngle",
        value: function hasAngle() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {

            var colorString = this.getColorString();

            var opt = EMPTY_STRING;
            var angle = this.json.angle;

            opt = angle;

            if (isNumber(opt)) {
                opt = DEFINED_DIRECTIONS["" + opt] || opt;
            }

            if (isNumber(opt)) {
                opt = opt > 360 ? opt % 360 : opt;

                opt = opt + "deg";
            }

            var result = this.json.type + "(" + opt + ", " + colorString + ")";

            return result;
        }
    }], [{
        key: "toLinearGradient",
        value: function toLinearGradient(image) {
            if (image.isGradient()) {
                var gradient = new LinearGradient({
                    angle: 'to right',
                    colorsteps: image.colorsteps
                });

                return gradient + "";
            }

            return '';
        }
    }]);
    return LinearGradient;
}(Gradient);

var GradientSteps = function (_UIElement) {
    inherits(GradientSteps, _UIElement);

    function GradientSteps() {
        classCallCheck(this, GradientSteps);
        return possibleConstructorReturn(this, (GradientSteps.__proto__ || Object.getPrototypeOf(GradientSteps)).apply(this, arguments));
    }

    createClass(GradientSteps, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'gradient-steps\'>\n                <div class="hue-container" ref="$back"></div>            \n                <div class="hue" ref="$steps">\n                    <div class=\'step-list\' ref="$stepList"></div>\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'getStepPosition',
        value: function getStepPosition(step) {
            var _getMinMax = this.getMinMax(),
                min = _getMinMax.min,
                max = _getMinMax.max;

            var left = this.refs.$steps.offset().left;

            min -= left;
            max -= left;

            if (step.isPx) {
                return step.px;
            }

            return min + (max - min) * (step.percent / 100);
        }
    }, {
        key: 'getUnitName',
        value: function getUnitName(step) {
            var unit$$1 = step.unit || UNIT_PERCENT;

            if ([UNIT_PX, UNIT_EM].includes(unit$$1)) {
                return unit$$1;
            }

            return UNIT_PERCENT;
        }
    }, {
        key: 'getUnitSelect',
        value: function getUnitSelect(step) {

            return '\n        <select class=\'unit\' data-colorstep-id="' + step.id + '">\n            <option value=\'percent\' ' + (step.isPercent ? 'selected' : EMPTY_STRING) + '>%</option>\n            <option value=\'px\' ' + (step.isPx ? 'selected' : EMPTY_STRING) + '>px</option>\n            <option value=\'em\' ' + (step.isEm ? 'selected' : EMPTY_STRING) + '>em</option>\n        </select>\n        ';
        }
    }, {
        key: 'getMaxValue',
        value: function getMaxValue() {
            return editor$1.config.get('step.width') || 400;
        }

        // load 후에 이벤트를 재설정 해야한다. 

    }, {
        key: LOAD('$stepList'),
        value: function value$$1() {
            var _this2 = this;

            var item = editor$1.selection.image;
            if (!item) return EMPTY_STRING;

            if (!image.isGradient()) return EMPTY_STRING;

            return image.colorsteps.map(function (step) {

                var cut = step.cut ? 'cut' : EMPTY_STRING;
                var unitValue$$1 = step.getUnitValue(_this2.getMaxValue());
                return '\n                <div \n                    class=\'drag-bar ' + (step.selected ? 'selected' : EMPTY_STRING) + '\' \n                    id="' + step.id + '"\n                    style="left: ' + _this2.getStepPosition(step) + 'px;"\n                >   \n                    <div class="guide-step step" style=" border-color: ' + step.color + ';background-color: ' + step.color + ';"></div>\n                    <div class=\'guide-line\' \n                        style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), ' + step.color + ' 10%) ;"></div>\n                    <div class="guide-change ' + cut + '" data-colorstep-id="' + step.id + '"></div>\n                    <div class="guide-unit ' + step.getUnit() + '">\n                        <input type="number" class="percent" min="-100" max="100" step="0.1"  value="' + unitValue$$1.percent + '" data-colorstep-id="' + step.id + '"  />\n                        <input type="number" class="px" min="-100" max="1000" step="1"  value="' + unitValue$$1.px + '" data-colorstep-id="' + step.id + '"  />\n                        <input type="number" class="em" min="-100" max="500" step="0.1"  value="' + unitValue$$1.em + '" data-colorstep-id="' + step.id + '"  />\n                        ' + _this2.getUnitSelect(step) + '\n                    </div>       \n                </div>\n            ';
            });
        }
    }, {
        key: 'isShow',
        value: function isShow() {

            var item = editor$1.selection.image;
            if (!item) return false;

            return item.isGradient();
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            this.$el.toggle(this.isShow());

            var item = editor$1.selection.image;
            if (item && item.isGradient()) {
                this.load();
                this.setColorUI();
            }
        }
    }, {
        key: 'setColorUI',
        value: function setColorUI() {
            this.setBackgroundColor();
        }
    }, {
        key: 'setBackgroundColor',
        value: function setBackgroundColor() {

            var item = editor$1.selection.image;
            if (item && item.isGradient()) {
                this.refs.$stepList.css('background-image', LinearGradient.toLinearGradient(item));
            }
        }

        /* slide 영역 min,max 구하기  */

    }, {
        key: 'getMinMax',
        value: function getMinMax() {
            var min = this.refs.$steps.offsetLeft();
            var width = this.refs.$steps.width();
            var max = min + width;

            return { min: min, max: max, width: width };
        }

        /* 현재 위치 구하기  */

    }, {
        key: 'getCurrent',
        value: function getCurrent() {
            var _getMinMax2 = this.getMinMax(),
                min = _getMinMax2.min,
                max = _getMinMax2.max;

            var _editor$config$get = editor$1.config.get('pos'),
                x = _editor$config$get.x;

            var current = Math.min(Math.max(min, x), max);

            return current;
        }

        /**
         * 마우스 이벤트로 현재 위치 및 percent 설정, 전체  gradient 리프레쉬 
         * 
         * @param {*} e 
         */

    }, {
        key: 'refreshColorUI',
        value: function refreshColorUI(isUpdate) {
            var _getMinMax3 = this.getMinMax(),
                min = _getMinMax3.min,
                max = _getMinMax3.max;

            var current = this.getCurrent();

            if (this.currentStep) {
                var posX = Math.max(min, current);
                var px$$1 = posX - this.refs.$steps.offsetLeft();

                if (editor$1.config.get('bodyEvent').ctrlKey) {
                    px$$1 = Math.floor(px$$1); // control + drag is floor number 
                }
                this.currentStepBox.px('left', px$$1);

                var item = editor$1.get(this.currentStepBox.attr('id'));

                if (item) {

                    // item.px = px; 
                    var maxValue = max - min;
                    var percent$$1 = Length$1.px(px$$1).toPercent(maxValue);
                    var em$$1 = Length$1.px(px$$1).toEm(maxValue);

                    item.reset({ px: px$$1, percent: percent$$1, em: em$$1 });

                    this.currentUnitPercent.val(percent$$1);
                    this.currentUnitPx.val(px$$1);
                    this.currentUnitEm.val(em$$1);

                    editor$1.send(CHANGE_COLORSTEP, item);
                    this.setBackgroundColor();
                }
            }
        }
    }, {
        key: EVENT(CHANGE_COLORSTEP, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }

        // 이미 선언된 메소드를 사용하여 메타 데이타로 쓴다. 

    }, {
        key: CLICK('$back'),
        value: function value$$1(e) {
            this.addStep(e);
        }
    }, {
        key: 'removeStep',
        value: function removeStep(e) {

            var id = e.$delegateTarget.attr('id');

            editor$1.remove(id);
            editor$1.send(CHANGE_LAYER, id);
        }
    }, {
        key: 'addStep',
        value: function addStep(e) {
            var _getMinMax4 = this.getMinMax(),
                min = _getMinMax4.min,
                max = _getMinMax4.max;

            var current = this.getCurrent(e);
            var percent$$1 = Math.floor((current - min) / (max - min) * 100);
            var item = editor$1.selection.image;
            if (!item) return;

            image.insertColorStep(percent$$1);
            editor$1.send(CHANGE_LAYER, image);
        }
    }, {
        key: 'getSortedStepList',
        value: function getSortedStepList() {
            var list = this.refs.$stepList.$$('.drag-bar').map(function (it) {
                return { id: it.attr('id'), x: it.cssFloat('left') };
            });

            list.sort(function (a, b) {
                if (a.x == b.x) return 0;
                return a.x > b.x ? 1 : -1;
            });

            return list.map(function (it) {
                return it.id;
            });
        }
    }, {
        key: 'selectStep',
        value: function selectStep(e) {
            var parent = e.$delegateTarget.parent();
            var item = editor$1.get(parent.attr('id'));

            item.select();
            editor$1.send(CHANGE_COLORSTEP, item);

            this.currentStepBox = this.currentStepBox || parent;
            var $selected = this.refs.$stepList.$('.selected');
            if ($selected && !$selected.is(this.currentStepBox)) {
                $selected.removeClass('selected');
            }

            this.currentStepBox.addClass('selected');

            this.setBackgroundColor();
        }
    }, {
        key: CLICK('$steps .step') + SHIFT,
        value: function value$$1(e) {
            this.removeStep(e);
        }
    }, {
        key: CLICK('$steps .step'),
        value: function value$$1(e) {
            this.selectStep(e);
        }
    }, {
        key: CLICK('$steps .guide-change'),
        value: function value$$1(e) {
            var id = e.$delegateTarget.attr('data-colorstep-id');

            var item = editor$1.get(id);

            if (item) {
                item.reset({ cut: !item.cut });
                editor$1.send(CHANGE_COLORSTEP, item);
            }
        }
    }, {
        key: CHANGE('$steps .guide-unit select.unit'),
        value: function value$$1(e) {

            var unit$$1 = e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('data-colorstep-id');

            var step = editor$1.get(id);

            if (step) {
                step.changeUnit(unit$$1, this.getMaxValue());
                editor$1.send(CHANGE_COLORSTEP, step);

                var $parent = e.$delegateTarget.parent();
                $parent.removeClass(UNIT_PERCENT, UNIT_PX, UNIT_EM).addClass(step.getUnit());
            }
        }
    }, {
        key: INPUT('$steps input.percent'),
        value: function value$$1(e) {
            var item = editor$1.selection.colorstep;
            if (!item) return;

            var percent$$1 = +e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('data-colorstep-id');

            var step = editor$1.get(id);

            if (step) {

                step.percent = percent$$1;
                step.changeUnit('percent', this.getMaxValue());

                this.currentStepBox.px('left', step.px);
                this.currentUnitPx.val(step.px);
                this.currentUnitEm.val(step.em);

                editor$1.send(CHANGE_COLORSTEP, step);
                this.setBackgroundColor();
            }
        }
    }, {
        key: INPUT('$steps input.px'),
        value: function value$$1(e) {
            var item = editor$1.selection.colorstep;
            if (!item) return;

            var px$$1 = +e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('data-colorstep-id');

            var step = editor$1.get(id);

            if (step) {

                step.px = px$$1;
                step.changeUnit('px', this.getMaxValue());

                this.currentStepBox.px('left', step.px);
                this.currentUnitPercent.val(step.percent);
                this.currentUnitEm.val(step.em);

                editor$1.send(CHANGE_COLORSTEP, step);
                this.setBackgroundColor();
            }
        }
    }, {
        key: INPUT('$steps input.em'),
        value: function value$$1(e) {
            var item = editor$1.selection.colorstep;
            if (!item) return;

            var em$$1 = +e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('data-colorstep-id');

            var step = editor$1.get(id);

            if (step) {

                step.em = em$$1;
                step.changeUnit('em', this.getMaxValue());

                this.currentStepBox.px('left', step.px);
                this.currentUnitPercent.val(step.percent);
                this.currentUnitPx.val(step.px);

                editor$1.send(CHANGE_COLORSTEP, step);
                this.setBackgroundColor();
            }
        }

        // Event Bindings 

    }, {
        key: 'end',
        value: function end() {
            if (this.refs.$stepList) {
                this.refs.$stepList.removeClass('mode-drag');
            }
        }
    }, {
        key: 'move',
        value: function move() {
            this.refreshColorUI(true);
            this.refs.$stepList.addClass('mode-drag');
        }
    }, {
        key: 'isStepElement',
        value: function isStepElement(e) {
            return new Dom(e.target).hasClass('step');
        }
    }, {
        key: POINTERSTART('$steps .step') + IF('isStepElement') + MOVE() + END(),
        value: function value$$1(e) {
            e.preventDefault();

            this.xy = e.xy;
            this.currentStep = e.$delegateTarget;
            this.currentStepBox = this.currentStep.parent();
            this.currentUnit = this.currentStepBox.$(".guide-unit");
            this.currentUnitPercent = this.currentUnit.$(".percent");
            this.currentUnitPx = this.currentUnit.$(".px");
            this.currentUnitEm = this.currentUnit.$(".em");

            if (this.currentStep) {
                this.selectStep(e);
            }
        }
    }]);
    return GradientSteps;
}(UIElement);

var ColorSteps = function (_BasePropertyItem) {
    inherits(ColorSteps, _BasePropertyItem);

    function ColorSteps() {
        classCallCheck(this, ColorSteps);
        return possibleConstructorReturn(this, (ColorSteps.__proto__ || Object.getPrototypeOf(ColorSteps)).apply(this, arguments));
    }

    createClass(ColorSteps, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item gradient-steps show'>\n                <div class='title'>Color Steps</div>\n                <div class='items'>            \n                    <GradientSteps></GradientSteps>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return { GradientSteps: GradientSteps };
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var item = editor$1.selection.backgroundImage;

            if (!item) return false;

            return item.image.isGradient();
        }
    }]);
    return ColorSteps;
}(BasePropertyItem);

var _templateObject$1 = taggedTemplateLiteral(["<div class='step-list' ref=\"$stepList\">\n                    ", "\n                </div>"], ["<div class='step-list' ref=\"$stepList\">\n                    ", "\n                </div>"]);

var GradientInfo = function (_UIElement) {
    inherits(GradientInfo, _UIElement);

    function GradientInfo() {
        classCallCheck(this, GradientInfo);
        return possibleConstructorReturn(this, (GradientInfo.__proto__ || Object.getPrototypeOf(GradientInfo)).apply(this, arguments));
    }

    createClass(GradientInfo, [{
        key: "template",
        value: function template() {
            return "\n            <div class='gradient-info'>\n                <div class=\"form-item\" ref=\"$colorsteps\"></div>\n            </div>\n        ";
        }
    }, {
        key: "getUnitSelect",
        value: function getUnitSelect(step) {

            return "\n        <select class='unit' colorstep-id=\"" + step.id + "\">\n            <option value='percent' " + (step.isPercent ? 'selected' : EMPTY_STRING) + ">%</option>\n            <option value='px' " + (step.isPx ? 'selected' : EMPTY_STRING) + ">px</option>\n            <option value='em' " + (step.isEm ? 'selected' : EMPTY_STRING) + ">em</option>\n        </select>\n        ";
        }
    }, {
        key: LOAD('$colorsteps'),
        value: function value$$1() {
            var _this2 = this;

            var item = editor$1.selection.image;
            if (!item) return EMPTY_STRING;

            var colorsteps = image.colorsteps;

            return html(_templateObject$1, colorsteps.map(function (step) {
                var cut = step.cut ? 'cut' : EMPTY_STRING;
                var unitValue$$1 = step.getUnitValue(_this2.getMaxValue());
                return "\n                            <div class='color-step " + (step.selected ? 'selected' : EMPTY_STRING) + "' colorstep-id=\"" + step.id + "\" >\n                                <div class=\"color-cut\">\n                                    <div class=\"guide-change " + cut + "\" colorstep-id=\"" + step.id + "\"></div>\n                                </div>                                \n                                <div class=\"color-view\">\n                                    <div class=\"color-view-item\" style=\"background-color: " + step.color + "\" colorstep-id=\"" + step.id + "\" ></div>\n                                </div>                            \n                                <div class=\"color-code\">\n                                    <input type=\"text\" class=\"code\" value='" + step.color + "' colorstep-id=\"" + step.id + "\"  />\n                                </div>\n                                <div class=\"color-unit " + step.getUnit() + "\">\n                                    <input type=\"number\" class=\"percent\" min=\"0\" max=\"100\" step=\"0.1\"  value=\"" + unitValue$$1.percent + "\" colorstep-id=\"" + step.id + "\"  />\n                                    <input type=\"number\" class=\"px\" min=\"0\" max=\"1000\" step=\"1\"  value=\"" + unitValue$$1.px + "\" colorstep-id=\"" + step.id + "\"  />\n                                    <input type=\"number\" class=\"em\" min=\"0\" max=\"500\" step=\"0.1\"  value=\"" + unitValue$$1.em + "\" colorstep-id=\"" + step.id + "\"  />\n                                    " + _this2.getUnitSelect(step) + "\n                                </div>                       \n                                <div class=\"tools\">\n                                    <button type=\"button\" class='remove-step' colorstep-id=\"" + step.id + "\" >&times;</button>\n                                </div>\n                            </div>\n                        ";
            }));
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: EVENT(CHANGE_COLORSTEP, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "selectStep",
        value: function selectStep(e) {
            editor$1.selection.select(e.$delegateTarget.attr('colorstep-id'));
        }
    }, {
        key: CLICK('$colorsteps .color-view-item'),
        value: function value$$1(e) {
            this.selectStep(e);
        }
    }, {
        key: INPUT('$colorsteps input.code'),
        value: function value$$1(e) {

            var color$$1 = e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('colorstep-id');

            var step = editor$1.get(id);

            if (step) {
                step.color = color$$1;
                editor$1.send(CHANGE_COLORSTEP, step);

                this.refs.$stepList.$(".color-view-item[colorstep-id=\"" + step.id + "\"]").css({
                    'background-color': color$$1
                });
            }
        }
    }, {
        key: "getMaxValue",
        value: function getMaxValue(layer) {
            return editor$1.config.get('step.width') || 400;
        }
    }, {
        key: CHANGE('$colorsteps select.unit'),
        value: function value$$1(e) {

            var unit$$1 = e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('colorstep-id');

            var step = editor$1.get(id);

            if (step) {
                step.changeUnit(unit$$1, this.getMaxValue());
                editor$1.send(CHANGE_COLORSTEP, step);

                var $parent = e.$delegateTarget.parent();
                $parent.removeClass(UNIT_PERCENT, UNIT_PX, UNIT_EM).addClass(unit$$1);
            }
        }
    }, {
        key: INPUT('$colorsteps input.percent'),
        value: function value$$1(e) {

            var percent$$1 = e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('colorstep-id');

            var step = editor$1.get(id);

            if (step) {
                step.percent = +percent$$1;
                step.changeUnit(step.unit, this.getMaxValue());

                editor$1.send(CHANGE_COLORSTEP, step);
            }
        }
    }, {
        key: INPUT('$colorsteps input.px'),
        value: function value$$1(e) {
            var px$$1 = e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('colorstep-id');

            var step = this.get(id);

            if (step) {
                step.px = +px$$1;
                step.changeUnit(step.unit, this.getMaxValue());

                editor$1.send(CHANGE_COLORSTEP, step);
            }
        }
    }, {
        key: INPUT('$colorsteps input.em'),
        value: function value$$1(e) {

            var em$$1 = e.$delegateTarget.val();
            var id = e.$delegateTarget.attr('colorstep-id');

            var step = editor$1.get(id);

            if (step) {
                step.em = +em$$1;
                step.changeUnit(step.unit, this.getMaxValue());
                editor$1.send(CHANGE_COLORSTEP, step);
            }
        }
    }, {
        key: CLICK('$colorsteps .remove-step'),
        value: function value$$1(e) {
            var item = editor$1.selection.currentImage;
            if (!item) return;

            var id = e.$delegateTarget.attr('colorstep-id');
            var step = editor$1.get(id);
            if (step) {
                step.remove();
            }
            editor$1.send(CHANGE_LAYER, id);
        }
    }, {
        key: CLICK('$colorsteps .guide-change'),
        value: function value$$1(e) {
            var id = e.$delegateTarget.attr('colorstep-id');
            var item = editor$1.get(id);

            if (item) {
                item.cut = !item.cut;
                editor$1.send(CHANGE_COLORSTEP, item);
            }
        }
    }]);
    return GradientInfo;
}(UIElement);

var ColorStepsInfo = function (_UIElement) {
    inherits(ColorStepsInfo, _UIElement);

    function ColorStepsInfo() {
        classCallCheck(this, ColorStepsInfo);
        return possibleConstructorReturn(this, (ColorStepsInfo.__proto__ || Object.getPrototypeOf(ColorStepsInfo)).apply(this, arguments));
    }

    createClass(ColorStepsInfo, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item gradient-steps-info show'>\n                <div class='items'>            \n                    <GradientInfo></GradientInfo>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return { GradientInfo: GradientInfo };
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var item = editor$1.selection.backgroundImage;
            if (!item) return false;

            return item.image.isGradient();
        }
    }]);
    return ColorStepsInfo;
}(UIElement);

var ColorPickerPanel = function (_UIElement) {
    inherits(ColorPickerPanel, _UIElement);

    function ColorPickerPanel() {
        classCallCheck(this, ColorPickerPanel);
        return possibleConstructorReturn(this, (ColorPickerPanel.__proto__ || Object.getPrototypeOf(ColorPickerPanel)).apply(this, arguments));
    }

    createClass(ColorPickerPanel, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item colorpicker show'>\n                <div class='items'>            \n                    <ColorPicker></ColorPicker>\n                </div>\n                <div class='items bar'></div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return {
                // ColorPicker 
            };
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var item = editor$1.selection.backgroundImage;

            if (!item) return false;

            return item.image.isImage();
        }
    }]);
    return ColorPickerPanel;
}(UIElement);

var Transform = function (_BasePropertyItem) {
    inherits(Transform, _BasePropertyItem);

    function Transform() {
        classCallCheck(this, Transform);
        return possibleConstructorReturn(this, (Transform.__proto__ || Object.getPrototypeOf(Transform)).apply(this, arguments));
    }

    createClass(Transform, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item transform show'>\n                <div class='items block'>            \n                    <div>\n                        <label>Rotate</label>\n                        <div>\n                            <input type='range' ref=\"$rotateRange\" min=\"0\" max=\"360\">\n                            <input type='number' ref=\"$rotate\"> <span>" + UNIT_DEG + "</span>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Scale</label>\n                        <div>\n                            <input type='range' ref=\"$scaleRange\" min=\"0.5\" max=\"10.0\" step=\"0.1\">                        \n                            <input type='number' ref=\"$scale\" min=\"0.5\" max=\"10.0\" step=\"0.1\">\n                        </div>\n                    </div>                      \n                    <div>\n                        <label>SkewX</label>\n                        <div>\n                            <input type='range' ref=\"$skewXRange\" min=\"-360\" max=\"360\" step=\"0.1\">    \n                            <input type='number' ref=\"$skewX\" min=\"-360\" max=\"360\" step=\"0.1\"> <span>" + UNIT_DEG + "</span>\n                        </div>\n                    </div>\n                    <div>                        \n                        <label>SkewY</label>\n                        <div>\n                            <input type='range' ref=\"$skewYRange\" min=\"-360\" max=\"360\" step=\"0.1\">\n                            <input type='number' ref=\"$skewY\" min=\"-360\" max=\"360\" step=\"0.1\"> <span>" + UNIT_DEG + "</span>\n                        </div>\n                    </div>     \n   \n                    <div>\n                        <label>translateX</label>\n                        <div>\n                            <input type='range' ref=\"$translateXRange\" min=\"-2000\" max=\"2000\" step=\"1\">                        \n                            <input type='number' ref=\"$translateX\" min=\"-2000\" max=\"2000\" step=\"1\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>\n                    <div>                        \n                        <label>translateY</label>\n                        <div>\n                            <input type='range' ref=\"$translateYRange\" min=\"-2000\" max=\"2000\" step=\"1\">\n                            <input type='number' ref=\"$translateY\" min=\"-2000\" max=\"2000\" step=\"1\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>                                                   \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var _this2 = this;

            var layer = editor$1.selection.layer;
            if (layer) {

                var attr = ['rotate', 'skewX', 'skewY', 'scale', 'translateX', 'translateY'];

                attr.forEach(function (key) {
                    var value$$1 = layer[key];
                    if (value$$1) {
                        _this2.refs["$" + key + "Range"].val(value$$1);
                        _this2.refs["$" + key].val(value$$1);
                    }
                });
            }
        }
    }, {
        key: "updateTransform",
        value: function updateTransform(key) {
            var postfix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_STRING;

            var layer = editor$1.selection.layer;
            if (layer) {
                var value$$1 = this.refs['$' + key + postfix].val();
                if (postfix == EMPTY_STRING) {
                    this.refs['$' + key + 'Range'].val(value$$1);
                } else {
                    this.refs['$' + key].val(value$$1);
                }
                layer[key] = value$$1;
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: CHANGEINPUT('$rotateRange'),
        value: function value$$1() {
            this.updateTransform('rotate', 'Range');
        }
    }, {
        key: CHANGEINPUT('$skewXRange'),
        value: function value$$1() {
            this.updateTransform('skewX', 'Range');
        }
    }, {
        key: CHANGEINPUT('$skewYRange'),
        value: function value$$1() {
            this.updateTransform('skewY', 'Range');
        }
    }, {
        key: CHANGEINPUT('$scaleRange'),
        value: function value$$1() {
            this.updateTransform('scale', 'Range');
        }
    }, {
        key: CHANGEINPUT('$translateXRange'),
        value: function value$$1() {
            this.updateTransform('translateX', 'Range');
        }
    }, {
        key: CHANGEINPUT('$translateYRange'),
        value: function value$$1() {
            this.updateTransform('translateY', 'Range');
        }
    }, {
        key: INPUT('$rotate'),
        value: function value$$1() {
            this.updateTransform('rotate');
        }
    }, {
        key: INPUT('$skewX'),
        value: function value$$1() {
            this.updateTransform('skewX');
        }
    }, {
        key: INPUT('$skewY'),
        value: function value$$1() {
            this.updateTransform('skewY');
        }
    }, {
        key: INPUT('$scale'),
        value: function value$$1() {
            this.updateTransform('scale');
        }
    }, {
        key: INPUT('$translateX'),
        value: function value$$1() {
            this.updateTransform('translateX');
        }
    }, {
        key: INPUT('$translateY'),
        value: function value$$1() {
            this.updateTransform('translateY');
        }
    }]);
    return Transform;
}(BasePropertyItem);

var Transform3d = function (_BasePropertyItem) {
    inherits(Transform3d, _BasePropertyItem);

    function Transform3d() {
        classCallCheck(this, Transform3d);
        return possibleConstructorReturn(this, (Transform3d.__proto__ || Object.getPrototypeOf(Transform3d)).apply(this, arguments));
    }

    createClass(Transform3d, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item transform show'>\n                <div class='items block'>            \n                    <div>\n                        <label> 3D </label>\n                        <div><label><input type='checkbox' ref=\"$preserve\"> preserve-3d </label></div>\n                    </div>                    \n                    <div>\n                        <label>Perspective</label>\n                        <div>\n                            <input type='range' data-type=\"perspective\" ref=\"$perspectiveRange\" min=\"0\" max=\"3000\">\n                            <input type='number' data-type=\"perspective\" ref=\"$perspective\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>                \n                    <div>\n                        <label>Rotate X</label>\n                        <div>\n                            <input type='range' data-type=\"rotateX\" ref=\"$rotateXRange\" min=\"-360\" max=\"360\">\n                            <input type='number' data-type=\"rotateX\" ref=\"$rotateX\"> <span>" + UNIT_DEG + "</span>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Rotate Y</label>\n                        <div>\n                            <input type='range' data-type=\"rotateY\" ref=\"$rotateYRange\" min=\"-360\" max=\"360\">\n                            <input type='number' data-type=\"rotateY\" ref=\"$rotateY\"> <span>" + UNIT_DEG + "</span>\n                        </div>\n                    </div>                    \n                    <div>\n                        <label>Rotate Z</label>\n                        <div>\n                            <input type='range' data-type=\"rotateZ\" ref=\"$rotateZRange\" min=\"-360\" max=\"360\">\n                            <input type='number' data-type=\"rotateZ\" ref=\"$rotateZ\"> <span>" + UNIT_DEG + "</span>\n                        </div>\n                    </div>                                         \n                    <div>\n                        <label>Scale X</label>\n                        <div>\n                            <input type='range' data-type=\"scaleX\" ref=\"$scaleXRange\" min=\"0.5\" max=\"10\" step=\"0.1\">\n                            <input type='number' data-type=\"scaleX\" ref=\"$scaleX\"> \n                        </div>\n                    </div>                                        \n                    <div>\n                        <label>Scale Y</label>\n                        <div>\n                            <input type='range' data-type=\"scaleY\" ref=\"$scaleYRange\" min=\"0.5\" max=\"10\" step=\"0.1\">\n                            <input type='number' data-type=\"scaleY\" ref=\"$scaleY\"> \n                        </div>\n                    </div>                                        \n                    <div>\n                        <label>Scale Z</label>\n                        <div>\n                            <input type='range' data-type=\"scaleZ\" ref=\"$scaleZRange\" min=\"0.5\" max=\"10\" step=\"0.1\">\n                            <input type='number' data-type=\"scaleZ\" ref=\"$scaleZ\"> \n                        </div>\n                    </div>    \n                    <div>\n                        <label>Translate X</label>\n                        <div>\n                            <input type='range'  data-type=\"translateX\" ref=\"$translateXRange\" min=\"-2000\" max=\"2000\">\n                            <input type='number'  data-type=\"translateX\" ref=\"$translateX\" min=\"-2000\" max=\"2000\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Translate Y</label>\n                        <div>\n                            <input type='range'  data-type=\"translateY\" ref=\"$translateYRange\" min=\"-2000\" max=\"2000\">\n                            <input type='number' data-type=\"translateY\" ref=\"$translateY\" min=\"-2000\" max=\"2000\"> <span>" + UNIT_PX + "</span> \n                        </div>\n                    </div>\n                    <div>\n                        <label>Translate Z</label>\n                        <div>\n                            <input type='range' data-type=\"translateZ\" ref=\"$translateZRange\" min=\"-2000\" max=\"2000\">\n                            <input type='number' data-type=\"translateZ\" ref=\"$translateZ\" min=\"-2000\" max=\"2000\">  <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>                                        \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: CLICK('$preserve'),
        value: function value$$1(e) {

            var layer = editor$1.selection.layer;
            if (layer) {
                layer.preserve = this.refs.$preserve;
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var _this2 = this;

            var layer = editor$1.selection.layer;
            if (layer) {

                var attr = ['perspective', 'rotateX', 'rotateY', 'rotateZ', 'scaleX', 'scaleY', 'scaleZ', 'translateX', 'translateY', 'translateZ'];

                attr.forEach(function (key) {
                    if (layer[key]) {
                        _this2.refs["$" + key + "Range"].val(layer[key]);
                        _this2.refs["$" + key].val(layer[key]);
                    }
                });

                this.refs.$preserve.checked(!!layer.preserve);
            }
        }
    }, {
        key: "updateTransform",
        value: function updateTransform(key) {
            var postfix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_STRING;

            var layer = editor$1.selection.layer;
            if (layer) {
                var value$$1 = this.refs['$' + key + postfix].val();
                if (postfix == EMPTY_STRING) {
                    this.refs['$' + key + 'Range'].val(value$$1);
                } else {
                    this.refs['$' + key].val(value$$1);
                }
                layer[key] = value$$1;
                editor$1.send(CHANGE_LAYER);
            }
        }
    }, {
        key: CHANGEINPUT('$el input[type=range]'),
        value: function value$$1(e) {
            var $item = e.$delegateTarget;
            this.updateTransform($item.attr('data-type'), 'Range');
        }
    }, {
        key: INPUT('$el input[type=number]'),
        value: function value$$1(e) {
            var $item = e.$delegateTarget;
            this.updateTransform($item.attr('data-type'));
        }
    }]);
    return Transform3d;
}(BasePropertyItem);

var position_list = [POSITION_LEFT, POSITION_TOP, POSITION_RIGHT, POSITION_BOTTOM, POSITION_CENTER];

var UnitRange = function (_UIElement) {
    inherits(UnitRange, _UIElement);

    function UnitRange() {
        classCallCheck(this, UnitRange);
        return possibleConstructorReturn(this, (UnitRange.__proto__ || Object.getPrototypeOf(UnitRange)).apply(this, arguments));
    }

    createClass(UnitRange, [{
        key: "created",
        value: function created() {
            this.min = this.props.min || 0;
            this.max = this.props.max || 1000;
            this.step = this.props.step || 1;
            this.value = this.props.value || 0;
            this.unit = this.props.unit || UNIT_PX;
            this.showClass = 'show';
            this.maxValueFunction = this.parent[this.props.maxvaluefunction].bind(this.parent);
            this.updateFunction = this.parent[this.props.updatefunction].bind(this.parent);
        }
    }, {
        key: "afterRender",
        value: function afterRender() {
            this.initializeRangeMax(this.unit);
        }
    }, {
        key: "template",
        value: function template() {

            var value$$1 = position_list.includes(this.value) ? "" : this.value;

            return "\n            <div class='unit-range'>\n                <div class='base-value'>\n                    <input ref=\"$range\" type=\"range\" class='range' min=\"" + this.min + "\" max=\"" + this.max + "\" step=\"" + this.step + "\" value=\"" + value$$1 + "\" />\n                    <input ref=\"$number\" type=\"number\" class='number' min=\"" + this.min + "\" max=\"" + this.max + "\" step=\"" + this.step + "\" value=\"" + value$$1 + "\"  />\n                    <button ref=\"$unit\" type=\"button\" class='unit'>" + this.unit + "</button>\n                </div>\n                <div class=\"multi-value\" ref=\"$multiValue\">\n                    <div ref=\"$px\" class=\"" + UNIT_PX + "\" unit='" + UNIT_PX + "'></div>\n                    <div ref=\"$percent\" class=\"" + UNIT_PERCENT + "\" unit='" + UNIT_PERCENT + "'></div>\n                    <div ref=\"$em\" class=\"" + UNIT_EM + "\" unit='" + UNIT_EM + "'></div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: CLICK('$multiValue div'),
        value: function value$$1(e) {
            var unit$$1 = e.$delegateTarget.attr('unit');
            var value$$1 = e.$delegateTarget.attr('value');

            this.selectUnit(unit$$1, value$$1);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var value$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EMPTY_STRING;


            if (isPxUnit(value$$1) || isPercentUnit(value$$1) || isEmUnit(value$$1)) {
                this.selectUnit(value$$1.unit, value$$1.value);
                return;
            }

            //TODO: remove legacy code 
            value$$1 = (value$$1 || EMPTY_STRING) + EMPTY_STRING;
            var unit$$1 = UNIT_PX;
            if (value$$1.includes(UNIT_PERCENT)) {
                unit$$1 = UNIT_PERCENT;
            } else if (value$$1.includes(UNIT_EM)) {
                unit$$1 = UNIT_EM;
            }

            value$$1 = position_list.includes(value$$1) ? "" : parseParamNumber$2(value$$1);

            this.selectUnit(unit$$1, value$$1);
            //TODO: remove legacy code 
        }
    }, {
        key: "initializeRangeMax",
        value: function initializeRangeMax(unit$$1) {

            if (isPercent(unit$$1)) {
                var max = isPercent(this.props.unit) ? this.props.max : 300;
                this.refs.$range.attr('max', max);
                this.refs.$range.attr('step', 0.01);
                this.refs.$number.attr('max', max);
                this.refs.$number.attr('step', 0.01);
            } else if (isPX(unit$$1)) {
                var max = isPX(this.props.unit) ? this.props.max : 1000;

                this.refs.$range.attr('max', max);
                this.refs.$range.attr('step', 1);
                this.refs.$number.attr('max', max);
                this.refs.$number.attr('step', 1);
            } else if (isEM(unit$$1)) {
                var max = isEM(this.props.unit) ? this.props.max : 300;
                this.refs.$range.attr('max', max);
                this.refs.$range.attr('step', 0.01);
                this.refs.$number.attr('max', max);
                this.refs.$number.attr('step', 0.01);
            }
        }
    }, {
        key: "selectUnit",
        value: function selectUnit(unit$$1, value$$1) {
            this.unit = unit$$1;
            this.value = position_list.includes(value$$1) ? "" : value$$1;

            this.refs.$range.val(this.value);
            this.refs.$number.val(this.value);
            this.refs.$unit.text(unitString(this.unit));

            this.initializeRangeMax(this.unit);
        }
    }, {
        key: CLICK('$unit'),
        value: function value$$1(e) {
            this.$el.toggleClass(this.showClass);
            this.updateRange();
        }
    }, {
        key: "updateRange",
        value: function updateRange() {
            var unit$$1 = this.unit;
            var px$$1 = isPX(unit$$1) ? this.refs.$range.val() : undefined;
            var percent$$1 = isPercent(unit$$1) ? this.refs.$range.val() : undefined;
            var em$$1 = isEM(unit$$1) ? this.refs.$range.val() : undefined;
            var maxValue = this.maxValueFunction();

            if (px$$1) {
                this.refs.$px.text(px$$1 + ' px').attr('value', px$$1);
                this.refs.$percent.text(px2percent(px$$1, maxValue) + ' %').attr('value', px2percent(px$$1, maxValue));
                this.refs.$em.text(px2em(px$$1, maxValue) + ' em').attr('value', px2em(px$$1, maxValue));
            } else if (percent$$1) {
                this.refs.$percent.text(percent$$1 + ' %').attr('value', percent$$1);
                this.refs.$px.text(percent2px(percent$$1, maxValue) + ' px').attr('value', percent2px(percent$$1, maxValue));
                this.refs.$em.text(percent2em(percent$$1, maxValue) + ' em').attr('value', percent2em(percent$$1, maxValue));
            } else if (em$$1) {
                this.refs.$em.text(em$$1 + ' em').attr('value', em$$1);
                this.refs.$percent.text(em2percent(em$$1, maxValue) + ' %').attr('value', em2percent(em$$1, maxValue));
                this.refs.$px.text(em2px(em$$1, maxValue) + ' px').attr('value', em2px(em$$1, maxValue));
            }
        }
    }, {
        key: INPUT('$range'),
        value: function value$$1(e) {
            var value$$1 = +this.refs.$range.val();
            this.refs.$number.val(value$$1);
            this.updateRange();
            this.updateFunction(unitObject(value$$1, this.unit));
        }
    }, {
        key: INPUT('$number'),
        value: function value$$1(e) {
            var value$$1 = +this.refs.$number.val();
            this.refs.$range.val(value$$1);
            this.updateRange();
            this.updateFunction(unitObject(value$$1, this.unit));
        }
    }]);
    return UnitRange;
}(UIElement);

var BackgroundSize = function (_UIElement) {
    inherits(BackgroundSize, _UIElement);

    function BackgroundSize() {
        classCallCheck(this, BackgroundSize);
        return possibleConstructorReturn(this, (BackgroundSize.__proto__ || Object.getPrototypeOf(BackgroundSize)).apply(this, arguments));
    }

    createClass(BackgroundSize, [{
        key: "components",
        value: function components() {
            return {
                UnitRange: UnitRange
            };
        }
    }, {
        key: "template",
        value: function template() {
            return "\n            <div class='property-item background show'>\n                <div class='items'>\n                    <div>\n                        <label>size</label>\n                        <div class='size-list' ref=\"$size\">\n                            <button type=\"button\" value=\"contain\" title=\"contain\" ></button>\n                            <button type=\"button\" value=\"cover\" title=\"cover\"></button>\n                            <button type=\"button\" value=\"auto\" title=\"auto\"></button>\n                        </div>\n                    </div>\n                    <div>\n                        <label>x</label>\n                        <UnitRange \n                            ref=\"$x\" \n                            min=\"-100\" max=\"1000\" step=\"1\" value=\"0\" unit=\"" + UNIT_PX + "\"\n                            maxValueFunction=\"getMaxX\"\n                            updateFunction=\"updateX\"\n                        />\n                    </div>\n                    <div>\n                        <label>y</label>\n                        <UnitRange \n                            ref=\"$y\" \n                            min=\"-100\" max=\"1000\" step=\"1\" value=\"0\" unit=\"" + UNIT_PX + "\"\n                            maxValueFunction=\"getMaxY\"\n                            updateFunction=\"updateY\"\n                        />\n                    </div>\n                    <div>\n                        <label>width</label>\n                        <UnitRange \n                            ref=\"$width\" \n                            min=\"0\" max=\"1000\" step=\"1\" value=\"0\" unit=\"" + UNIT_PX + "\"\n                            maxValueFunction=\"getMaxWidth\"\n                            updateFunction=\"updateWidth\"\n                        />\n                    </div>\n                    <div>\n                        <label>height</label>\n                        <UnitRange \n                            ref=\"$height\" \n                            min=\"0\" max=\"1000\" step=\"1\" value=\"0\" unit=\"" + UNIT_PX + "\"\n                            maxValueFunction=\"getMaxHeight\"\n                            updateFunction=\"updateHeight\"\n                        />\n                    </div>                    \n                    <div>\n                        <label>repeat</label>\n                        <div class='flex repeat-list' ref=\"$repeat\">\n                            <button type=\"button\" value='no-repeat' title=\"no-repeat\">\n                                <span></span>\n                            </button>                        \n                            <button type=\"button\" value='repeat' title=\"repeat\">\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                            </button>\n                            <button type=\"button\" value='repeat-x' title=\"repeat-x\">\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                            </button>\n                            <button type=\"button\" value='repeat-y' title=\"repeat-y\">\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                            </button>\n                            <button type=\"button\" value='space' title=\"space\">\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>                                \n                            </button>\n                            <button type=\"button\" value='round' title=\"round\">\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>\n                                <span></span>                                                                \n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "updateWidth",
        value: function updateWidth(width) {
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { width: width });
        }
    }, {
        key: "updateHeight",
        value: function updateHeight(height) {
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { height: height });
        }
    }, {
        key: "updateX",
        value: function updateX(x) {
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { x: x });
        }
    }, {
        key: "updateY",
        value: function updateY(y) {
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { y: y });
        }
    }, {
        key: "getMaxHeight",
        value: function getMaxHeight() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return 0;

            return +layer.height;
        }
    }, {
        key: "getMaxY",
        value: function getMaxY() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return 0;

            return +layer.height * 2;
        }
    }, {
        key: "getMaxWidth",
        value: function getMaxWidth() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return 0;

            return +layer.width;
        }
    }, {
        key: "getMaxX",
        value: function getMaxX() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return 0;

            return +layer.width * 2;
        }
    }, {
        key: CLICK('$size button'),
        value: function value$$1(e) {
            var size = e.$delegateTarget.val();
            this.selectBackgroundSize(size);
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { size: size });
        }
    }, {
        key: "selectBackgroundSize",
        value: function selectBackgroundSize() {
            var value$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'auto';

            var selectedItem = this.refs.$size.$('.selected');
            if (selectedItem) selectedItem.removeClass('selected');

            if (!['contain', 'cover', 'auto'].includes(value$$1)) {
                value$$1 = 'auto';
            }

            var item = this.refs.$size.$("[value=" + value$$1 + "]");

            if (item) {
                item.addClass('selected');
            }
        }
    }, {
        key: "selectBackgroundRepeat",
        value: function selectBackgroundRepeat(value$$1) {
            var selectedItem = this.refs.$repeat.$('.selected');
            if (selectedItem) selectedItem.removeClass('selected');

            var item = this.refs.$repeat.$("[value=" + value$$1 + "]");

            if (item) {
                item.addClass('selected');
            }
        }
    }, {
        key: CLICK('$repeat button'),
        value: function value$$1(e) {
            var repeat = e.$delegateTarget.val();
            this.selectBackgroundRepeat(repeat);
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { repeat: repeat });
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggle(isShow);

            if (isShow) {
                var image = editor$1.selection.currentBackgroundImage;
                if (image) {
                    this.children.$width.refresh(image.width);
                    this.children.$height.refresh(image.height);
                    this.children.$x.refresh(image.x);
                    this.children.$y.refresh(image.y);
                    this.selectBackgroundSize(image.size);
                    this.selectBackgroundRepeat(image.repeat);
                }
            }
        }
    }, {
        key: "isShow",
        value: function isShow() {

            return true;
        }
    }]);
    return BackgroundSize;
}(UIElement);

var PageSize = function (_UIElement) {
    inherits(PageSize, _UIElement);

    function PageSize() {
        classCallCheck(this, PageSize);
        return possibleConstructorReturn(this, (PageSize.__proto__ || Object.getPrototypeOf(PageSize)).apply(this, arguments));
    }

    createClass(PageSize, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item size show'>\n                <div class='items'>\n                    <div>\n                        <label>   Width</label>\n                        <div>\n                            <input type='number' ref=\"$width\"> <span>" + UNIT_PX + "</span>\n                            <button type=\"button\" ref=\"$rect\">rect</button>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Height</label>\n                        <div>\n                            <input type='number' ref=\"$height\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>             \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_ARTBOARD),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var artboard = editor$1.selection.currentArtBoard;
            if (artboard) {
                this.refs.$width.val(+artboard.width);
                this.refs.$height.val(+artboard.height);
            }
        }
    }, {
        key: CLICK('$rect'),
        value: function value$$1(e) {
            var artboard = editor$1.selection.currentArtBoard;
            if (artboard) {
                artboard.reset({
                    width: Length.px(this.refs.$width.int()),
                    height: Length.px(this.refs.$width.int())
                });
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: INPUT('$width'),
        value: function value$$1() {
            var artboard = editor$1.selection.currentArtBoard;
            if (artboard) {
                artboard.width = Length.px(this.refs.$width.int());
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: INPUT('$height'),
        value: function value$$1() {
            var artboard = editor$1.selection.currentArtBoard;
            if (artboard) {
                artboard.height = Length.px(this.refs.$height.int());
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }]);
    return PageSize;
}(UIElement);

var PageName = function (_UIElement) {
    inherits(PageName, _UIElement);

    function PageName() {
        classCallCheck(this, PageName);
        return possibleConstructorReturn(this, (PageName.__proto__ || Object.getPrototypeOf(PageName)).apply(this, arguments));
    }

    createClass(PageName, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item name show'>\n                <div class='items'>            \n                    <div>\n                        <label>Name</label>\n                        <div>\n                            <input type='text' ref=\"$name\" style=\"width: 100px;\"> \n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_ARTBOARD, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var artboard = editor$1.selection.currentArtBoard;
            if (artboard) {
                this.refs.$name.val(artboard.name);
            }
        }
    }, {
        key: INPUT('$name'),
        value: function value() {
            editor$1.selection.updateArtBoard(CHANGE_ARTBOARD, {
                name: this.refs.$name.val()
            });
        }
    }]);
    return PageName;
}(UIElement);

var PageExport = function (_UIElement) {
    inherits(PageExport, _UIElement);

    function PageExport() {
        classCallCheck(this, PageExport);
        return possibleConstructorReturn(this, (PageExport.__proto__ || Object.getPrototypeOf(PageExport)).apply(this, arguments));
    }

    createClass(PageExport, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item export'>\n                <div class='items no-padding'>\n                    <div>\n                        <label>Export</label>\n                        <button type=\"button\" ref=\"$exportCSS\">CSS</button>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: CLICK('$exportCSS'),
        value: function value(e) {
            this.emit('showExport');
        }
    }]);
    return PageExport;
}(UIElement);

var SELECTION_CHECK = 'selection/check';







var SELECTION_CURRENT_IMAGE = 'selection/current/image';
var SELECTION_CURRENT_IMAGE_ID = 'selection/current/image/id';




var SELECTION_CURRENT_LAYER = 'selection/current/layer';
var SELECTION_CURRENT_LAYER_ID = 'selection/current/layer/id';
var SELECTION_CURRENT_PAGE = 'selection/current/page';
var SELECTION_CURRENT_PAGE_ID = 'selection/current/page/id';



var SELECTION_IS_LAYER = 'selection/is/layer';










var SELECTION_ONE = 'selection/one';

var FILTER_GET = 'filter/get';
var FILTER_LIST = 'filter/list';

var _templateObject$2 = taggedTemplateLiteral(["\n            <div class='filter'>\n                <span class=\"area\"></span>\n                <span class=\"checkbox\">\n                    <input type=\"checkbox\" ", " data-key=\"", "\" />\n                </span>\n                <span class='title long' draggable=\"true\">", "</span>\n            </div>\n            <div class='items'>\n                ", "\n            </div>\n            "], ["\n            <div class='filter'>\n                <span class=\"area\"></span>\n                <span class=\"checkbox\">\n                    <input type=\"checkbox\" ", " data-key=\"", "\" />\n                </span>\n                <span class='title long' draggable=\"true\">", "</span>\n            </div>\n            <div class='items'>\n                ", "\n            </div>\n            "]);

var DROPSHADOW_FILTER_KEYS = ['filterDropshadowOffsetX', 'filterDropshadowOffsetY', 'filterDropshadowBlurRadius', 'filterDropshadowColor'];

var FilterList$1 = function (_BasePropertyItem) {
    inherits(FilterList, _BasePropertyItem);

    function FilterList() {
        classCallCheck(this, FilterList);
        return possibleConstructorReturn(this, (FilterList.__proto__ || Object.getPrototypeOf(FilterList)).apply(this, arguments));
    }

    createClass(FilterList, [{
        key: "template",
        value: function template() {
            return "<div class='property-item filters show'><div class='items'><div class=\"filter-list\" ref=\"$filterList\"></div></div></div>";
        }
    }, {
        key: "makeInputItem",
        value: function makeInputItem(key, viewObject, dataObject) {
            var _this2 = this;

            var value$$1 = dataObject[key] ? dataObject[key].value : undefined;

            if (viewObject.type == 'range') {
                if (isUndefined$1(value$$1)) {
                    value$$1 = viewObject.defaultValue;
                }

                return "\n                <div class='filter'>\n                    <span class=\"area\"></span>                \n                    <span class=\"checkbox\">\n                        <input type=\"checkbox\" " + (dataObject.checked ? "checked=\"checked\"" : EMPTY_STRING) + " data-key=\"" + key + "\" />\n                    </span>\n                    <span class='title' draggable=\"true\">" + viewObject.title + "</span>\n                    <span class='range'><input type=\"range\" min=\"" + viewObject.min + "\" max=\"" + viewObject.max + "\" step=\"" + viewObject.step + "\" value=\"" + value$$1 + "\" ref=\"" + key + "Range\" data-key=\"" + key + "\"/></span>\n                    <span class='input-value'><input type=\"number\" min=\"" + viewObject.min + "\" max=\"" + viewObject.max + "\" step=\"" + viewObject.step + "\" value=\"" + value$$1 + "\"  ref=\"" + key + "Number\" data-key=\"" + key + "\"/></span>\n                    <span class='unit'>" + unitString(viewObject.unit) + "</span>\n                </div>\n            ";
            } else if (viewObject.type == 'multi') {
                return html(_templateObject$2, dataObject.checked ? "checked=\"checked\"" : EMPTY_STRING, key, viewObject.title, DROPSHADOW_FILTER_KEYS.map(function (subkey) {

                    var it = _this2.read(FILTER_GET, subkey);
                    var value$$1 = isUndefined$1(dataObject[subkey]) ? it.defaultValue : unitValue(dataObject[subkey]);

                    if (isColorUnit(it)) {
                        return "\n                        <div>\n                            <span class='title'>" + it.title + "</span>\n                            <span class='color'>\n                                <span class=\"color-view drop-shadow\" ref=\"$dropShadowColor\" style=\"background-color: " + value$$1 + "\" data-key=\"" + subkey + "\" ></span>\n                                <span class=\"color-text\" ref=\"$dropShadowColorText\">" + value$$1 + "</span>\n                            </span>\n                        </div>\n                        ";
                    } else {

                        return "\n                        <div>\n                            <span class='title'>" + it.title + "</span>\n                            <span class='range'><input type=\"range\" min=\"" + it.min + "\" max=\"" + it.max + "\" step=\"" + it.step + "\" value=\"" + value$$1 + "\" ref=\"" + subkey + "Range\"  data-key=\"" + subkey + "\" /></span>\n                            <span class='input-value'><input type=\"number\" min=\"" + it.min + "\" max=\"" + it.max + "\" step=\"" + it.step + "\" value=\"" + value$$1 + "\" ref=\"" + subkey + "Number\" data-key=\"" + subkey + "\" /></span>\n                            <span class='unit'>" + unitString(it.unit) + "</span>\n                        </div>\n                        ";
                    }
                }));
            }

            return "<div></div>";
        }
    }, {
        key: LOAD('$filterList'),
        value: function value$$1() {
            var _this3 = this;

            var layer = this.read(SELECTION_CURRENT_LAYER);

            if (!layer) return EMPTY_STRING;

            var filterKeys = this.read(FILTER_LIST, layer.id);

            return filterKeys.map(function (key) {
                var realKey = key;
                var viewObject = _this3.read(FILTER_GET, realKey);
                var dataObject = layer || {};
                return "\n                <div class='filter-item'>\n                    <div class=\"filter-item-input\">\n                        " + _this3.makeInputItem(realKey, viewObject, dataObject) + "\n                    </div>\n                </div>";
            });
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "isShow",
        value: function isShow() {
            return true;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: "updateFilterKeyValue",
        value: function updateFilterKeyValue(key, lastValue) {
            var _this4 = this;

            this.read(SELECTION_CURRENT_LAYER, function (layer) {
                var id = layer.id;
                var value$$1 = layer[key] || _extends({}, FILTER_DEFAULT_OBJECT[key]);
                value$$1.value = lastValue;

                _this4.commit(CHANGE_LAYER, defineProperty({ id: id }, key, value$$1));
            });
        }
    }, {
        key: "updateFilterKeyChecked",
        value: function updateFilterKeyChecked(key, checked) {
            var _this5 = this;

            this.read(SELECTION_CURRENT_LAYER, function (layer) {
                var id = layer.id;
                var value$$1 = layer[key] || _extends({}, FILTER_DEFAULT_OBJECT[key]);
                value$$1.checked = checked;

                _this5.commit(CHANGE_LAYER, defineProperty({ id: id }, key, value$$1));
            });
        }
    }, {
        key: CLICK('$filterList input[type=checkbox]'),
        value: function value$$1(e) {
            var $check = e.$delegateTarget;
            var key = $check.attr('data-key');
            this.updateFilterKeyChecked(key, $check.checked());
        }
    }, {
        key: CHANGEINPUT('$filterList input[type=range]'),
        value: function value$$1(e) {
            var $range = e.$delegateTarget;
            var key = $range.attr('data-key');
            this.refs[key + "Number"].val($range.val());
            this.updateFilterKeyValue(key, $range.val());
        }
    }, {
        key: INPUT('$filterList input[type=number]'),
        value: function value$$1(e) {
            var $number = e.$delegateTarget;
            var key = $number.attr('data-key');
            this.refs[key + "Range"].val($number.val());
            this.updateFilterKeyValue(key, $number.val());
        }
    }, {
        key: CLICK('$el .drop-shadow'),
        value: function value$$1(e) {
            var color$$1 = e.$delegateTarget.css('background-color');
            this.emit('selectFillColor', color$$1, this.updateDropShadowColor.bind(this));
        }
    }, {
        key: "updateDropShadowColor",
        value: function updateDropShadowColor(color$$1) {
            this.refs.$dropShadowColor.css('background-color', color$$1);
            this.refs.$dropShadowColorText.text(color$$1);

            var key = this.refs.$dropShadowColor.attr('data-key');

            this.updateFilterKeyValue(key, color$$1);
        }
    }]);
    return FilterList;
}(BasePropertyItem);

var IMAGE_GET_FILE = 'image/get/file';
var IMAGE_GET_URL = 'image/get/url';
var IMAGE_GET_BLOB = 'image/get/blob';




var IMAGE_TO_STRING = 'image/toString';

var ITEM_INITIALIZE = 'item/initialize';





















var ITEM_SET_IMAGE_FILE = 'item/set/image/file';



var ITEM_ADD_KEYFRAME = 'item/add/keyframe';

var SVG_LIST = 'svg/list';


var SVG_GET_BLOB = 'svg/get/blob';

var ImageResource$1 = function (_BasePropertyItem) {
    inherits(ImageResource, _BasePropertyItem);

    function ImageResource() {
        classCallCheck(this, ImageResource);
        return possibleConstructorReturn(this, (ImageResource.__proto__ || Object.getPrototypeOf(ImageResource)).apply(this, arguments));
    }

    createClass(ImageResource, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item image-resource show'>\n                <div class='title'>Image Resource</div>            \n                <div class='items' ref=\"$imageList\"></div>\n            </div>\n        ";
        }
    }, {
        key: LOAD('$imageList'),
        value: function value() {
            return this.read(SVG_LIST).map(function (svg, index) {
                if (isObject(svg)) {
                    return "<div class='svg-item' data-key=\"" + svg.key + "\">" + svg.svg + "</div>";
                } else {
                    return "<div class='svg-item' data-index=\"" + index + "\">" + svg + "</div>";
                }
            });
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.toggle(this.isShow());
            this.load();
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: EVENT('changeSvgList'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT('selectImage'),
        value: function value() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var item = editor$1.selection.backgroundImage;
            if (!item) return false;

            return item.gradient.isImage();
        }
    }, {
        key: CLICK('$imageList .svg-item'),
        value: function value(e) {
            var _this2 = this;

            var _e$$delegateTarget$at = e.$delegateTarget.attrs('data-index', 'data-key'),
                _e$$delegateTarget$at2 = slicedToArray(_e$$delegateTarget$at, 2),
                index = _e$$delegateTarget$at2[0],
                key = _e$$delegateTarget$at2[1];

            if (index) {
                var image = editor$1.selection.backgroundImage;
                if (image) {
                    var file = this.read(SVG_GET_BLOB, +index);
                    this.read(IMAGE_GET_BLOB, [file], function (newImage) {
                        _this2.dispatch(ITEM_SET_IMAGE_FILE, image.id, newImage);
                    });
                }
            } else if (key) {
                var image = editor$1.selection.backgroundImage;
                if (image) {
                    var file = this.read(SVG_GET_BLOB, Number.MAX_SAFE_INTEGER, key);
                    this.read(IMAGE_GET_BLOB, [file], function (newImage) {
                        _this2.dispatch(ITEM_SET_IMAGE_FILE, image.id, newImage);
                    });
                }
            }
        }
    }]);
    return ImageResource;
}(BasePropertyItem);

var _templateObject$3 = taggedTemplateLiteral(["\n            <div class='property-item clip-path show'>\n                <div class='items'>            \n                    <div>\n                        <label>View editor</label>\n                        <div >\n                            <label><input type=\"checkbox\" ref=\"$showClipPathEditor\" /> show clip path editor</label>\n                        </div>\n                    </div>                       \n                    <div>\n                        <label>Type</label>\n                        <div class='full-size'>\n                            <select ref=\"$clipType\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>                       \n                </div>\n            </div>\n        "], ["\n            <div class='property-item clip-path show'>\n                <div class='items'>            \n                    <div>\n                        <label>View editor</label>\n                        <div >\n                            <label><input type=\"checkbox\" ref=\"$showClipPathEditor\" /> show clip path editor</label>\n                        </div>\n                    </div>                       \n                    <div>\n                        <label>Type</label>\n                        <div class='full-size'>\n                            <select ref=\"$clipType\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>                       \n                </div>\n            </div>\n        "]);

var CLIP_PATH_TYPES = [CLIP_PATH_TYPE_NONE, CLIP_PATH_TYPE_CIRCLE, CLIP_PATH_TYPE_ELLIPSE, CLIP_PATH_TYPE_INSET, CLIP_PATH_TYPE_POLYGON, CLIP_PATH_TYPE_SVG];

var ClipPath = function (_BasePropertyItem) {
    inherits(ClipPath, _BasePropertyItem);

    function ClipPath() {
        classCallCheck(this, ClipPath);
        return possibleConstructorReturn(this, (ClipPath.__proto__ || Object.getPrototypeOf(ClipPath)).apply(this, arguments));
    }

    createClass(ClipPath, [{
        key: "template",
        value: function template() {
            return html(_templateObject$3, CLIP_PATH_TYPES.map(function (type) {
                return "<option value=\"" + type + "\">" + type + "</option>";
            }));
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.currentLayer;
            if (layer) {
                this.refs.$showClipPathEditor.checked(layer.showClipPathEditor);
                this.refs.$clipType.val(layer.clipPathType || 'none');
            }
        }
    }, {
        key: CHANGE('$clipType'),
        value: function value$$1() {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                clipPathType: this.refs.$clipType.val()
            });
        }
    }, {
        key: CLICK('$showClipPathEditor'),
        value: function value$$1() {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                showClipPathEditor: this.refs.$showClipPathEditor.checked()
            });
        }
    }]);
    return ClipPath;
}(BasePropertyItem);

var PageShowGrid = function (_UIElement) {
    inherits(PageShowGrid, _UIElement);

    function PageShowGrid() {
        classCallCheck(this, PageShowGrid);
        return possibleConstructorReturn(this, (PageShowGrid.__proto__ || Object.getPrototypeOf(PageShowGrid)).apply(this, arguments));
    }

    createClass(PageShowGrid, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item hidden'>\n                <div class='items'>            \n                    <div>\n                        <label>Show Grid</label>\n                        <div>\n                            <input type='checkbox' ref=\"$check\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT('changeTool'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.refs.$check.checked(editor$1.config.get('show.grid'));
        }
    }, {
        key: CLICK('$check'),
        value: function value() {

            editor$1.config.set('show.grid', this.refs.$check.checked());
            editor$1.config.set('snap.grid', this.refs.$check.checked());

            editor$1.send(CHANGE_TOOL);
        }
    }]);
    return PageShowGrid;
}(UIElement);

var ClipPath$2 = function (_Property) {
    inherits(ClipPath, _Property);

    function ClipPath() {
        classCallCheck(this, ClipPath);
        return possibleConstructorReturn(this, (ClipPath.__proto__ || Object.getPrototypeOf(ClipPath)).apply(this, arguments));
    }

    createClass(ClipPath, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(ClipPath.prototype.__proto__ || Object.getPrototypeOf(ClipPath.prototype), "getDefaultObject", this).call(this, _extends({ itemType: 'clip-path' }, obj));
        }
    }, {
        key: "toCSS",
        value: function toCSS() {
            return {
                'clip-path': this.toString()
            };
        }
    }, {
        key: "isNone",
        value: function isNone() {
            return true;
        }
    }, {
        key: "isEllipse",
        value: function isEllipse() {
            return false;
        }
    }, {
        key: "isCircle",
        value: function isCircle() {
            return false;
        }
    }, {
        key: "isInset",
        value: function isInset() {
            return false;
        }
    }, {
        key: "isPolygon",
        value: function isPolygon() {
            return false;
        }
    }, {
        key: "isSVG",
        value: function isSVG() {
            return false;
        }
    }, {
        key: "isSideType",
        value: function isSideType(sideType) {
            return this.json.sideType == sideType;
        }
    }]);
    return ClipPath;
}(Property);

var NoneClipPath = function (_ClipPath) {
    inherits(NoneClipPath, _ClipPath);

    function NoneClipPath() {
        classCallCheck(this, NoneClipPath);
        return possibleConstructorReturn(this, (NoneClipPath.__proto__ || Object.getPrototypeOf(NoneClipPath)).apply(this, arguments));
    }

    createClass(NoneClipPath, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(NoneClipPath.prototype.__proto__ || Object.getPrototypeOf(NoneClipPath.prototype), "getDefaultObject", this).call(this, {
                type: 'none'
            });
        }
    }, {
        key: "toString",
        value: function toString() {
            return 'none';
        }
    }]);
    return NoneClipPath;
}(ClipPath$2);

var EllipseClipPath = function (_ClipPath2) {
    inherits(EllipseClipPath, _ClipPath2);

    function EllipseClipPath() {
        classCallCheck(this, EllipseClipPath);
        return possibleConstructorReturn(this, (EllipseClipPath.__proto__ || Object.getPrototypeOf(EllipseClipPath)).apply(this, arguments));
    }

    createClass(EllipseClipPath, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(EllipseClipPath.prototype.__proto__ || Object.getPrototypeOf(EllipseClipPath.prototype), "getDefaultObject", this).call(this, {
                type: 'ellipse',
                centerX: Length$1.percent(50),
                centerY: Length$1.percent(50),
                radiusX: Length$1.percent(100),
                radiusY: Length$1.percent(100),
                sideType: 'none'
            });
        }
    }, {
        key: "isEllipse",
        value: function isEllipse() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {
            var json = this.json;
            var sideType = json.sideType;

            if (sideType == 'none') {
                var layer = this.parent();
                var dist = layer.dist();
                var width = +layer.width.toPx(); // px 가 되어야 함.  
                var height = +layer.height.toPx(); // px 가 되어야 함 

                var radiusSizeX = Math.abs(json.radiusX.toPx(width) - json.centerX.toPx(width));
                var radiusPercentX = Length$1.percent(Math.floor(radiusSizeX / dist * 100));

                var radiusSizeY = Math.abs(json.radiusY.toPx(height) - json.centerY.toPx(height));
                var radiusPercentY = Length$1.percent(Math.floor(radiusSizeY / dist * 100));

                var radiusString = radiusPercentX + " " + radiusPercentY;
            } else if (sideType == 'closest-side' || sideType == 'farthest-side') {
                var radiusString = sideType;
            }

            return "ellipse(" + radiusString + " at " + json.centerX + " " + json.centerY + ")";
        }
    }]);
    return EllipseClipPath;
}(ClipPath$2);

var CircleClipPath = function (_ClipPath3) {
    inherits(CircleClipPath, _ClipPath3);

    function CircleClipPath() {
        classCallCheck(this, CircleClipPath);
        return possibleConstructorReturn(this, (CircleClipPath.__proto__ || Object.getPrototypeOf(CircleClipPath)).apply(this, arguments));
    }

    createClass(CircleClipPath, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(CircleClipPath.prototype.__proto__ || Object.getPrototypeOf(CircleClipPath.prototype), "getDefaultObject", this).call(this, {
                type: 'circle',
                centerX: Length$1.percent(50),
                centerY: Length$1.percent(50),
                radiusX: Length$1.percent(100),
                radiusY: Length$1.percent(100),
                sideType: 'none'
            });
        }
    }, {
        key: "isCircle",
        value: function isCircle() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {
            var json = this.json;
            var sideType = json.sideType;

            if (sideType == 'none') {
                var layer = this.parent();
                var dist = layer.dist();
                var width = +layer.width.toPx(); // px 가 되어야 함.  
                var height = +layer.height.toPx(); // px 가 되어야 함 

                var radiusSize = Math.sqrt(Math.pow(Math.abs(json.radiusX.toPx(width) - json.centerX.toPx(width)), 2) + Math.pow(Math.abs(json.radiusY.toPx(height) - json.centerY.toPx(height)), 2));
                var radiusString = Length$1.percent(Math.floor(radiusSize / dist * 100));
            } else if (sideType == 'closest-side' || sideType == 'farthest-side') {
                var radiusString = sideType;
            }

            return "circle(" + radiusString + " at " + json.centerX + " " + json.centerY + ")";
        }
    }]);
    return CircleClipPath;
}(ClipPath$2);

var InsetClipPath = function (_ClipPath4) {
    inherits(InsetClipPath, _ClipPath4);

    function InsetClipPath() {
        classCallCheck(this, InsetClipPath);
        return possibleConstructorReturn(this, (InsetClipPath.__proto__ || Object.getPrototypeOf(InsetClipPath)).apply(this, arguments));
    }

    createClass(InsetClipPath, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(InsetClipPath.prototype.__proto__ || Object.getPrototypeOf(InsetClipPath.prototype), "getDefaultObject", this).call(this, {
                type: 'inset',
                top: Length$1.percent(0),
                left: Length$1.percent(0),
                right: Length$1.percent(0),
                bottom: Length$1.percent(0)
            });
        }
    }, {
        key: "isInset",
        value: function isInset() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {
            var _json = this.json,
                top = _json.top,
                right = _json.right,
                bottom = _json.bottom,
                left = _json.left;


            return "inset(" + top + " " + right + " " + bottom + " " + left + ")";
        }
    }]);
    return InsetClipPath;
}(ClipPath$2);

var PolygonClipPath = function (_ClipPath5) {
    inherits(PolygonClipPath, _ClipPath5);

    function PolygonClipPath() {
        classCallCheck(this, PolygonClipPath);
        return possibleConstructorReturn(this, (PolygonClipPath.__proto__ || Object.getPrototypeOf(PolygonClipPath)).apply(this, arguments));
    }

    createClass(PolygonClipPath, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(PolygonClipPath.prototype.__proto__ || Object.getPrototypeOf(PolygonClipPath.prototype), "getDefaultObject", this).call(this, {
                type: 'polygon',
                fillRule: EMPTY_STRING,
                points: []
            });
        }
    }, {
        key: "removePoint",
        value: function removePoint(index) {
            this.json.points.splice(index, 1);
        }
    }, {
        key: "copyPoint",
        value: function copyPoint(index) {
            var copyItem = this.json.points[index];
            var copy = { x: Length$1.parse(copyItem.x), y: Length$1.parse(copyItem.y) };
            this.json.points.splice(index, 0, copy);
        }
    }, {
        key: "updatePoint",
        value: function updatePoint(index, key, value$$1) {
            this.json.points[index][key] = value$$1;
        }
    }, {
        key: "isPolygon",
        value: function isPolygon() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {
            var json = this.json;

            var fillRule = json.fillRule == EMPTY_STRING ? '' : json.fillRule + ',';
            var polygonString = json.points.map(function (it) {
                return it.x + " " + it.y;
            }).join(', ');

            return "polygon(" + fillRule + " " + polygonString + ")";
        }
    }]);
    return PolygonClipPath;
}(ClipPath$2);

var SVGClipPath = function (_ClipPath6) {
    inherits(SVGClipPath, _ClipPath6);

    function SVGClipPath() {
        classCallCheck(this, SVGClipPath);
        return possibleConstructorReturn(this, (SVGClipPath.__proto__ || Object.getPrototypeOf(SVGClipPath)).apply(this, arguments));
    }

    createClass(SVGClipPath, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(SVGClipPath.prototype.__proto__ || Object.getPrototypeOf(SVGClipPath.prototype), "getDefaultObject", this).call(this, {
                type: 'svg',
                svg: EMPTY_STRING
            });
        }
    }, {
        key: "isSVG",
        value: function isSVG() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {
            return "url(#clippath-" + this.id + ")";
        }
    }]);
    return SVGClipPath;
}(ClipPath$2);

var ClipPathClassName = {
    'none': NoneClipPath,
    'circle': CircleClipPath,
    'ellipse': EllipseClipPath,
    'inset': InsetClipPath,
    'polygon': PolygonClipPath,
    'svg': SVGClipPath
};

ClipPath$2.parse = function (obj) {
    var ClipPathClass = ClipPathClassName[obj.type];

    return new ClipPathClass(obj);
};

var Filter = function (_Property) {
    inherits(Filter, _Property);

    function Filter() {
        classCallCheck(this, Filter);
        return possibleConstructorReturn(this, (Filter.__proto__ || Object.getPrototypeOf(Filter)).apply(this, arguments));
    }

    createClass(Filter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(Filter.prototype.__proto__ || Object.getPrototypeOf(Filter.prototype), "getDefaultObject", this).call(this, _extends({ itemType: 'filter' }, obj));
        }
    }, {
        key: "toString",
        value: function toString() {
            return this.json.type + "(" + (this.json.value || '') + ")";
        }
    }]);
    return Filter;
}(Property);

var BlurFilter = function (_Filter) {
    inherits(BlurFilter, _Filter);

    function BlurFilter() {
        classCallCheck(this, BlurFilter);
        return possibleConstructorReturn(this, (BlurFilter.__proto__ || Object.getPrototypeOf(BlurFilter)).apply(this, arguments));
    }

    createClass(BlurFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BlurFilter.prototype.__proto__ || Object.getPrototypeOf(BlurFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'blur',
                value: BlurFilter.spec.defaultValue
            });
        }
    }]);
    return BlurFilter;
}(Filter);

BlurFilter.spec = { title: 'Blur', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PX, defaultValue: Length$1.px(0) };

var GrayscaleFilter = function (_Filter2) {
    inherits(GrayscaleFilter, _Filter2);

    function GrayscaleFilter() {
        classCallCheck(this, GrayscaleFilter);
        return possibleConstructorReturn(this, (GrayscaleFilter.__proto__ || Object.getPrototypeOf(GrayscaleFilter)).apply(this, arguments));
    }

    createClass(GrayscaleFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(GrayscaleFilter.prototype.__proto__ || Object.getPrototypeOf(GrayscaleFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'grayscale',
                value: GrayscaleFilter.spec.defaultValue
            });
        }
    }]);
    return GrayscaleFilter;
}(Filter);

GrayscaleFilter.spec = { title: 'Grayscale', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(0) };

var HueRotateFilter = function (_Filter3) {
    inherits(HueRotateFilter, _Filter3);

    function HueRotateFilter() {
        classCallCheck(this, HueRotateFilter);
        return possibleConstructorReturn(this, (HueRotateFilter.__proto__ || Object.getPrototypeOf(HueRotateFilter)).apply(this, arguments));
    }

    createClass(HueRotateFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(HueRotateFilter.prototype.__proto__ || Object.getPrototypeOf(HueRotateFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'hue-rotate',
                value: HueRotateFilter.spec.defaultValue
            });
        }
    }]);
    return HueRotateFilter;
}(Filter);

HueRotateFilter.spec = { title: 'Hue', inputType: 'range', min: 0, max: 360, step: 1, unit: UNIT_DEG, defaultValue: Length$1.deg(0) };

var InvertFilter = function (_Filter4) {
    inherits(InvertFilter, _Filter4);

    function InvertFilter() {
        classCallCheck(this, InvertFilter);
        return possibleConstructorReturn(this, (InvertFilter.__proto__ || Object.getPrototypeOf(InvertFilter)).apply(this, arguments));
    }

    createClass(InvertFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(InvertFilter.prototype.__proto__ || Object.getPrototypeOf(InvertFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'invert',
                value: InvertFilter.spec.defaultValue
            });
        }
    }]);
    return InvertFilter;
}(Filter);

InvertFilter.spec = { title: 'Invert', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(0) };

var BrightnessFilter = function (_Filter5) {
    inherits(BrightnessFilter, _Filter5);

    function BrightnessFilter() {
        classCallCheck(this, BrightnessFilter);
        return possibleConstructorReturn(this, (BrightnessFilter.__proto__ || Object.getPrototypeOf(BrightnessFilter)).apply(this, arguments));
    }

    createClass(BrightnessFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BrightnessFilter.prototype.__proto__ || Object.getPrototypeOf(BrightnessFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'brightness',
                value: BrightnessFilter.spec.defaultValue
            });
        }
    }]);
    return BrightnessFilter;
}(Filter);

BrightnessFilter.spec = { title: 'Brightness', inputType: 'range', min: 0, max: 200, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var ContrastFilter = function (_Filter6) {
    inherits(ContrastFilter, _Filter6);

    function ContrastFilter() {
        classCallCheck(this, ContrastFilter);
        return possibleConstructorReturn(this, (ContrastFilter.__proto__ || Object.getPrototypeOf(ContrastFilter)).apply(this, arguments));
    }

    createClass(ContrastFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(ContrastFilter.prototype.__proto__ || Object.getPrototypeOf(ContrastFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'contrast',
                value: ContrastFilter.spec.defaultValue
            });
        }
    }]);
    return ContrastFilter;
}(Filter);

ContrastFilter.spec = { title: 'Contrast', inputType: 'range', min: 0, max: 200, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var OpacityFilter = function (_Filter7) {
    inherits(OpacityFilter, _Filter7);

    function OpacityFilter() {
        classCallCheck(this, OpacityFilter);
        return possibleConstructorReturn(this, (OpacityFilter.__proto__ || Object.getPrototypeOf(OpacityFilter)).apply(this, arguments));
    }

    createClass(OpacityFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(OpacityFilter.prototype.__proto__ || Object.getPrototypeOf(OpacityFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'opacity',
                value: OpacityFilter.spec.defaultValue
            });
        }
    }]);
    return OpacityFilter;
}(Filter);

OpacityFilter.spec = { title: 'Opacity', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var SaturateFilter = function (_Filter8) {
    inherits(SaturateFilter, _Filter8);

    function SaturateFilter() {
        classCallCheck(this, SaturateFilter);
        return possibleConstructorReturn(this, (SaturateFilter.__proto__ || Object.getPrototypeOf(SaturateFilter)).apply(this, arguments));
    }

    createClass(SaturateFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(SaturateFilter.prototype.__proto__ || Object.getPrototypeOf(SaturateFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'saturate',
                value: SaturateFilter.spec.defaultValue
            });
        }
    }]);
    return SaturateFilter;
}(Filter);

SaturateFilter.spec = { title: 'Saturate', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var SepiaFilter = function (_Filter9) {
    inherits(SepiaFilter, _Filter9);

    function SepiaFilter() {
        classCallCheck(this, SepiaFilter);
        return possibleConstructorReturn(this, (SepiaFilter.__proto__ || Object.getPrototypeOf(SepiaFilter)).apply(this, arguments));
    }

    createClass(SepiaFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(SepiaFilter.prototype.__proto__ || Object.getPrototypeOf(SepiaFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'sepia',
                value: SepiaFilter.spec.defaultValue
            });
        }
    }]);
    return SepiaFilter;
}(Filter);

SepiaFilter.spec = { title: 'Sepia', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(0) };

var DropshadowFilter = function (_Filter10) {
    inherits(DropshadowFilter, _Filter10);

    function DropshadowFilter() {
        classCallCheck(this, DropshadowFilter);
        return possibleConstructorReturn(this, (DropshadowFilter.__proto__ || Object.getPrototypeOf(DropshadowFilter)).apply(this, arguments));
    }

    createClass(DropshadowFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(DropshadowFilter.prototype.__proto__ || Object.getPrototypeOf(DropshadowFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'drop-shadow',
                multi: true,
                offsetX: DropshadowFilter.spec.offsetX.defaultValue,
                offsetY: DropshadowFilter.spec.offsetY.defaultValue,
                blurRadius: DropshadowFilter.spec.blurRadius.defaultValue,
                color: DropshadowFilter.spec.color.defaultValue
            });
        }
    }, {
        key: "toString",
        value: function toString() {
            var json = this.json;
            return "drop-shadow(" + json.offsetX + " " + json.offsetY + " " + json.blurRadius + " " + json.color + ")";
        }
    }]);
    return DropshadowFilter;
}(Filter);

DropshadowFilter.spec = {
    offsetX: { title: 'Offset X', inputType: 'range', min: -100, max: 100, step: 1, defaultValue: Length$1.px(0), unit: UNIT_PX },
    offsetY: { title: 'Offset Y', inputType: 'range', min: -100, max: 100, step: 1, defaultValue: Length$1.px(0), unit: UNIT_PX },
    blurRadius: { title: 'Blur Radius', inputType: 'range', min: 0, max: 100, step: 1, defaultValue: Length$1.px(0), unit: UNIT_PX },
    color: { title: 'Color', inputType: 'color', defaultValue: 'rgba(0, 0, 0, 0)', unit: UNIT_COLOR }
};





Filter.parse = function (obj) {
    var FilterClass = FilerClassName[obj.type];

    return new FilterClass(obj);
};

var BackdropFilter = function (_Property) {
    inherits(BackdropFilter, _Property);

    function BackdropFilter() {
        classCallCheck(this, BackdropFilter);
        return possibleConstructorReturn(this, (BackdropFilter.__proto__ || Object.getPrototypeOf(BackdropFilter)).apply(this, arguments));
    }

    createClass(BackdropFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(BackdropFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropFilter.prototype), "getDefaultObject", this).call(this, _extends({ itemType: 'filter' }, obj));
        }
    }, {
        key: "toString",
        value: function toString() {
            return this.json.type + "(" + (this.json.value || '') + ")";
        }
    }]);
    return BackdropFilter;
}(Property);

var BackdropBlurFilter = function (_BackdropFilter) {
    inherits(BackdropBlurFilter, _BackdropFilter);

    function BackdropBlurFilter() {
        classCallCheck(this, BackdropBlurFilter);
        return possibleConstructorReturn(this, (BackdropBlurFilter.__proto__ || Object.getPrototypeOf(BackdropBlurFilter)).apply(this, arguments));
    }

    createClass(BackdropBlurFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropBlurFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropBlurFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'blur',
                value: BackdropBlurFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropBlurFilter;
}(BackdropFilter);

BackdropBlurFilter.spec = { title: 'Blur', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PX, defaultValue: Length$1.px(0) };

var BackdropGrayscaleFilter = function (_BackdropFilter2) {
    inherits(BackdropGrayscaleFilter, _BackdropFilter2);

    function BackdropGrayscaleFilter() {
        classCallCheck(this, BackdropGrayscaleFilter);
        return possibleConstructorReturn(this, (BackdropGrayscaleFilter.__proto__ || Object.getPrototypeOf(BackdropGrayscaleFilter)).apply(this, arguments));
    }

    createClass(BackdropGrayscaleFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropGrayscaleFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropGrayscaleFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'grayscale',
                value: BackdropGrayscaleFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropGrayscaleFilter;
}(BackdropFilter);

BackdropGrayscaleFilter.spec = { title: 'Grayscale', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(0) };

var BackdropHueRotateFilter = function (_BackdropFilter3) {
    inherits(BackdropHueRotateFilter, _BackdropFilter3);

    function BackdropHueRotateFilter() {
        classCallCheck(this, BackdropHueRotateFilter);
        return possibleConstructorReturn(this, (BackdropHueRotateFilter.__proto__ || Object.getPrototypeOf(BackdropHueRotateFilter)).apply(this, arguments));
    }

    createClass(BackdropHueRotateFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropHueRotateFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropHueRotateFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'hue-rotate',
                value: BackdropHueRotateFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropHueRotateFilter;
}(BackdropFilter);

BackdropHueRotateFilter.spec = { title: 'Hue', inputType: 'range', min: 0, max: 360, step: 1, unit: UNIT_DEG, defaultValue: Length$1.deg(0) };

var BackdropInvertFilter = function (_BackdropFilter4) {
    inherits(BackdropInvertFilter, _BackdropFilter4);

    function BackdropInvertFilter() {
        classCallCheck(this, BackdropInvertFilter);
        return possibleConstructorReturn(this, (BackdropInvertFilter.__proto__ || Object.getPrototypeOf(BackdropInvertFilter)).apply(this, arguments));
    }

    createClass(BackdropInvertFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropInvertFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropInvertFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'invert',
                value: BackdropInvertFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropInvertFilter;
}(BackdropFilter);

BackdropInvertFilter.spec = { title: 'Invert', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(0) };

var BackdropBrightnessFilter = function (_BackdropFilter5) {
    inherits(BackdropBrightnessFilter, _BackdropFilter5);

    function BackdropBrightnessFilter() {
        classCallCheck(this, BackdropBrightnessFilter);
        return possibleConstructorReturn(this, (BackdropBrightnessFilter.__proto__ || Object.getPrototypeOf(BackdropBrightnessFilter)).apply(this, arguments));
    }

    createClass(BackdropBrightnessFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropBrightnessFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropBrightnessFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'brightness',
                value: BackdropBrightnessFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropBrightnessFilter;
}(BackdropFilter);

BackdropBrightnessFilter.spec = { title: 'Brightness', inputType: 'range', min: 0, max: 200, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var BackdropContrastFilter = function (_BackdropFilter6) {
    inherits(BackdropContrastFilter, _BackdropFilter6);

    function BackdropContrastFilter() {
        classCallCheck(this, BackdropContrastFilter);
        return possibleConstructorReturn(this, (BackdropContrastFilter.__proto__ || Object.getPrototypeOf(BackdropContrastFilter)).apply(this, arguments));
    }

    createClass(BackdropContrastFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropContrastFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropContrastFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'contrast',
                value: BackdropContrastFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropContrastFilter;
}(BackdropFilter);

BackdropContrastFilter.spec = { title: 'Contrast', inputType: 'range', min: 0, max: 200, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var BackdropOpacityFilter = function (_BackdropFilter7) {
    inherits(BackdropOpacityFilter, _BackdropFilter7);

    function BackdropOpacityFilter() {
        classCallCheck(this, BackdropOpacityFilter);
        return possibleConstructorReturn(this, (BackdropOpacityFilter.__proto__ || Object.getPrototypeOf(BackdropOpacityFilter)).apply(this, arguments));
    }

    createClass(BackdropOpacityFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropOpacityFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropOpacityFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'opacity',
                value: BackdropOpacityFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropOpacityFilter;
}(BackdropFilter);

BackdropOpacityFilter.spec = { title: 'Opacity', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var BackdropSaturateFilter = function (_BackdropFilter8) {
    inherits(BackdropSaturateFilter, _BackdropFilter8);

    function BackdropSaturateFilter() {
        classCallCheck(this, BackdropSaturateFilter);
        return possibleConstructorReturn(this, (BackdropSaturateFilter.__proto__ || Object.getPrototypeOf(BackdropSaturateFilter)).apply(this, arguments));
    }

    createClass(BackdropSaturateFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropSaturateFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropSaturateFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'saturate',
                value: BackdropSaturateFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropSaturateFilter;
}(BackdropFilter);

BackdropSaturateFilter.spec = { title: 'Saturate', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(100) };

var BackdropSepiaFilter = function (_BackdropFilter9) {
    inherits(BackdropSepiaFilter, _BackdropFilter9);

    function BackdropSepiaFilter() {
        classCallCheck(this, BackdropSepiaFilter);
        return possibleConstructorReturn(this, (BackdropSepiaFilter.__proto__ || Object.getPrototypeOf(BackdropSepiaFilter)).apply(this, arguments));
    }

    createClass(BackdropSepiaFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropSepiaFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropSepiaFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'sepia',
                value: BackdropSepiaFilter.spec.defaultValue
            });
        }
    }]);
    return BackdropSepiaFilter;
}(BackdropFilter);

BackdropSepiaFilter.spec = { title: 'Sepia', inputType: 'range', min: 0, max: 100, step: 1, unit: UNIT_PERCENT, defaultValue: Length$1.percent(0) };

var BackdropDropshadowFilter = function (_BackdropFilter10) {
    inherits(BackdropDropshadowFilter, _BackdropFilter10);

    function BackdropDropshadowFilter() {
        classCallCheck(this, BackdropDropshadowFilter);
        return possibleConstructorReturn(this, (BackdropDropshadowFilter.__proto__ || Object.getPrototypeOf(BackdropDropshadowFilter)).apply(this, arguments));
    }

    createClass(BackdropDropshadowFilter, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackdropDropshadowFilter.prototype.__proto__ || Object.getPrototypeOf(BackdropDropshadowFilter.prototype), "getDefaultObject", this).call(this, {
                type: 'drop-shadow',
                multi: true,
                offsetX: BackdropDropshadowFilter.spec.offsetX.defaultValue,
                offsetY: BackdropDropshadowFilter.spec.offsetY.defaultValue,
                blurRadius: BackdropDropshadowFilter.spec.blurRadius.defaultValue,
                color: BackdropDropshadowFilter.spec.color.defaultValue
            });
        }
    }, {
        key: "toString",
        value: function toString() {
            var json = this.json;
            return "drop-shadow(" + json.offsetX + " " + json.offsetY + " " + json.blurRadius + " " + json.color + ")";
        }
    }]);
    return BackdropDropshadowFilter;
}(BackdropFilter);

BackdropDropshadowFilter.spec = {
    offsetX: { title: 'Offset X', inputType: 'range', min: -100, max: 100, step: 1, defaultValue: Length$1.px(0), unit: UNIT_PX },
    offsetY: { title: 'Offset Y', inputType: 'range', min: -100, max: 100, step: 1, defaultValue: Length$1.px(0), unit: UNIT_PX },
    blurRadius: { title: 'Blur Radius', inputType: 'range', min: 0, max: 100, step: 1, defaultValue: Length$1.px(0), unit: UNIT_PX },
    color: { title: 'Color', inputType: 'color', defaultValue: 'rgba(0, 0, 0, 0)', unit: UNIT_COLOR }
};



var BackdropFilterClassName = {
    'blur': BackdropBlurFilter,
    'grayscale': BackdropGrayscaleFilter,
    'hue-rotate': BackdropHueRotateFilter,
    'invert': BackdropInvertFilter,
    'brightness': BackdropBrightnessFilter,
    'contrast': BackdropContrastFilter,
    'opacity': BackdropOpacityFilter,
    'saturate': BackdropSaturateFilter,
    'sepia': BackdropSepiaFilter,
    'drop-shadow': BackdropDropshadowFilter
};

BackdropFilter.parse = function (obj) {
    var BackdropFilterClass = BackdropFilterClassName[obj.type];

    return new BackdropFilterClass(obj);
};

var RepeatList = ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'];

var BackgroundImage = function (_Property) {
    inherits(BackgroundImage, _Property);

    function BackgroundImage() {
        classCallCheck(this, BackgroundImage);
        return possibleConstructorReturn(this, (BackgroundImage.__proto__ || Object.getPrototypeOf(BackgroundImage)).apply(this, arguments));
    }

    createClass(BackgroundImage, [{
        key: "addImageResource",
        value: function addImageResource(imageResource) {
            this.clear('image-resource');
            return this.addItem('image-resource', imageResource);
        }
    }, {
        key: "addGradient",
        value: function addGradient(gradient) {
            return this.addImageResource(gradient);
        }
    }, {
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BackgroundImage.prototype.__proto__ || Object.getPrototypeOf(BackgroundImage.prototype), "getDefaultObject", this).call(this, {
                itemType: 'background-image',
                blendMode: 'normal',
                size: 'auto',
                repeat: 'repeat',
                width: Length$1.percent(100),
                height: Length$1.percent(100),
                x: Position$1.CENTER,
                y: Position$1.CENTER
            });
        }
    }, {
        key: "convert",
        value: function convert(json) {
            json.x = Length$1.parse(json.x);
            json.y = Length$1.parse(json.y);

            if (json.width) json.width = Length$1.parse(json.width);
            if (json.height) json.height = Length$1.parse(json.height);

            return json;
        }
    }, {
        key: "checkField",
        value: function checkField(key, value) {
            if (key === 'repeat') {
                return RepeatList.includes(value);
            }

            return get$1(BackgroundImage.prototype.__proto__ || Object.getPrototypeOf(BackgroundImage.prototype), "checkField", this).call(this, key, value);
        }
    }, {
        key: "toBackgroundImageCSS",
        value: function toBackgroundImageCSS() {
            if (!this.image) return {};
            return {
                'background-image': this.image + ""
            };
        }
    }, {
        key: "toBackgroundPositionCSS",
        value: function toBackgroundPositionCSS() {
            var json = this.json;

            return {
                'background-position': json.x + " " + json.y
            };
        }
    }, {
        key: "toBackgroundSizeCSS",
        value: function toBackgroundSizeCSS() {

            var json = this.json;
            var backgroundSize = 'auto';

            if (json.size == 'contain' || json.size == 'cover') {
                backgroundSize = json.size;
            } else if (json.width.isPercent() && json.width.isPercent()) {
                // 기본 사이즈가 아닌 것만 표시 (100% 100% 이 아닐 때 )
                if (+json.width !== 100 || +json.height !== 100) {
                    backgroundSize = json.width + " " + json.height;
                }
            } else {
                backgroundSize = json.width + " " + json.height;
            }

            return {
                'background-size': backgroundSize
            };
        }
    }, {
        key: "toBackgroundRepeatCSS",
        value: function toBackgroundRepeatCSS() {
            var json = this.json;
            return {
                'background-repeat': json.repeat
            };
        }
    }, {
        key: "toBackgroundBlendCSS",
        value: function toBackgroundBlendCSS() {
            var json = this.json;
            return {
                'background-blend-mode': json.blendMode
            };
        }
    }, {
        key: "toCSS",
        value: function toCSS() {

            var results = _extends({}, this.toBackgroundImageCSS(), this.toBackgroundPositionCSS(), this.toBackgroundSizeCSS(), this.toBackgroundRepeatCSS(), this.toBackgroundBlendCSS());

            return results;
        }
    }, {
        key: "toString",
        value: function toString() {
            return keyMap(this.toCSS(), function (key, value) {
                return key + ": " + value;
            }).join(';');
        }
    }, {
        key: "image",
        get: function get$$1() {
            return this.one({ itemType: 'image-resource' }) || new Gradient();
        }

        //FIXME: why this method is not working 
        ,
        set: function set$$1(imageResource) {
            this.addImageResource(imageResource);
        }
    }], [{
        key: "parse",
        value: function parse(obj) {
            return new BackgroundImage(obj);
        }
    }]);
    return BackgroundImage;
}(Property);

var BoxShadow = function (_Property) {
    inherits(BoxShadow, _Property);

    function BoxShadow() {
        classCallCheck(this, BoxShadow);
        return possibleConstructorReturn(this, (BoxShadow.__proto__ || Object.getPrototypeOf(BoxShadow)).apply(this, arguments));
    }

    createClass(BoxShadow, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(BoxShadow.prototype.__proto__ || Object.getPrototypeOf(BoxShadow.prototype), "getDefaultObject", this).call(this, {
                itemType: 'box-shadow',
                inset: false,
                offsetX: Length$1.px(0),
                offsetY: Length$1.px(0),
                blurRadius: Length$1.px(0),
                spreadRadius: Length$1.px(0),
                color: 'rgba(0, 0, 0, 0)'
            });
        }
    }, {
        key: "toCSS",
        value: function toCSS() {
            return {
                'box-shadow': this.toString()
            };
        }
    }, {
        key: "toString",
        value: function toString() {
            var json = this.json;

            return "" + (json.inset ? 'inset ' : EMPTY_STRING) + json.offsetX + " " + json.offsetY + " " + json.blurRadius + " " + json.spreadRadius + " " + json.color;
        }
    }], [{
        key: "parse",
        value: function parse(obj) {
            return new BoxShadow(obj);
        }
    }]);
    return BoxShadow;
}(Property);

var TextShadow = function (_Property) {
    inherits(TextShadow, _Property);

    function TextShadow() {
        classCallCheck(this, TextShadow);
        return possibleConstructorReturn(this, (TextShadow.__proto__ || Object.getPrototypeOf(TextShadow)).apply(this, arguments));
    }

    createClass(TextShadow, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(TextShadow.prototype.__proto__ || Object.getPrototypeOf(TextShadow.prototype), "getDefaultObject", this).call(this, {
                itemType: 'text-shadow',
                offsetX: Length$1.px(0),
                offsetY: Length$1.px(0),
                blurRadius: Length$1.px(0),
                color: 'rgba(0, 0, 0, 0)'
            });
        }
    }, {
        key: "toCSS",
        value: function toCSS() {
            return {
                'text-shadow': this.toString()
            };
        }
    }, {
        key: "toString",
        value: function toString() {

            var json = this.json;

            return json.offsetX + " " + json.offsetY + " " + json.blurRadius + " " + json.color;
        }
    }], [{
        key: "parse",
        value: function parse(obj) {
            return new TextShadow(obj);
        }
    }]);
    return TextShadow;
}(Property);

var Display = function (_Property) {
    inherits(Display, _Property);

    function Display() {
        classCallCheck(this, Display);
        return possibleConstructorReturn(this, (Display.__proto__ || Object.getPrototypeOf(Display)).apply(this, arguments));
    }

    createClass(Display, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(Display.prototype.__proto__ || Object.getPrototypeOf(Display.prototype), 'getDefaultObject', this).call(this, _extends({
                itemType: 'display' }, obj));
        }
    }, {
        key: 'toCSS',
        value: function toCSS() {
            return {
                'display': this.json.display
            };
        }
    }]);
    return Display;
}(Property);

var InlineDisplay = function (_Display) {
    inherits(InlineDisplay, _Display);

    function InlineDisplay() {
        classCallCheck(this, InlineDisplay);
        return possibleConstructorReturn(this, (InlineDisplay.__proto__ || Object.getPrototypeOf(InlineDisplay)).apply(this, arguments));
    }

    createClass(InlineDisplay, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(InlineDisplay.prototype.__proto__ || Object.getPrototypeOf(InlineDisplay.prototype), 'getDefaultObject', this).call(this, {
                type: 'inline',
                display: 'inline'
            });
        }
    }]);
    return InlineDisplay;
}(Display);

var InlineBlockDisplay = function (_Display2) {
    inherits(InlineBlockDisplay, _Display2);

    function InlineBlockDisplay() {
        classCallCheck(this, InlineBlockDisplay);
        return possibleConstructorReturn(this, (InlineBlockDisplay.__proto__ || Object.getPrototypeOf(InlineBlockDisplay)).apply(this, arguments));
    }

    createClass(InlineBlockDisplay, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(InlineBlockDisplay.prototype.__proto__ || Object.getPrototypeOf(InlineBlockDisplay.prototype), 'getDefaultObject', this).call(this, {
                type: 'inline-block',
                display: 'inline-block'
            });
        }
    }]);
    return InlineBlockDisplay;
}(Display);

var BlockDisplay = function (_Display3) {
    inherits(BlockDisplay, _Display3);

    function BlockDisplay() {
        classCallCheck(this, BlockDisplay);
        return possibleConstructorReturn(this, (BlockDisplay.__proto__ || Object.getPrototypeOf(BlockDisplay)).apply(this, arguments));
    }

    createClass(BlockDisplay, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(BlockDisplay.prototype.__proto__ || Object.getPrototypeOf(BlockDisplay.prototype), 'getDefaultObject', this).call(this, {
                type: 'block',
                display: 'block'
            });
        }
    }]);
    return BlockDisplay;
}(Display);

var FlexDisplay = function (_Display4) {
    inherits(FlexDisplay, _Display4);

    function FlexDisplay() {
        classCallCheck(this, FlexDisplay);
        return possibleConstructorReturn(this, (FlexDisplay.__proto__ || Object.getPrototypeOf(FlexDisplay)).apply(this, arguments));
    }

    createClass(FlexDisplay, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(FlexDisplay.prototype.__proto__ || Object.getPrototypeOf(FlexDisplay.prototype), 'getDefaultObject', this).call(this, {
                type: 'flex',
                display: 'flex',

                // refer to https://developer.mozilla.org/docs/Web/CSS/flex-direction            
                direction: 'row',

                // refer to https://developer.mozilla.org/docs/Web/CSS/align-items
                alignItems: 'normal',

                // refer to https://developer.mozilla.org/docs/Web/CSS/align-content
                alignCentent: 'normal',

                // refer to https://developer.mozilla.org/docs/Web/CSS/flex-wrap
                wrap: 'nowrap',

                justifyContent: 'flex-start'
            });
        }
    }, {
        key: 'toCSS',
        value: function toCSS() {
            var json = this.json;
            var css = {
                display: 'flex'
            };

            if (json.direction != 'row') {
                css['flex-direction'] = json.direction;
            }

            if (json.alignItems != 'normal') {
                css['align-items'] = json.alignItems;
            }

            if (json.alignContent != 'normal') {
                css['align-content'] = json.alignContent;
            }

            if (json.wrap != 'nowrap') {
                css['flex-wrap'] = json.wrap;
            }

            if (json.justifyContent != 'flex-start') {
                css['justify-content'] = json.justifyContent;
            }

            return css;
        }
    }]);
    return FlexDisplay;
}(Display);

var GridDisplay = function (_Display5) {
    inherits(GridDisplay, _Display5);

    function GridDisplay() {
        classCallCheck(this, GridDisplay);
        return possibleConstructorReturn(this, (GridDisplay.__proto__ || Object.getPrototypeOf(GridDisplay)).apply(this, arguments));
    }

    createClass(GridDisplay, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(GridDisplay.prototype.__proto__ || Object.getPrototypeOf(GridDisplay.prototype), 'getDefaultObject', this).call(this, {
                type: 'grid',
                display: 'grid'
            });
        }
    }]);
    return GridDisplay;
}(Display);

var DisplayClassName = {
    'inline': InlineDisplay,
    'inline-block': InlineBlockDisplay,
    'block': BlockDisplay,
    'flex': FlexDisplay,
    'grid': GridDisplay
};

Display.parse = function (obj) {
    var DisplayClass = DisplayClassName[obj.type];

    return new DisplayClass(obj);
};

var BLEND_LIST = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];

var Layer = function (_Item) {
    inherits(Layer, _Item);

    function Layer() {
        classCallCheck(this, Layer);
        return possibleConstructorReturn(this, (Layer.__proto__ || Object.getPrototypeOf(Layer)).apply(this, arguments));
    }

    createClass(Layer, [{
        key: "getDefaultTitle",
        value: function getDefaultTitle() {
            return 'Layer';
        }
    }, {
        key: "isLayoutItem",
        value: function isLayoutItem() {
            var parent = this.parent();

            return parent.itemType == 'layer';
        }
    }, {
        key: "add",
        value: function add(layer) {
            if (layer.itemType == 'layer') {
                return get$1(Layer.prototype.__proto__ || Object.getPrototypeOf(Layer.prototype), "add", this).call(this, layer);
            } else {
                throw new Error('layer 객체입니다.');
            }
        }
    }, {
        key: "addBackgroundImage",
        value: function addBackgroundImage(item) {
            this.json.backgroundImages.push(item);
            return item;
        }
    }, {
        key: "addFilter",
        value: function addFilter(item) {
            this.json.filters.push(item);
            return item;
        }
    }, {
        key: "addBackdropFilter",
        value: function addBackdropFilter(item) {
            this.json.backdropFilters.push(item);
            return item;
        }
    }, {
        key: "addBoxShadow",
        value: function addBoxShadow(item) {
            this.json.boxShadows.push(item);
            return item;
        }
    }, {
        key: "addTextShadow",
        value: function addTextShadow(item) {
            this.json.textShadows.push(item);
            return item;
        }
    }, {
        key: "convert",
        value: function convert(json) {
            json = get$1(Layer.prototype.__proto__ || Object.getPrototypeOf(Layer.prototype), "convert", this).call(this, json);

            json.x = Length$1.parse(json.x);
            json.y = Length$1.parse(json.y);
            json.width = Length$1.parse(json.width);
            json.height = Length$1.parse(json.height);

            if (json.clippath) json.clippath = ClipPath$2.parse(json.clippath);
            if (json.display) json.display = Display.parse(json.display);

            json.filters = json.filters.map(function (f) {
                return Filter.parse(f);
            });
            json.backdropFilters = json.backdropFilters.map(function (f) {
                return BackdropFilter.parse(f);
            });
            json.backgroundImages = json.backgroundImages.map(function (f) {
                return BackgroundImage.parse(f);
            });
            json.boxShadows = json.boxShadows.map(function (f) {
                return BoxShadow.parse(f);
            });
            json.textShadows = json.textShadows.map(function (f) {
                return TextShadow.parse(f);
            });

            return json;
        }
    }, {
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(Layer.prototype.__proto__ || Object.getPrototypeOf(Layer.prototype), "getDefaultObject", this).call(this, _extends({
                itemType: 'layer',
                width: Length$1.px(400),
                height: Length$1.px(300),
                backgroundColor: 'rgba(222, 222, 222, 1)',
                position: 'absolute',
                x: Length$1.px(0),
                y: Length$1.px(0),
                rotate: 0,
                filters: [],
                backdropFilters: [],
                backgroundImages: [],
                boxShadows: [],
                textShadows: [],
                clippath: new NoneClipPath(),
                display: new BlockDisplay()
            }, obj));
        }
    }, {
        key: "checkField",
        value: function checkField(key, value) {
            if (key === 'parentId') {
                this.json.parentPosition = this.getParentPosition(value).id;
            }
            return true;
        }
    }, {
        key: "getArtBoard",
        value: function getArtBoard() {
            return this.path().filter(function (it) {
                return it.itemType == 'artboard';
            })[0];
        }
    }, {
        key: "getParentPosition",
        value: function getParentPosition(parentId) {
            var path = this.path(parentId);

            return path.filter(function (it) {
                if (it.itemType == 'layer') {
                    if (it.display.type == 'block') return true;else if (it.display.type == 'inline-block') return true;
                } else if (it.itemType == 'artboard') {
                    return true;
                }

                return false;
            })[0];
        }
    }, {
        key: "parentDirectory",
        value: function parentDirectory() {
            var path = this.path();

            return path.filter(function (it) {
                if (it.itemType == 'directory') {
                    return true;
                } else if (it.itemType == 'artboard') {
                    return true;
                }

                return false;
            })[0];
        }
    }, {
        key: "toString",
        value: function toString() {
            return CSS_TO_STRING(this.toCSS());
        }
    }, {
        key: "toBoundString",
        value: function toBoundString() {
            return CSS_TO_STRING(this.toCSS(true));
        }
    }, {
        key: "toClipPathCSS",
        value: function toClipPathCSS() {
            return this.json.clippath.toCSS();
        }
    }, {
        key: "toDisplayCSS",
        value: function toDisplayCSS() {
            return this.json.display.toCSS();
        }
    }, {
        key: "toPropertyCSS",
        value: function toPropertyCSS(list) {
            var results = {};
            list.forEach(function (item) {
                keyEach(item.toCSS(), function (key, value) {
                    if (!results[key]) results[key] = [];
                    results[key].push(value);
                });
            });

            return combineKeyArray(results);
        }
    }, {
        key: "toBackgroundImageCSS",
        value: function toBackgroundImageCSS() {
            return this.toPropertyCSS(this.backgroundImages);
        }
    }, {
        key: "toBoxShadowCSS",
        value: function toBoxShadowCSS() {
            return this.toPropertyCSS(this.boxShadows);
        }
    }, {
        key: "toTextShadowCSS",
        value: function toTextShadowCSS() {
            return this.toPropertyCSS(this.textShadows);
        }
    }, {
        key: "toFilterCSS",
        value: function toFilterCSS() {
            return this.toPropertyCSS(this.filters);
        }
    }, {
        key: "toBackdropFilterCSS",
        value: function toBackdropFilterCSS() {
            return this.toPropertyCSS(this.backdropFilters);
        }
    }, {
        key: "toFontCSS",
        value: function toFontCSS() {
            var results = {};
            var json = this.json;

            if (json.color) {
                results['color'] = json.color;
            }

            if (json.fontSize) {
                results['font-size'] = json.fontSize;
            }

            if (json.fontFamily) {
                results['font-family'] = json.fontFamily;
            }

            if (json.fontWeight) {
                results['font-weight'] = json.fontWeight;
            }

            if (json.lineHeight) {
                results['line-height'] = json.lineHeight;
            }

            results['word-wrap'] = json.wordWrap || 'break-word';
            results['word-break'] = json.wordBreak || 'break-word';

            if (json.clipText) {
                results['color'] = 'transparent';
                results['background-clip'] = 'text';
                results['-webkit-background-clip'] = 'text';
            }

            return results;
        }
    }, {
        key: "toBorderRadiusCSS",
        value: function toBorderRadiusCSS() {
            var json = this.json;
            var css = {};
            if (json.fixedRadius) {
                css['border-radius'] = json.borderRadius;
            } else {
                if (json.borderTopLeftRadius) css['border-top-left-radius'] = json.borderTopLeftRadius;
                if (json.borderTopRightRadius) css['border-top-right-radius'] = json.borderTopRightRadius;
                if (json.borderBottomLeftRadius) css['border-bottom-left-radius'] = json.borderBottomLeftRadius;
                if (json.borderBottomRightRadius) css['border-bottom-right-radius'] = json.borderBottomRightRadius;
            }

            return css;
        }
    }, {
        key: "toBorderColorCSS",
        value: function toBorderColorCSS() {
            var json = this.json;
            var css = {};

            if (json.borderColor) {
                css['border-color'] = json.borderColor;
            } else {
                if (json.borderTopColor) css['border-top-color'] = json.borderTopColor;
                if (json.borderRightColor) css['border-right-color'] = json.borderRightColor;
                if (json.borderBottomColor) css['border-bottom-color'] = json.borderBottomColor;
                if (json.borderLeftColor) css['border-left-color'] = json.borderLeftColor;
            }

            return css;
        }
    }, {
        key: "toBorderStyleCSS",
        value: function toBorderStyleCSS() {
            var json = this.json;
            var css = {};

            if (json.borderStyle) css['border-style'] = json.borderStyle;
            if (json.borderTopStyle) css['border-top-style'] = json.borderTopStyle;
            if (json.borderRightStyle) css['border-right-style'] = json.borderRightStyle;
            if (json.borderBottomStyle) css['border-bottom-style'] = json.borderBottomStyle;
            if (json.borderLeftStyle) css['border-left-style'] = json.borderLeftStyle;

            return css;
        }
    }, {
        key: "toBorderWidthCSS",
        value: function toBorderWidthCSS() {
            var json = this.json;
            var css = {};

            if (json.fixedBorderWidth) {
                css['border-width'] = json.borderWidth;
                css['border-style'] = 'solid';
            } else {

                if (json.borderTopWidth) {
                    css['border-top-width'] = json.borderTopWidth;
                    css['border-top-style'] = 'solid';
                }

                if (json.borderRightWidth) {
                    css['border-right-width'] = json.borderRightWidth;
                    css['border-right-style'] = 'solid';
                }

                if (json.borderLeftWidth) {
                    css['border-left-width'] = json.borderLeftWidth;
                    css['border-left-style'] = 'solid';
                }

                if (json.borderBottomWidth) {
                    css['border-bottom-width'] = json.borderBottomWidth;
                    css['border-bottom-style'] = 'solid';
                }
            }

            return css;
        }
    }, {
        key: "toTransformCSS",
        value: function toTransformCSS() {

            var json = this.json;
            var results = [];

            if (json.perspective) {
                results.push("perspective(" + json.perspective + "px)");
            }

            if (json.rotate) {
                results.push("rotate(" + json.rotate + "deg)");
            }

            if (json.skewX) {
                results.push("skewX(" + json.skewX + "deg)");
            }

            if (json.skewY) {
                results.push("skewY(" + json.skewY + "deg)");
            }

            if (json.scale) {
                results.push("scale(" + json.scale + ")");
            }

            if (json.translateX) {
                results.push("translateX(" + json.translateX + "px)");
            }

            if (json.translateY) {
                results.push("translateY(" + json.translateY + "px)");
            }

            if (json.translateZ) {
                results.push("translateZ(" + json.translateZ + "px)");
            }

            if (json.rotateX) {
                results.push("rotateX(" + json.rotateX + "deg)");
            }

            if (json.rotateY) {
                results.push("rotateY(" + json.rotateY + "deg)");
            }

            if (json.rotateZ) {
                results.push("rotateZ(" + json.rotateZ + "deg)");
            }

            if (json.scaleX) {
                results.push("scaleX(" + json.scaleX + ")");
            }

            if (json.scaleY) {
                results.push("scaleY(" + json.scaleY + ")");
            }

            if (json.scaleZ) {
                results.push("scaleZ(" + json.scaleZ + ")");
            }

            return {
                transform: results.length ? results.join(WHITE_STRING) : 'none'
            };
        }
    }, {
        key: "toDefaultCSS",
        value: function toDefaultCSS(isBound) {
            var css = _extends({}, this.toBoundCSS(isBound));
            var json = this.json;

            css['box-sizing'] = json.boxSizing || 'border-box';
            css['visibility'] = json.visible ? 'visible' : 'hidden';
            css.position = json.position;
            if (json.backgroundColor) {
                css['background-color'] = json.backgroundColor;
            }

            if (json.mixBlendMode) {
                css['mix-blend-mode'] = json.mixBlendMode || "normal";
            }

            if (json.backgroundClip && !json.clipText) {
                css['background-clip'] = json.backgroundClip || "";
                css['-webkit-background-clip'] = json.backgroundClip || "";
            }

            if (json.opacity) {
                css['opacity'] = json.opacity;
            }

            return css;
        }
    }, {
        key: "toBoundCSS",
        value: function toBoundCSS() {
            var isBound = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            var json = this.json;

            // isBound 가 true 이고  상위 
            var isBoundRect = isBound && this.parent().itemType != 'layer';

            return {
                left: isBoundRect === false ? json.x : this.screenX,
                top: isBoundRect === false ? json.y : this.screenY,
                width: json.width,
                height: json.height
            };
        }
    }, {
        key: "toCSS",
        value: function toCSS() {
            var isBound = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


            var results = _extends({}, this.toDefaultCSS(isBound), this.toBorderWidthCSS(), this.toBorderRadiusCSS(), this.toBorderColorCSS(), this.toBorderStyleCSS(), this.toTransformCSS(), this.toDisplayCSS(), this.toClipPathCSS(), this.toFilterCSS(), this.toBackdropFilterCSS(), this.toFontCSS(), this.toBoxShadowCSS(), this.toTextShadowCSS(), this.toBackgroundImageCSS());

            return CSS_FILTERING(cleanObject(results));
        }
    }, {
        key: "texts",
        get: function get$$1() {
            return this.search({ itemType: 'layer', type: 'text' });
        }
    }, {
        key: "images",
        get: function get$$1() {
            return this.search({ itemType: 'layer', type: 'image' });
        }
    }, {
        key: "filters",
        get: function get$$1() {
            return this.json.filters;
        }
    }, {
        key: "backdropFilters",
        get: function get$$1() {
            return this.json.backdropFilters;
        }
    }, {
        key: "backgroundImages",
        get: function get$$1() {
            return this.json.backgroundImages;
        }
    }, {
        key: "boxShadows",
        get: function get$$1() {
            return this.json.boxShadows;
        }
    }, {
        key: "textShadows",
        get: function get$$1() {
            return this.json.textShadows;
        }
    }, {
        key: "screenX",
        get: function get$$1() {
            return Length$1.px(editor$1.get(this.json.parentPosition).screenX.value + this.json.x.value);
        }
    }, {
        key: "screenY",
        get: function get$$1() {
            return Length$1.px(editor$1.get(this.json.parentPosition).screenY.value + this.json.y.value);
        }
    }]);
    return Layer;
}(Item);

var _templateObject$4 = taggedTemplateLiteral(['\n        <div class=\'property-item blend show\'>\n            <div class=\'items max-height\'>         \n                <div>\n                    <label>Blend</label>\n                    <div class=\'size-list full-size\' ref="$size">\n                        <select ref="$blend">\n                        ', '\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </div>\n        '], ['\n        <div class=\'property-item blend show\'>\n            <div class=\'items max-height\'>         \n                <div>\n                    <label>Blend</label>\n                    <div class=\'size-list full-size\' ref="$size">\n                        <select ref="$blend">\n                        ', '\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ']);

var BackgroundBlend = function (_BasePropertyItem) {
    inherits(BackgroundBlend, _BasePropertyItem);

    function BackgroundBlend() {
        classCallCheck(this, BackgroundBlend);
        return possibleConstructorReturn(this, (BackgroundBlend.__proto__ || Object.getPrototypeOf(BackgroundBlend)).apply(this, arguments));
    }

    createClass(BackgroundBlend, [{
        key: 'template',
        value: function template() {
            return html(_templateObject$4, BLEND_LIST.map(function (blend) {
                return '<option value="' + blend + '">' + blend + '</option>';
            }));
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return editor$1.selection.backgroundImage;
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                this.refs.$blend.val(image.blendMode);
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: CHANGE('$blend'),
        value: function value(e) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.blendMode = this.refs.$blend.val();
                editor$1.send(CHANGE_IMAGE, image);
            }
        }
    }]);
    return BackgroundBlend;
}(BasePropertyItem);

var _templateObject$5 = taggedTemplateLiteral(['\n        <div class=\'property-item blend show\'>\n            <div class=\'items max-height\'>         \n                <div>\n                    <label>Blend</label>\n                    <div class=\'size-list full-size\' ref="$size">\n                        <select ref="$blend">\n                        ', '\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </div>\n        '], ['\n        <div class=\'property-item blend show\'>\n            <div class=\'items max-height\'>         \n                <div>\n                    <label>Blend</label>\n                    <div class=\'size-list full-size\' ref="$size">\n                        <select ref="$blend">\n                        ', '\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ']);

var LayerBlend = function (_BasePropertyItem) {
    inherits(LayerBlend, _BasePropertyItem);

    function LayerBlend() {
        classCallCheck(this, LayerBlend);
        return possibleConstructorReturn(this, (LayerBlend.__proto__ || Object.getPrototypeOf(LayerBlend)).apply(this, arguments));
    }

    createClass(LayerBlend, [{
        key: 'template',
        value: function template() {
            return html(_templateObject$5, BLEND_LIST.map(function (blend) {
                return '<option value="' + blend + '">' + blend + '</option>';
            }));
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return editor$1.selection.layer;
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                this.refs.$blend.val(layer.mixBlendMode);
            }
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: CHANGE('$blend'),
        value: function value(e) {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.mixBlendMode = this.refs.$blend.val();
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }]);
    return LayerBlend;
}(BasePropertyItem);

var Rotate = function (_BasePropertyItem) {
    inherits(Rotate, _BasePropertyItem);

    function Rotate() {
        classCallCheck(this, Rotate);
        return possibleConstructorReturn(this, (Rotate.__proto__ || Object.getPrototypeOf(Rotate)).apply(this, arguments));
    }

    createClass(Rotate, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item rotate show'>\n                <div class='items'>            \n                    <div>\n                        <label>Rotate</label>\n                        <div>\n                            <input type='range' ref=\"$rotateRange\" min=\"-360\" max=\"360\" step=\"0.1\">\n                            <input type='number' class='middle' ref=\"$rotate\" min=\"-360\" max=\"360\" step=\"0.1\"> <span>\xB0</span>\n                        </div>\n                    </div>                                                                           \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                this.refs.$rotateRange.val(layer.rotate || "0");
                this.refs.$rotate.val(layer.rotate || "0");
            }
        }
    }, {
        key: "updateTransform",
        value: function updateTransform(type) {
            var layer = editor$1.selection.layer;
            if (layer) {
                if (type == 'rotate') {
                    layer.rotate = this.refs.$rotate;
                    this.refs.$rotateRange.val(layer.rotate);
                } else if (type == 'range') {
                    layer.rotate = this.refs.$rotateRange;
                    this.refs.$rotate.val(layer.rotate);
                }
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: INPUT('$rotateRange'),
        value: function value() {
            this.updateTransform('range');
        }
    }, {
        key: INPUT('$rotate'),
        value: function value() {
            this.updateTransform('rotate');
        }
    }]);
    return Rotate;
}(BasePropertyItem);

var RadiusFixed = function (_BasePropertyItem) {
    inherits(RadiusFixed, _BasePropertyItem);

    function RadiusFixed() {
        classCallCheck(this, RadiusFixed);
        return possibleConstructorReturn(this, (RadiusFixed.__proto__ || Object.getPrototypeOf(RadiusFixed)).apply(this, arguments));
    }

    createClass(RadiusFixed, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item fixed-radius'>\n                <div class='items'>            \n                    <div>\n                        <label > <button type=\"button\" ref=\"$radiusLabel\">*</button> Radius</label>\n                        <div>\n                            <input type='range' ref=\"$radiusRange\" min=\"0\" max=\"360\">\n                            <input type='number' class='middle' ref=\"$radius\" min=\"0\" max=\"360\"> <span>px</span>\n                        </div>\n                    </div>                                                                           \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggleClass('show', isShow);

            if (isShow) {

                var layer = editor$1.selection.layer;
                if (layer) {
                    var radius = defaultValue(layer.borderRadius, Length$1.px(0));
                    this.refs.$radiusRange.val(radius.value);
                    this.refs.$radius.val(radius.value);
                }
            }
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var layer = editor$1.selection.layer;

            if (!layer) return false;
            if (layer.type == 'circle') return false;

            return true;
        }
    }, {
        key: "updateTransform",
        value: function updateTransform(type) {
            var layer = editor$1.selection.layer;
            if (layer) {

                if (type == 'radius') {
                    var borderRadiusValue = this.refs.$radius.val();
                    layer.reset({
                        fixedRadius: true,
                        borderRadius: Length$1.px(borderRadiusValue)
                    });
                    editor$1.send(CHANGE_LAYER, layer);
                    this.refs.$radiusRange.val(borderRadiusValue);
                } else if (type == 'range') {
                    var borderRadiusValue = this.refs.$radiusRange.val();
                    layer.reset({
                        fixedRadius: true,
                        borderRadius: Length$1.px(borderRadiusValue)
                    });
                    editor$1.send(CHANGE_LAYER, layer);
                    this.refs.$radius.val(borderRadiusValue);
                }
            }
        }
    }, {
        key: INPUT('$radiusRange'),
        value: function value() {
            this.updateTransform('range');
        }
    }, {
        key: INPUT('$radius'),
        value: function value() {
            this.updateTransform('radius');
        }
    }, {
        key: CLICK('$radiusLabel'),
        value: function value() {
            this.emit('toggleRadius');
        }
    }]);
    return RadiusFixed;
}(BasePropertyItem);

var Opacity = function (_BasePropertyItem) {
    inherits(Opacity, _BasePropertyItem);

    function Opacity() {
        classCallCheck(this, Opacity);
        return possibleConstructorReturn(this, (Opacity.__proto__ || Object.getPrototypeOf(Opacity)).apply(this, arguments));
    }

    createClass(Opacity, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item opacity show'>\n                <div class='items'>            \n                    <div>\n                        <label>Opacity</label>\n                        <div>\n                            <input type='range' ref=\"$opacityRange\" min=\"0\" max=\"1\" step=\"0.01\">\n                            <input type='number' class='middle' ref=\"$opacity\" min=\"0\" max=\"1\" step=\"0.01\">\n                        </div>\n                    </div>                                                                           \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                this.refs.$opacityRange.val(layer.opacity || "1");
                this.refs.$opacity.val(layer.opacity || "1");
            }
        }
    }, {
        key: "updateTransform",
        value: function updateTransform(type) {
            var layer = editor$1.selection.layer;
            if (layer) {
                if (type == 'opacity') {
                    var opacity = this.refs.$opacity.val();
                    this.refs.$opacityRange.val(opacity);
                } else if (type == 'range') {
                    var opacity = this.refs.$opacityRange.val();
                    this.refs.$opacity.val(opacity);
                }
                layer.opacity = opacity;
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: INPUT('$opacityRange'),
        value: function value() {
            this.updateTransform('range');
        }
    }, {
        key: INPUT('$opacity'),
        value: function value() {
            this.updateTransform('opacity');
        }
    }]);
    return Opacity;
}(BasePropertyItem);

var _templateObject$6 = taggedTemplateLiteral(["\n            <div class='property-item clip-path-side show'>\n                <div class='items'>            \n                    <div>\n                        <label>Side</label>\n                        <div class='full-size'>\n                            <select ref=\"$clipSideType\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>                                                    \n                </div>\n            </div>\n        "], ["\n            <div class='property-item clip-path-side show'>\n                <div class='items'>            \n                    <div>\n                        <label>Side</label>\n                        <div class='full-size'>\n                            <select ref=\"$clipSideType\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>                                                    \n                </div>\n            </div>\n        "]);

var CLIP_PATH_SIDE_TYPES = [CLIP_PATH_SIDE_TYPE_NONE, CLIP_PATH_SIDE_TYPE_CLOSEST, CLIP_PATH_SIDE_TYPE_FARTHEST];

var ClipPathSide = function (_BasePropertyItem) {
    inherits(ClipPathSide, _BasePropertyItem);

    function ClipPathSide() {
        classCallCheck(this, ClipPathSide);
        return possibleConstructorReturn(this, (ClipPathSide.__proto__ || Object.getPrototypeOf(ClipPathSide)).apply(this, arguments));
    }

    createClass(ClipPathSide, [{
        key: "template",
        value: function template() {
            return html(_templateObject$6, CLIP_PATH_SIDE_TYPES.map(function (type) {
                return "<option value=\"" + type + "\">" + type + "</option>";
            }));
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            var isShow = this.isShow();

            if (isShow) {
                var layer = editor$1.selection.currentLayer;
                if (layer) {
                    this.refs.$clipSideType.val(layer.clippath.sideType || 'none');
                }
            }
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var item = editor$1.selection.currentLayer;
            if (!item) return false;

            var clippath = item.clippath;
            if (!clippath) return false;

            if (clippath.isCircle()) return true;
            if (clippath.isEllipse()) return true;

            return false;
        }
    }, {
        key: EVENT('toggleClipPathSideType'),
        value: function value$$1() {
            this.$el.toggleClass('show');
        }
    }, {
        key: CHANGE('$clipSideType'),
        value: function value$$1() {

            var layer = editor$1.selection.layer;
            if (layer) {
                var clippath = layer.clippath;
                if (clippath) {
                    clippath.sideType = this.refs.$clipSideType.val();
                }
                editor$1.send(CHANGE_LAYER);
            }
        }
    }]);
    return ClipPathSide;
}(BasePropertyItem);

var _templateObject$7 = taggedTemplateLiteral(["\n            <div class='property-item clip-path-polygon'>\n                <div class=\"items\">\n                    <div>\n                        Click panel with alt if you want to add point\n                    </div>\n                    <div>\n                        Click drag item with alt if you want to delete point\n                    </div>                    \n                </div>\n                <div class='items' ref='$sampleList'>\uC0D8\uD50C \uB9AC\uC2A4\uD2B8 \uAD6C\uD604\uD574\uC8FC\uC138\uC694.</div> \n                <div class='items' ref='$polygonList'></div>\n            </div>\n        "], ["\n            <div class='property-item clip-path-polygon'>\n                <div class=\"items\">\n                    <div>\n                        Click panel with alt if you want to add point\n                    </div>\n                    <div>\n                        Click drag item with alt if you want to delete point\n                    </div>                    \n                </div>\n                <div class='items' ref='$sampleList'>\uC0D8\uD50C \uB9AC\uC2A4\uD2B8 \uAD6C\uD604\uD574\uC8FC\uC138\uC694.</div> \n                <div class='items' ref='$polygonList'></div>\n            </div>\n        "]);

var ClipPathPolygon = function (_BasePropertyItem) {
    inherits(ClipPathPolygon, _BasePropertyItem);

    function ClipPathPolygon() {
        classCallCheck(this, ClipPathPolygon);
        return possibleConstructorReturn(this, (ClipPathPolygon.__proto__ || Object.getPrototypeOf(ClipPathPolygon)).apply(this, arguments));
    }

    createClass(ClipPathPolygon, [{
        key: "template",
        value: function template() {
            return html(_templateObject$7);
        }
    }, {
        key: LOAD('$polygonList'),
        value: function value$$1() {
            var layer = editor$1.selection.currentLayer;
            if (!layer) return EMPTY_STRING;

            var clippath = layer.clippath;
            if (!clippath) return EMPTY_STRING;

            if (!clippath.isPolygon()) return EMPTY_STRING;

            var points = clippath.points;
            if (!points.length) return EMPTY_STRING;

            var startIndex = 0;
            var lastIndex = points.length - 1;

            return points.map(function (p, index) {

                var start = index == startIndex ? 'start' : EMPTY_STRING;
                var end = index == lastIndex ? 'end' : EMPTY_STRING;

                return "\n                <div class=\"polygon-item " + start + " " + end + "\" data-index=\"" + index + "\" >\n                    <div class='area'></div>\n                    <label>X</label>\n                    <div>\n                        <input type=\"number\" data-index=\"" + index + "\" data-key='x' value=\"" + +p.x + "\" />\n                        " + p.x.getUnitName() + "\n                    </div>\n                    <label>Y</label>\n                    <div>\n                        <input type=\"number\" data-index=\"" + index + "\" data-key='y' value=\"" + +p.y + "\" />\n                        " + p.y.getUnitName() + "\n                    </div>\n                    <div class='tools'>\n                        <button type=\"button\" data-key='delete' data-index=\"" + index + "\">&times;</button>\n                        <button type=\"button\" data-key='copy' data-index=\"" + index + "\">+</button>\n                    </div>\n                </div>\n            ";
            });
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggleClass('show', isShow);

            if (isShow) {

                this.load();
            }
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var item = editor$1.selection.currentLayer;

            if (!item) return false;

            return item.clippath && item.clippath.isPolygon();
        }
    }, {
        key: EVENT('toggleClipPathPolygon'),
        value: function value$$1(isShow) {

            if (isUndefined$1(isShow)) {
                this.$el.toggleClass('show');
            } else {
                this.$el.toggleClass('show', isShow);
            }
        }
    }, {
        key: CLICK('$polygonList button[data-key]'),
        value: function value$$1(e) {
            var $item = e.$delegateTarget;
            var polygonIndex = +$item.attr('data-index');
            var key = $item.attr('data-key');
            if (key == 'delete') {

                var layer = editor$1.selection.currentLayer;
                if (layer) {
                    var clippath = layer.clippath;
                    if (clippath) {
                        clippath.removePoint(polygonIndex);
                        editor$1.send(CHANGE_LAYER, layer);
                    }
                }
            } else if (key == 'copy') {
                var layer = editor$1.selection.currentLayer;
                if (layer) {
                    var clippath = layer.clippath;
                    if (clippath) {
                        clippath.copyPoint(polygonIndex);
                        editor$1.send(CHANGE_LAYER, layer);
                    }
                }
            }
        }
    }, {
        key: CHANGEINPUT('$polygonList input[type=number]'),
        value: function value$$1(e) {
            var $item = e.$delegateTarget;

            var polygonIndex = +$item.attr('data-index');
            var key = $item.attr('data-key');
            var value$$1 = +$item.val();

            var layer = editor$1.selection.currentLayer;
            if (layer) {
                var clippath = layer.clippath;

                if (clippath) {
                    clippath.updatePoint(polygonIndex, key, Length.percent(value$$1));
                    editor$1.send(CHANGE_LAYER, layer);
                }
            }
        }
    }, {
        key: CLICK('$sampleList .clip-path-item'),
        value: function value$$1(e) {
            alert('샘플 데이타 변경 하느거 구현해주세요.');
        }
    }]);
    return ClipPathPolygon;
}(BasePropertyItem);

var BoxShadow$1 = function (_BasePropertyItem) {
    inherits(BoxShadow, _BasePropertyItem);

    function BoxShadow() {
        classCallCheck(this, BoxShadow);
        return possibleConstructorReturn(this, (BoxShadow.__proto__ || Object.getPrototypeOf(BoxShadow)).apply(this, arguments));
    }

    createClass(BoxShadow, [{
        key: 'template',
        value: function template() {
            return '\n        <div class=\'property-item box-shadow show\'>\n            <div class=\'items\'>         \n                <div class="box-shadow-list" ref="$boxShadowList"></div>\n            </div>\n        </div>\n        ';
        }
    }, {
        key: 'makeItemNodeBoxShadow',
        value: function makeItemNodeBoxShadow(item) {

            var offsetX = unitValue(item.offsetX);
            var offsetY = unitValue(item.offsetY);
            var blurRadius = unitValue(item.blurRadius);
            var spreadRadius = unitValue(item.spreadRadius);

            var checked = this.read(SELECTION_CHECK, item.id) ? 'checked' : EMPTY_STRING;

            return '\n            <div class=\'box-shadow-item ' + checked + '\' box-shadow-id="' + item.id + '">  \n                <div>\n                    <label>Color</label>\n                    <div class=\'value-field\'>\n                        <div class="color" style="background-color: ' + item.color + ';"></div>\n                        <button type="button" class=\'delete-boxshadow\'>&times;</button>   \n                    </div>                                          \n                </div>                            \n                <div>\n                    <label>Type</label>\n                    <div class="select">\n                        <label><input type="radio" name="' + item.id + '"  ' + (item.inset === false ? 'checked="checked"' : EMPTY_STRING) + ' value="false" /> Outset</label>\n                        <label><input type="radio" name="' + item.id + '" ' + (item.inset ? 'checked="checked"' : EMPTY_STRING) + ' value="true" /> Inset</label>\n                    </div> \n                </div>\n\n                <div>\n                    <label>X offset</label>\n                    <div class="input">\n                        <input type="number" min="-100" max="100" data-type=\'offsetX\' value="' + offsetX + '" />\n                    </div>\n                </div>\n                <div>\n                    <label>Y Offset</label>                \n                    <div class="input">\n                        <input type="number" min="-100" max="100" data-type=\'offsetY\' value="' + offsetY + '" />\n                    </div>\n                </div>\n                <div class=\'empty\'></div>\n                <div>\n                    <label>Blur Radius</label>                \n                    <div class="input">\n                        <input type="number" min="0" max="100" data-type=\'blurRadius\' value="' + blurRadius + '" />                    \n                        <input type="range" min="0" max="100" data-type=\'blurRadiusRange\' value="' + blurRadius + '" />\n                    </div>\n                </div>\n                <div>\n                    <label>Spread Radius</label>                \n                    <div class="input">\n                        <input type="number" min="0" max="100" data-type=\'spreadRadius\' value="' + spreadRadius + '" />                    \n                        <input type="range" min="0" max="100" data-type=\'spreadRadiusRange\' value="' + spreadRadius + '" />\n                    </div>  \n                </div>\n                <div class=\'drag-area\'><div class=\'drag-pointer\' style=\'left: ' + (offsetX + 40) + 'px; top: ' + (offsetY + 40) + 'px;\'></div></div>\n            </div>\n        ';
        }
    }, {
        key: LOAD('$boxShadowList'),
        value: function value$$1() {
            var _this2 = this;

            var item = editor$1.selection.currentLayer;
            if (!item) {
                return EMPTY_STRING;
            }

            var results = item.boxShadows.map(function (item) {
                return _this2.makeItemNodeBoxShadow(item);
            });

            return results;
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return true;
            // return this.read(SELECTION_IS_LAYER); 
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggle(isShow);

            if (isShow) {
                this.load();
            }
        }
    }, {
        key: 'getBoxShadowId',
        value: function getBoxShadowId($el) {
            return $el.closest('box-shadow-item').attr('box-shadow-id');
        }
    }, {
        key: EVENT(CHANGE_BOXSHADOW),
        value: function value$$1(newValue) {
            this.refreshBoxShadow(newValue);
        }
    }, {
        key: 'refreshBoxShadow',
        value: function refreshBoxShadow(newValue) {
            var $el = this.refs.$boxShadowList.$('[box-shadow-id="' + newValue.id + '"] .color');
            if ($el) {
                $el.css('background-color', newValue.color);
            }
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_SELECTION, CHANGE_EDITOR),
        value: function value$$1() {
            if (this.isPropertyShow()) {
                this.refresh();
            }
        }
    }, {
        key: INPUT('$boxShadowList input[type=number]'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var field = $el.attr('data-type');
            var id = this.getBoxShadowId($el);

            var $range = $el.parent().$('[data-type=' + field + 'Range]');

            if ($range) {
                $range.val($el.val());
            }
            this.commit(CHANGE_BOXSHADOW, defineProperty({ id: id }, field, pxUnit($el.int())));
        }
    }, {
        key: INPUT('$boxShadowList input[type=range]'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var field = $el.attr('data-type').replace('Range', EMPTY_STRING);
            var id = this.getBoxShadowId($el);

            $el.parent().$('[data-type=' + field + ']').val($el.val());
            this.commit(CHANGE_BOXSHADOW, defineProperty({ id: id }, field, pxUnit($el.int())));
        }
    }, {
        key: CLICK('$boxShadowList input[type=radio]'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var id = this.getBoxShadowId($el);

            this.commit(CHANGE_BOXSHADOW, { id: id, inset: $el.val() === 'true' });
        }
    }, {
        key: CLICK('$boxShadowList .delete-boxshadow'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var id = this.getBoxShadowId($el);

            this.run(ITEM_INITIALIZE, id);
            this.emit(CHANGE_BOXSHADOW);
            this.refresh();
        }
    }, {
        key: CLICK('$boxShadowList .color'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var id = this.getBoxShadowId($el);

            this.dispatch(SELECTION_ONE, id);
            this.emit('fillColorId', id, CHANGE_BOXSHADOW);
            this.refresh();
        }
    }, {
        key: 'refreshUI',
        value: function refreshUI() {
            var _config = this.config('pos'),
                x = _config.x,
                y = _config.y;

            var rect = this.selectedPointArea.rect();

            if (x < rect.left) x = rect.left;
            if (y < rect.top) y = rect.top;
            if (x > rect.right) x = rect.right;
            if (y > rect.bottom) y = rect.bottom;

            x = x - rect.left;
            y = y - rect.top;

            this.refreshOffsetValue(x - 40, y - 40);
            this.selectedDragPointer.px('left', x);
            this.selectedDragPointer.px('top', y);
        }
    }, {
        key: 'refreshOffsetValue',
        value: function refreshOffsetValue(x, y) {
            var id = this.getBoxShadowId(this.selectedPointArea);

            var boxShadowItem = this.refs.$boxShadowList.$('[box-shadow-id="' + id + '"]');

            boxShadowItem.$("[data-type=offsetX]").val(x);
            boxShadowItem.$("[data-type=offsetY]").val(y);

            this.commit(CHANGE_BOXSHADOW, { id: id, offsetX: pxUnit(x), offsetY: pxUnit(y) });
        }

        // Event Bindings 

    }, {
        key: 'end',
        value: function end() {
            this.selectedPointArea = false;
        }
    }, {
        key: 'move',
        value: function move() {
            this.refreshUI(true);
        }
    }, {
        key: POINTERSTART('$boxShadowList .drag-area') + MOVE() + END(),
        value: function value$$1(e) {
            e.preventDefault();
            this.selectedPointArea = e.$delegateTarget;
            this.selectedDragPointer = this.selectedPointArea.$('.drag-pointer');
        }
    }]);
    return BoxShadow;
}(BasePropertyItem);

var TextShadow$1 = function (_BasePropertyItem) {
    inherits(TextShadow, _BasePropertyItem);

    function TextShadow() {
        classCallCheck(this, TextShadow);
        return possibleConstructorReturn(this, (TextShadow.__proto__ || Object.getPrototypeOf(TextShadow)).apply(this, arguments));
    }

    createClass(TextShadow, [{
        key: 'template',
        value: function template() {
            return '\n        <div class=\'property-item text-shadow show\'>\n            <div class=\'items\'>         \n                <div class="text-shadow-list" ref="$textShadowList"></div>\n            </div>     \n        </div>\n        ';
        }
    }, {
        key: 'makeItemNodetextShadow',
        value: function makeItemNodetextShadow(item) {

            var offsetX = +item.offsetX;
            var offsetY = +item.offsetY;
            var blurRadius = +item.blurRadius;
            var checked = item.selected ? 'checked' : EMPTY_STRING;

            return '\n            <div class=\'text-shadow-item ' + checked + '\' text-shadow-id="' + item.id + '">  \n                <div>\n                    <label>Color</label>\n                    <div class=\'value-field\'>\n                        <div class="color" style="background-color: ' + item.color + ';"></div>\n                        <button type="button" class=\'delete-boxshadow\'>&times;</button>   \n                    </div>                                          \n                </div>                            \n                <div>\n                    <label>X offset</label>\n                    <div class="input">\n                        <input type="number" min="-100" max="100" data-type=\'offsetX\' value="' + offsetX + '" />\n                    </div>\n                </div>\n                <div>\n                    <label>Y Offset</label>                \n                    <div class="input">\n                        <input type="number" min="-100" max="100" data-type=\'offsetY\' value="' + offsetY + '" />\n                    </div>\n                </div>\n                <div class=\'empty\'></div>        \n                <div>\n                    <label>Blur</label>                \n                    <div class="input">\n                        <input type="number" min="0" max="100" data-type=\'blurRadius\' value="' + blurRadius + '" />                    \n                        <input type="range" min="0" max="100" data-type=\'blurRadiusRange\' value="' + blurRadius + '" />\n                    </div>\n                </div>\n                <div class=\'drag-area\'><div class=\'drag-pointer\' style=\'left: ' + (offsetX + 40) + 'px; top: ' + (offsetY + 40) + 'px;\'></div></div>\n            </div>\n        ';
        }
    }, {
        key: LOAD('$textShadowList'),
        value: function value$$1() {
            var _this2 = this;

            var layer = editor$1.selection.layer;
            if (!layer) {
                return EMPTY_STRING;
            }

            return layer.textShadows.map(function (item) {
                return _this2.makeItemNodetextShadow(item);
            });
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.load();
        }
    }, {
        key: 'getTextShadowId',
        value: function getTextShadowId($el) {
            return $el.closest('text-shadow-item').attr('text-shadow-id');
        }
    }, {
        key: EVENT(CHANGE_TEXTSHADOW),
        value: function value$$1(newValue) {
            this.refreshTextShadow(newValue);
        }
    }, {
        key: 'refreshTextShadow',
        value: function refreshTextShadow(newValue) {
            var $el = this.refs.$textShadowList.$('[text-shadow-id="' + newValue.id + '"] .color');
            if ($el) {
                $el.css('background-color', newValue.color);
            }
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_SELECTION, CHANGE_EDITOR),
        value: function value$$1() {
            if (this.isPropertyShow()) {
                this.refresh();
            }
        }
    }, {
        key: INPUT('$textShadowList input[type=number]'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var field = $el.attr('data-type');
            var id = this.getTextShadowId($el);
            var $range = $el.parent().$('[data-type=' + field + 'Range]');

            if ($range) {
                $range.val($el.val());
            }
            this.commit(CHANGE_TEXTSHADOW, defineProperty({ id: id }, field, pxUnit($el.int())));
        }
    }, {
        key: INPUT('$textShadowList input[type=range]'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var field = $el.attr('data-type').replace('Range', EMPTY_STRING);
            var id = this.getTextShadowId($el);

            $el.parent().$('[data-type=' + field + ']').val($el.val());
            this.commit(CHANGE_TEXTSHADOW, defineProperty({ id: id }, field, pxUnit($el.int())));
        }
    }, {
        key: CLICK('$textShadowList .delete-textshadow'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var id = this.getTextShadowId($el);
            editor$1.remove(id);
            editor$1.send(CHANGE_TEXTSHADOW);
            this.refresh();
        }
    }, {
        key: CLICK('$textShadowList .color'),
        value: function value$$1(e) {
            var $el = e.$delegateTarget;
            var id = this.getTextShadowId($el);

            editor$1.selection.select(id);
            // editor.send(TEXT_FILL_COLOR, id, CHANGE_TEXTSHADOW);
            this.refresh();
        }
    }, {
        key: 'refreshUI',
        value: function refreshUI() {
            var _config = this.config('pos'),
                x = _config.x,
                y = _config.y;

            var rect = this.selectedPointArea.rect();

            if (x < rect.left) x = rect.left;
            if (y < rect.top) y = rect.top;
            if (x > rect.right) x = rect.right;
            if (y > rect.bottom) y = rect.bottom;

            x = x - rect.left;
            y = y - rect.top;

            this.refreshOffsetValue(x - 40, y - 40);
            this.selectedDragPointer.px('left', x);
            this.selectedDragPointer.px('top', y);
        }
    }, {
        key: 'refreshOffsetValue',
        value: function refreshOffsetValue(x, y) {
            var id = this.getTextShadowId(this.selectedPointArea);

            var textShadowItem = this.refs.$textShadowList.$('[text-shadow-id="' + id + '"]');

            textShadowItem.$("[data-type=offsetX]").val(x);
            textShadowItem.$("[data-type=offsetY]").val(y);

            this.commit(CHANGE_TEXTSHADOW, { id: id, offsetX: pxUnit(x), offsetY: pxUnit(y) });
        }

        // Event Bindings 

    }, {
        key: 'end',
        value: function end() {
            this.selectedPointArea = null;
        }
    }, {
        key: 'move',
        value: function move() {
            this.refreshUI();
        }
    }, {
        key: POINTERSTART('$textShadowList .drag-area') + MOVE() + END(),
        value: function value$$1(e) {
            e.preventDefault();
            this.selectedPointArea = e.$delegateTarget;
            this.selectedDragPointer = this.selectedPointArea.$('.drag-pointer');
        }
    }]);
    return TextShadow;
}(BasePropertyItem);

var BaseModule = function () {
    function BaseModule($store) {
        classCallCheck(this, BaseModule);

        this.$store = $store;
        this.initialize();
    }

    createClass(BaseModule, [{
        key: "afterDispatch",
        value: function afterDispatch() {}
    }, {
        key: "initialize",
        value: function initialize() {
            var _this = this;

            this.filterProps(ACTION_PREFIX).forEach(function (key) {
                _this.$store.action(key, _this);
            });

            this.filterProps(GETTER_PREFIX).forEach(function (key) {
                _this.$store.getter(key, _this);
            });
        }
    }, {
        key: "filterProps",
        value: function filterProps() {
            var pattern = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

            return Object.getOwnPropertyNames(this.__proto__).filter(function (key) {
                return key.startsWith(pattern);
            });
        }
    }, {
        key: "get",
        value: function get(id) {
            return this.$store.items[id] || {};
        }
    }, {
        key: "set",
        value: function set$$1(id, opt) {
            this.$store.items[id] = opt;
        }
    }, {
        key: "config",
        value: function config(key, defaultValue) {
            return isUndefined(this.$store.tool[key]) ? defaultValue : this.$store.tool[key];
        }
    }, {
        key: "initConfig",
        value: function initConfig(key, value) {
            this.$store.tool[key] = value;
        }
    }]);
    return BaseModule;
}();

var ColorSetsList = function (_BaseModule) {
    inherits(ColorSetsList, _BaseModule);

    function ColorSetsList() {
        classCallCheck(this, ColorSetsList);
        return possibleConstructorReturn(this, (ColorSetsList.__proto__ || Object.getPrototypeOf(ColorSetsList)).apply(this, arguments));
    }

    createClass(ColorSetsList, [{
        key: 'initialize',
        value: function initialize() {
            get$1(ColorSetsList.prototype.__proto__ || Object.getPrototypeOf(ColorSetsList.prototype), 'initialize', this).call(this);

            // set property
            this.$store.colorSetsList = [{ name: "Material",
                edit: true,
                colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B']
            }, { name: "Custom", "edit": true, "colors": [] }, { name: "Color Scale", "scale": ['red', 'yellow', 'black'], count: 5 }];
            this.$store.currentColorSets = {};
        }
    }, {
        key: ACTION('setUserPalette'),
        value: function value($store, list) {
            $store.userList = list;

            $store.dispatch('resetUserPalette');
            $store.dispatch('setCurrentColorSets');
        }
    }, {
        key: ACTION('resetUserPalette'),
        value: function value($store) {
            if ($store.userList && $store.userList.length) {
                $store.userList = $store.userList.map(function (element, index) {

                    if (isFunction(element.colors)) {
                        var makeCallback = element.colors;

                        element.colors = makeCallback($store);
                        element._colors = makeCallback;
                    }

                    return _extends({
                        name: 'color-' + index,
                        colors: []
                    }, element);
                });

                $store.emit('changeUserList');
            }
        }
    }, {
        key: ACTION('setCurrentColorSets'),
        value: function value($store, nameOrIndex) {

            var _list = $store.read('list');

            if (isUndefined$1(nameOrIndex)) {
                $store.currentColorSets = _list[0];
            } else if (isNumber(nameOrIndex)) {
                $store.currentColorSets = _list[nameOrIndex];
            } else {
                $store.currentColorSets = _list.filter(function (obj) {
                    return obj.name == nameOrIndex;
                })[0];
            }

            $store.emit('changeCurrentColorSets');
        }
    }, {
        key: GETTER('getCurrentColorSets'),
        value: function value($store) {
            return $store.currentColorSets;
        }
    }, {
        key: ACTION('addCurrentColor'),
        value: function value($store, color) {
            if (Array.isArray($store.currentColorSets.colors)) {
                $store.currentColorSets.colors.push(color);
                $store.emit('changeCurrentColorSets');
            }
        }
    }, {
        key: ACTION('setCurrentColorAll'),
        value: function value($store) {
            var colors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            $store.currentColorSets.colors = colors;
            $store.emit('changeCurrentColorSets');
        }
    }, {
        key: ACTION('removeCurrentColor'),
        value: function value($store, index) {
            if ($store.currentColorSets.colors[index]) {
                $store.currentColorSets.colors.splice(index, 1);
                $store.emit('changeCurrentColorSets');
            }
        }
    }, {
        key: ACTION('removeCurrentColorToTheRight'),
        value: function value($store, index) {
            if ($store.currentColorSets.colors[index]) {
                $store.currentColorSets.colors.splice(index, Number.MAX_VALUE);
                $store.emit('changeCurrentColorSets');
            }
        }
    }, {
        key: ACTION('clearPalette'),
        value: function value($store) {
            if ($store.currentColorSets.colors) {
                $store.currentColorSets.colors = [];
                $store.emit('changeCurrentColorSets');
            }
        }
    }, {
        key: GETTER('list'),
        value: function value($store) {
            return Array.isArray($store.userList) && $store.userList.length ? $store.userList : $store.colorSetsList;
        }
    }, {
        key: GETTER('getCurrentColors'),
        value: function value($store) {
            return $store.read('getColors', $store.currentColorSets);
        }
    }, {
        key: GETTER('getColors'),
        value: function value($store, element) {
            if (element.scale) {
                return Color$1.scale(element.scale, element.count);
            }

            return element.colors || [];
        }
    }, {
        key: GETTER('getColorSetsList'),
        value: function value($store) {
            return $store.read('list').map(function (element) {
                return {
                    name: element.name,
                    edit: element.edit,
                    colors: $store.read('getColors', element)
                };
            });
        }
    }]);
    return ColorSetsList;
}(BaseModule);

var ColorManager = function (_BaseModule) {
    inherits(ColorManager, _BaseModule);

    function ColorManager() {
        classCallCheck(this, ColorManager);
        return possibleConstructorReturn(this, (ColorManager.__proto__ || Object.getPrototypeOf(ColorManager)).apply(this, arguments));
    }

    createClass(ColorManager, [{
        key: 'initialize',
        value: function initialize() {
            get$1(ColorManager.prototype.__proto__ || Object.getPrototypeOf(ColorManager.prototype), 'initialize', this).call(this);

            this.$store.rgb = {};
            this.$store.hsl = {};
            this.$store.hsv = {};
            this.$store.alpha = 1;
            this.$store.format = 'hex';

            // this.$store.dispatch('changeColor');
        }
    }, {
        key: ACTION('changeFormat'),
        value: function value($store, format) {
            $store.format = format;

            $store.emit('changeFormat');
        }
    }, {
        key: ACTION('initColor'),
        value: function value($store, colorObj, source) {
            $store.dispatch('changeColor', colorObj, source, true);
            $store.emit('initColor');
        }
    }, {
        key: ACTION('changeColor'),
        value: function value($store, colorObj, source, isNotEmit) {

            colorObj = colorObj || '#FF0000';

            if (isString(colorObj)) {
                colorObj = Color$1.parse(colorObj);
            }

            colorObj.source = colorObj.source || source;

            $store.alpha = isUndefined$1(colorObj.a) ? $store.alpha : colorObj.a;
            $store.format = colorObj.type != 'hsv' ? colorObj.type || $store.format : $store.format;

            if ($store.format == 'hex' && $store.alpha < 1) {
                $store.format = 'rgb';
            }

            if (colorObj.type == 'hsl') {
                $store.hsl = _extends({}, $store.hsl, colorObj);
                $store.rgb = Color$1.HSLtoRGB($store.hsl);
                $store.hsv = Color$1.HSLtoHSV(colorObj);
            } else if (colorObj.type == 'hex') {
                $store.rgb = _extends({}, $store.rgb, colorObj);
                $store.hsl = Color$1.RGBtoHSL($store.rgb);
                $store.hsv = Color$1.RGBtoHSV(colorObj);
            } else if (colorObj.type == 'rgb') {
                $store.rgb = _extends({}, $store.rgb, colorObj);
                $store.hsl = Color$1.RGBtoHSL($store.rgb);
                $store.hsv = Color$1.RGBtoHSV(colorObj);
            } else if (colorObj.type == 'hsv') {
                $store.hsv = _extends({}, $store.hsv, colorObj);
                $store.rgb = Color$1.HSVtoRGB($store.hsv);
                $store.hsl = Color$1.HSVtoHSL($store.hsv);
            }

            if (!isNotEmit) {
                $store.emit('changeColor', colorObj.source);
            }
        }
    }, {
        key: GETTER('getHueColor'),
        value: function value($store) {
            return HueColor.checkHueColor($store.hsv.h / 360);
        }
    }, {
        key: GETTER('toString'),
        value: function value($store, type) {
            type = type || $store.format;
            var colorObj = $store[type] || $store.rgb;
            return Color$1.format(_extends({}, colorObj, { a: $store.alpha }), type);
        }
    }, {
        key: GETTER('toColor'),
        value: function value($store, type) {
            type = (type || $store.format).toLowerCase();

            if (type == 'rgb') {
                return $store.read('toRGB');
            } else if (type == 'hsl') {
                return $store.read('toHSL');
            } else if (type == 'hex') {
                return $store.read('toHEX');
            }

            return $store.read('toString', type);
        }
    }, {
        key: GETTER('toRGB'),
        value: function value($store) {
            return $store.read('toString', 'rgb');
        }
    }, {
        key: GETTER('toHSL'),
        value: function value($store) {
            return $store.read('toString', 'hsl');
        }
    }, {
        key: GETTER('toHEX'),
        value: function value($store) {
            return $store.read('toString', 'hex').toUpperCase();
        }
    }]);
    return ColorManager;
}(BaseModule);

var BaseColorPicker = function (_UIElement) {
    inherits(BaseColorPicker, _UIElement);

    function BaseColorPicker() {
        classCallCheck(this, BaseColorPicker);
        return possibleConstructorReturn(this, (BaseColorPicker.__proto__ || Object.getPrototypeOf(BaseColorPicker)).apply(this, arguments));
    }

    createClass(BaseColorPicker, [{
        key: 'created',
        value: function created() {
            this.isColorPickerShow = false;
            this.isShortCut = false;
            this.hideDelay = +defaultValue(this.opt.hideDeplay, 2000);
            this.timerCloseColorPicker;
            this.autoHide = this.opt.autoHide || true;
            this.outputFormat = this.opt.outputFormat;
            this.$checkColorPickerClass = this.checkColorPickerClass.bind(this);
        }
    }, {
        key: 'initialize',
        value: function initialize() {
            var _this2 = this;

            var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            this.$body = null;
            this.$root = null;

            this.$store = new BaseStore({
                modules: [ColorManager, ColorSetsList].concat(toConsumableArray(modules))
            });

            this.callbackChange = function () {
                _this2.callbackChangeValue();
            };

            this.colorpickerShowCallback = function () {};
            this.colorpickerHideCallback = function () {};

            this.$body = new Dom(this.getContainer());
            this.$root = new Dom('div', 'codemirror-colorpicker');

            //  append colorpicker to container (ex : body)
            if (this.opt.position == 'inline') {
                this.$body.append(this.$root);
            }

            if (this.opt.type) {
                // to change css style
                this.$root.addClass(this.opt.type);
            }

            if (this.opt.hideInformation) {
                this.$root.addClass('hide-information');
            }

            if (this.opt.hideColorsets) {
                this.$root.addClass('hide-colorsets');
            }

            if (this.opt.width) {
                this.$root.css('width', this.opt.width);
            }

            this.$arrow = new Dom('div', 'arrow');

            this.$root.append(this.$arrow);

            this.dispatch('setUserPalette', this.opt.colorSets);

            this.render(this.$root);

            this.initColorWithoutChangeEvent(this.opt.color);

            // 이벤트 연결 
            this.initializeEvent();
        }
    }, {
        key: 'initColorWithoutChangeEvent',
        value: function initColorWithoutChangeEvent(color$$1) {
            this.dispatch('initColor', color$$1);
        }

        /** 
         * public method 
         * 
         */

        /**
         * 
         * show colorpicker with position  
         * 
         * @param {{left, top, hideDelay, isShortCut}} opt 
         * @param {String|Object} color  
         * @param {Function} showCallback  it is called when colorpicker is shown
         * @param {Function} hideCallback  it is called once when colorpicker is hidden
         */

    }, {
        key: 'show',
        value: function show(opt, color$$1, showCallback, hideCallback) {

            // 매번 이벤트를 지우고 다시 생성할 필요가 없어서 초기화 코드는 지움. 
            // this.destroy();
            // this.initializeEvent();
            // define colorpicker callback
            this.colorpickerShowCallback = showCallback;
            this.colorpickerHideCallback = hideCallback;
            this.$root.css(this.getInitalizePosition()).show();

            this.definePosition(opt);

            this.isColorPickerShow = true;
            this.isShortCut = opt.isShortCut || false;
            this.outputFormat = opt.outputFormat;

            // define hide delay
            this.hideDelay = +defaultValue(opt.hideDelay, 2000);
            if (this.hideDelay > 0) {
                this.setHideDelay(this.hideDelay);
            }

            this.$root.appendTo(this.$body);

            this.initColorWithoutChangeEvent(color$$1);
        }

        /**
         * 
         * initialize color for colorpicker
         * 
         * @param {String|Object} newColor 
         * @param {String} format  hex, rgb, hsl
         */

    }, {
        key: 'initColor',
        value: function initColor(newColor, format) {
            this.dispatch('changeColor', newColor, format);
        }

        /**
         * hide colorpicker 
         * 
         */

    }, {
        key: 'hide',
        value: function hide() {
            if (this.isColorPickerShow) {
                // this.destroy();
                this.$root.hide();
                this.$root.remove(); // not empty 
                this.isColorPickerShow = false;

                this.callbackHideValue();
            }
        }

        /**
         * set to colors in current sets that you see 
         * @param {Array} colors 
         */

    }, {
        key: 'setColorsInPalette',
        value: function setColorsInPalette() {
            var colors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            this.dispatch('setCurrentColorAll', colors);
        }

        /**
         * refresh all color palette 
         * 
         * @param {*} list 
         */

    }, {
        key: 'setUserPalette',
        value: function setUserPalette() {
            var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            this.dispatch('setUserPalette', list);
        }

        /**
         * private method 
         */

    }, {
        key: 'getOption',
        value: function getOption(key) {
            return this.opt[key];
        }
    }, {
        key: 'setOption',
        value: function setOption(key, value$$1) {
            this.opt[key] = value$$1;
        }
    }, {
        key: 'getContainer',
        value: function getContainer() {
            return this.opt.container || document.body;
        }
    }, {
        key: 'getColor',
        value: function getColor(type) {
            return this.read('toColor', type);
        }
    }, {
        key: 'definePositionForArrow',
        value: function definePositionForArrow(opt, elementScreenLeft, elementScreenTop) {
            // console.log(arguments)
        }
    }, {
        key: 'definePosition',
        value: function definePosition(opt) {

            var width = this.$root.width();
            var height = this.$root.height();

            // set left position for color picker
            var elementScreenLeft = opt.left - this.$body.scrollLeft();
            if (width + elementScreenLeft > window.innerWidth) {
                elementScreenLeft -= width + elementScreenLeft - window.innerWidth;
            }
            if (elementScreenLeft < 0) {
                elementScreenLeft = 0;
            }

            // set top position for color picker
            var elementScreenTop = opt.top - this.$body.scrollTop();
            if (height + elementScreenTop > window.innerHeight) {
                elementScreenTop -= height + elementScreenTop - window.innerHeight;
            }
            if (elementScreenTop < 0) {
                elementScreenTop = 0;
            }

            // set position
            this.$root.css({
                left: px(elementScreenLeft),
                top: px(elementScreenTop)
            });

            // this.definePositionForArrow(opt, elementScreenLeft, elementScreenTop);
        }
    }, {
        key: 'getInitalizePosition',
        value: function getInitalizePosition() {
            if (this.opt.position == 'inline') {
                return {
                    position: 'relative',
                    left: 'auto',
                    top: 'auto',
                    display: 'inline-block'
                };
            } else {
                var position = this.opt.position == 'absolute' ? 'absolute' : 'fixed';
                return {
                    position: position, // color picker has fixed position
                    left: '-10000px',
                    top: '-10000px'
                };
            }
        }
    }, {
        key: 'setHideDelay',
        value: function setHideDelay(delayTime) {
            var _this3 = this;

            delayTime = delayTime || 0;

            var hideCallback = this.hide.bind(this);

            this.$root.off('mouseenter');
            this.$root.off('mouseleave');

            this.$root.on('mouseenter', function () {
                clearTimeout(_this3.timerCloseColorPicker);
            });

            this.$root.on('mouseleave', function () {
                clearTimeout(_this3.timerCloseColorPicker);
                _this3.timerCloseColorPicker = setTimeout(hideCallback, delayTime);
            });

            clearTimeout(this.timerCloseColorPicker);
            // this.timerCloseColorPicker = setTimeout(hideCallback, delayTime);
        }
    }, {
        key: 'callbackChangeValue',
        value: function callbackChangeValue(color$$1) {
            color$$1 = color$$1 || this.getCurrentColor();

            if (isFunction(this.opt.onChange)) {
                this.opt.onChange.call(this, color$$1);
            }

            if (isFunction(this.colorpickerShowCallback)) {
                this.colorpickerShowCallback(color$$1);
            }
        }
    }, {
        key: 'callbackHideValue',
        value: function callbackHideValue(color$$1) {
            color$$1 = color$$1 || this.getCurrentColor();
            if (isFunction(this.opt.onHide)) {
                this.opt.onHide.call(this, color$$1);
            }

            if (isFunction(this.colorpickerHideCallback)) {
                this.colorpickerHideCallback(color$$1);
            }
        }
    }, {
        key: 'getCurrentColor',
        value: function getCurrentColor() {
            return this.read('toColor', this.outputFormat);
        }
    }, {
        key: 'checkColorPickerClass',
        value: function checkColorPickerClass(el) {
            var $el = new Dom(el);
            var hasColorView = $el.closest('codemirror-colorview');
            var hasColorPicker = $el.closest('codemirror-colorpicker');
            var hasCodeMirror = $el.closest('CodeMirror');
            var IsInHtml = el.nodeName == 'HTML';

            return !!(hasColorPicker || hasColorView || hasCodeMirror);
        }
    }, {
        key: 'checkInHtml',
        value: function checkInHtml(el) {
            var IsInHtml = el.nodeName == 'HTML';

            return IsInHtml;
        }
    }, {
        key: 'initializeStoreEvent',
        value: function initializeStoreEvent() {
            get$1(BaseColorPicker.prototype.__proto__ || Object.getPrototypeOf(BaseColorPicker.prototype), 'initializeStoreEvent', this).call(this);

            this.$store.on('changeColor', this.callbackChange, this);
            this.$store.on('changeFormat', this.callbackChange, this);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            get$1(BaseColorPicker.prototype.__proto__ || Object.getPrototypeOf(BaseColorPicker.prototype), 'destroy', this).call(this);

            this.$store.off('changeColor', this.callbackChange);
            this.$store.off('changeFormat', this.callbackChange);

            this.callbackChange = undefined;

            // remove color picker callback
            this.colorpickerShowCallback = undefined;
            this.colorpickerHideCallback = undefined;
        }

        // Event Bindings 

    }, {
        key: MOUSEUP('document'),
        value: function value$$1(e) {

            // when color picker clicked in outside
            if (this.checkInHtml(e.target)) {
                //this.setHideDelay(hideDelay);
            } else if (this.checkColorPickerClass(e.target) == false) {
                this.hide();
            }
        }
    }]);
    return BaseColorPicker;
}(UIElement);

var BaseBox = function (_UIElement) {
    inherits(BaseBox, _UIElement);

    function BaseBox() {
        classCallCheck(this, BaseBox);
        return possibleConstructorReturn(this, (BaseBox.__proto__ || Object.getPrototypeOf(BaseBox)).apply(this, arguments));
    }

    createClass(BaseBox, [{
        key: 'refresh',
        value: function refresh() {}
    }, {
        key: 'refreshColorUI',
        value: function refreshColorUI(e) {}

        /** push change event  */

    }, {
        key: 'changeColor',
        value: function changeColor(opt) {
            this.dispatch('changeColor', opt || {});
        }

        // Event Bindings 

    }, {
        key: POINTEREND('document'),
        value: function value(e) {
            this.onDragEnd(e);
        }
    }, {
        key: POINTERMOVE('document'),
        value: function value(e) {
            this.onDragMove(e);
        }
    }, {
        key: POINTERSTART('$bar'),
        value: function value(e) {
            e.preventDefault();
            this.isDown = true;
        }
    }, {
        key: POINTERSTART('$container'),
        value: function value(e) {
            this.isDown = true;
            this.onDragStart(e);
        }
    }, {
        key: 'onDragStart',
        value: function onDragStart(e) {
            this.isDown = true;
            this.refreshColorUI(e);
        }
    }, {
        key: 'onDragMove',
        value: function onDragMove(e) {
            if (this.isDown) {
                this.refreshColorUI(e);
            }
        }

        /* called when mouse is ended move  */

    }, {
        key: 'onDragEnd',
        value: function onDragEnd(e) {
            this.isDown = false;
        }
    }, {
        key: EVENT('changeColor'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT('initColor'),
        value: function value() {
            this.refresh();
        }
    }]);
    return BaseBox;
}(UIElement);

var BaseSlider = function (_BaseBox) {
    inherits(BaseSlider, _BaseBox);

    function BaseSlider() {
        classCallCheck(this, BaseSlider);
        return possibleConstructorReturn(this, (BaseSlider.__proto__ || Object.getPrototypeOf(BaseSlider)).apply(this, arguments));
    }

    createClass(BaseSlider, [{
        key: 'initialize',
        value: function initialize() {
            get$1(BaseSlider.prototype.__proto__ || Object.getPrototypeOf(BaseSlider.prototype), 'initialize', this).call(this);
            this.minValue = 0; // min domain value 
            this.maxValue = 1; // max domain value 
        }

        /* slider container's min and max position */

    }, {
        key: 'getMinMaxPosition',
        value: function getMinMaxPosition() {
            var min = this.getMinPosition();
            var width = this.getMaxDist();
            var max = min + width;

            return { min: min, max: max, width: width };
        }

        /** get current position on page  */

    }, {
        key: 'getCurrent',
        value: function getCurrent(value$$1) {
            return min + this.getMaxDist() * value$$1;
        }

        /** get min position on slider container  */

    }, {
        key: 'getMinPosition',
        value: function getMinPosition() {
            return this.refs.$container.offset().left;
        }
    }, {
        key: 'getMaxDist',
        value: function getMaxDist() {
            return this.refs.$container.width();
        }

        /** get dist for position value */

    }, {
        key: 'getDist',
        value: function getDist(current) {
            var _getMinMaxPosition = this.getMinMaxPosition(),
                min = _getMinMaxPosition.min,
                max = _getMinMaxPosition.max;

            var dist;
            if (current < min) {
                dist = 0;
            } else if (current > max) {
                dist = 100;
            } else {
                dist = (current - min) / (max - min) * 100;
            }

            return dist;
        }

        /** get calculated dist for domain value   */

    }, {
        key: 'getCalculatedDist',
        value: function getCalculatedDist(e) {
            var current = e ? this.getMousePosition(e) : this.getCurrent(this.getDefaultValue() / this.maxValue);
            var dist = this.getDist(current);

            return dist;
        }

        /** get default value used in slider container */

    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return 0;
        }

        /** set mosue position */

    }, {
        key: 'setMousePosition',
        value: function setMousePosition(x) {
            this.refs.$bar.css({ left: px(x) });
        }

        /** set mouse position in page */

    }, {
        key: 'getMousePosition',
        value: function getMousePosition(e) {
            return Event.pos(e).pageX;
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.setColorUI();
        }

        /** set drag bar position  */

    }, {
        key: 'setColorUI',
        value: function setColorUI(v) {

            v = v || this.getDefaultValue();

            if (v <= this.minValue) {
                this.refs.$bar.addClass('first').removeClass('last');
            } else if (v >= this.maxValue) {
                this.refs.$bar.addClass('last').removeClass('first');
            } else {
                this.refs.$bar.removeClass('last').removeClass('first');
            }

            this.setMousePosition(this.getMaxDist() * ((v || 0) / this.maxValue));
        }
    }]);
    return BaseSlider;
}(BaseBox);

var Value = function (_BaseSlider) {
    inherits(Value, _BaseSlider);

    function Value() {
        classCallCheck(this, Value);
        return possibleConstructorReturn(this, (Value.__proto__ || Object.getPrototypeOf(Value)).apply(this, arguments));
    }

    createClass(Value, [{
        key: 'initialize',
        value: function initialize() {
            get$1(Value.prototype.__proto__ || Object.getPrototypeOf(Value.prototype), 'initialize', this).call(this);

            this.minValue = 0;
            this.maxValue = 1;
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n            <div class="value">\n                <div ref="$container" class="value-container">\n                    <div ref="$bar" class="drag-bar"></div>\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'setBackgroundColor',
        value: function setBackgroundColor() {
            this.refs.$container.css("background-color", this.read('toRGB'));
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            get$1(Value.prototype.__proto__ || Object.getPrototypeOf(Value.prototype), 'refresh', this).call(this);
            this.setBackgroundColor();
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.$store.hsv.v;
        }
    }, {
        key: 'refreshColorUI',
        value: function refreshColorUI(e) {
            var dist = this.getCalculatedDist(e);

            this.setColorUI(dist / 100 * this.maxValue);

            this.changeColor({
                type: 'hsv',
                v: dist / 100 * this.maxValue
            });
        }
    }]);
    return Value;
}(BaseSlider);

var Opacity$2 = function (_BaseSlider) {
    inherits(Opacity, _BaseSlider);

    function Opacity() {
        classCallCheck(this, Opacity);
        return possibleConstructorReturn(this, (Opacity.__proto__ || Object.getPrototypeOf(Opacity)).apply(this, arguments));
    }

    createClass(Opacity, [{
        key: 'initialize',
        value: function initialize() {
            get$1(Opacity.prototype.__proto__ || Object.getPrototypeOf(Opacity.prototype), 'initialize', this).call(this);

            this.minValue = 0;
            this.maxValue = 1;
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n        <div class="opacity">\n            <div ref="$container" class="opacity-container">\n                <div ref="$colorbar" class="color-bar"></div>\n                <div ref="$bar" class="drag-bar2"></div>\n            </div>\n        </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            get$1(Opacity.prototype.__proto__ || Object.getPrototypeOf(Opacity.prototype), 'refresh', this).call(this);
            this.setOpacityColorBar();
        }
    }, {
        key: 'setOpacityColorBar',
        value: function setOpacityColorBar() {
            var rgb = _extends({}, this.$store.rgb);

            rgb.a = 0;
            var start = Color$1.format(rgb, 'rgb');

            rgb.a = 1;
            var end = Color$1.format(rgb, 'rgb');

            this.refs.$colorbar.css('background', 'linear-gradient(to right, ' + start + ', ' + end + ')');
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.$store.alpha;
        }
    }, {
        key: 'refreshColorUI',
        value: function refreshColorUI(e) {
            var dist = this.getCalculatedDist(e);

            this.setColorUI(dist / 100 * this.maxValue);

            this.changeColor({
                a: Math.floor(dist) / 100 * this.maxValue
            });
        }
    }]);
    return Opacity;
}(BaseSlider);

var ColorView = function (_UIElement) {
    inherits(ColorView, _UIElement);

    function ColorView() {
        classCallCheck(this, ColorView);
        return possibleConstructorReturn(this, (ColorView.__proto__ || Object.getPrototypeOf(ColorView)).apply(this, arguments));
    }

    createClass(ColorView, [{
        key: 'template',
        value: function template() {
            return '<div class="color"></div>';
        }
    }, {
        key: 'setBackgroundColor',
        value: function setBackgroundColor() {
            this.refs.$el.css("background-color", this.read('toRGB'));
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.setBackgroundColor();
        }
    }, {
        key: EVENT('changeColor'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT('initColor'),
        value: function value() {
            this.refresh();
        }
    }]);
    return ColorView;
}(UIElement);

var ColorWheel = function (_UIElement) {
    inherits(ColorWheel, _UIElement);

    function ColorWheel() {
        classCallCheck(this, ColorWheel);
        return possibleConstructorReturn(this, (ColorWheel.__proto__ || Object.getPrototypeOf(ColorWheel)).apply(this, arguments));
    }

    createClass(ColorWheel, [{
        key: 'initialize',
        value: function initialize() {
            get$1(ColorWheel.prototype.__proto__ || Object.getPrototypeOf(ColorWheel.prototype), 'initialize', this).call(this);
            this.width = 214;
            this.height = 214;
            this.thinkness = 0;
            this.half_thinkness = 0;
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n        <div class="wheel">\n            <canvas class="wheel-canvas" ref="$colorwheel" ></canvas>\n            <div class="wheel-canvas" ref="$valuewheel" ></div>\n            <div class="drag-pointer" ref="$drag_pointer"></div>\n        </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh(isEvent) {
            this.setColorUI(isEvent);
        }
    }, {
        key: 'setColorUI',
        value: function setColorUI(isEvent) {
            this.renderCanvas();
            this.renderValue();
            this.setHueColor(null, isEvent);
        }
    }, {
        key: 'renderValue',
        value: function renderValue() {
            var value = 1 - this.$store.hsv.v;
            this.refs.$valuewheel.css('background-color', 'rgba(0, 0, 0, ' + value + ')');
        }
    }, {
        key: 'renderWheel',
        value: function renderWheel(width, height) {

            if (this.width && !width) width = this.width;
            if (this.height && !height) height = this.height;

            var $canvas = new Dom('canvas');
            var context = $canvas.el.getContext('2d');
            $canvas.el.width = width;
            $canvas.el.height = height;
            $canvas.px('width', width);
            $canvas.px('height', height);

            var img = context.getImageData(0, 0, width, height);
            var pixels = img.data;
            var half_width = Math.floor(width / 2);
            var half_height = Math.floor(height / 2);

            var radius = width > height ? half_height : half_width;
            var cx = half_width;
            var cy = half_height;

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var rx = x - cx + 1,
                        ry = y - cy + 1,
                        d = rx * rx + ry * ry,
                        hue = calculateAngle(rx, ry);

                    var rgb = Color$1.HSVtoRGB(hue, // 0~360 hue 
                    Math.min(Math.sqrt(d) / radius, 1), // 0..1 Saturation 
                    1 //  0..1 Value
                    );

                    var index = (y * width + x) * 4;
                    pixels[index] = rgb.r;
                    pixels[index + 1] = rgb.g;
                    pixels[index + 2] = rgb.b;
                    pixels[index + 3] = 255;
                }
            }

            context.putImageData(img, 0, 0);

            if (this.thinkness > 0) {
                context.globalCompositeOperation = "destination-out"; // destination-out 은 그리는 영역이 지워진다. 
                context.fillStyle = 'black';
                context.beginPath();
                context.arc(cx, cy, radius - this.thinkness, 0, Math.PI * 2);
                context.closePath();
                context.fill();
            }

            return $canvas;
        }
    }, {
        key: 'renderCanvas',
        value: function renderCanvas() {

            // only once rendering 
            if (this.$store.createdWheelCanvas) return;

            var $canvas = this.refs.$colorwheel;
            // console.log($canvas);
            var context = $canvas.el.getContext('2d');

            var _$canvas$size = $canvas.size(),
                _$canvas$size2 = slicedToArray(_$canvas$size, 2),
                width = _$canvas$size2[0],
                height = _$canvas$size2[1];

            if (this.width && !width) width = this.width;
            if (this.height && !height) height = this.height;

            $canvas.el.width = width;
            $canvas.el.height = height;
            $canvas.px('width', width);
            $canvas.px('height', height);

            var $wheelCanvas = this.renderWheel(width, height);

            context.drawImage($wheelCanvas.el, 0, 0);

            this.$store.createdWheelCanvas = true;
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.$store.hsv.h;
        }
    }, {
        key: 'getDefaultSaturation',
        value: function getDefaultSaturation() {
            return this.$store.hsv.s;
        }
    }, {
        key: 'getCurrentXY',
        value: function getCurrentXY(e, angle, radius, centerX, centerY) {
            return e ? e.xy : getXYInCircle(angle, radius, centerX, centerY);
        }
    }, {
        key: 'getRectangle',
        value: function getRectangle() {
            var width = this.$el.width();
            var height = this.$el.height();
            var radius = this.refs.$colorwheel.width() / 2;

            var minX = this.$el.offsetLeft();
            var centerX = minX + width / 2;

            var minY = this.$el.offsetTop();
            var centerY = minY + height / 2;

            return { minX: minX, minY: minY, width: width, height: height, radius: radius, centerX: centerX, centerY: centerY };
        }
    }, {
        key: 'setHueColor',
        value: function setHueColor(e, isEvent) {

            if (!this.state.get('$el.width')) return;

            var _getRectangle = this.getRectangle(),
                minX = _getRectangle.minX,
                minY = _getRectangle.minY,
                radius = _getRectangle.radius,
                centerX = _getRectangle.centerX,
                centerY = _getRectangle.centerY;

            var _getCurrentXY = this.getCurrentXY(e, this.getDefaultValue(), this.getDefaultSaturation() * radius, centerX, centerY),
                x = _getCurrentXY.x,
                y = _getCurrentXY.y;

            var rx = x - centerX,
                ry = y - centerY,
                d = rx * rx + ry * ry,
                hue = calculateAngle(rx, ry);

            if (d > radius * radius) {
                var _getCurrentXY2 = this.getCurrentXY(null, hue, radius, centerX, centerY),
                    x = _getCurrentXY2.x,
                    y = _getCurrentXY2.y;
            }

            // saturation 을 
            var saturation = Math.min(Math.sqrt(d) / radius, 1);

            // set drag pointer position 
            this.refs.$drag_pointer.px('left', x - minX);
            this.refs.$drag_pointer.px('top', y - minY);

            if (!isEvent) {
                this.changeColor({
                    type: 'hsv',
                    h: hue,
                    s: saturation
                });
            }
        }
    }, {
        key: 'changeColor',
        value: function changeColor(opt) {
            this.dispatch('changeColor', opt || {});
        }
    }, {
        key: EVENT('changeColor'),
        value: function value() {
            this.refresh(true);
        }
    }, {
        key: EVENT('initColor'),
        value: function value() {
            this.refresh(true);
        }

        // Event Bindings 

    }, {
        key: POINTEREND('document'),
        value: function value(e) {
            this.isDown = false;
        }
    }, {
        key: POINTERMOVE('document'),
        value: function value(e) {
            if (this.isDown) {
                this.setHueColor(e);
            }
        }
    }, {
        key: POINTERSTART('$drag_pointer'),
        value: function value(e) {
            e.preventDefault();
            this.isDown = true;
        }
    }, {
        key: POINTERSTART(),
        value: function value(e) {
            this.isDown = true;
            this.setHueColor(e);
        }
    }]);
    return ColorWheel;
}(UIElement);

var ColorInformation = function (_UIElement) {
    inherits(ColorInformation, _UIElement);

    function ColorInformation() {
        classCallCheck(this, ColorInformation);
        return possibleConstructorReturn(this, (ColorInformation.__proto__ || Object.getPrototypeOf(ColorInformation)).apply(this, arguments));
    }

    createClass(ColorInformation, [{
        key: 'template',
        value: function template() {
            return '\n        <div class="information hex">\n            <div ref="$informationChange" class="information-change">\n                <button ref="$formatChangeButton" type="button" class="format-change-button arrow-button"></button>\n            </div>\n            <div class="information-item hex">\n                <div class="input-field hex">\n                    <input ref="$hexCode" class="input" type="text" />\n                    <div class="title">HEX</div>\n                </div>\n            </div>\n            <div class="information-item rgb">\n                <div class="input-field rgb-r">\n                    <input ref="$rgb_r" class="input" type="number" step="1" min="0" max="255" />\n                    <div class="title">R</div>\n                </div>\n                <div class="input-field rgb-g">\n                    <input ref="$rgb_g" class="input" type="number" step="1" min="0" max="255" />\n                    <div class="title">G</div>\n                </div>\n                <div class="input-field rgb-b">\n                    <input ref="$rgb_b" class="input" type="number" step="1" min="0" max="255" />\n                    <div class="title">B</div>\n                </div>          \n                <div class="input-field rgb-a">\n                    <input ref="$rgb_a" class="input" type="number" step="0.01" min="0" max="1" />\n                    <div class="title">A</div>\n                </div>                                                            \n            </div>\n            <div class="information-item hsl">\n                <div class="input-field hsl-h">\n                    <input ref="$hsl_h" class="input" type="number" step="1" min="0" max="360" />\n                    <div class="title">H</div>\n                </div>\n                <div class="input-field hsl-s">\n                    <input ref="$hsl_s" class="input" type="number" step="1" min="0" max="100" />\n                    <div class="postfix">%</div>\n                    <div class="title">S</div>\n                </div>\n                <div class="input-field hsl-l">\n                    <input ref="$hsl_l" class="input" type="number" step="1" min="0" max="100" />\n                    <div class="postfix">%</div>                        \n                    <div class="title">L</div>\n                </div>\n                <div class="input-field hsl-a">\n                    <input ref="$hsl_a" class="input" type="number" step="0.01" min="0" max="1" />\n                    <div class="title">A</div>\n                </div>\n            </div>\n        </div>\n        ';
        }
    }, {
        key: 'setCurrentFormat',
        value: function setCurrentFormat(format) {
            this.format = format;

            this.initFormat();
        }
    }, {
        key: 'initFormat',
        value: function initFormat() {
            var current_format = this.format || 'hex';

            this.$el.removeClass('hex');
            this.$el.removeClass('rgb');
            this.$el.removeClass('hsl');
            this.$el.addClass(current_format);
        }
    }, {
        key: 'nextFormat',
        value: function nextFormat() {
            var current_format = this.format || 'hex';

            var next_format = 'hex';
            if (current_format == 'hex') {
                next_format = 'rgb';
            } else if (current_format == 'rgb') {
                next_format = 'hsl';
            } else if (current_format == 'hsl') {
                if (this.$store.alpha == 1) {
                    next_format = 'hex';
                } else {
                    next_format = 'rgb';
                }
            }

            this.$el.removeClass(current_format);
            this.$el.addClass(next_format);
            this.format = next_format;

            this.dispatch('changeFormat', this.format);
        }
    }, {
        key: 'getFormat',
        value: function getFormat() {
            return this.format || 'hex';
        }
    }, {
        key: 'checkNumberKey',
        value: function checkNumberKey(e) {
            return Event.checkNumberKey(e);
        }
    }, {
        key: 'checkNotNumberKey',
        value: function checkNotNumberKey(e) {
            return !Event.checkNumberKey(e);
        }
    }, {
        key: 'changeRgbColor',
        value: function changeRgbColor() {
            this.dispatch('changeColor', {
                type: 'rgb',
                r: this.refs.$rgb_r.int(),
                g: this.refs.$rgb_g.int(),
                b: this.refs.$rgb_b.int(),
                a: this.refs.$rgb_a.float()
            });
        }
    }, {
        key: 'changeHslColor',
        value: function changeHslColor() {
            this.dispatch('changeColor', {
                type: 'hsl',
                h: this.refs.$hsl_h.int(),
                s: this.refs.$hsl_s.int(),
                l: this.refs.$hsl_l.int(),
                a: this.refs.$hsl_a.float()
            });
        }
    }, {
        key: EVENT('changeColor'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT('initColor'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: INPUT('$rgb_r'),
        value: function value(e) {
            this.changeRgbColor();
        }
    }, {
        key: INPUT('$rgb_g'),
        value: function value(e) {
            this.changeRgbColor();
        }
    }, {
        key: INPUT('$rgb_b'),
        value: function value(e) {
            this.changeRgbColor();
        }
    }, {
        key: INPUT('$rgb_a'),
        value: function value(e) {
            this.changeRgbColor();
        }
    }, {
        key: INPUT('$hsl_h'),
        value: function value(e) {
            this.changeHslColor();
        }
    }, {
        key: INPUT('$hsl_s'),
        value: function value(e) {
            this.changeHslColor();
        }
    }, {
        key: INPUT('$hsl_l'),
        value: function value(e) {
            this.changeHslColor();
        }
    }, {
        key: INPUT('$hsl_a'),
        value: function value(e) {
            this.changeHslColor();
        }
    }, {
        key: KEYDOWN('$hexCode'),
        value: function value(e) {
            if (e.which < 65 || e.which > 70) {
                return this.checkNumberKey(e);
            }
        }
    }, {
        key: KEYUP('$hexCode'),
        value: function value(e) {
            var code = this.refs.$hexCode.val();

            if (code.charAt(0) == '#' && code.length == 7) {
                this.dispatch('changeColor', code);
            }
        }
    }, {
        key: CLICK('$formatChangeButton'),
        value: function value(e) {
            this.nextFormat();
        }
    }, {
        key: 'setRGBInput',
        value: function setRGBInput() {
            this.refs.$rgb_r.val(this.$store.rgb.r);
            this.refs.$rgb_g.val(this.$store.rgb.g);
            this.refs.$rgb_b.val(this.$store.rgb.b);
            this.refs.$rgb_a.val(this.$store.alpha);
        }
    }, {
        key: 'setHSLInput',
        value: function setHSLInput() {
            this.refs.$hsl_h.val(this.$store.hsl.h);
            this.refs.$hsl_s.val(this.$store.hsl.s);
            this.refs.$hsl_l.val(this.$store.hsl.l);
            this.refs.$hsl_a.val(this.$store.alpha);
        }
    }, {
        key: 'setHexInput',
        value: function setHexInput() {
            this.refs.$hexCode.val(this.read('toHEX'));
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.setCurrentFormat(this.$store.format);
            this.setRGBInput();
            this.setHSLInput();
            this.setHexInput();
        }
    }]);
    return ColorInformation;
}(UIElement);

var _templateObject$8 = taggedTemplateLiteral(['\n            <div>\n                ', '\n            </div>\n        '], ['\n            <div>\n                ', '\n            </div>\n        ']);
var _templateObject2 = taggedTemplateLiteral(['\n                        <div class="colorsets-item" data-colorsets-index="', '" >\n                            <h1 class="title">', '</h1>\n                            <div class="items">\n                                <div>\n                                    ', '\n                                </div>\n                            </div>\n                        </div>'], ['\n                        <div class="colorsets-item" data-colorsets-index="', '" >\n                            <h1 class="title">', '</h1>\n                            <div class="items">\n                                <div>\n                                    ', '\n                                </div>\n                            </div>\n                        </div>']);

var DATA_COLORSETS_INDEX = 'data-colorsets-index';

var ColorSetsChooser = function (_UIElement) {
    inherits(ColorSetsChooser, _UIElement);

    function ColorSetsChooser() {
        classCallCheck(this, ColorSetsChooser);
        return possibleConstructorReturn(this, (ColorSetsChooser.__proto__ || Object.getPrototypeOf(ColorSetsChooser)).apply(this, arguments));
    }

    createClass(ColorSetsChooser, [{
        key: 'template',
        value: function template() {
            return '<div class="color-chooser">\n            <div class="color-chooser-container">\n                <div class="colorsets-item colorsets-item-header">\n                    <h1 class="title">Color Palettes</h1>\n                    <span ref="$toggleButton" class="items">&times;</span>\n                </div>\n                <div ref="$colorsetsList" class="colorsets-list"></div>\n            </div>\n        </div>';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.load();
        }
    }, {
        key: EVENT('changeCurrentColorSets'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT('toggleColorChooser'),
        value: function value() {
            this.toggle();
        }

        // loadable 

    }, {
        key: LOAD('$colorsetsList'),
        value: function value() {
            // colorsets 
            var colorSets = this.read('getColorSetsList');

            return html(_templateObject$8, colorSets.map(function (element, index) {
                return html(_templateObject2, index, element.name, element.colors.filter(function (color, i) {
                    return i < 5;
                }).map(function (color) {
                    color = color || 'rgba(255, 255, 255, 1)';
                    return '<div class="color-item" title="' + color + '">\n                                                <div class="color-view" style="background-color: ' + color + '"></div>\n                                            </div>';
                }));
            }));
        }
    }, {
        key: 'show',
        value: function show() {
            this.$el.addClass('open');
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.$el.removeClass('open');
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            this.$el.toggleClass('open');
        }
    }, {
        key: CLICK('$toggleButton'),
        value: function value(e) {
            this.toggle();
        }
    }, {
        key: CLICK('$colorsetsList .colorsets-item'),
        value: function value(e, $dt) {
            if ($dt) {

                var index = parseInt($dt.attr(DATA_COLORSETS_INDEX));

                this.dispatch('setCurrentColorSets', index);

                this.hide();
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            get$1(ColorSetsChooser.prototype.__proto__ || Object.getPrototypeOf(ColorSetsChooser.prototype), 'destroy', this).call(this);

            this.hide();
        }
    }]);
    return ColorSetsChooser;
}(UIElement);

var _templateObject$9 = taggedTemplateLiteral(['<div class="current-color-sets">\n            ', '   \n            ', '         \n            </div>'], ['<div class="current-color-sets">\n            ', '   \n            ', '         \n            </div>']);

var CurrentColorSets = function (_UIElement) {
    inherits(CurrentColorSets, _UIElement);

    function CurrentColorSets() {
        classCallCheck(this, CurrentColorSets);
        return possibleConstructorReturn(this, (CurrentColorSets.__proto__ || Object.getPrototypeOf(CurrentColorSets)).apply(this, arguments));
    }

    createClass(CurrentColorSets, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="colorsets">\n                <div class="menu" title="Open Color Palettes">\n                    <button ref="$colorSetsChooseButton" type="button" class="color-sets-choose-btn arrow-button"></button>\n                </div>\n                <div ref="$colorSetsColorList" class="color-list"></div>\n            </div>\n        ';
        }
    }, {
        key: LOAD('$colorSetsColorList'),
        value: function value$$1() {
            var currentColorSets = this.read('getCurrentColorSets');
            var colors = this.read('getCurrentColors');

            return html(_templateObject$9, colors.map(function (color$$1, i) {
                return '<div class="color-item" title="' + color$$1 + '" data-index="' + i + '" data-color="' + color$$1 + '">\n                    <div class="empty"></div>\n                    <div class="color-view" style="background-color: ' + color$$1 + '"></div>\n                </div>';
            }), currentColorSets.edit ? '<div class="add-color-item">+</div>' : EMPTY_STRING);
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.load();
        }
    }, {
        key: 'addColor',
        value: function addColor(color$$1) {
            this.dispatch('addCurrentColor', color$$1);
            this.refresh();
        }
    }, {
        key: EVENT('changeCurrentColorSets'),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: CLICK('$colorSetsChooseButton'),
        value: function value$$1(e) {
            this.emit('toggleColorChooser');
        }
    }, {
        key: CONTEXTMENU('$colorSetsColorList'),
        value: function value$$1(e) {
            e.preventDefault();
            var currentColorSets = this.read('getCurrentColorSets');

            if (!currentColorSets.edit) {
                return;
            }

            var $target = new Dom(e.target);

            var $item = $target.closest('color-item');

            if ($item) {
                var index = parseInt($item.attr('data-index'));

                this.emit('showContextMenu', e, index);
            } else {
                this.emit('showContextMenu', e);
            }
        }
    }, {
        key: CLICK('$colorSetsColorList .add-color-item'),
        value: function value$$1(e) {
            this.addColor(this.read('toColor'));
        }
    }, {
        key: CLICK('$colorSetsColorList .color-item'),
        value: function value$$1(e, $dt) {
            this.dispatch('changeColor', $dt.attr('data-color'));
        }
    }]);
    return CurrentColorSets;
}(UIElement);

var CurrentColorSetsContextMenu = function (_UIElement) {
    inherits(CurrentColorSetsContextMenu, _UIElement);

    function CurrentColorSetsContextMenu() {
        classCallCheck(this, CurrentColorSetsContextMenu);
        return possibleConstructorReturn(this, (CurrentColorSetsContextMenu.__proto__ || Object.getPrototypeOf(CurrentColorSetsContextMenu)).apply(this, arguments));
    }

    createClass(CurrentColorSetsContextMenu, [{
        key: 'template',
        value: function template() {
            return '\n            <ul class="colorsets-contextmenu">\n                <li class="menu-item small-hide" data-type="remove-color">Remove color</li>\n                <li class="menu-item small-hide" data-type="remove-all-to-the-right">Remove all to the right</li>\n                <li class="menu-item" data-type="clear-palette">Clear palette</li>\n            </ul>\n        ';
        }
    }, {
        key: 'show',
        value: function show(e, index) {
            var $event = Event.pos(e);

            this.$el.px('top', $event.clientY - 10);
            this.$el.px('left', $event.clientX);
            this.$el.addClass('show');
            this.selectedColorIndex = index;

            if (isUndefined$1(this.selectedColorIndex)) {
                this.$el.addClass('small');
            } else {
                this.$el.removeClass('small');
            }
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.$el.removeClass('show');
        }
    }, {
        key: 'runCommand',
        value: function runCommand(command) {
            switch (command) {
                case 'remove-color':
                    this.dispatch('removeCurrentColor', this.selectedColorIndex);
                    break;
                case 'remove-all-to-the-right':
                    this.dispatch('removeCurrentColorToTheRight', this.selectedColorIndex);
                    break;
                case 'clear-palette':
                    this.dispatch('clearPalette');
                    break;
            }
        }
    }, {
        key: EVENT('showContextMenu'),
        value: function value(e, index) {
            this.show(e, index);
        }
    }, {
        key: CLICK('$el .menu-item'),
        value: function value(e, $dt) {
            e.preventDefault();

            this.runCommand($dt.attr('data-type'));
            this.hide();
        }
    }]);
    return CurrentColorSetsContextMenu;
}(UIElement);

var MacOSColorPicker = function (_BaseColorPicker) {
    inherits(MacOSColorPicker, _BaseColorPicker);

    function MacOSColorPicker() {
        classCallCheck(this, MacOSColorPicker);
        return possibleConstructorReturn(this, (MacOSColorPicker.__proto__ || Object.getPrototypeOf(MacOSColorPicker)).apply(this, arguments));
    }

    createClass(MacOSColorPicker, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'colorpicker-body\'>\n                <ColorWheel />\n                <div class="control">\n                    <Value />\n                    <Opacity />\n                    <div class="empty"></div>\n                    <ColorView />\n                </div>\n                <Information />\n                <CurrentColorSets />\n                <ColorSetsChooser >\n                <ContextMenu />\n            </div> \n        ';
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Value: Value, Opacity: Opacity$2, ColorView: ColorView,
                ColorWheel: ColorWheel,
                Information: ColorInformation,
                CurrentColorSets: CurrentColorSets,
                ColorSetsChooser: ColorSetsChooser,
                ContextMenu: CurrentColorSetsContextMenu
            };
        }
    }]);
    return MacOSColorPicker;
}(BaseColorPicker);

var Hue = function (_BaseSlider) {
    inherits(Hue, _BaseSlider);

    function Hue() {
        classCallCheck(this, Hue);
        return possibleConstructorReturn(this, (Hue.__proto__ || Object.getPrototypeOf(Hue)).apply(this, arguments));
    }

    createClass(Hue, [{
        key: 'initialize',
        value: function initialize() {
            get$1(Hue.prototype.__proto__ || Object.getPrototypeOf(Hue.prototype), 'initialize', this).call(this);
            this.minValue = 0;
            this.maxValue = 360;
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n            <div class="hue">\n                <div ref="$container" class="hue-container">\n                    <div ref="$bar" class="drag-bar"></div>\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.$store.hsv.h;
        }
    }, {
        key: 'refreshColorUI',
        value: function refreshColorUI(e) {

            var dist = this.getCalculatedDist(e);

            this.setColorUI(dist / 100 * this.maxValue);

            this.changeColor({
                h: dist / 100 * this.maxValue,
                type: 'hsv'
            });
        }
    }]);
    return Hue;
}(BaseSlider);

var ColorPalette = function (_UIElement) {
    inherits(ColorPalette, _UIElement);

    function ColorPalette() {
        classCallCheck(this, ColorPalette);
        return possibleConstructorReturn(this, (ColorPalette.__proto__ || Object.getPrototypeOf(ColorPalette)).apply(this, arguments));
    }

    createClass(ColorPalette, [{
        key: 'template',
        value: function template() {
            return '\n        <div class="color-panel">\n            <div ref="$saturation" class="saturation">\n                <div ref="$value" class="value">\n                    <div ref="$drag_pointer" class="drag-pointer"></div>\n                </div>\n            </div>        \n        </div>        \n        ';
        }
    }, {
        key: 'setBackgroundColor',
        value: function setBackgroundColor(color) {
            this.$el.css("background-color", color);
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.setColorUI();
        }
    }, {
        key: 'calculateSV',
        value: function calculateSV() {
            var pos = this.drag_pointer_pos || { x: 0, y: 0 };

            var width = this.$el.width();
            var height = this.$el.height();

            var s = pos.x / width;
            var v = (height - pos.y) / height;

            this.dispatch('changeColor', {
                type: 'hsv',
                s: s,
                v: v
            });
        }
    }, {
        key: 'setColorUI',
        value: function setColorUI() {
            var x = this.state.get('$el.width') * this.$store.hsv.s,
                y = this.state.get('$el.height') * (1 - this.$store.hsv.v);

            this.refs.$drag_pointer.px('left', x);
            this.refs.$drag_pointer.px('top', y);

            this.drag_pointer_pos = { x: x, y: y };

            this.setBackgroundColor(this.read('getHueColor'));
        }
    }, {
        key: 'setMainColor',
        value: function setMainColor(e) {
            // e.preventDefault();
            var pos = this.state.get('$el.offset');
            var w = this.state.get('$el.contentWidth');
            var h = this.state.get('$el.contentHeight');

            var x = Event.pos(e).pageX - pos.left;
            var y = Event.pos(e).pageY - pos.top;

            if (x < 0) x = 0;else if (x > w) x = w;

            if (y < 0) y = 0;else if (y > h) y = h;

            this.refs.$drag_pointer.px('left', x);
            this.refs.$drag_pointer.px('top', y);

            this.drag_pointer_pos = { x: x, y: y };

            this.calculateSV();
        }
    }, {
        key: EVENT('changeColor'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT('initColor'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: POINTEREND('document'),
        value: function value(e) {
            this.isDown = false;
        }
    }, {
        key: POINTERMOVE('document'),
        value: function value(e) {
            if (this.isDown) {
                this.setMainColor(e);
            }
        }
    }, {
        key: POINTERSTART(),
        value: function value(e) {
            this.isDown = true;
            this.setMainColor(e);
        }
    }, {
        key: POINTEREND(),
        value: function value(e) {
            this.isDown = false;
        }
    }]);
    return ColorPalette;
}(UIElement);

var ChromeDevToolColorPicker = function (_BaseColorPicker) {
    inherits(ChromeDevToolColorPicker, _BaseColorPicker);

    function ChromeDevToolColorPicker() {
        classCallCheck(this, ChromeDevToolColorPicker);
        return possibleConstructorReturn(this, (ChromeDevToolColorPicker.__proto__ || Object.getPrototypeOf(ChromeDevToolColorPicker)).apply(this, arguments));
    }

    createClass(ChromeDevToolColorPicker, [{
        key: 'template',
        value: function template() {
            return '<div class=\'colorpicker-body\'>\n            <Palette />\n            <div class="control">\n                <Hue />\n                <Opacity />\n                <div class="empty"></div>\n                <ColorView />\n            </div>\n            <Information />\n            <CurrentColorSets />\n            <ColorSetsChooser />\n            <ContextMenu />\n        </div>';
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Hue: Hue, Opacity: Opacity$2, ColorView: ColorView,
                Palette: ColorPalette,
                Information: ColorInformation,
                CurrentColorSets: CurrentColorSets,
                ColorSetsChooser: ColorSetsChooser,
                ContextMenu: CurrentColorSetsContextMenu
            };
        }
    }]);
    return ChromeDevToolColorPicker;
}(BaseColorPicker);

var MiniColorPicker = function (_BaseColorPicker) {
    inherits(MiniColorPicker, _BaseColorPicker);

    function MiniColorPicker() {
        classCallCheck(this, MiniColorPicker);
        return possibleConstructorReturn(this, (MiniColorPicker.__proto__ || Object.getPrototypeOf(MiniColorPicker)).apply(this, arguments));
    }

    createClass(MiniColorPicker, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'colorpicker-body\'>\n                <Palette />\n                <div class="control">\n                    <Hue />\n                    <Opacity />\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Hue: Hue, Opacity: Opacity$2, Palette: ColorPalette
            };
        }
    }]);
    return MiniColorPicker;
}(BaseColorPicker);

var VerticalSlider = function (_BaseSlider) {
    inherits(VerticalSlider, _BaseSlider);

    function VerticalSlider() {
        classCallCheck(this, VerticalSlider);
        return possibleConstructorReturn(this, (VerticalSlider.__proto__ || Object.getPrototypeOf(VerticalSlider)).apply(this, arguments));
    }

    createClass(VerticalSlider, [{
        key: 'getMaxDist',


        /** get max height for vertical slider */
        value: function getMaxDist() {
            return this.refs.$container.height();
        }

        /** set mouse pointer for vertical slider */

    }, {
        key: 'setMousePosition',
        value: function setMousePosition(y) {
            this.refs.$bar.px('top', y);
        }

        /** get mouse position by pageY for vertical slider */

    }, {
        key: 'getMousePosition',
        value: function getMousePosition(e) {
            return Event.pos(e).pageY;
        }

        /** get min position for vertial slider */

    }, {
        key: 'getMinPosition',
        value: function getMinPosition() {
            return this.refs.$container.offset().top;
        }

        /** get calculated dist for domain value   */

    }, {
        key: 'getCalculatedDist',
        value: function getCalculatedDist(e) {
            var current = e ? this.getMousePosition(e) : this.getCurrent(this.getDefaultValue() / this.maxValue);
            var dist = 100 - this.getDist(current);

            return dist;
        }

        /** set drag bar position  */

    }, {
        key: 'setColorUI',
        value: function setColorUI(v) {

            v = v || this.getDefaultValue();

            if (v <= this.minValue) {
                this.refs.$bar.addClass('first').removeClass('last');
            } else if (v >= this.maxValue) {
                this.refs.$bar.addClass('last').removeClass('first');
            } else {
                this.refs.$bar.removeClass('last').removeClass('first');
            }

            var per = 1 - (v || 0) / this.maxValue;

            this.setMousePosition(this.getMaxDist() * per);
        }
    }]);
    return VerticalSlider;
}(BaseSlider);

var VerticalHue = function (_VerticalSlider) {
    inherits(VerticalHue, _VerticalSlider);

    function VerticalHue() {
        classCallCheck(this, VerticalHue);
        return possibleConstructorReturn(this, (VerticalHue.__proto__ || Object.getPrototypeOf(VerticalHue)).apply(this, arguments));
    }

    createClass(VerticalHue, [{
        key: 'initialize',
        value: function initialize() {
            get$1(VerticalHue.prototype.__proto__ || Object.getPrototypeOf(VerticalHue.prototype), 'initialize', this).call(this);
            this.minValue = 0;
            this.maxValue = 360;
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n            <div class="hue">\n                <div ref="$container" class="hue-container">\n                    <div ref="$bar" class="drag-bar"></div>\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.$store.hsv.h;
        }
    }, {
        key: 'refreshColorUI',
        value: function refreshColorUI(e) {

            var dist = this.getCalculatedDist(e);

            this.setColorUI(dist / 100 * this.maxValue);

            this.changeColor({
                h: dist / 100 * this.maxValue,
                type: 'hsv'
            });
        }
    }]);
    return VerticalHue;
}(VerticalSlider);

var VerticalOpacity = function (_VerticalSlider) {
    inherits(VerticalOpacity, _VerticalSlider);

    function VerticalOpacity() {
        classCallCheck(this, VerticalOpacity);
        return possibleConstructorReturn(this, (VerticalOpacity.__proto__ || Object.getPrototypeOf(VerticalOpacity)).apply(this, arguments));
    }

    createClass(VerticalOpacity, [{
        key: 'template',
        value: function template() {
            return '\n        <div class="opacity">\n            <div ref="$container" class="opacity-container">\n                <div ref="$colorbar" class="color-bar"></div>\n                <div ref="$bar" class="drag-bar2"></div>\n            </div>\n        </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            get$1(VerticalOpacity.prototype.__proto__ || Object.getPrototypeOf(VerticalOpacity.prototype), 'refresh', this).call(this);
            this.setOpacityColorBar();
        }
    }, {
        key: 'setOpacityColorBar',
        value: function setOpacityColorBar() {
            var rgb = _extends({}, this.$store.rgb);

            rgb.a = 0;
            var start = Color$1.format(rgb, 'rgb');

            rgb.a = 1;
            var end = Color$1.format(rgb, 'rgb');

            this.refs.$colorbar.css('background', 'linear-gradient(to top, ' + start + ', ' + end + ')');
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.$store.alpha;
        }
    }, {
        key: 'refreshColorUI',
        value: function refreshColorUI(e) {
            var dist = this.getCalculatedDist(e);

            this.setColorUI(dist / 100 * this.maxValue);

            this.changeColor({
                a: Math.floor(dist) / 100 * this.maxValue
            });
        }
    }]);
    return VerticalOpacity;
}(VerticalSlider);

var MiniColorPicker$2 = function (_BaseColorPicker) {
    inherits(MiniColorPicker, _BaseColorPicker);

    function MiniColorPicker() {
        classCallCheck(this, MiniColorPicker);
        return possibleConstructorReturn(this, (MiniColorPicker.__proto__ || Object.getPrototypeOf(MiniColorPicker)).apply(this, arguments));
    }

    createClass(MiniColorPicker, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'colorpicker-body\'>\n                <Palette /><div class="control"><Hue /><Opacity /></div>\n            </div>\n        ';
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Hue: VerticalHue,
                Opacity: VerticalOpacity,
                Palette: ColorPalette
            };
        }
    }]);
    return MiniColorPicker;
}(BaseColorPicker);

var ColorRing = function (_ColorWheel) {
    inherits(ColorRing, _ColorWheel);

    function ColorRing() {
        classCallCheck(this, ColorRing);
        return possibleConstructorReturn(this, (ColorRing.__proto__ || Object.getPrototypeOf(ColorRing)).apply(this, arguments));
    }

    createClass(ColorRing, [{
        key: 'initialize',
        value: function initialize() {
            get$1(ColorRing.prototype.__proto__ || Object.getPrototypeOf(ColorRing.prototype), 'initialize', this).call(this);

            this.width = 214;
            this.height = 214;
            this.thinkness = 16;
            this.half_thinkness = this.thinkness / 2;
        }
    }, {
        key: 'template',
        value: function template() {
            return '<div class="wheel" data-type="ring">\n            <canvas class="wheel-canvas" ref="$colorwheel" ></canvas>\n            <div class="drag-pointer" ref="$drag_pointer"></div>\n        </div>';
        }
    }, {
        key: 'setColorUI',
        value: function setColorUI(isEvent) {
            this.renderCanvas();
            this.setHueColor(null, isEvent);
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.$store.hsv.h;
        }
    }, {
        key: 'setHueColor',
        value: function setHueColor(e, isEvent) {

            if (!this.state.get('$el.width')) return;

            var _getRectangle = this.getRectangle(),
                minX = _getRectangle.minX,
                minY = _getRectangle.minY,
                radius = _getRectangle.radius,
                centerX = _getRectangle.centerX,
                centerY = _getRectangle.centerY;

            var _getCurrentXY = this.getCurrentXY(e, this.getDefaultValue(), radius, centerX, centerY),
                x = _getCurrentXY.x,
                y = _getCurrentXY.y;

            var rx = x - centerX,
                ry = y - centerY,
                hue = calculateAngle(rx, ry);

            {
                var _getCurrentXY2 = this.getCurrentXY(null, hue, radius - this.half_thinkness, centerX, centerY),
                    x = _getCurrentXY2.x,
                    y = _getCurrentXY2.y;
            }

            // set drag pointer position 
            this.refs.$drag_pointer.px('left', x - minX);
            this.refs.$drag_pointer.px('top', y - minY);

            if (!isEvent) {
                this.changeColor({
                    type: 'hsv',
                    h: hue
                });
            }
        }
    }]);
    return ColorRing;
}(ColorWheel);

var RingColorPicker = function (_BaseColorPicker) {
    inherits(RingColorPicker, _BaseColorPicker);

    function RingColorPicker() {
        classCallCheck(this, RingColorPicker);
        return possibleConstructorReturn(this, (RingColorPicker.__proto__ || Object.getPrototypeOf(RingColorPicker)).apply(this, arguments));
    }

    createClass(RingColorPicker, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'colorpicker-body\'>\n                <ColorRing />\n                <Palette />\n                <div class="control">\n                    <Value />\n                    <Opacity />\n                    <div class="empty"></div>\n                    <ColorView />\n                </div>\n                <Information />\n                <CurrentColorSets />\n                <ColorSetsChooser />\n                <ContextMenu />\n            </div>\n        ';
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Value: Value,
                Opacity: Opacity$2,
                ColorView: ColorView,
                ColorRing: ColorRing,
                Palette: ColorPalette,
                Information: ColorInformation,
                CurrentColorSets: CurrentColorSets,
                ColorSetsChooser: ColorSetsChooser,
                ContextMenu: CurrentColorSetsContextMenu
            };
        }
    }]);
    return RingColorPicker;
}(BaseColorPicker);

var XDColorPicker = function (_BaseColorPicker) {
    inherits(XDColorPicker, _BaseColorPicker);

    function XDColorPicker() {
        classCallCheck(this, XDColorPicker);
        return possibleConstructorReturn(this, (XDColorPicker.__proto__ || Object.getPrototypeOf(XDColorPicker)).apply(this, arguments));
    }

    createClass(XDColorPicker, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'colorpicker-body\'>\n                <palette />\n                <div class="control">\n                    <Hue />\n                    <Opacity />\n                </div>\n                <information />\n                <currentColorSets />\n                <colorSetsChooser />\n                <contextMenu />\n            </div>\n        ';
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Hue: VerticalHue,
                Opacity: VerticalOpacity,
                Palette: ColorPalette,
                Information: ColorInformation,
                CurrentColorSets: CurrentColorSets,
                ColorSetsChooser: ColorSetsChooser,
                ContextMenu: CurrentColorSetsContextMenu
            };
        }
    }]);
    return XDColorPicker;
}(BaseColorPicker);

var RingTabColorPicker = function (_BaseColorPicker) {
    inherits(RingTabColorPicker, _BaseColorPicker);

    function RingTabColorPicker() {
        classCallCheck(this, RingTabColorPicker);
        return possibleConstructorReturn(this, (RingTabColorPicker.__proto__ || Object.getPrototypeOf(RingTabColorPicker)).apply(this, arguments));
    }

    createClass(RingTabColorPicker, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'colorpicker-body\'>\n                <div class=\'color-tab\' ref="$tab">\n                    <div class=\'color-tab-header\' ref="$tabHeader">\n                        <div class=\'color-tab-item active\' item-id="color"><span >' + this.opt.tabTitle + '</span> Color</div>\n                        <div class=\'color-tab-item\' item-id="swatch">Swatch</div>\n                        <div class=\'color-tab-item\' item-id="colorset">Color Set</div>\n                    </div>\n                    <div class=\'color-tab-body\' ref="$tabBody">\n                        <div class=\'color-tab-content active\'  item-id="color">\n                            <ColorRing />\n                            <Palette />\n                            <div class="control">\n                                <Value />\n                                <Opacity />\n                                <div class="empty"></div>\n                                <ColorView />\n                            </div>\n                            <Information />\n                        </div>\n                        <div class=\'color-tab-content\' item-id="swatch">\n                            <CurrentColorSets />\n                            <ContextMenu />\n                        </div>\n                        <div class=\'color-tab-content\' item-id="colorset">\n                            <ColorSetsChooser />\n                        </div>                        \n                    </div>\n            </div>\n        ';
        }
    }, {
        key: CLICK('$tabHeader .color-tab-item'),
        value: function value(e, $dt) {
            if (!$dt.hasClass('active')) {
                var selectedItem = this.refs.$tabHeader.$('.active');
                if (selectedItem) selectedItem.removeClass('active');
                $dt.addClass('active');

                var selectedItem = this.refs.$tabBody.$('.active');
                if (selectedItem) selectedItem.removeClass('active');
                var activeItem = this.refs.$tabBody.$('[item-id=\'' + $dt.attr('item-id') + '\']');
                if (activeItem) activeItem.addClass('active');
            }
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Value: Value,
                Opacity: Opacity$2,
                ColorView: ColorView,
                ColorRing: ColorRing,
                Palette: ColorPalette,
                Information: ColorInformation,
                CurrentColorSets: CurrentColorSets,
                ColorSetsChooser: ColorSetsChooser,
                ContextMenu: CurrentColorSetsContextMenu
            };
        }
    }]);
    return RingTabColorPicker;
}(BaseColorPicker);

var XDTabColorPicker = function (_BaseColorPicker) {
    inherits(XDTabColorPicker, _BaseColorPicker);

    function XDTabColorPicker() {
        classCallCheck(this, XDTabColorPicker);
        return possibleConstructorReturn(this, (XDTabColorPicker.__proto__ || Object.getPrototypeOf(XDTabColorPicker)).apply(this, arguments));
    }

    createClass(XDTabColorPicker, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'colorpicker-body\'>\n                <div class=\'color-tab xd\' ref="$tab">\n                    <div class=\'color-tab-header\' ref="$tabHeader">\n                        <div class=\'color-tab-item active\' item-id="color"><span >' + this.opt.tabTitle + '</span> Color</div>\n                        <div class=\'color-tab-item\' item-id="swatch">Swatch</div>\n                        <div class=\'color-tab-item\' item-id="colorset">Color Set</div>\n                    </div>\n                    <div class=\'color-tab-body\' ref="$tabBody">\n                        <div class=\'color-tab-content active\'  item-id="color">\n                            <palette />\n                            <div class="control">\n                                <Hue />\n                                <Opacity />\n                            </div>\n                            <information />\n                        </div>\n                        <div class=\'color-tab-content\' item-id="swatch">\n                            <CurrentColorSets />\n                            <ContextMenu />\n                        </div>\n                        <div class=\'color-tab-content\' item-id="colorset">\n                            <ColorSetsChooser />\n                        </div>                        \n                    </div>\n\n            </div>\n        ';
        }
    }, {
        key: CLICK('$tabHeader .color-tab-item'),
        value: function value(e, $dt) {
            if (!$dt.hasClass('active')) {
                var selectedItem = this.refs.$tabHeader.$('.active');
                if (selectedItem) selectedItem.removeClass('active');
                $dt.addClass('active');

                var selectedItem = this.refs.$tabBody.$('.active');
                if (selectedItem) selectedItem.removeClass('active');
                var activeItem = this.refs.$tabBody.$('[item-id=\'' + $dt.attr('item-id') + '\']');
                if (activeItem) activeItem.addClass('active');
            }
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                Hue: VerticalHue,
                Opacity: VerticalOpacity,
                Palette: ColorPalette,
                Information: ColorInformation,
                CurrentColorSets: CurrentColorSets,
                ColorSetsChooser: ColorSetsChooser,
                ContextMenu: CurrentColorSetsContextMenu
            };
        }
    }]);
    return XDTabColorPicker;
}(BaseColorPicker);

var ColorPicker = {
    create: function create(opts) {
        switch (opts.type) {
            case 'macos':
                return new MacOSColorPicker(opts);
            case 'xd':
                return new XDColorPicker(opts);
            case 'xd-tab':
                return new XDTabColorPicker(opts);
            case 'ring':
                return new RingColorPicker(opts);
            case 'ring-tab':
                return new RingTabColorPicker(opts);
            case 'mini':
                return new MiniColorPicker(opts);
            case 'mini-vertical':
                return new MiniColorPicker$2(opts);
            case 'sketch':
            case 'palette':
            default:
                return new ChromeDevToolColorPicker(opts);
        }
    },

    ColorPicker: ChromeDevToolColorPicker,
    ChromeDevToolColorPicker: ChromeDevToolColorPicker,
    MacOSColorPicker: MacOSColorPicker,
    RingColorPicker: RingColorPicker,
    MiniColorPicker: MiniColorPicker,
    MiniVerticalColorPicker: MiniColorPicker$2,
    XDColorPicker: XDColorPicker
};

var FillColorPicker = function (_UIElement) {
    inherits(FillColorPicker, _UIElement);

    function FillColorPicker() {
        classCallCheck(this, FillColorPicker);
        return possibleConstructorReturn(this, (FillColorPicker.__proto__ || Object.getPrototypeOf(FillColorPicker)).apply(this, arguments));
    }

    createClass(FillColorPicker, [{
        key: 'afterRender',
        value: function afterRender() {
            var _this2 = this;

            var defaultColor = 'rgba(0, 0, 0, 0)';

            this.colorPicker = ColorPicker.create({
                type: 'xd-tab',
                tabTitle: 'Fill',
                position: 'inline',
                container: this.$el.el,
                color: defaultColor,
                onChange: function onChange(c) {
                    _this2.changeColor(c);
                }
            });

            setTimeout(function () {
                _this2.colorPicker.dispatch('initColor', defaultColor);
            }, 100);
        }
    }, {
        key: 'template',
        value: function template() {
            return '<div class=\'colorpicker-layer\'> </div>';
        }
    }, {
        key: 'changeColor',
        value: function changeColor(color) {
            if (this.changeColorId) {
                this.commit(this.eventType, { id: this.changeColorId, color: color });
            } else {
                if (this.callback) {
                    this.callback(color);
                }
            }
        }
    }, {
        key: EVENT('fillColorId'),
        value: function value(id, eventType) {
            this.changeColorId = id;
            this.itemType = this.get(id).itemType;
            this.eventType = eventType;

            this.color = null;
            this.callback = null;

            this.refresh();
        }
    }, {
        key: EVENT('selectFillColor'),
        value: function value(color, callback) {
            this.changeColorId = null;
            this.itemType = null;
            this.eventType = null;
            this.color = color;
            this.callback = callback;

            this.refresh();
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            if (this.changeColorId) {
                var item = this.get(this.changeColorId);
                this.colorPicker.initColorWithoutChangeEvent(item.color);
            } else if (this.callback) {
                this.colorPicker.initColorWithoutChangeEvent(this.color);
            }
        }
    }]);
    return FillColorPicker;
}(UIElement);

var FillColorPickerPanel = function (_UIElement) {
    inherits(FillColorPickerPanel, _UIElement);

    function FillColorPickerPanel() {
        classCallCheck(this, FillColorPickerPanel);
        return possibleConstructorReturn(this, (FillColorPickerPanel.__proto__ || Object.getPrototypeOf(FillColorPickerPanel)).apply(this, arguments));
    }

    createClass(FillColorPickerPanel, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item fill-colorpicker show'>\n                <div class='items'>            \n                    <FillColorPicker></FillColorPicker>\n                </div>\n                <div class='items bar'></div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return { FillColorPicker: FillColorPicker };
        }
    }]);
    return FillColorPickerPanel;
}(UIElement);

var Text = function (_BasePropertyItem) {
    inherits(Text, _BasePropertyItem);

    function Text() {
        classCallCheck(this, Text);
        return possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).apply(this, arguments));
    }

    createClass(Text, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item text show'>\n                <div class='items'>\n                    <div class=\"not-clip\">\n                        <label>Text Color</label>\n                        <div>\n                            <span class='color' ref='$color'></span> \n                            <input type=\"text\" class='color-text' ref='$colorText'/>\n                        </div>\n                    </div>\n                    <div class=\"not-clip\">\n                        <label>Clip Area</label>\n                        <div class='size-list full-size'>\n                            <select ref=\"$clip\">\n                                <option value=\"content-box\">content-box</option>\n                                <option value=\"border-box\">border-box</option>\n                                <option value=\"padding-box\">padding-box</option>\n                                <option value=\"text\">text</option>\n                            </select>\n                        </div>\n                    </div>    \n                    <div class=\"not-clip\">\n                        <label></label>\n                        <div class='size-list'>\n                            <label><input type=\"checkbox\" ref=\"$clipText\" /> only text </label>\n                        </div>\n                    </div>    \n\n                    <div>\n                        <textarea class='content' ref=\"$content\"></textarea>\n                    </div>\n                </div>            \n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                this.refs.$color.css('background-color', layer.color);
                this.refs.$colorText.val(layer.color || EMPTY_STRING);
                this.refs.$content.val(layer.content || EMPTY_STRING);
                this.refs.$clip.val(layer.backgroundClip);
                this.refs.$clipText.checked(layer.clipText || false);

                this.$el.toggleClass('has-clip-text', layer.clipText || false);
            }
        }
    }, {
        key: INPUT('$content'),
        value: function value$$1(e) {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.content = this.refs.$content;
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: CLICK('$color'),
        value: function value$$1(e) {
            var layer = editor$1.selection.layer;
            
        }
    }, {
        key: CHANGE('$clip'),
        value: function value$$1(e) {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.backgroundClip = this.refs.$clip;
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: CLICK('$clipText'),
        value: function value$$1(e) {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.clipText = this.refs.$clipText;
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }]);
    return Text;
}(BasePropertyItem);

var LayerCode = function (_BasePropertyItem) {
    inherits(LayerCode, _BasePropertyItem);

    function LayerCode() {
        classCallCheck(this, LayerCode);
        return possibleConstructorReturn(this, (LayerCode.__proto__ || Object.getPrototypeOf(LayerCode)).apply(this, arguments));
    }

    createClass(LayerCode, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item layer-code show'>\n                <div class='items'>\n                    <div class=\"key-value-view\" ref=\"$keys\"></div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: LOAD('$keys'),
        value: function value$$1() {
            var layer = editor$1.selection.layer;

            if (!layer) return EMPTY_STRING;

            return keyMap(layer.toCSS(), function (key, value$$1) {
                if (key == 'background-image' || key == 'box-shadow' || key == 'text-shadow') {
                    var ret = convertMatches(value$$1);

                    var str = ret.str.split(',').join(',\n  ');

                    str = str.replace(/\(/g, '(\n');
                    str = str.replace(/\)/g, '\n)');

                    value$$1 = reverseMatches(str, ret.matches);
                }

                var isShort = EMPTY_STRING;

                if (value$$1.length < 20) {
                    isShort = 'short';
                }

                return "\n                <div class=\"key-value-item " + isShort + "\">\n                    <div class=\"key\">" + key + ":</div>\n                    <pre class=\"value\">" + value$$1 + ";</pre>\n                </div>\n            ";
            });
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_BOXSHADOW, CHANGE_TEXTSHADOW, CHANGE_EDITOR, CHANGE_SELECTION, SELECT_TAB_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            if (editor$1.config.get('tool.tabs.layer.selectedId') === 'css') {
                this.load();
            }
        }
    }]);
    return LayerCode;
}(BasePropertyItem);

var BackgroundCode = function (_BasePropertyItem) {
    inherits(BackgroundCode, _BasePropertyItem);

    function BackgroundCode() {
        classCallCheck(this, BackgroundCode);
        return possibleConstructorReturn(this, (BackgroundCode.__proto__ || Object.getPrototypeOf(BackgroundCode)).apply(this, arguments));
    }

    createClass(BackgroundCode, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item background-code show'>\n                <div class='items'><div class=\"key-value-view\" ref=\"$keys\"></div></div>\n            </div>\n        ";
        }
    }, {
        key: LOAD('$keys'),
        value: function value$$1() {
            var image = editor$1.selection.currentBackgroundImage;
            if (!image) return EMPTY_STRING;

            var obj = image.toCSS();

            return keyMap(obj, function (key, value$$1) {
                if (key == 'background-image') {
                    var ret = convertMatches(value$$1);

                    var str = ret.str.split(',').join(',\n  ');

                    str = str.replace('(', '(\n');
                    str = str.replace(')', '\n)');

                    value$$1 = reverseMatches(str, ret.matches);
                }

                return "\n                <div class=\"key-value-item\">\n                    <div class=\"key\">" + key + ":</div>\n                    <pre class=\"value\">" + value$$1 + ";</pre>\n                </div>\n            ";
            });
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_COLORSTEP, CHANGE_EDITOR, CHANGE_SELECTION, SELECT_TAB_IMAGE),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            if (editor$1.config.get('tool.tabs.image.selectedId') == 'css') {
                this.load();
            }
        }
    }]);
    return BackgroundCode;
}(BasePropertyItem);

var _templateObject$10 = taggedTemplateLiteral(["\n            <div class='property-item font show'>\n                <div class='items'>\n                    <div>\n                        <label>Family</label>   \n                        <div class='full-size'>\n                            <select ref=\"$fontFamily\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>   \n                    <div>\n                        <label>Weight</label>   \n                        <div class='full-size'>\n                            <select ref=\"$fontWeight\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>                       \n                    <div>\n                        <label>Size</label>\n                        <UnitRange \n                            ref=\"$fontSize\" \n                            min=\"1\" max=\"300\" step=\"1\" value=\"13\" unit=\"", "\"\n                            maxValueFunction=\"getMaxFontSize\"\n                            updateFunction=\"updateFontSize\"\n                        />\n                    </div>      \n                    <div>\n                        <label>Line Height</label>\n                        <UnitRange \n                            ref=\"$lineHeight\" \n                            min=\"1\" max=\"100\" step=\"0.01\" value=\"1\" unit=\"", "\"\n                            maxValueFunction=\"getMaxLineHeight\"\n                            updateFunction=\"updateLineHeight\"\n                        />\n                    </div>                           \n                </div>\n            </div>\n        "], ["\n            <div class='property-item font show'>\n                <div class='items'>\n                    <div>\n                        <label>Family</label>   \n                        <div class='full-size'>\n                            <select ref=\"$fontFamily\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>   \n                    <div>\n                        <label>Weight</label>   \n                        <div class='full-size'>\n                            <select ref=\"$fontWeight\">\n                                ", "\n                            </select>\n                        </div>\n                    </div>                       \n                    <div>\n                        <label>Size</label>\n                        <UnitRange \n                            ref=\"$fontSize\" \n                            min=\"1\" max=\"300\" step=\"1\" value=\"13\" unit=\"", "\"\n                            maxValueFunction=\"getMaxFontSize\"\n                            updateFunction=\"updateFontSize\"\n                        />\n                    </div>      \n                    <div>\n                        <label>Line Height</label>\n                        <UnitRange \n                            ref=\"$lineHeight\" \n                            min=\"1\" max=\"100\" step=\"0.01\" value=\"1\" unit=\"", "\"\n                            maxValueFunction=\"getMaxLineHeight\"\n                            updateFunction=\"updateLineHeight\"\n                        />\n                    </div>                           \n                </div>\n            </div>\n        "]);

var fontFamilyList = ['Georgia', "Times New Roman", 'serif', 'sans-serif'];

var fontWeightList = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

var MAX_FONT_SIZE = 300;
var MAX_LINE_HEIGHT = 100;

var Font = function (_BasePropertyItem) {
    inherits(Font, _BasePropertyItem);

    function Font() {
        classCallCheck(this, Font);
        return possibleConstructorReturn(this, (Font.__proto__ || Object.getPrototypeOf(Font)).apply(this, arguments));
    }

    createClass(Font, [{
        key: "template",
        value: function template() {
            return html(_templateObject$10, fontFamilyList.map(function (f) {
                return "<option value=\"" + f + "\">" + f + "</option>";
            }), fontWeightList.map(function (f) {
                return "<option value=\"" + f + "\">" + f + "</option>";
            }), UNIT_PX, UNIT_PX);
        }
    }, {
        key: "components",
        value: function components() {
            return { UnitRange: UnitRange };
        }
    }, {
        key: "getMaxFontSize",
        value: function getMaxFontSize() {
            return MAX_FONT_SIZE;
        }
    }, {
        key: "getMaxLineHeight",
        value: function getMaxLineHeight() {
            return MAX_LINE_HEIGHT;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                this.refs.$fontFamily.val(layer.fontFamily);
                this.refs.$fontWeight.val(layer.fontWeight);
                this.children.$fontSize.refresh(layer.fontSize);
                this.children.$lineHeight.refresh(layer.lineHeight);
            }
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "updateFont",
        value: function updateFont() {
            var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            editor$1.selection.updateLayer(CHANGE_LAYER, attrs);
        }
    }, {
        key: "updateFontSize",
        value: function updateFontSize(fontSize) {
            this.updateFont({ fontSize: fontSize });
        }
    }, {
        key: "updateLineHeight",
        value: function updateLineHeight(lineHeight) {
            this.updateFont({ lineHeight: lineHeight });
        }
    }, {
        key: "updateFontFamily",
        value: function updateFontFamily(fontFamily) {
            this.updateFont({ fontFamily: fontFamily });
        }
    }, {
        key: "updateFontWeight",
        value: function updateFontWeight(fontWeight) {
            this.updateFont({ fontWeight: fontWeight });
        }
    }, {
        key: CHANGE('$fontFamily'),
        value: function value$$1(e) {
            this.updateFontFamily(this.refs.$fontFamily.val());
        }
    }, {
        key: CHANGE('$fontWeight'),
        value: function value$$1(e) {
            this.updateFontWeight(this.refs.$fontWeight.val());
        }
    }]);
    return Font;
}(BasePropertyItem);

var BackgroundClip = function (_BasePropertyItem) {
    inherits(BackgroundClip, _BasePropertyItem);

    function BackgroundClip() {
        classCallCheck(this, BackgroundClip);
        return possibleConstructorReturn(this, (BackgroundClip.__proto__ || Object.getPrototypeOf(BackgroundClip)).apply(this, arguments));
    }

    createClass(BackgroundClip, [{
        key: 'template',
        value: function template() {
            return '\n        <div class=\'property-item clip-area show\'>\n            <div class=\'items\'>         \n                <div>\n                    <label>Clip Area</label>\n                    <div class=\'size-list full-size\'>\n                        <select ref="$clip">\n                            <option value="content-box">content-box</option>\n                            <option value="border-box">border-box</option>\n                            <option value="padding-box">padding-box</option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ';
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return editor$1.selection.layer;
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var layer = editor$1.selection.currentLayer;
            if (layer) {
                this.refs.$clip.val(layer.backgroundClip);
            }
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: CHANGE('$clip'),
        value: function value(e) {
            var layer = editor$1.selection.currentLayer;
            if (layer) {
                layer.backgroundClip = this.refs.$clip;
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }]);
    return BackgroundClip;
}(BasePropertyItem);

var TextFillColorPicker = function (_UIElement) {
    inherits(TextFillColorPicker, _UIElement);

    function TextFillColorPicker() {
        classCallCheck(this, TextFillColorPicker);
        return possibleConstructorReturn(this, (TextFillColorPicker.__proto__ || Object.getPrototypeOf(TextFillColorPicker)).apply(this, arguments));
    }

    createClass(TextFillColorPicker, [{
        key: 'afterRender',
        value: function afterRender() {
            var _this2 = this;

            var defaultColor = 'rgba(0, 0, 0, 0)';

            this.colorPicker = ColorPicker.create({
                type: 'xd-tab',
                tabTitle: 'Text',
                position: 'inline',
                container: this.$el.el,
                color: defaultColor,
                onChange: function onChange(c) {
                    _this2.changeColor(c);
                }
            });

            setTimeout(function () {
                _this2.colorPicker.dispatch('initColor', defaultColor);
            }, 100);
        }
    }, {
        key: 'templateClass',
        value: function templateClass() {
            return 'colorpicker-layer';
        }
    }, {
        key: 'changeColor',
        value: function changeColor(color) {
            if (this.changeColorId) {
                this.commit(this.eventType, { id: this.changeColorId, color: color });
            }
        }

        // [EVENT(TEXT_FILL_COLOR)] (id, eventType) {
        //     this.changeColorId = id;
        //     this.itemType = this.get( id).itemType;
        //     this.eventType = eventType;

        //     this.refresh();
        // }

    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: 'setColor',
        value: function setColor(color) {
            this.colorPicker.initColorWithoutChangeEvent(color);
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            if (this.changeColorId) {
                var item = this.get(this.changeColorId);
                this.setColor(item.color);
            }
        }
    }]);
    return TextFillColorPicker;
}(UIElement);

var LayerTextColorPickerPanel = function (_UIElement) {
    inherits(LayerTextColorPickerPanel, _UIElement);

    function LayerTextColorPickerPanel() {
        classCallCheck(this, LayerTextColorPickerPanel);
        return possibleConstructorReturn(this, (LayerTextColorPickerPanel.__proto__ || Object.getPrototypeOf(LayerTextColorPickerPanel)).apply(this, arguments));
    }

    createClass(LayerTextColorPickerPanel, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item text-colorpicker show'>\n                <div class='items'>            \n                    <TextFillColorPicker />\n                </div>\n                <div class='items bar'></div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return { TextFillColorPicker: TextFillColorPicker };
        }
    }]);
    return LayerTextColorPickerPanel;
}(UIElement);

var InfoFillColorPicker = function (_UIElement) {
    inherits(InfoFillColorPicker, _UIElement);

    function InfoFillColorPicker() {
        classCallCheck(this, InfoFillColorPicker);
        return possibleConstructorReturn(this, (InfoFillColorPicker.__proto__ || Object.getPrototypeOf(InfoFillColorPicker)).apply(this, arguments));
    }

    createClass(InfoFillColorPicker, [{
        key: 'initialize',
        value: function initialize() {
            get$1(InfoFillColorPicker.prototype.__proto__ || Object.getPrototypeOf(InfoFillColorPicker.prototype), 'initialize', this).call(this);

            this.eventType = CHANGE_LAYER;
            this.eventKey = 'backgroundColor';
        }
    }, {
        key: 'afterRender',
        value: function afterRender() {
            var _this2 = this;

            var defaultColor = 'rgba(0, 0, 0, 0)';

            this.colorPicker = ColorPicker.create({
                type: 'xd-tab',
                tabTitle: 'Background',
                position: 'inline',
                container: this.$el.el,
                color: defaultColor,
                onChange: function onChange(c) {
                    _this2.changeColor(c);
                }
            });

            setTimeout(function () {
                _this2.colorPicker.dispatch('initColor', defaultColor);
            }, 100);
        }
    }, {
        key: 'template',
        value: function template() {
            return '<div class=\'colorpicker-layer\'> </div>';
        }
    }, {
        key: 'changeColor',
        value: function changeColor(color) {
            editor$1.selection.updateLayer(this.eventType, defineProperty({}, this.eventKey, color));
        }
    }, {
        key: 'setColor',
        value: function setColor(color) {
            this.colorPicker.initColorWithoutChangeEvent(color);
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var layer = editor$1.selection.layer;
            if (layer) {
                var color = layer.backgroundColor || 'rgba(0, 0, 0, 1)';
                this.setColor(color);
            }
        }
    }]);
    return InfoFillColorPicker;
}(UIElement);

var LayerInfoColorPickerPanel = function (_UIElement) {
    inherits(LayerInfoColorPickerPanel, _UIElement);

    function LayerInfoColorPickerPanel() {
        classCallCheck(this, LayerInfoColorPickerPanel);
        return possibleConstructorReturn(this, (LayerInfoColorPickerPanel.__proto__ || Object.getPrototypeOf(LayerInfoColorPickerPanel)).apply(this, arguments));
    }

    createClass(LayerInfoColorPickerPanel, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item text-colorpicker show'>\n                <div class='items'>            \n                    <InfoFillColorPicker />\n                </div>\n                <div class=\"items bar\"></div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return { InfoFillColorPicker: InfoFillColorPicker };
        }
    }]);
    return LayerInfoColorPickerPanel;
}(UIElement);

var BorderFillColorPicker = function (_UIElement) {
    inherits(BorderFillColorPicker, _UIElement);

    function BorderFillColorPicker() {
        classCallCheck(this, BorderFillColorPicker);
        return possibleConstructorReturn(this, (BorderFillColorPicker.__proto__ || Object.getPrototypeOf(BorderFillColorPicker)).apply(this, arguments));
    }

    createClass(BorderFillColorPicker, [{
        key: 'initialize',
        value: function initialize() {
            get$1(BorderFillColorPicker.prototype.__proto__ || Object.getPrototypeOf(BorderFillColorPicker.prototype), 'initialize', this).call(this);

            this.eventType = CHANGE_LAYER;
            this.eventKey = 'borderColor';
        }
    }, {
        key: 'afterRender',
        value: function afterRender() {
            var _this2 = this;

            var defaultColor = 'rgba(0, 0, 0, 0)';

            this.colorPicker = ColorPicker.create({
                type: 'xd-tab',
                tabTitle: 'Border',
                position: 'inline',
                container: this.$el.el,
                color: defaultColor,
                onChange: function onChange(c) {
                    _this2.changeColor(c);
                }
            });

            setTimeout(function () {
                _this2.colorPicker.dispatch('initColor', defaultColor);
            }, 100);
        }
    }, {
        key: 'template',
        value: function template() {
            return '<div class=\'colorpicker-layer\'> </div>';
        }
    }, {
        key: 'changeColor',
        value: function changeColor(color) {
            var _this3 = this;

            this.read(SELECTION_CURRENT_LAYER_ID, function (id) {
                _this3.commit(_this3.eventType, _extends(defineProperty({ id: id }, _this3.eventKey, color), _this3.eventOpt));
            });
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var _this4 = this;

            if (this.read(SELECTION_IS_LAYER)) {
                this.read(SELECTION_CURRENT_LAYER, function (layer) {
                    if (layer.borderColor) {
                        _this4.setColor(layer.borderColor);
                    }
                });
            }
        }
    }, {
        key: 'setColor',
        value: function setColor(color) {
            this.colorPicker.initColorWithoutChangeEvent(color);
        }
    }, {
        key: EVENT('selectBorderColor'),
        value: function value(color, key, eventType) {
            var opt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            this.eventKey = key;
            this.eventType = eventType;
            this.eventOpt = opt;

            this.setColor(color);
        }
    }]);
    return BorderFillColorPicker;
}(UIElement);

var LayerBorderColorPickerPanel = function (_UIElement) {
    inherits(LayerBorderColorPickerPanel, _UIElement);

    function LayerBorderColorPickerPanel() {
        classCallCheck(this, LayerBorderColorPickerPanel);
        return possibleConstructorReturn(this, (LayerBorderColorPickerPanel.__proto__ || Object.getPrototypeOf(LayerBorderColorPickerPanel)).apply(this, arguments));
    }

    createClass(LayerBorderColorPickerPanel, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item text-colorpicker show'>\n                <div class='items'>            \n                    <!--BorderFillColorPicker /-->\n                </div>\n                <div class=\"items bar\"></div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return { BorderFillColorPicker: BorderFillColorPicker };
        }
    }]);
    return LayerBorderColorPickerPanel;
}(UIElement);

var BACKDROP_GET = 'backdrop/get';

var _templateObject$11 = taggedTemplateLiteral(["\n            <div class='filter'>\n                <span class=\"area\"></span>\n                <span class=\"checkbox\">\n                    <input type=\"checkbox\" ", " data-key=\"", "\" />\n                </span>\n                <span class='title long' draggable=\"true\">", "</span>\n            </div>\n            <div class='items'>\n                ", "\n            </div>\n            "], ["\n            <div class='filter'>\n                <span class=\"area\"></span>\n                <span class=\"checkbox\">\n                    <input type=\"checkbox\" ", " data-key=\"", "\" />\n                </span>\n                <span class='title long' draggable=\"true\">", "</span>\n            </div>\n            <div class='items'>\n                ", "\n            </div>\n            "]);

var DROPSHADOW_FILTER_KEYS$1 = ['backdropDropshadowOffsetX', 'backdropDropshadowOffsetY', 'backdropDropshadowBlurRadius', 'backdropDropshadowColor'];

var BackdropList = function (_BasePropertyItem) {
    inherits(BackdropList, _BasePropertyItem);

    function BackdropList() {
        classCallCheck(this, BackdropList);
        return possibleConstructorReturn(this, (BackdropList.__proto__ || Object.getPrototypeOf(BackdropList)).apply(this, arguments));
    }

    createClass(BackdropList, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item filters show'>\n                <div class='items'> <div class=\"filter-list\" ref=\"$filterList\"></div></div>\n            </div>\n        ";
        }
    }, {
        key: "makeInputItem",
        value: function makeInputItem(key, viewObject, dataObject) {
            var _this2 = this;

            var value$$1 = dataObject[key] ? dataObject[key].value : undefined;

            if (viewObject.type == 'range') {
                if (isUndefined$1(value$$1)) {
                    value$$1 = viewObject.defaultValue;
                }

                return "\n                <div class='filter'>\n                    <span class=\"area\"></span>                \n                    <span class=\"checkbox\">\n                        <input type=\"checkbox\" " + (dataObject.checked ? "checked=\"checked\"" : EMPTY_STRING) + " data-key=\"" + key + "\" />\n                    </span>\n                    <span class='title' draggable=\"true\">" + viewObject.title + "</span>\n                    <span class='range'><input type=\"range\" min=\"" + viewObject.min + "\" max=\"" + viewObject.max + "\" step=\"" + viewObject.step + "\" value=\"" + value$$1 + "\" ref=\"" + key + "Range\" data-key=\"" + key + "\"/></span>\n                    <span class='input-value'><input type=\"number\" min=\"" + viewObject.min + "\" max=\"" + viewObject.max + "\" step=\"" + viewObject.step + "\" value=\"" + value$$1 + "\"  ref=\"" + key + "Number\" data-key=\"" + key + "\"/></span>\n                    <span class='unit'>" + unitString(viewObject.unit) + "</span>\n                </div>\n            ";
            } else if (viewObject.type == 'multi') {
                return html(_templateObject$11, dataObject.checked ? "checked=\"checked\"" : EMPTY_STRING, key, viewObject.title, DROPSHADOW_FILTER_KEYS$1.map(function (subkey) {

                    var it = _this2.read(BACKDROP_GET, subkey);
                    var value$$1 = isUndefined$1(dataObject[subkey]) ? it.defaultValue : unitValue(dataObject[subkey]);

                    if (isColorUnit(it)) {
                        return "\n                        <div>\n                            <span class='title'>" + it.title + "</span>\n                            <span class='color'>\n                                <span class=\"color-view drop-shadow\" ref=\"$dropShadowColor\" style=\"background-color: " + value$$1 + "\" data-key=\"" + subkey + "\" ></span>\n                                <span class=\"color-text\" ref=\"$dropShadowColorText\">" + value$$1 + "</span>\n                            </span>\n                        </div>\n                        ";
                    } else {

                        return "\n                        <div>\n                            <span class='title'>" + it.title + "</span>\n                            <span class='range'><input type=\"range\" min=\"" + it.min + "\" max=\"" + it.max + "\" step=\"" + it.step + "\" value=\"" + value$$1 + "\" ref=\"" + subkey + "Range\"  data-key=\"" + subkey + "\" /></span>\n                            <span class='input-value'><input type=\"number\" min=\"" + it.min + "\" max=\"" + it.max + "\" step=\"" + it.step + "\" value=\"" + value$$1 + "\" ref=\"" + subkey + "Number\" data-key=\"" + subkey + "\" /></span>\n                            <span class='unit'>" + unitString(it.unit) + "</span>\n                        </div>\n                        ";
                    }
                }));
            }

            return "<div></div>";
        }
    }, {
        key: LOAD('$filterList'),
        value: function value$$1() {
            var _this3 = this;

            var layer = editor$1.selection.currentLayer;
            if (!layer) return EMPTY_STRING;

            return layer.backdropFilters.map(function (filter) {
                return "\n                <div class='filter-item'>\n                    <div class=\"filter-item-input\">\n                        " + _this3.makeInputItem(filter) + "\n                    </div>\n                </div>";
            });
        }
    }, {
        key: "refreshFilter",
        value: function refreshFilter(obj) {
            Object.keys(obj).filter(function (key) {
                return key.includes('backdrop');
            }).forEach(function (key) {
                console.log(key);
            });
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_LAYER),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "isShow",
        value: function isShow() {
            return true;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: "updateFilterKeyValue",
        value: function updateFilterKeyValue(key, lastValue) {

            console.log('구현해줘요');
        }
    }, {
        key: CHANGEINPUT('$filterList input[type=range]'),
        value: function value$$1(e) {
            var $range = e.$delegateTarget;
            var key = $range.attr('data-key');
            this.refs[key + "Number"].val($range.val());
            this.updateFilterKeyValue(key, $range.val());
        }
    }, {
        key: INPUT('$filterList input[type=number]'),
        value: function value$$1(e) {
            var $number = e.$delegateTarget;
            var key = $number.attr('data-key');
            this.refs[key + "Range"].val($number.val());
            this.updateFilterKeyValue(key, $number.val());
        }
    }, {
        key: CLICK('$el .drop-shadow'),
        value: function value$$1(e) {
            var color$$1 = e.$delegateTarget.css('background-color');
            this.emit('selectFillColor', color$$1, this.updateDropShadowColor.bind(this));
        }
    }, {
        key: "updateDropShadowColor",
        value: function updateDropShadowColor(color$$1) {
            this.refs.$dropShadowColor.css('background-color', color$$1);
            this.refs.$dropShadowColorText.text(color$$1);

            var key = this.refs.$dropShadowColor.attr('data-key');

            this.updateFilterKeyValue(key, color$$1);
        }
    }]);
    return BackdropList;
}(BasePropertyItem);

var EmptyArea = function (_BasePropertyItem) {
    inherits(EmptyArea, _BasePropertyItem);

    function EmptyArea() {
        classCallCheck(this, EmptyArea);
        return possibleConstructorReturn(this, (EmptyArea.__proto__ || Object.getPrototypeOf(EmptyArea)).apply(this, arguments));
    }

    createClass(EmptyArea, [{
        key: "template",
        value: function template() {
            return "<div class='property-item empty-area show' style=\"height: " + this.props.height + ";\"></div>";
        }
    }]);
    return EmptyArea;
}(BasePropertyItem);

var Page3D = function (_UIElement) {
    inherits(Page3D, _UIElement);

    function Page3D() {
        classCallCheck(this, Page3D);
        return possibleConstructorReturn(this, (Page3D.__proto__ || Object.getPrototypeOf(Page3D)).apply(this, arguments));
    }

    createClass(Page3D, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item size show'>\n                <div class='items'>\n                    <div>\n                        <label> 3D </label>\n                        <div>\n                            <label><input type='checkbox' ref=\"$preserve\"> preserve-3d </label>\n                        </div>\n                    </div>    \n                    <div>\n                        <label> Perspective </label>\n                        <div>\n                            <input type=\"range\" ref=\"$perspectiveRange\" min=\"-2000\" max=\"2000\" /> \n                            <input type=\"number\" ref=\"$perspective\" /> <span class='unit'>%</span>\n                        </div>                        \n                    </div>                                 \n                    <div>\n                        <label>Origin  X </label>\n                        <div>\n                            <input type=\"range\" ref=\"$xRange\" min=\"-100\" max=\"100\" />                         \n                            <input type=\"number\" ref=\"$x\" /> <span class='unit'>%</span>\n                        </div>\n                    </div>                                            \n                    <div>\n                        <label>Origin Y </label>\n                        <div>\n                            <input type=\"range\" ref=\"$yRange\" min=\"-100\" max=\"100\" />                                                 \n                            <input type=\"number\" ref=\"$y\" /> <span class='unit'>%</span>\n                        </div>\n                    </div>                                                                \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_ARTBOARD),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var item = editor$1.selection.artboard;
            if (item) {
                var perspective = defaultValue(item.perspective, Length$1.px(0));
                var perspectiveOriginPositionX = defaultValue(item.perspectiveOriginPositionX, Length$1.percent(0));
                var perspectiveOriginPositionY = defaultValue(item.perspectiveOriginPositionY, Length$1.percent(0));

                this.refs.$perspective.val(+perspective);
                this.refs.$perspectiveRange.val(+perspective);
                this.refs.$x.val(+perspectiveOriginPositionX);
                this.refs.$y.val(+perspectiveOriginPositionY);
                this.refs.$xRange.val(+perspectiveOriginPositionX);
                this.refs.$yRange.val(+perspectiveOriginPositionY);
                this.refs.$preserve.checked(!!item.preserve);
            }
        }
    }, {
        key: CLICK('$preserve'),
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                artboard.preserve = this.refs.$preserve;
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: INPUT('$perspective'),
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                var value = this.refs.$perspective.val();
                artboard.perspective = Length$1.px(+value);
                this.refs.$perspectiveRange.val(value);
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: CHANGEINPUT('$perspectiveRange'),
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                var value = this.refs.$perspectiveRange.val();
                artboard.perspective = Length$1.px(+value);
                this.refs.$perspective.val(value);
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: INPUT('$x'),
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                var value = this.refs.$x.val();
                artboard.perspectiveOriginPositionX = Length$1.percent(+value);
                this.refs.$xRange.val(value);
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: CHANGEINPUT('$xRange'),
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                var value = this.refs.$xRange.val();
                this.refs.$x.val(value);
                artboard.perspectiveOriginPositionX = Length$1.percent(+value);
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: INPUT('$y'),
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                var value = this.refs.$y.val();
                artboard.perspectiveOriginPositionY = Length$1.percent(+value);
                this.refs.$yRange.val(value);
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: CHANGEINPUT('$yRange'),
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                var value = this.refs.$yRange.val();
                this.refs.$y.val(value);
                artboard.perspectiveOriginPositionY = Length$1.percent(value);
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }]);
    return Page3D;
}(UIElement);

var COLORSTEP_CUT_OFF = 'colorstep/cut/off';
var COLORSTEP_CUT_ON = 'colorstep/cut/on';

var COLORSTEP_ORDERING_EQUALS = 'colorstep/ordering/equals';
var COLORSTEP_ORDERING_EQUALS_LEFT = 'colorstep/ordering/equals/left';
var COLORSTEP_ORDERING_EQUALS_RIGHT = 'colorstep/ordering/equals/right';

var ImageSorting = function (_BasePropertyItem) {
    inherits(ImageSorting, _BasePropertyItem);

    function ImageSorting() {
        classCallCheck(this, ImageSorting);
        return possibleConstructorReturn(this, (ImageSorting.__proto__ || Object.getPrototypeOf(ImageSorting)).apply(this, arguments));
    }

    createClass(ImageSorting, [{
        key: 'template',
        value: function template() {
            return '\n        <div class=\'property-item image-sorting show\'>\n            <div class=\'items\'>             \n                <div>\n                    <label>Sorting</label>\n                    <div class="button-group">\n                        <button ref="$ordering" title="Full Ordering">=|=</button>\n                        <button ref="$orderingLeft" title="Left Ordering">=|</button>\n                        <button ref="$orderingRight" title="Right Ordering">|=</button>\n                    </div>\n\n                    <label>Cutting</label>\n                    <div class="button-group">\n                        <button class="cut" ref="$cutOff" title="Cut Off"></button>\n                        <button class="cut on" ref="$cutOn" title="Cut On"></button>\n                    </div>      \n                </div>           \n            </div>\n        </div>\n        ';
        }

        // indivisual layer effect 

    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: 'isShow',
        value: function isShow() {

            var image = editor$1.selection.backgroundImage;
            if (!image) return false;

            if (image.image.isImage()) {
                return false;
            }

            return true;
        }
    }, {
        key: CLICK('$ordering'),
        value: function value(e) {
            this.dispatch(COLORSTEP_ORDERING_EQUALS);
        }
    }, {
        key: CLICK('$orderingLeft'),
        value: function value(e) {
            this.dispatch(COLORSTEP_ORDERING_EQUALS_LEFT);
        }
    }, {
        key: CLICK('$orderingRight'),
        value: function value(e) {
            this.dispatch(COLORSTEP_ORDERING_EQUALS_RIGHT);
        }
    }, {
        key: CLICK('$cutOff'),
        value: function value(e) {
            this.dispatch(COLORSTEP_CUT_OFF);
        }
    }, {
        key: CLICK('$cutOn'),
        value: function value(e) {
            this.dispatch(COLORSTEP_CUT_ON);
        }
    }]);
    return ImageSorting;
}(BasePropertyItem);

var BackgroundImage$1 = function (_BasePropertyItem) {
    inherits(BackgroundImage, _BasePropertyItem);

    function BackgroundImage() {
        classCallCheck(this, BackgroundImage);
        return possibleConstructorReturn(this, (BackgroundImage.__proto__ || Object.getPrototypeOf(BackgroundImage)).apply(this, arguments));
    }

    createClass(BackgroundImage, [{
        key: 'template',
        value: function template() {
            return '\n        <div class=\'property-item background-image\'>\n            <div class=\'items\'>         \n                <div>\n                    <img ref="$image" style="max-width: 100%; height: 100px" />\n                </div>\n            </div>\n        </div>\n        ';
        }
    }, {
        key: 'onToggleShow',
        value: function onToggleShow() {
            this.refresh();
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return false;
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggle(isShow);

            if (isShow) {
                var image = editor$1.selection.currentBackgroundImage;
                if (image) {
                    this.refs.$image.attr('src', image.url);
                }
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_SELECTION),
        value: function value() {
            if (this.isPropertyShow()) {
                this.refresh();
            }
        }
    }, {
        key: CLICK('$blendList .blend-item') + SELF,
        value: function value(e) {
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, {
                blendMode: e.$delegateTarget.attr('data-mode')
            });
        }
    }]);
    return BackgroundImage;
}(BasePropertyItem);

var PATTERN_SET = 'pattern/set';

var BLEND_LIST$1 = 'blend/list';

var _templateObject$12 = taggedTemplateLiteral(["\n            <div class='property-item rotate-pattern show'>\n                <div class='items'>            \n                    <div>\n                        <label>Enable</label>\n                        <div>\n                            <input type=\"checkbox\" ref=\"$enable\" /> \n                            Only Linear Gradient\n                        </div>\n                    </div>   \n                    <div>\n                        <label>Clone</label>\n                        <div >\n                            <input type='range' ref=\"$cloneCountRange\" min=\"0\" max=\"100\">                        \n                            <input type='number' class='middle' min=\"0\" max=\"100\" ref=\"$cloneCount\"> \n                        </div>\n                    </div>\n                    <div>\n                        <label>Blend</label>\n                        <div>\n                            <select ref=\"$blend\">\n                            ", "\n                            </select>\n                        </div>\n                    </div>          \n                    <div>\n                        <label>Random</label>\n                        <div>\n                            <label><input type=\"checkbox\" ref=\"$randomPosition\" /> Position</label>\n                            <label><input type=\"checkbox\" ref=\"$randomSize\" /> Size</label>\n                        </div>                        \n                    </div>  \n                </div>\n            </div>\n        "], ["\n            <div class='property-item rotate-pattern show'>\n                <div class='items'>            \n                    <div>\n                        <label>Enable</label>\n                        <div>\n                            <input type=\"checkbox\" ref=\"$enable\" /> \n                            Only Linear Gradient\n                        </div>\n                    </div>   \n                    <div>\n                        <label>Clone</label>\n                        <div >\n                            <input type='range' ref=\"$cloneCountRange\" min=\"0\" max=\"100\">                        \n                            <input type='number' class='middle' min=\"0\" max=\"100\" ref=\"$cloneCount\"> \n                        </div>\n                    </div>\n                    <div>\n                        <label>Blend</label>\n                        <div>\n                            <select ref=\"$blend\">\n                            ", "\n                            </select>\n                        </div>\n                    </div>          \n                    <div>\n                        <label>Random</label>\n                        <div>\n                            <label><input type=\"checkbox\" ref=\"$randomPosition\" /> Position</label>\n                            <label><input type=\"checkbox\" ref=\"$randomSize\" /> Size</label>\n                        </div>                        \n                    </div>  \n                </div>\n            </div>\n        "]);

var RotatePattern = function (_BasePropertyItem) {
    inherits(RotatePattern, _BasePropertyItem);

    function RotatePattern() {
        classCallCheck(this, RotatePattern);
        return possibleConstructorReturn(this, (RotatePattern.__proto__ || Object.getPrototypeOf(RotatePattern)).apply(this, arguments));
    }

    createClass(RotatePattern, [{
        key: "template",
        value: function template() {
            return html(_templateObject$12, this.read(BLEND_LIST$1).map(function (blend) {
                return "<option value=\"" + blend + "\">" + blend + "</option>";
            }));
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var _this2 = this;

            this.read(SELECTION_CURRENT_IMAGE, function (image) {
                var rotate = PATTERN_GET(image, 'rotate');
                if (rotate) {
                    _this2.refs.$enable.checked(rotate.enable || false);
                    _this2.refs.$cloneCountRange.val(rotate.clone || 1);
                    _this2.refs.$cloneCount.val(rotate.clone || 1);
                    _this2.refs.$blend.val(rotate.blend || 'normal');
                    _this2.refs.$randomPosition.checked(rotate.randomPosition || false);
                    _this2.refs.$randomSize.checked(rotate.randomSize || false);
                }
            });
        }
    }, {
        key: "changePatternValue",
        value: function changePatternValue() {
            var image = editor$1.selection.backgroundImage;
            if (image) {

                this.run(PATTERN_SET, image, 'rotate', {
                    enable: this.refs.$enable.checked(),
                    clone: this.refs.$cloneCount.int(),
                    blend: this.refs.$blend.val(),
                    randomPosition: this.refs.$randomPosition.checked(),
                    randomSize: this.refs.$randomSize.checked()
                });

                editor$1.send(CHANGE_IMAGE);
            }
        }
    }, {
        key: CLICK('$enable'),
        value: function value() {
            this.changePatternValue();
        }
    }, {
        key: CLICK('$randomPosition'),
        value: function value() {
            this.changePatternValue();
        }
    }, {
        key: CLICK('$randomSize'),
        value: function value() {
            this.changePatternValue();
        }
    }, {
        key: INPUT('$cloneCount'),
        value: function value() {
            this.refs.$cloneCountRange.val(this.refs.$cloneCount);
            this.changePatternValue();
        }
    }, {
        key: INPUT('$cloneCountRange'),
        value: function value() {
            this.refs.$cloneCount.val(this.refs.$cloneCountRange);
            this.changePatternValue();
        }
    }, {
        key: CHANGE('$blend'),
        value: function value() {
            this.changePatternValue();
        }
    }]);
    return RotatePattern;
}(BasePropertyItem);

var BorderFixed = function (_BasePropertyItem) {
    inherits(BorderFixed, _BasePropertyItem);

    function BorderFixed() {
        classCallCheck(this, BorderFixed);
        return possibleConstructorReturn(this, (BorderFixed.__proto__ || Object.getPrototypeOf(BorderFixed)).apply(this, arguments));
    }

    createClass(BorderFixed, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item fixed-border'>\n                <div class='items'>            \n                    <div>\n                        <label > <button type=\"button\" ref=\"$borderLabel\">*</button> Width</label>\n                        <div>\n                            <input type='range' ref=\"$borderWidthRange\" min=\"0\" max=\"360\">\n                            <input type='number' class='middle' ref=\"$borderWidth\" min=\"0\" max=\"360\"> <span>px</span>\n                        </div>\n                    </div>                                                                           \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggleClass('show', isShow);

            if (isShow) {
                var layer = editor$1.selection.currentLayer;
                if (layer) {
                    var borderWidth = defaultValue(layer.borderWidth, Length$1.px(0));
                    this.refs.$borderWidthRange.val(+borderWidth);
                    this.refs.$borderWidth.val(+borderWidth);
                }
            }
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return false;

            return true;
        }
    }, {
        key: "updateTransform",
        value: function updateTransform(type) {
            var items = {};
            if (type == 'border') {
                var borderWidthValue = this.refs.$borderWidth.val();
                this.refs.$borderWidthRange.val(borderWidthValue);
                items = {
                    fixedBorderWidth: true,
                    borderWidth: Length$1.px(borderWidthValue)
                };
            } else if (type == 'range') {
                var borderWidthValue = this.refs.$borderWidthRange.val();
                this.refs.$borderWidth.val(borderWidthValue);
                items = {
                    fixedBorderWidth: true,
                    borderWidth: Length$1.px(borderWidthValue)
                };
            }

            editor$1.selection.updateLayer(CHANGE_LAYER, items);
        }
    }, {
        key: CHANGEINPUT('$borderWidthRange'),
        value: function value() {
            this.updateTransform('range');
        }
    }, {
        key: CHANGEINPUT('$borderWidth'),
        value: function value() {
            this.updateTransform('border');
        }
    }, {
        key: CLICK('$borderLabel'),
        value: function value() {
            this.emit('toggleBorderWidth');
        }
    }]);
    return BorderFixed;
}(BasePropertyItem);

var BoxSizing = function (_BasePropertyItem) {
    inherits(BoxSizing, _BasePropertyItem);

    function BoxSizing() {
        classCallCheck(this, BoxSizing);
        return possibleConstructorReturn(this, (BoxSizing.__proto__ || Object.getPrototypeOf(BoxSizing)).apply(this, arguments));
    }

    createClass(BoxSizing, [{
        key: 'template',
        value: function template() {
            return '\n        <div class=\'property-item box-sizing show\'>\n            <div class=\'items\'>         \n                <div>\n                    <label>Box Sizing</label>\n                    <div class=\'size-list full-size\'>\n                        <select ref="$boxSizing">\n                            <option value="content-box">content-box</option>\n                            <option value="border-box">border-box</option>\n                            <option value="padding-box">padding-box</option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ';
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return editor$1.selection.currentLayer;
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var layer = editor$1.selection.currentLayer;
            if (layer) {
                this.refs.$boxSizing.val(layer.boxSizing);
            }
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: CHANGE('$boxSizing'),
        value: function value(e) {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                boxSizing: this.refs.$boxSizing.val()
            });
        }
    }]);
    return BoxSizing;
}(BasePropertyItem);

var BorderWidth = function (_BasePropertyItem) {
    inherits(BorderWidth, _BasePropertyItem);

    function BorderWidth() {
        classCallCheck(this, BorderWidth);
        return possibleConstructorReturn(this, (BorderWidth.__proto__ || Object.getPrototypeOf(BorderWidth)).apply(this, arguments));
    }

    createClass(BorderWidth, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item border show'>\n                <div class='items'>         \n                    <div>\n                        <label >Top</label>\n                        <div>\n                            <input type='range' ref=\"$topWidthRange\" min=\"0\" max=\"500\" value=\"0\">                        \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$topWidth\" value=\"0\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Right</label>\n                        <div>\n                            <input type='range' ref=\"$rightWidthRange\" min=\"0\" max=\"500\" value=\"0\">                                                \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$rightWidth\" value=\"0\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>          \n                    <div>\n                        <label>Bottom</label>\n                        <div>\n                            <input type='range' ref=\"$bottomWidthRange\" min=\"0\" max=\"500\" value=\"0\">                                                \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$bottomWidth\" value=\"0\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>\n                    <div>\n                        <label>Left</label>\n                        <div>\n                            <input type='range' ref=\"$leftWidthRange\" min=\"0\" max=\"500\" value=\"0\">                                                \n                            <input type='number' class='middle' min=\"0\" max=\"500\" ref=\"$leftWidth\" value=\"0\"> <span>" + UNIT_PX + "</span>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var item = editor$1.selection.currentLayer;
            if (item) {
                if (item.fixedBorderWidth) {
                    var borderWidth = item.borderWidth;
                    var border = +borderWidth;

                    this.refs.$topWidthRange.val(border);
                    this.refs.$rightWidthRange.val(border);
                    this.refs.$leftWidthRange.val(border);
                    this.refs.$bottomWidthRange.val(border);
                    this.refs.$topWidth.val(border);
                    this.refs.$rightWidth.val(border);
                    this.refs.$leftWidth.val(border);
                    this.refs.$bottomWidth.val(border);
                } else {

                    var value$$1 = defaultValue(item.borderTopWidth, Length$1.px(0));
                    this.refs.$topWidth.val(value$$1.value);
                    this.refs.$topWidthRange.val(value$$1.value);

                    var value$$1 = defaultValue(item.borderRightWidth, Length$1.px(0));
                    this.refs.$rightWidth.val(value$$1.value);
                    this.refs.$rightWidthRange.val(value$$1.value);

                    var value$$1 = defaultValue(item.borderLeftWidth, Length$1.px(0));
                    this.refs.$leftWidth.val(value$$1.value);
                    this.refs.$leftWidthRange.val(value$$1.value);

                    var value$$1 = defaultValue(item.borderBottomWidth, Length$1.px(0));
                    this.refs.$bottomWidth.val(value$$1.value);
                    this.refs.$bottomWidthRange.val(value$$1.value);
                }
            }
        }
    }, {
        key: "refreshValue",
        value: function refreshValue() {
            editor$1.selection.updateLayer(CHANGE_LAYER, {
                borderTopWidth: Length$1.px(this.refs.$topWidth.val()),
                borderRightWidth: Length$1.px(this.refs.$rightWidth.val()),
                borderLeftWidth: Length$1.px(this.refs.$leftWidth.val()),
                borderBottomWidth: Length$1.px(this.refs.$bottomWidth.val()),
                fixedBorderWidth: false
            });
        }
    }, {
        key: CHANGEINPUT('$topWidthRange'),
        value: function value$$1() {
            this.refs.$topWidth.val(this.refs.$topWidthRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$rightWidthRange'),
        value: function value$$1() {
            this.refs.$rightWidth.val(this.refs.$rightWidthRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$leftWidthRange'),
        value: function value$$1() {
            this.refs.$leftWidth.val(this.refs.$leftWidthRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$bottomWidthRange'),
        value: function value$$1() {
            this.refs.$bottomWidth.val(this.refs.$bottomWidthRange);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$topWidth'),
        value: function value$$1() {
            this.refs.$topWidthRange.val(this.refs.$topWidth);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$rightWidth'),
        value: function value$$1() {
            this.refs.$rightWidthRange.val(this.refs.$rightWidth);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$leftWidth'),
        value: function value$$1() {
            this.refs.$leftWidthRange.val(this.refs.$leftWidth);
            this.refreshValue();
        }
    }, {
        key: CHANGEINPUT('$bottomWidth'),
        value: function value$$1() {
            this.refs.$bottomWidthRange.val(this.refs.$bottomWidth);
            this.refreshValue();
        }
    }, {
        key: EVENT('toggleBorderWidth'),
        value: function value$$1() {
            this.$el.toggleClass('show');
        }
    }]);
    return BorderWidth;
}(BasePropertyItem);

var defined_position = {
    'to right': {
        x: Position$1.RIGHT,
        y: Position$1.CENTER
    },
    'to left': {
        x: Position$1.LEFT,
        y: Position$1.CENTER
    },
    'to top': {
        x: Position$1.CENTER,
        y: Position$1.TOP
    },
    'to bottom': {
        x: Position$1.CENTER,
        y: Position$1.BOTTOM
    },
    'to top right': {
        x: Position$1.RIGHT,
        y: Position$1.TOP
    },
    'to bottom right': {
        x: Position$1.RIGHT,
        y: Position$1.BOTTOM
    },
    'to bottom left': {
        x: Position$1.LEFT,
        y: Position$1.BOTTOM
    },
    'to top left': {
        x: Position$1.LEFT,
        y: Position$1.TOP
    }
};

var PredefinedBackgroundPosition = function (_UIElement) {
    inherits(PredefinedBackgroundPosition, _UIElement);

    function PredefinedBackgroundPosition() {
        classCallCheck(this, PredefinedBackgroundPosition);
        return possibleConstructorReturn(this, (PredefinedBackgroundPosition.__proto__ || Object.getPrototypeOf(PredefinedBackgroundPosition)).apply(this, arguments));
    }

    createClass(PredefinedBackgroundPosition, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="predefined-background-position">\n                <button type="button" data-value="to right"></button>                          \n                <button type="button" data-value="to left"></button>                                                  \n                <button type="button" data-value="to top"></button>                            \n                <button type="button" data-value="to bottom"></button>                                        \n                <button type="button" data-value="to top right"></button>                                \n                <button type="button" data-value="to bottom right"></button>                                    \n                <button type="button" data-value="to bottom left"></button>\n                <button type="button" data-value="to top left"></button>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return editor$1.selection.backgroundImage;
        }
    }, {
        key: 'getPosition',
        value: function getPosition(type) {
            return defined_position[type] || {
                x: Position$1.CENTER,
                y: Position$1.CENTER
            };
        }
    }, {
        key: CLICK('$el button') + SELF,
        value: function value(e) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.reset(this.getPosition(e.$delegateTarget.attr('data-value')));
                editor$1.send(CHANGE_IMAGE, image);
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }]);
    return PredefinedBackgroundPosition;
}(UIElement);

var BackgroundResizer = function (_UIElement) {
    inherits(BackgroundResizer, _UIElement);

    function BackgroundResizer() {
        classCallCheck(this, BackgroundResizer);
        return possibleConstructorReturn(this, (BackgroundResizer.__proto__ || Object.getPrototypeOf(BackgroundResizer)).apply(this, arguments));
    }

    createClass(BackgroundResizer, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="background-resizer">\n                <div ref="$dragPointer" class="drag-pointer"></div>\n                <div ref="$backgroundRect" class=\'background-rect\'></div>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggle(isShow);

            if (isShow) {
                this.refreshUI();
            }
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            return editor$1.selection.backgroundImage;
        }
    }, {
        key: 'getCurrentXY',
        value: function getCurrentXY(isUpdate, position) {

            if (isUpdate) {
                var xy = this.config('pos');

                return [xy.x, xy.y];
            }

            return position;
        }
    }, {
        key: 'getRectangle',
        value: function getRectangle() {
            var width = this.$el.width();
            var height = this.$el.height();
            var minX = this.$el.offsetLeft();
            var minY = this.$el.offsetTop();

            var maxX = minX + width;
            var maxY = minY + height;

            return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: width, height: height };
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {

            var item = editor$1.selection.backgroundImage;
            if (!item) return EMPTY_STRING;

            var x = +item.x;
            var y = +item.y;
            var width = +item.width;
            var height = +item.height;

            return { x: x, y: y, width: width, height: height };
        }
    }, {
        key: 'refreshUI',
        value: function refreshUI(isUpdate) {
            var _getRectangle = this.getRectangle(),
                minX = _getRectangle.minX,
                minY = _getRectangle.minY,
                maxX = _getRectangle.maxX,
                maxY = _getRectangle.maxY;

            var _getDefaultValue = this.getDefaultValue(),
                x = _getDefaultValue.x,
                y = _getDefaultValue.y,
                width = _getDefaultValue.width,
                height = _getDefaultValue.height;

            if (isUpdate) {
                var _getCurrentXY = this.getCurrentXY(isUpdate),
                    _getCurrentXY2 = slicedToArray(_getCurrentXY, 2),
                    x = _getCurrentXY2[0],
                    y = _getCurrentXY2[1];

                x = Math.max(Math.min(maxX, x), minX);
                y = Math.max(Math.min(maxY, y), minY);

                var left = x - minX;
                var top = y - minY;
            } else {

                var left = minX + (maxX - minX) * (x / 100);
                var top = minY + (maxY - minY) * (y / 100);
            }

            left = Math.floor(left);
            top = Math.floor(top);

            this.refs.$dragPointer.px('left', left);
            this.refs.$dragPointer.px('top', top);

            if (isUpdate) {
                var newLeft = left / (maxX - minX) * 100;
                var newTop = top / (maxY - minY) * 100;
                this.setBackgroundPosition(Length.percent(newLeft), Length.percent(newTop));
            }
        }
    }, {
        key: 'setBackgroundPosition',
        value: function setBackgroundPosition(x, y) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.reset({ x: x, y: y });
                editor$1.send(CHANGE_IMAGE);
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }

        // Event Bindings 

    }, {
        key: 'move',
        value: function move() {
            this.refreshUI(true);
        }
    }, {
        key: POINTERSTART('$dragPointer') + MOVE(),
        value: function value$$1(e) {
            e.preventDefault();
        }
    }, {
        key: POINTERSTART() + MOVE(),
        value: function value$$1(e) {}
    }]);
    return BackgroundResizer;
}(UIElement);

var BackgroundPosition = function (_UIElement) {
    inherits(BackgroundPosition, _UIElement);

    function BackgroundPosition() {
        classCallCheck(this, BackgroundPosition);
        return possibleConstructorReturn(this, (BackgroundPosition.__proto__ || Object.getPrototypeOf(BackgroundPosition)).apply(this, arguments));
    }

    createClass(BackgroundPosition, [{
        key: "components",
        value: function components() {
            return {
                PredefinedBackgroundPosition: PredefinedBackgroundPosition,
                BackgroundResizer: BackgroundResizer,
                UnitRange: UnitRange
            };
        }
    }, {
        key: "template",
        value: function template() {
            return "\n            <div class='property-item background-position show'>\n                <div class='items'>\n\n                    <div class='drag-property-ui'>\n                        <div class='drag-ui'>\n                            <PredefinedBackgroundPosition></PredefinedBackgroundPosition>\n                            <BackgroundResizer></BackgroundResizer>\n                        </div>\n\n                        <div class='property-ui'>\n\n                            <div>\n                                <label>x</label>\n                                <UnitRange \n                                    ref=\"$x\" \n                                    min=\"-100\" max=\"1000\" step=\"1\" value=\"0\" unit=\"" + UNIT_PX + "\"\n                                    maxValueFunction=\"getMaxX\"\n                                    updateFunction=\"updateX\"\n                                ></UnitRange>\n                            </div>\n                            <div>\n                                <label>y</label>\n                                <UnitRange \n                                    ref=\"$y\" \n                                    min=\"-100\" max=\"1000\" step=\"1\" value=\"0\" unit=\"" + UNIT_PX + "\"\n                                    maxValueFunction=\"getMaxY\"\n                                    updateFunction=\"updateY\"\n                                ></UnitRange>\n                            </div>\n                        </div>\n                    </div>\n\n\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "updateX",
        value: function updateX(x) {
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { x: x });
        }
    }, {
        key: "updateY",
        value: function updateY(y) {
            editor$1.selection.updateBackgroundImage(CHANGE_IMAGE, { y: y });
        }
    }, {
        key: "getMaxHeight",
        value: function getMaxHeight() {
            var layer = editor$1.selection.currentLayer;
            if (!layer) return 0;

            return +layer.height;
        }
    }, {
        key: "getMaxY",
        value: function getMaxY() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return 0;

            return +layer.height * 2;
        }
    }, {
        key: "getMaxWidth",
        value: function getMaxWidth() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return 0;

            return +layer.width;
        }
    }, {
        key: "getMaxX",
        value: function getMaxX() {
            var layer = editor$1.selection.currentLayer;

            if (!layer) return 0;

            return +layer.width * 2;
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggle(isShow);

            if (isShow) {
                var image = editor$1.selection.currentBackgroundImage;
                if (image) {
                    this.children.$x.refresh(image.x);
                    this.children.$y.refresh(image.y);
                }
            }
        }
    }, {
        key: "isShow",
        value: function isShow() {

            return true;
        }
    }]);
    return BackgroundPosition;
}(UIElement);

var BorderColorFixed = function (_BasePropertyItem) {
    inherits(BorderColorFixed, _BasePropertyItem);

    function BorderColorFixed() {
        classCallCheck(this, BorderColorFixed);
        return possibleConstructorReturn(this, (BorderColorFixed.__proto__ || Object.getPrototypeOf(BorderColorFixed)).apply(this, arguments));
    }

    createClass(BorderColorFixed, [{
        key: "template",
        value: function template() {
            return "\n            <div class='property-item fixed-border-color show'>\n                <div class='items'>            \n                    <div>\n                        <label >Color</label>\n                        <div style='cursor:pointer;' ref=\"$colorview\" title=\"Click me!!\">\n                            <span class='background-transparent'>\n                                <span class='color' ref='$color'></span>\n                            </span>\n                            <span class='color-text' ref=\"$colortext\"></span>\n                        </div>\n                    </div>                                                                           \n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var layer = editor$1.selection.currentLayer;
            if (layer) {
                this.refs.$color.css('background-color', layer.borderColor);
                this.refs.$colortext.text(layer.borderColor);
            }
        }
    }, {
        key: CLICK('$colorview'),
        value: function value() {

            alert('컬러 피커를 뛰워주세요');
        }
    }]);
    return BorderColorFixed;
}(BasePropertyItem);

var patterns = {
    RotatePattern: RotatePattern
};

var items$1 = _extends({}, patterns, {
    BackgroundPosition: BackgroundPosition,
    LayerBorderColorPickerPanel: LayerBorderColorPickerPanel,
    BorderColorFixed: BorderColorFixed,
    BoxSizing: BoxSizing,
    BorderWidth: BorderWidth,
    BackgroundImage: BackgroundImage$1,
    ImageSorting: ImageSorting,
    Page3D: Page3D,
    ClipPathSide: ClipPathSide,
    ClipPathPolygon: ClipPathPolygon,
    // ClipPathSVG,
    EmptyArea: EmptyArea,
    BackdropList: BackdropList,
    LayerInfoColorPickerPanel: LayerInfoColorPickerPanel,
    BackgroundClip: BackgroundClip,
    Font: Font,
    LayerTextColorPickerPanel: LayerTextColorPickerPanel,
    BackgroundCode: BackgroundCode,
    LayerCode: LayerCode,
    Text: Text,
    FillColorPickerPanel: FillColorPickerPanel,
    TextShadow: TextShadow$1,
    BoxShadow: BoxShadow$1,
    // ClipPathSVG,
    Opacity: Opacity,
    BorderFixed: BorderFixed,
    RadiusFixed: RadiusFixed,
    Rotate: Rotate,
    LayerBlend: LayerBlend,
    PageShowGrid: PageShowGrid,
    ClipPath: ClipPath,
    ImageResource: ImageResource$1,
    BackgroundBlend: BackgroundBlend,
    FilterList: FilterList$1,
    PageExport: PageExport,
    PageSize: PageSize,
    PageName: PageName,
    BackgroundSize: BackgroundSize,
    Transform3d: Transform3d,
    Transform: Transform,
    ColorPickerPanel: ColorPickerPanel,
    ColorStepsInfo: ColorStepsInfo,
    ColorSteps: ColorSteps,
    Name: Name,
    Size: Size,
    Position: Position$2,
    Radius: Radius,
    Clip: Clip
});

var BaseProperty = function (_UIElement) {
    inherits(BaseProperty, _UIElement);

    function BaseProperty() {
        classCallCheck(this, BaseProperty);
        return possibleConstructorReturn(this, (BaseProperty.__proto__ || Object.getPrototypeOf(BaseProperty)).apply(this, arguments));
    }

    createClass(BaseProperty, [{
        key: "onToggleShow",
        value: function onToggleShow() {}
    }, {
        key: "template",
        value: function template() {
            return "\n        <div class='property " + this.getClassName() + " show'>\n            " + (this.isHideHeader() ? EMPTY_STRING : "\n            <div class='property-title' ref=\"$title\">\n                " + this.getTitle() + "\n                <span class=\"tools\">" + this.getTools() + "</span>\n            </div>") + "\n            <div class='property-body'>" + this.getBody() + "</div>\n        </div>\n        ";
        }
    }, {
        key: "isHideHeader",
        value: function isHideHeader() {
            return false;
        }
    }, {
        key: "getClassName",
        value: function getClassName() {
            return EMPTY_STRING;
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return EMPTY_STRING;
        }
    }, {
        key: "getTools",
        value: function getTools() {
            return EMPTY_STRING;
        }
    }, {
        key: "getBody",
        value: function getBody() {
            return EMPTY_STRING;
        }
    }, {
        key: CLICK('$title'),
        value: function value$$1(e) {
            var $dom = new Dom(e.target);

            if ($dom.hasClass('property-title')) {
                this.$el.toggleClass('show');
                this.onToggleShow();
            }
        }
    }, {
        key: "isPropertyShow",
        value: function isPropertyShow() {
            return this.$el.hasClass('show');
        }
    }, {
        key: "toggle",
        value: function toggle(isShow) {
            this.$el.toggle(isShow);
        }
    }, {
        key: "hide",
        value: function hide() {
            this.$el.hide();
        }
    }, {
        key: "show",
        value: function show() {
            this.$el.show();
        }
    }, {
        key: "components",
        value: function components() {
            return items$1;
        }
    }]);
    return BaseProperty;
}(UIElement);

var BoundProperty = function (_BaseProperty) {
    inherits(BoundProperty, _BaseProperty);

    function BoundProperty() {
        classCallCheck(this, BoundProperty);
        return possibleConstructorReturn(this, (BoundProperty.__proto__ || Object.getPrototypeOf(BoundProperty)).apply(this, arguments));
    }

    createClass(BoundProperty, [{
        key: "getBody",
        value: function getBody() {
            return "\n            <div class='property-item'>\n                <div class='items'>\n                    <div>\n                        <label><button type=\"button\" ref=\"$rect\">*</button>Width</label>\n                        <div>\n                            <div class='input two'> \n                                <input type='number' ref=\"$width\"> <span>px</span>\n                            </div>\n                        </div>\n                        <label class='second'>height</label>\n                        <div>\n                            <div class=\"input two\">\n                                <input type='number' ref=\"$height\"> <span>px</span>\n                            </div>\n                        </div>                        \n                    </div>   \n                    <div>\n                        <label>X</label>\n                        <div>\n                            <div class='input two'> \n                                <input type='number' ref=\"$x\"> <span>px</span>\n                            </div>\n                        </div>\n                        <label class='second'>Y</label>\n                        <div>\n                            <div class='input two'>\n                                <input type='number' ref=\"$y\"> <span>px</span>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: EVENT(CHANGE_RECT, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var item = editor$1.selection.currentRect;
            if (!item) return;

            this.refs.$width.val(item.width.value);
            this.refs.$height.val(item.height.value);
            this.refs.$x.val(item.x.value);
            this.refs.$y.val(item.y.value);
        }
    }, {
        key: CLICK('$rect'),
        value: function value(e) {
            var widthValue = this.refs.$width.int();
            editor$1.selection.updateRect(CHANGE_RECT, {
                width: Length$1.px(widthValue),
                height: Length$1.px(widthValue)
            });
        }
    }, {
        key: INPUT('$width'),
        value: function value() {
            editor$1.selection.updateRect(CHANGE_RECT, {
                width: Length$1.px(this.refs.$width.int())
            }, this);
        }
    }, {
        key: INPUT('$height'),
        value: function value() {
            editor$1.selection.updateRect(CHANGE_RECT, {
                height: Length$1.px(this.refs.$height.int())
            }, this);
        }
    }, {
        key: INPUT('$x'),
        value: function value() {
            editor$1.selection.updateRect(CHANGE_RECT, {
                x: Length$1.px(this.refs.$x.int())
            }, this);
        }
    }, {
        key: INPUT('$y'),
        value: function value() {
            editor$1.selection.updateRect(CHANGE_RECT, {
                y: Length$1.px(this.refs.$y.int())
            }, this);
        }
    }]);
    return BoundProperty;
}(BaseProperty);

// import ArtboardProperty from "./ArtboardProperty";
// import LayerProperty from "./LayerProperty";
// import LayerFontProperty from "./LayerFontProperty";
// import LayerTextProperty from "./LayerTextProperty";
// import TextShadowProperty from "./TextShadowProperty";
// import BoxShadowProperty from "./BoxShadowProperty";
// import FilterProperty from "./FilterProperty";
// import BackdropProperty from "./BackdropProperty";
// import ClipPathProperty from "./ClipPathProperty";
// import Transform2DProperty from "./Transform2DProperty";
// import Transform3DProperty from "./Transform3DProperty";
// import LayerCodeProperty from "./LayerCodeProperty";
// import ImageSortingProperty from "./ImageSortingProperty";
// import ColorStepProperty from "./ColorStepProperty";
// import BackgroundCodeProperty from "./BackgroundCodeProperty";
// import BackgroundProperty from "./BackgroundProperty";
// import LayerBorderProperty from "./LayerBorderProperty";
// import Transform2DControlProperty from "./Transform2DControlProperty";
// import BackgroundPositionProperty from "./BackgroundPositionProperty";
// import LayerBorderRadiusProperty from "./LayerBorderRadiusProperty";
var property = {
    BoundProperty: BoundProperty
    // BackgroundPositionProperty,
    // Transform2DControlProperty,
    // LayerBorderRadiusProperty,
    // LayerBorderProperty,
    // BackgroundProperty,
    // BackgroundCodeProperty,
    // ColorStepProperty,
    // ImageSortingProperty,
    // LayerCodeProperty,
    // Transform2DProperty,
    // Transform3DProperty,
    // ClipPathProperty,
    // FilterProperty,
    // BackdropProperty,
    // BoxShadowProperty,
    // ArtboardProperty,
    // LayerProperty,
    // LayerFontProperty,
    // LayerTextProperty,
    // TextShadowProperty
};

var Inspector = function () {
    function Inspector(editor) {
        classCallCheck(this, Inspector);

        this.editor = editor;

        this.components = {};

        this.initialize();
    }

    createClass(Inspector, [{
        key: "initialize",
        value: function initialize() {
            this.components = {};

            this.set(property);
        }
    }, {
        key: "initializeKeys",
        value: function initializeKeys() {
            this.keys = Object.keys(this.components);
        }
    }, {
        key: "set",
        value: function set$$1(key, PropertyClass) {
            var _this = this;

            if (isString(key)) {
                this.components[key] = PropertyClass;
            } else if (isObject(key)) {
                keyEach(key, function (key, PropertyClass) {
                    _this.components[key] = PropertyClass;
                });
            }

            this.initializeKeys();
            this.editor.send(CHANGE_EDITOR);
        }
    }, {
        key: "remove",
        value: function remove(key) {
            delete this.components[key];

            this.initializeKeys();
            this.editor.send(CHANGE_EDITOR);
        }
    }]);
    return Inspector;
}();

var items = new Map();

function traverse(item, results, parentId) {
    var newItem = item.clone(true);
    newItem.parentId = parentId;
    results.push(newItem);

    item.children.forEach(function (child) {
        traverse(child, results, newItem.id);
    });
}

function tree(id) {
    var item = editor$1.get(id);
    var newItem = item.clone(true);
    var results = [newItem];

    item.children.forEach(function (item) {
        traverse(item, results, newItem.id);
    });

    return results;
}

var EDITOR_ID = '';
var editor$1 = new (function () {
    function _class() {
        classCallCheck(this, _class);

        this.config = new Config(this);
        this.selection = new Selection(this);
        this.inspector = new Inspector(this);
    }

    createClass(_class, [{
        key: "setStore",
        value: function setStore($store) {
            this.$store = $store;
        }
    }, {
        key: "send",
        value: function send() {
            this.emit.apply(this, arguments);
        }
    }, {
        key: "emit",
        value: function emit() {
            if (this.$store) {
                var _$store;

                this.$store.source = 'EDITOR_ID';
                (_$store = this.$store).emit.apply(_$store, arguments);
            }
        }

        /**
         * add Project
         * 
         * @param {Project} project 
         */

    }, {
        key: "addProject",
        value: function addProject(project) {
            return this.add(EDITOR_ID, project);
        }
    }, {
        key: "filter",
        value: function filter(itemType) {
            var results = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = slicedToArray(_step.value, 2),
                        id = _step$value[0],
                        item = _step$value[1];

                    if (item.itemType === itemType) {
                        results[results.length] = item;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return results;
        }

        /**
         * get project list 
         */

    }, {
        key: "add",


        /**
         * add item 
         * 
         * @param {string} parentId 
         * @param {Item} item 
         * @return {Item} 
         */
        value: function add(parentId, item) {
            item.parentId = parentId;
            items.set(item.id, item);

            this.sort(item.itemType);

            return item;
        }

        /**
         * remove Item  with all children 
         * 
         * @param {string} id 
         */

    }, {
        key: "remove",
        value: function remove(id) {
            var isDeleteChildren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


            if (isDeleteChildren) this.removeChildren(id);

            items.delete(id);
        }
    }, {
        key: "copy",
        value: function copy(id) {
            var _this = this;

            var data = tree(id, uuidShort());

            data.forEach(function (it) {
                _this.set(it.id, it);
            });

            if (data.length) {
                data[0].index = data[0].index + 1;
                data[0].parent().sort();
            }

            return data;
        }
    }, {
        key: "clear",
        value: function clear() {
            items.clear();
        }
    }, {
        key: "removeChildren",


        /**
         * remove all children 
         * 
         * @param {string} parentId 
         */
        value: function removeChildren() {
            var _this2 = this;

            var parentId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EDITOR_ID;
            var parentObject = arguments[1];


            var children = [];

            if (parentId == EDITOR_ID) {
                children = this.projects;
            } else {
                var parent = this.get(parentId);
                if (parent) {
                    children = parent.children;
                } else if (parentObject) {
                    children = parentObject.children;
                }
            }

            if (children.length) {
                children.forEach(function (child) {
                    _this2.removeChildren(child.id);
                    _this2.remove(child.id);
                });
            }
        }

        /**
         * get item 
         * 
         * @param {String} key 
         */

    }, {
        key: "get",
        value: function get(key) {
            return items.get(key);
        }

        /**
         * set Item 
         * 
         * @param {string} key 
         * @param {Item} value 
         */

    }, {
        key: "set",
        value: function set$$1(key, value) {
            items.set(key, value);
        }

        /**
         * check item id 
         * 
         * @param {string|Item} key 
         */

    }, {
        key: "has",
        value: function has(key) {
            return items.has(key);
        }

        /**
         * get children by searchObj  
         * 
         * @param {object} searchObj 
         */

    }, {
        key: "search",
        value: function search(searchObj) {
            var keys = Object.keys(searchObj);
            var results = [];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                var _loop = function _loop() {
                    var _step2$value = slicedToArray(_step2.value, 2),
                        id = _step2$value[0],
                        item = _step2$value[1];

                    isItem = keys.every(function (searchField) {
                        return searchObj[searchField] === item[searchField];
                    });

                    if (isItem) {
                        results[results.length] = item;
                    }
                };

                for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var isItem;

                    _loop();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            results.sort(function (a, b) {
                return a.index > b.index ? 1 : -1;
            });

            return results;
        }
    }, {
        key: "sort",
        value: function sort(itemType) {

            var children = [];

            if (itemType === 'project') children = this.projects;

            children.sort(function (a, b) {
                if (a.index === b.index) return 0;
                return a.index > b.index ? 1 : -1;
            });

            children.forEach(function (it, index) {
                it.index = index * 100;
            });
        }

        /**
         * get children 
         * 
         * @param {string} parentId 
         */

    }, {
        key: "children",
        value: function children(parentId) {
            var results = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _step3$value = slicedToArray(_step3.value, 2),
                        id = _step3$value[0],
                        _item = _step3$value[1];

                    if (_item.parentId === parentId) {
                        results[results.length] = _item;
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return results;
        }
    }, {
        key: "projects",
        get: function get() {
            return this.filter('project');
        }
    }, {
        key: "artboards",
        get: function get() {
            return this.filter('artboard');
        }
    }, {
        key: "layers",
        get: function get() {
            return this.filter('layer');
        }
    }, {
        key: "groups",
        get: function get() {
            return this.filter('group');
        }
    }, {
        key: "all",
        get: function get() {
            return items;
        }
    }]);
    return _class;
}())();

var EMPTY_POS = { x: 0, y: 0 };

var start = function start(opt) {
    var App = function (_UIElement) {
        inherits(App, _UIElement);

        function App() {
            classCallCheck(this, App);
            return possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
        }

        createClass(App, [{
            key: "initialize",
            value: function initialize() {
                var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

                this.$store = new BaseStore({
                    modules: [].concat(toConsumableArray(this.getModuleList()), toConsumableArray(modules))
                });

                editor$1.setStore(this.$store);

                this.$body = new Dom(this.getContainer());
                this.$root = new Dom('div', this.getClassName());

                this.$body.append(this.$root);

                this.render(this.$root);

                // 이벤트 연결 
                this.initializeEvent();

                this.initBodyMoves();
            }
        }, {
            key: "initBodyMoves",
            value: function initBodyMoves() {
                this.moves = new Set();
                this.ends = new Set();
                this.funcBodyMoves = debounce(this.loopBodyMoves.bind(this), 10);
            }
        }, {
            key: "loopBodyMoves",
            value: function loopBodyMoves() {
                var oldPos = editor$1.config.get('oldPos');
                var pos = editor$1.config.get('pos');
                var isRealMoved = oldPos.x != pos.x || oldPos.y != pos.y;

                if (isRealMoved && this.moves.size) {
                    this.moves.forEach(function (v) {
                        v.func.call(v.context);
                    });
                }
                requestAnimationFrame(this.funcBodyMoves);
            }
        }, {
            key: "removeBodyMoves",
            value: function removeBodyMoves() {

                this.ends.forEach(function (v) {
                    v.func.call(v.context);
                });

                this.moves.clear();
                this.ends.clear();
            }
        }, {
            key: EVENT(ADD_BODY_MOUSEMOVE),
            value: function value(func, context) {
                this.moves.add({ func: func, context: context });
            }
        }, {
            key: EVENT(ADD_BODY_MOUSEUP),
            value: function value(func, context) {
                this.ends.add({ func: func, context: context });
            }
        }, {
            key: "getModuleList",
            value: function getModuleList() {
                return opt.modules || [];
            }
        }, {
            key: "getClassName",
            value: function getClassName() {
                return opt.className || 'csseditor';
            }
        }, {
            key: "getContainer",
            value: function getContainer() {
                return opt.container || document.body;
            }
        }, {
            key: "template",
            value: function template() {
                return "<div>" + opt.template + "</div>";
            }
        }, {
            key: "components",
            value: function components() {
                return opt.components || {};
            }
        }, {
            key: POINTERMOVE('document'),
            value: function value(e) {
                var oldPos = editor$1.config.get('pos') || EMPTY_POS;
                var newPos = Event.pos(e) || EMPTY_POS;

                this.bodyMoved = !(oldPos.x == newPos.x && oldPos.y == newPos.y);
                editor$1.config.set('bodyEvent', e);
                editor$1.config.set('pos', newPos);
                editor$1.config.set('oldPos', oldPos);

                if (!this.requestId) {
                    this.requestId = requestAnimationFrame(this.funcBodyMoves);
                }
            }
        }, {
            key: POINTEREND('document'),
            value: function value(e) {
                var newPos = Event.pos(e) || EMPTY_POS;
                editor$1.config.set('bodyEvent', e);
                editor$1.config.set('pos', newPos);
                this.removeBodyMoves();
                this.requestId = null;
            }
        }]);
        return App;
    }(UIElement);

    return new App(opt);
};



var App = Object.freeze({
	start: start
});

var Util = {
    App: App,
    Color: Color$1,
    HueColor: HueColor,
    ColorNames: ColorNames,
    ImageFilter: ImageFilter,
    GL: GL,
    Canvas: Canvas,
    ImageLoader: ImageLoader
};

var _templateObject$13 = taggedTemplateLiteral(["\n            <div class='feature-control'>     \n            ", "\n            </div>\n        "], ["\n            <div class='feature-control'>     \n            ", "\n            </div>\n        "]);

var FeatureControl = function (_UIElement) {
    inherits(FeatureControl, _UIElement);

    function FeatureControl() {
        classCallCheck(this, FeatureControl);
        return possibleConstructorReturn(this, (FeatureControl.__proto__ || Object.getPrototypeOf(FeatureControl)).apply(this, arguments));
    }

    createClass(FeatureControl, [{
        key: "template",
        value: function template() {
            return html(_templateObject$13, editor$1.inspector.keys.map(function (key) {
                return "<" + key + " />";
            }));
        }
    }, {
        key: "components",
        value: function components() {
            return editor$1.inspector.components;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value() {
            this.refresh();
        }
    }]);
    return FeatureControl;
}(UIElement);

var ITEM_MOVE_LAST = 'item/move/last';

var ITEM_MOVE_IN = 'item/move/in';

var ImageListView = function (_UIElement) {
    inherits(ImageListView, _UIElement);

    function ImageListView() {
        classCallCheck(this, ImageListView);
        return possibleConstructorReturn(this, (ImageListView.__proto__ || Object.getPrototypeOf(ImageListView)).apply(this, arguments));
    }

    createClass(ImageListView, [{
        key: 'templateClass',
        value: function templateClass() {
            return 'image-list';
        }
    }, {
        key: 'makeItemNodeImage',
        value: function makeItemNodeImage(item) {
            var selected = item.selected ? 'selected' : EMPTY_STRING;
            return '\n            <div class=\'tree-item ' + selected + '\' data-id="' + item.id + '" draggable="true" title="' + item.type + '" >\n                <div class="item-view-container">\n                    <div class="item-view"  style=\'' + item + '\'></div>\n                </div>\n            </div>\n            ';
        }
    }, {
        key: LOAD(),
        value: function value$$1() {
            var _this2 = this;

            var layer = editor$1.selection.layer;
            if (!layer) return '';

            return layer.backgroundImages.map(function (item) {
                return _this2.makeItemNodeImage(item);
            });
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.load();
        }

        // individual effect

    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_COLORSTEP, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1(newValue) {
            this.refresh();
        }
    }, {
        key: CLICK('$el .tree-item') + SELF,
        value: function value$$1(e) {
            var id = e.$delegateTarget.attr('data-id');

            if (id) {
                editor$1.selection.select(id);
            }
        }
    }, {
        key: DRAGSTART('$el .tree-item'),
        value: function value$$1(e) {
            this.draggedImage = e.$delegateTarget;
            this.draggedImage.css('opacity', 0.5);
            // e.preventDefault();
        }
    }, {
        key: DRAGEND('$el .tree-item'),
        value: function value$$1(e) {

            if (this.draggedImage) {
                this.draggedImage.css('opacity', 1);
            }
        }
    }, {
        key: DRAGOVER('$el .tree-item'),
        value: function value$$1(e) {
            e.preventDefault();
        }
    }, {
        key: DROP('$el .tree-item') + SELF,
        value: function value$$1(e) {
            e.preventDefault();

            var destId = e.$delegateTarget.attr('data-id');
            var sourceId = this.draggedImage.attr('data-id');

            this.draggedImage = null;
            this.dispatch(ITEM_MOVE_IN, destId, sourceId);
            this.refresh();
        }
    }, {
        key: DROP(),
        value: function value$$1(e) {
            e.preventDefault();

            if (this.draggedImage) {
                var sourceId = this.draggedImage.attr('data-id');

                this.draggedImage = null;
                this.dispatch(ITEM_MOVE_LAST, sourceId);
                this.refresh();
            }
        }
    }]);
    return ImageListView;
}(UIElement);

var LayerToolbar = function (_UIElement) {
    inherits(LayerToolbar, _UIElement);

    function LayerToolbar() {
        classCallCheck(this, LayerToolbar);
        return possibleConstructorReturn(this, (LayerToolbar.__proto__ || Object.getPrototypeOf(LayerToolbar)).apply(this, arguments));
    }

    createClass(LayerToolbar, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'layer-toolbar\'>            \n                <div style="display:inline-block;vertical-align:middle;">       \n                    <ImageListView />\n                </div>    \n            </div>\n        ';
        }
    }, {
        key: 'components',
        value: function components() {
            return { ImageListView: ImageListView };
        }
    }]);
    return LayerToolbar;
}(UIElement);

var GradientAngle = function (_UIElement) {
    inherits(GradientAngle, _UIElement);

    function GradientAngle() {
        classCallCheck(this, GradientAngle);
        return possibleConstructorReturn(this, (GradientAngle.__proto__ || Object.getPrototypeOf(GradientAngle)).apply(this, arguments));
    }

    createClass(GradientAngle, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'drag-angle-rect\'>\n                <div class="drag-angle" ref="$dragAngle">\n                    <div ref="$angleText" class="angle-text"></div>\n                    <div ref="$dragPointer" class="drag-pointer"></div>\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            if (this.isShow()) {
                this.$el.show();

                this.refreshUI();
            } else {
                this.$el.hide();
            }
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            var image = editor$1.selection.backgroundImage;

            if (!image) return false;
            if (!image.image.hasAngle()) {
                return false;
            }

            return editor$1.config.get('guide.angle');
        }
    }, {
        key: 'getCurrentXY',
        value: function getCurrentXY(isUpdate, angle, radius, centerX, centerY) {
            return isUpdate ? editor$1.config.get('pos') : getXYInCircle(angle, radius, centerX, centerY);
        }
    }, {
        key: 'getRectangle',
        value: function getRectangle() {
            var width = this.refs.$dragAngle.width();
            var height = this.refs.$dragAngle.height();
            var radius = Math.floor(width / 2 * 0.7);

            var _refs$$dragAngle$offs = this.refs.$dragAngle.offset(),
                left = _refs$$dragAngle$offs.left,
                top = _refs$$dragAngle$offs.top;

            var minX = left;
            var minY = top;
            var centerX = minX + width / 2;
            var centerY = minY + height / 2;

            return { minX: minX, minY: minY, width: width, height: height, radius: radius, centerX: centerX, centerY: centerY };
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            var image = editor$1.selection.backgroundImage;
            if (!image) return 0;

            return image.image.calculateAngle() - 90;
        }
    }, {
        key: 'refreshAngleText',
        value: function refreshAngleText(angleText) {
            this.refs.$angleText.text(angleText + ' °');
        }
    }, {
        key: 'refreshUI',
        value: function refreshUI(isUpdate) {
            var _getRectangle = this.getRectangle(),
                minX = _getRectangle.minX,
                minY = _getRectangle.minY,
                radius = _getRectangle.radius,
                centerX = _getRectangle.centerX,
                centerY = _getRectangle.centerY;

            var _getCurrentXY = this.getCurrentXY(isUpdate, this.getDefaultValue(), radius, centerX, centerY),
                x = _getCurrentXY.x,
                y = _getCurrentXY.y;

            var rx = x - centerX,
                ry = y - centerY,
                angle = calculateAngle(rx, ry);

            {
                var _getCurrentXY2 = this.getCurrentXY(null, angle, radius, centerX, centerY),
                    x = _getCurrentXY2.x,
                    y = _getCurrentXY2.y;
            }

            // set drag pointer position 
            this.refs.$dragPointer.px('left', x - minX);
            this.refs.$dragPointer.px('top', y - minY);

            var lastAngle = Math.round(angle + 90) % 360;

            this.refreshAngleText(lastAngle);

            if (isUpdate) {

                this.setAngle(lastAngle);
            }
        }
    }, {
        key: 'setAngle',
        value: function setAngle(angle) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.image.angle = angle;
                editor$1.send(CHANGE_IMAGE, image.image);
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT(CHANGE_TOOL),
        value: function value() {
            this.$el.toggle(this.isShow());
        }

        // Event Bindings 

    }, {
        key: 'move',
        value: function move() {
            this.refreshUI(true);
        }
    }, {
        key: POINTERSTART('$dragAngle') + MOVE(),
        value: function value(e) {}
    }]);
    return GradientAngle;
}(UIElement);

var _DEFINE_POSITIONS;

var DEFINE_POSITIONS = (_DEFINE_POSITIONS = {}, defineProperty(_DEFINE_POSITIONS, Position$1.CENTER, [Position$1.CENTER, Position$1.CENTER]), defineProperty(_DEFINE_POSITIONS, Position$1.RIGHT, [Position$1.RIGHT, Position$1.CENTER]), defineProperty(_DEFINE_POSITIONS, Position$1.TOP, [Position$1.CENTER, Position$1.TOP]), defineProperty(_DEFINE_POSITIONS, Position$1.LEFT, [Position$1.LEFT, Position$1.CENTER]), defineProperty(_DEFINE_POSITIONS, Position$1.BOTTOM, [Position$1.CENTER, Position$1.BOTTOM]), _DEFINE_POSITIONS);

var GradientPosition = function (_UIElement) {
    inherits(GradientPosition, _UIElement);

    function GradientPosition() {
        classCallCheck(this, GradientPosition);
        return possibleConstructorReturn(this, (GradientPosition.__proto__ || Object.getPrototypeOf(GradientPosition)).apply(this, arguments));
    }

    createClass(GradientPosition, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="drag-position">\n                <div ref="$dragPointer" class="drag-pointer"></div>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggle(isShow);

            if (isShow) {
                this.refreshUI();
            }
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            var image = editor$1.selection.backgroundImage;
            if (!image) return false;

            var isRadial = image.image.isRadial();
            var isConic = image.image.isConic();

            if (isRadial == false && isConic == false) {
                // radial , conic 만 보여주기 
                return false;
            }

            return editor$1.config.get('guide.angle');
        }
    }, {
        key: 'getCurrentXY',
        value: function getCurrentXY(isUpdate, position) {

            if (isUpdate) {
                var xy = editor$1.config.get('pos');

                return [xy.x, xy.y];
            }

            var _getRectangle = this.getRectangle(),
                minX = _getRectangle.minX,
                minY = _getRectangle.minY,
                maxX = _getRectangle.maxX,
                maxY = _getRectangle.maxY,
                width = _getRectangle.width,
                height = _getRectangle.height;

            var p = position;
            if (isString(p) && DEFINE_POSITIONS[p]) {
                p = DEFINE_POSITIONS[p];
            } else if (isString(p)) {
                p = p.split(WHITE_STRING$1);
            }

            p = p.map(function (item, index) {
                if (item == 'center') {
                    if (index == 0) {
                        return minX + width / 2;
                    } else if (index == 1) {
                        return minY + height / 2;
                    }
                } else if (item === 'left') {
                    return minX;
                } else if (item === 'right') {
                    return maxX;
                } else if (item === 'top') {
                    return minY;
                } else if (item === 'bottom') {
                    return maxY;
                } else {
                    if (index == 0) {
                        return minX * width * (+item / 100);
                    } else if (index == 1) {
                        return minY * height * (+item / 100);
                    }
                }
            });

            return p;
        }
    }, {
        key: 'getRectangle',
        value: function getRectangle() {
            var width = this.$el.width();
            var height = this.$el.height();
            var minX = this.$el.offsetLeft();
            var minY = this.$el.offsetTop();

            var maxX = minX + width;
            var maxY = minY + height;

            return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: width, height: height };
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {

            var image = editor$1.selection.backgroundImage;
            if (!image) return EMPTY_STRING;

            return image.image.radialPosition || EMPTY_STRING;
        }
    }, {
        key: 'refreshUI',
        value: function refreshUI(isUpdate) {
            var _getRectangle2 = this.getRectangle(),
                minX = _getRectangle2.minX,
                minY = _getRectangle2.minY,
                maxX = _getRectangle2.maxX,
                maxY = _getRectangle2.maxY,
                width = _getRectangle2.width,
                height = _getRectangle2.height;

            var _getCurrentXY = this.getCurrentXY(isUpdate, this.getDefaultValue()),
                _getCurrentXY2 = slicedToArray(_getCurrentXY, 2),
                x = _getCurrentXY2[0],
                y = _getCurrentXY2[1];

            x = Math.max(Math.min(maxX, x), minX);
            y = Math.max(Math.min(maxY, y), minY);

            var left = x - minX;
            var top = y - minY;

            this.refs.$dragPointer.px('left', left);
            this.refs.$dragPointer.px('top', top);

            if (isUpdate) {

                this.setRadialPosition([Length.percent(Math.floor(left / width * 100)), Length.percent(Math.floor(top / height * 100))]);
            }
        }
    }, {
        key: 'setRadialPosition',
        value: function setRadialPosition(radialPosition) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.image.radialPosition = radialPosition;
                editor$1.send(CHANGE_IMAGE, image.image);
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: EVENT('changeTool'),
        value: function value$$1() {
            this.$el.toggle(this.isShow());
        }

        // Event Bindings 

    }, {
        key: 'move',
        value: function move() {
            this.refreshUI(true);
        }
    }, {
        key: POINTERSTART('$dragPointer') + MOVE(),
        value: function value$$1(e) {
            e.preventDefault();
        }
    }, {
        key: POINTERSTART() + MOVE(),
        value: function value$$1(e) {}
    }, {
        key: DOUBLECLICK('$dragPointer'),
        value: function value$$1(e) {
            e.preventDefault();
            this.setRadialPosition(Position$1.CENTER);
            this.refreshUI();
        }
    }]);
    return GradientPosition;
}(UIElement);

var PredefinedLinearGradientAngle = function (_UIElement) {
    inherits(PredefinedLinearGradientAngle, _UIElement);

    function PredefinedLinearGradientAngle() {
        classCallCheck(this, PredefinedLinearGradientAngle);
        return possibleConstructorReturn(this, (PredefinedLinearGradientAngle.__proto__ || Object.getPrototypeOf(PredefinedLinearGradientAngle)).apply(this, arguments));
    }

    createClass(PredefinedLinearGradientAngle, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="predefined-angluar-group">\n                <button type="button" data-value="to right"></button>                          \n                <button type="button" data-value="to left"></button>                                                  \n                <button type="button" data-value="to top"></button>                            \n                <button type="button" data-value="to bottom"></button>                                        \n                <button type="button" data-value="to top right"></button>                                \n                <button type="button" data-value="to bottom right"></button>                                    \n                <button type="button" data-value="to bottom left"></button>\n                <button type="button" data-value="to top left"></button>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            var image = editor$1.selection.backgroundImage;
            if (!image) {
                return false;
            }

            var isLinear = image.image.isLinear();
            var isConic = image.image.isConic();

            return editor$1.config.get('guide.angle') && (isLinear || isConic);
        }
    }, {
        key: CLICK('$el button') + SELF,
        value: function value(e) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.image.angle = e.$delegateTarget.attr('data-value');
                editor$1.send(CHANGE_IMAGE, image);
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT('changeTool'),
        value: function value() {
            this.refresh();
        }
    }]);
    return PredefinedLinearGradientAngle;
}(UIElement);

var PredefinedRadialGradientPosition = function (_UIElement) {
    inherits(PredefinedRadialGradientPosition, _UIElement);

    function PredefinedRadialGradientPosition() {
        classCallCheck(this, PredefinedRadialGradientPosition);
        return possibleConstructorReturn(this, (PredefinedRadialGradientPosition.__proto__ || Object.getPrototypeOf(PredefinedRadialGradientPosition)).apply(this, arguments));
    }

    createClass(PredefinedRadialGradientPosition, [{
        key: 'template',
        value: function template() {
            return ' \n            <div class="predefined-angluar-group radial-position">\n                <button type="button" data-value="top"></button>                          \n                <button type="button" data-value="left"></button>                                                  \n                <button type="button" data-value="bottom"></button>                            \n                <button type="button" data-value="right"></button>                                        \n            </div>\n        ';
        }
    }, {
        key: CLICK('$el button'),
        value: function value(e) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.radialPosition = e.$delegateTarget.attr('data-value');
                editor$1.send(CHANGE_IMAGE, image);
            }
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            var image = editor$1.selection.backgroundImage;
            if (!image) return false;

            var isRadial = image.image.isRadial();
            var isConic = image.image.isConic();

            return editor$1.config.get('guide.angle') && (isRadial || isConic);
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_TOOL),
        value: function value() {
            this.refresh();
        }
    }]);
    return PredefinedRadialGradientPosition;
}(UIElement);

var PredefinedRadialGradientAngle = function (_UIElement) {
    inherits(PredefinedRadialGradientAngle, _UIElement);

    function PredefinedRadialGradientAngle() {
        classCallCheck(this, PredefinedRadialGradientAngle);
        return possibleConstructorReturn(this, (PredefinedRadialGradientAngle.__proto__ || Object.getPrototypeOf(PredefinedRadialGradientAngle)).apply(this, arguments));
    }

    createClass(PredefinedRadialGradientAngle, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="predefined-radial-gradient-angle">\n                <button ref="$center" type="button" data-value="center" title="center"><span class=\'circle\'></span></button>            \n                <select class="radial-type-list" ref="$select">\n                    <option value="ellipse">ellipse</option>                \n                    <option value="closest-side">closest-side</option> \n                    <option value="closest-corner">closest-corner</option>\n                    <option value="farthest-side">farthest-side</option>\n                    <option value="farthest-corner">farthest-corner</option>                    \n                    <option value="circle">circle</option>\n                    <option value="circle closest-side">circle closest-side</option> \n                    <option value="circle closest-corner">circle closest-corner</option>\n                    <option value="circle farthest-side">circle farthest-side</option>\n                    <option value="circle farthest-corner">circle farthest-corner</option>                                        \n                </select>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                this.refs.$select.val(image.image.radialType);
            }
        }
    }, {
        key: EVENT(CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: CHANGE('$select'),
        value: function value(e) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.image.radialType = this.refs.$select.val();
                editor$1.send(CHANGE_IMAGE, image);
            }
        }
    }, {
        key: CLICK('$center'),
        value: function value(e) {
            var image = editor$1.selection.backgroundImage;
            if (image) {
                image.image.radialPosition = Position.CENTER;
                editor$1.send(CHANGE_IMAGE, image);
            }
        }
    }]);
    return PredefinedRadialGradientAngle;
}(UIElement);

var defined_position$1 = {
    'to right': {
        perspectiveOriginPositionX: Position$1.RIGHT,
        perspectiveOriginPositionY: Position$1.CENTER
    },
    'to left': {
        perspectiveOriginPositionX: Position$1.LEFT,
        perspectiveOriginPositionY: Position$1.CENTER
    },
    'to top': {
        perspectiveOriginPositionX: Position$1.CENTER,
        perspectiveOriginPositionY: Position$1.TOP
    },
    'to bottom': {
        perspectiveOriginPositionX: Position$1.CENTER,
        perspectiveOriginPositionY: Position$1.BOTTOM
    },
    'to top right': {
        perspectiveOriginPositionX: Position$1.RIGHT,
        perspectiveOriginPositionY: Position$1.TOP
    },
    'to bottom right': {
        perspectiveOriginPositionX: Position$1.RIGHT,
        perspectiveOriginPositionY: Position$1.BOTTOM
    },
    'to bottom left': {
        perspectiveOriginPositionX: Position$1.LEFT,
        perspectiveOriginPositionY: Position$1.BOTTOM
    },
    'to top left': {
        perspectiveOriginPositionX: Position$1.LEFT,
        perspectiveOriginPositionY: Position$1.TOP
    }
};

var PredefinedPerspectiveOriginPosition = function (_UIElement) {
    inherits(PredefinedPerspectiveOriginPosition, _UIElement);

    function PredefinedPerspectiveOriginPosition() {
        classCallCheck(this, PredefinedPerspectiveOriginPosition);
        return possibleConstructorReturn(this, (PredefinedPerspectiveOriginPosition.__proto__ || Object.getPrototypeOf(PredefinedPerspectiveOriginPosition)).apply(this, arguments));
    }

    createClass(PredefinedPerspectiveOriginPosition, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="predefined-perspective-origin-position">\n                <button type="button" data-value="to right"></button>                          \n                <button type="button" data-value="to left"></button>                                                  \n                <button type="button" data-value="to top"></button>                            \n                <button type="button" data-value="to bottom"></button>                                        \n                <button type="button" data-value="to top right"></button>                                \n                <button type="button" data-value="to bottom right"></button>                                    \n                <button type="button" data-value="to bottom left"></button>\n                <button type="button" data-value="to top left"></button>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            var artboard = editor$1.selection.artboard;
            if (!artboard) return false;

            return !!artboard.preserve;
        }
    }, {
        key: 'getPosition',
        value: function getPosition(type) {
            return defined_position$1[type] || {
                perspectiveOriginPositionX: Length$1.percent(0),
                perspectiveOriginPositionY: Length$1.percent(0)
            };
        }
    }, {
        key: CLICK('$el button') + SELF,
        value: function value(e) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                artboard.reset(this.getPosition(e.$delegateTarget.attr('data-value')));
                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: EVENT(CHANGE_ARTBOARD, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }]);
    return PredefinedPerspectiveOriginPosition;
}(UIElement);

var _DEFINE_POSITIONS$1;

var DEFINE_POSITIONS$1 = (_DEFINE_POSITIONS$1 = {}, defineProperty(_DEFINE_POSITIONS$1, POSITION_CENTER, [POSITION_CENTER, POSITION_CENTER]), defineProperty(_DEFINE_POSITIONS$1, POSITION_RIGHT, [POSITION_RIGHT, POSITION_CENTER]), defineProperty(_DEFINE_POSITIONS$1, POSITION_TOP, [POSITION_CENTER, POSITION_TOP]), defineProperty(_DEFINE_POSITIONS$1, POSITION_LEFT, [POSITION_LEFT, POSITION_CENTER]), defineProperty(_DEFINE_POSITIONS$1, POSITION_BOTTOM, [POSITION_CENTER, POSITION_BOTTOM]), _DEFINE_POSITIONS$1);

var PerspectiveOriginPosition = function (_UIElement) {
    inherits(PerspectiveOriginPosition, _UIElement);

    function PerspectiveOriginPosition() {
        classCallCheck(this, PerspectiveOriginPosition);
        return possibleConstructorReturn(this, (PerspectiveOriginPosition.__proto__ || Object.getPrototypeOf(PerspectiveOriginPosition)).apply(this, arguments));
    }

    createClass(PerspectiveOriginPosition, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="perspective-drag-position">\n                <div ref="$dragPointer" class="drag-pointer"></div>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            var isShow = this.isShow();

            this.$el.toggle(isShow);

            if (isShow) {
                this.refreshUI();
            }
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            var artboard = editor$1.selection.artboard;
            if (!artboard) return false;

            return !!artboard.preserve;
        }
    }, {
        key: 'getCurrentXY',
        value: function getCurrentXY(isUpdate, position) {

            if (isUpdate) {
                var xy = this.config('pos');

                return [xy.x, xy.y];
            }

            var _getRectangle = this.getRectangle(),
                minX = _getRectangle.minX,
                minY = _getRectangle.minY,
                maxX = _getRectangle.maxX,
                maxY = _getRectangle.maxY,
                width = _getRectangle.width,
                height = _getRectangle.height;

            var p = position;
            if (isString(p) && DEFINE_POSITIONS$1[p]) {
                p = DEFINE_POSITIONS$1[p];
            } else if (isString(p)) {
                p = p.split(WHITE_STRING$1);
            } else {
                p = [p.perspectiveOriginPositionX.value, p.perspectiveOriginPositionY.value];
            }

            p = p.map(function (item, index) {
                if (item == 'center') {
                    if (index == 0) {
                        return minX + width / 2;
                    } else if (index == 1) {
                        return minY + height / 2;
                    }
                } else if (item === 'left') {
                    return minX;
                } else if (item === 'right') {
                    return maxX;
                } else if (item === 'top') {
                    return minY;
                } else if (item === 'bottom') {
                    return maxY;
                } else {
                    if (index == 0) {
                        return minX + width * (+item / 100);
                    } else if (index == 1) {
                        return minY + height * (+item / 100);
                    }
                }
            });

            return p;
        }
    }, {
        key: 'getRectangle',
        value: function getRectangle() {
            var width = this.$el.width();
            var height = this.$el.height();
            var minX = this.$el.offsetLeft();
            var minY = this.$el.offsetTop();

            var maxX = minX + width;
            var maxY = minY + height;

            return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: width, height: height };
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {

            var artboard = editor$1.selection.artboard;
            if (!artboard) return EMPTY_STRING;

            return {
                perspectiveOriginPositionX: item.perspectiveOriginPositionX,
                perspectiveOriginPositionY: item.perspectiveOriginPositionY
            } || EMPTY_STRING;
        }
    }, {
        key: 'refreshUI',
        value: function refreshUI(isUpdate) {
            var _getRectangle2 = this.getRectangle(),
                minX = _getRectangle2.minX,
                minY = _getRectangle2.minY,
                maxX = _getRectangle2.maxX,
                maxY = _getRectangle2.maxY,
                width = _getRectangle2.width,
                height = _getRectangle2.height;

            var _getCurrentXY = this.getCurrentXY(isUpdate, this.getDefaultValue()),
                _getCurrentXY2 = slicedToArray(_getCurrentXY, 2),
                x = _getCurrentXY2[0],
                y = _getCurrentXY2[1];

            x = Math.max(Math.min(maxX, x), minX);
            y = Math.max(Math.min(maxY, y), minY);

            var left = x - minX;
            var top = y - minY;

            this.refs.$dragPointer.px('left', left);
            this.refs.$dragPointer.px('top', top);

            if (isUpdate) {

                this.setPerspectiveOriginPosition(Length$1.percent(Math.floor(left / width * 100)), Length$1.percent(Math.floor(top / height * 100)));
            }
        }
    }, {
        key: 'setPerspectiveOriginPosition',
        value: function setPerspectiveOriginPosition(perspectiveOriginPositionX, perspectiveOriginPositionY) {
            var artboard = editor$1.selection.artboard;
            if (artboard) {
                artboard.reset({
                    perspectiveOriginPositionX: perspectiveOriginPositionX,
                    perspectiveOriginPositionY: perspectiveOriginPositionY
                });

                editor$1.send(CHANGE_ARTBOARD, artboard);
            }
        }
    }, {
        key: EVENT(CHANGE_ARTBOARD, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }

        // Event Bindings 

    }, {
        key: 'move',
        value: function move() {
            this.refreshUI(true);
        }
    }, {
        key: POINTERSTART('$dragPointer') + MOVE(),
        value: function value$$1(e) {
            e.preventDefault();
        }
    }, {
        key: DOUBLECLICK('$dragPointer'),
        value: function value$$1(e) {
            e.preventDefault();
            this.setPerspectiveOriginPosition(Position$1.CENTER, Position$1.CENTER);
            this.refreshUI();
        }
    }]);
    return PerspectiveOriginPosition;
}(UIElement);

var LayerAngle = function (_UIElement) {
    inherits(LayerAngle, _UIElement);

    function LayerAngle() {
        classCallCheck(this, LayerAngle);
        return possibleConstructorReturn(this, (LayerAngle.__proto__ || Object.getPrototypeOf(LayerAngle)).apply(this, arguments));
    }

    createClass(LayerAngle, [{
        key: 'template',
        value: function template() {
            return '\n            <div class=\'drag-angle-rect\'>\n                <div class="drag-angle" ref="$dragAngle">\n                    <div ref="$angleText" class="angle-text"></div>\n                    <div ref="$dragPointer" class="drag-pointer"></div>\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {

            if (this.isShow()) {
                this.$el.show();
                this.refreshUI();
            } else {
                this.$el.hide();
            }
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            if (!editor$1.selection.layer) return false;
            return editor$1.config.get('guide.angle');
        }
    }, {
        key: 'getCurrentXY',
        value: function getCurrentXY(isUpdate, angle, radius, centerX, centerY) {
            return isUpdate ? editor$1.config.get('pos') : getXYInCircle(angle, radius, centerX, centerY);
        }
    }, {
        key: 'getRectangle',
        value: function getRectangle() {
            var width = this.refs.$dragAngle.width();
            var height = this.refs.$dragAngle.height();
            var radius = Math.floor(width / 2 * 0.7);

            var _refs$$dragAngle$offs = this.refs.$dragAngle.offset(),
                left = _refs$$dragAngle$offs.left,
                top = _refs$$dragAngle$offs.top;

            var minX = left;
            var minY = top;
            var centerX = minX + width / 2;
            var centerY = minY + height / 2;

            return { minX: minX, minY: minY, width: width, height: height, radius: radius, centerX: centerX, centerY: centerY };
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            var layer = editor$1.selection.layer;
            if (!layer) return -90;
            if (isUndefined$1(layer.rotate)) return -90;

            return layer.rotate - 90;
        }
    }, {
        key: 'refreshAngleText',
        value: function refreshAngleText(angleText) {
            this.refs.$angleText.text(angleText + ' °');
        }
    }, {
        key: 'refreshUI',
        value: function refreshUI(isUpdate) {
            var _getRectangle = this.getRectangle(),
                minX = _getRectangle.minX,
                minY = _getRectangle.minY,
                radius = _getRectangle.radius,
                centerX = _getRectangle.centerX,
                centerY = _getRectangle.centerY;

            var _getCurrentXY = this.getCurrentXY(isUpdate, this.getDefaultValue(), radius, centerX, centerY),
                x = _getCurrentXY.x,
                y = _getCurrentXY.y;

            var rx = x - centerX,
                ry = y - centerY,
                angle = calculateAngle(rx, ry);

            {
                var _getCurrentXY2 = this.getCurrentXY(null, angle, radius, centerX, centerY),
                    x = _getCurrentXY2.x,
                    y = _getCurrentXY2.y;
            }

            // set drag pointer position 
            this.refs.$dragPointer.px('left', x - minX);
            this.refs.$dragPointer.px('top', y - minY);

            var lastAngle = Math.round(angle + 90) % 360;

            this.refreshAngleText(lastAngle);

            if (isUpdate) {
                this.setAngle(lastAngle);
            }
        }
    }, {
        key: 'setAngle',
        value: function setAngle(rotate) {
            var _this2 = this;

            editor$1.selection.items.forEach(function (item) {
                item.rotate = (_this2.cachedRotate[id] + (rotate - _this2.cachedRotate[id])) % 360;
                _this2.commit(CHANGE_LAYER);
            });
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: EVENT(CHANGE_TOOL),
        value: function value() {
            this.$el.toggle(this.isShow());
        }

        // Event Bindings 

    }, {
        key: 'move',
        value: function move() {
            this.refreshUI(true);
        }
    }, {
        key: POINTERSTART('$dragAngle') + MOVE(),
        value: function value(e) {
            var _this3 = this;

            this.cachedRotate = {};
            editor$1.selection.items.forEach(function (item) {
                _this3.cachedRotate[item.id] = item.rotate || 0;
            });
            this.refreshUI(e);
        }
    }]);
    return LayerAngle;
}(UIElement);

var DEFINED_ANGLES$2 = {
    'to top': 0,
    'to top right': 45,
    'to right': 90,
    'to bottom right': 135,
    'to bottom': 180,
    'to bottom left': 225,
    'to left': 270,
    'to top left': 315

};

var PredefinedLayerAngle = function (_UIElement) {
    inherits(PredefinedLayerAngle, _UIElement);

    function PredefinedLayerAngle() {
        classCallCheck(this, PredefinedLayerAngle);
        return possibleConstructorReturn(this, (PredefinedLayerAngle.__proto__ || Object.getPrototypeOf(PredefinedLayerAngle)).apply(this, arguments));
    }

    createClass(PredefinedLayerAngle, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="predefined-angluar-group">\n                <button type="button" data-value="to right"></button>                          \n                <button type="button" data-value="to left"></button>                                                  \n                <button type="button" data-value="to top"></button>                            \n                <button type="button" data-value="to bottom"></button>                                        \n                <button type="button" data-value="to top right"></button>                                \n                <button type="button" data-value="to bottom right"></button>                                    \n                <button type="button" data-value="to bottom left"></button>\n                <button type="button" data-value="to top left"></button>\n            </div>\n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.$el.toggle(this.isShow());
        }
    }, {
        key: 'isShow',
        value: function isShow() {
            if (!editor$1.selection.layer) return false;

            return editor$1.config.get('guide.angle');
        }
    }, {
        key: CLICK('$el button') + SELF,
        value: function value(e) {
            var layer = editor$1.selection.layer;
            if (layer) {
                layer.rotate = DEFINED_ANGLES$2[e.$delegateTarget.attr('data-value')];
                editor$1.send(CHANGE_LAYER, layer);
            }
        }
    }, {
        key: EVENT(CHANGE_LAYER, CHANGE_EDITOR, CHANGE_SELECTION, CHANGE_TOOL),
        value: function value() {
            this.refresh();
        }
    }]);
    return PredefinedLayerAngle;
}(UIElement);

var SubFeatureControl = function (_UIElement) {
    inherits(SubFeatureControl, _UIElement);

    function SubFeatureControl() {
        classCallCheck(this, SubFeatureControl);
        return possibleConstructorReturn(this, (SubFeatureControl.__proto__ || Object.getPrototypeOf(SubFeatureControl)).apply(this, arguments));
    }

    createClass(SubFeatureControl, [{
        key: "template",
        value: function template() {
            return "\n            <div class='sub-feature-control'>         \n                <div class='feature'>\n                    <div class=\"property-view\" ref=\"$perspective\">\n                        <PredefinedPerspectiveOriginPosition />\n                        <PerspectiveOriginPosition />\n                    </div>\n                    <div class=\"property-view\" ref=\"$backgroundSize\">\n                        <PredefinedBackgroundPosition />\n                        <BackgroundResizer />\n                    </div>\n                    <div class=\"property-view linear\" ref=\"$linear\">\n                        <PredefinedLinearGradientAngle />\n                        <GradientAngle />\n                    </div>\n                    <div class=\"property-view radial\" ref=\"$radial\">\n                        <PredefinedRadialGradientAngle />\n                        <PredefinedRadialGradientPosition />\n                        <GradientPosition />\n                    </div>\n                    <div class=\"property-view layer\" ref=\"$layer\">\n                        <PredefinedLayerAngle />\n                        <LayerAngle />\n                    </div>                    \n                </div>\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return _extends({
                PredefinedLayerAngle: PredefinedLayerAngle,
                LayerAngle: LayerAngle,
                PerspectiveOriginPosition: PerspectiveOriginPosition,
                PredefinedPerspectiveOriginPosition: PredefinedPerspectiveOriginPosition,
                PredefinedRadialGradientAngle: PredefinedRadialGradientAngle,
                GradientAngle: GradientAngle,
                GradientPosition: GradientPosition,
                PredefinedLinearGradientAngle: PredefinedLinearGradientAngle,
                PredefinedRadialGradientPosition: PredefinedRadialGradientPosition,
                BackgroundResizer: BackgroundResizer,
                PredefinedBackgroundPosition: PredefinedBackgroundPosition
            }, items$1);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.toggle(this.isShow());
            this.refs.$perspective.toggleClass('hide', this.isNotPage());
            this.refs.$backgroundSize.toggleClass('hide', this.isNotImage());
            this.refs.$linear.toggleClass('hide', !this.isLinearShow());
            this.refs.$radial.toggleClass('hide', !this.isRadialShow());
            this.refs.$layer.toggleClass('hide', this.isNotLayer());
        }
    }, {
        key: "isShow",
        value: function isShow() {
            return true;
        }
    }, {
        key: "isNotImage",
        value: function isNotImage() {
            return !editor$1.selection.backgroundImage;
        }
    }, {
        key: "isNotLayer",
        value: function isNotLayer() {
            return !editor$1.selection.layer;
        }
    }, {
        key: "isNotPage",
        value: function isNotPage() {
            return !editor$1.selection.artboard;
        }
    }, {
        key: "isLinearShow",
        value: function isLinearShow() {
            var backgroundImage = editor$1.selection.backgroundImage;
            if (!backgroundImage) return false;

            var image = backgroundImage.image;
            if (!image) return false;

            if (image.isLinear() == false && image.isConic() == false) {
                return false;
            }

            return editor$1.config.get('guide.angle');
        }
    }, {
        key: "isRadialShow",
        value: function isRadialShow() {
            var backgroundImage = editor$1.selection.backgroundImage;
            if (!backgroundImage) return false;

            var image = backgroundImage.image;
            if (!image) return false;

            if (image.isRadial() == false && image.isConic() == false) {
                return false;
            }

            return editor$1.config.get('guide.angle');
        }
    }, {
        key: EVENT(CHANGE_ARTBOARD, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }]);
    return SubFeatureControl;
}(UIElement);

var colorpicker_class = 'codemirror-colorview';
var colorpicker_background_class = 'codemirror-colorview-background';
// Excluded tokens do not show color views..
var excluded_token = ['comment'];

function onChange(cm, evt) {
    if (evt.origin == 'setValue') {
        // if content is changed by setValue method, it initialize markers
        cm.state.colorpicker.close_color_picker();
        cm.state.colorpicker.init_color_update();
        cm.state.colorpicker.style_color_update();
    } else {
        cm.state.colorpicker.style_color_update(cm.getCursor().line);
    }
}

function onUpdate(cm, evt) {
    if (!cm.state.colorpicker.isUpdate) {
        cm.state.colorpicker.isUpdate = true;
        cm.state.colorpicker.close_color_picker();
        cm.state.colorpicker.init_color_update();
        cm.state.colorpicker.style_color_update();
    }
}

function onRefresh(cm, evt) {
    onChange(cm, { origin: 'setValue' });
}

function onKeyup(cm, evt) {
    cm.state.colorpicker.keyup(evt);
}

function onMousedown(cm, evt) {
    if (cm.state.colorpicker.is_edit_mode()) {
        cm.state.colorpicker.check_mousedown(evt);
    }
}

function onPaste(cm, evt) {
    onChange(cm, { origin: 'setValue' });
}

function onScroll(cm) {
    cm.state.colorpicker.close_color_picker();
}

function debounce$1(callback, delay) {

    var t = undefined;

    return function (cm, e) {
        if (t) {
            clearTimeout(t);
        }

        t = setTimeout(function () {
            callback(cm, e);
        }, delay || 300);
    };
}

function has_class(el, cls) {
    if (!el || !el.className) {
        return false;
    } else {
        var newClass = ' ' + el.className + ' ';
        return newClass.indexOf(' ' + cls + ' ') > -1;
    }
}

var ColorView$2 = function () {
    function ColorView(cm, opt) {
        classCallCheck(this, ColorView);

        if (isBoolean(opt)) {
            opt = { mode: 'edit' };
        } else {
            opt = _extends({ mode: 'edit' }, opt || {});
        }

        this.opt = opt;
        this.cm = cm;
        this.markers = {};

        // set excluded token 
        this.excluded_token = this.opt.excluded_token || excluded_token;

        if (this.opt.colorpicker) {
            this.colorpicker = this.opt.colorpicker(this.opt);
        } else {
            this.colorpicker = ColorPicker.create(this.opt);
        }

        this.init_event();
    }

    createClass(ColorView, [{
        key: 'init_event',
        value: function init_event() {

            this.cm.on('mousedown', onMousedown);
            this.cm.on('keyup', onKeyup);
            this.cm.on('change', onChange);
            this.cm.on('update', onUpdate);
            this.cm.on('refresh', onRefresh);

            // create paste callback
            this.onPasteCallback = function (cm, callback) {
                return function (evt) {
                    callback.call(this, cm, evt);
                };
            }(this.cm, onPaste);

            this.cm.getWrapperElement().addEventListener('paste', this.onPasteCallback);

            if (this.is_edit_mode()) {
                this.cm.on('scroll', debounce$1(onScroll, 50));
            }
        }
    }, {
        key: 'is_edit_mode',
        value: function is_edit_mode() {
            return this.opt.mode == 'edit';
        }
    }, {
        key: 'is_view_mode',
        value: function is_view_mode() {
            return this.opt.mode == 'view';
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.cm.off('mousedown', onMousedown);
            this.cm.off('keyup', onKeyup);
            this.cm.off('change', onChange);
            this.cm.getWrapperElement().removeEventListener('paste', this.onPasteCallback);

            if (this.is_edit_mode()) {
                this.cm.off('scroll');
            }
        }
    }, {
        key: 'hasClass',
        value: function hasClass(el, className) {
            if (!el.className) {
                return false;
            } else {
                var newClass = ' ' + el.className + ' ';
                return newClass.indexOf(' ' + className + ' ') > -1;
            }
        }
    }, {
        key: 'check_mousedown',
        value: function check_mousedown(evt) {
            if (this.hasClass(evt.target, colorpicker_background_class)) {
                this.open_color_picker(evt.target.parentNode);
            } else {
                this.close_color_picker();
            }
        }
    }, {
        key: 'popup_color_picker',
        value: function popup_color_picker(defalutColor) {
            var cursor = this.cm.getCursor();
            var colorMarker = {
                lineNo: cursor.line,
                ch: cursor.ch,
                color: defalutColor || '#FFFFFF',
                isShortCut: true
            };

            keyEach(this.markers, function (key, marker) {
                var searchKey = "#" + key;
                if (searchKey.indexOf("#" + colorMarker.lineNo + ":") > -1) {
                    
                    if (marker.ch <= colorMarker.ch && colorMarker.ch <= marker.ch + marker.color.length) {
                        // when cursor has marker
                        colorMarker.ch = marker.ch;
                        colorMarker.color = marker.color;
                        colorMarker.nameColor = marker.nameColor;
                    }
                }
            });

            this.open_color_picker(colorMarker);
        }
    }, {
        key: 'open_color_picker',
        value: function open_color_picker(el) {
            var lineNo = el.lineNo;
            var ch = el.ch;
            var nameColor = el.nameColor;
            var color = el.color;

            if (this.colorpicker) {
                var self = this;
                var prevColor = color;
                var pos = this.cm.charCoords({ line: lineNo, ch: ch });
                this.colorpicker.show({
                    left: pos.left,
                    top: pos.bottom,
                    isShortCut: el.isShortCut || false,
                    hideDelay: self.opt.hideDelay || 2000
                }, nameColor || color, function (newColor) {
                    self.cm.replaceRange(newColor, { line: lineNo, ch: ch }, { line: lineNo, ch: ch + prevColor.length }, '*colorpicker');
                    prevColor = newColor;
                });
            }
        }
    }, {
        key: 'close_color_picker',
        value: function close_color_picker(el) {
            if (this.colorpicker) {
                this.colorpicker.hide();
            }
        }
    }, {
        key: 'key',
        value: function key(lineNo, ch) {
            return [lineNo, ch].join(":");
        }
    }, {
        key: 'keyup',
        value: function keyup(evt) {

            if (this.colorpicker) {
                if (evt.key == 'Escape') {
                    this.colorpicker.hide();
                } else if (this.colorpicker.isShortCut == false) {
                    this.colorpicker.hide();
                }
            }
        }
    }, {
        key: 'init_color_update',
        value: function init_color_update() {
            this.markers = {}; // initialize marker list
        }
    }, {
        key: 'style_color_update',
        value: function style_color_update(lineHandle) {
            if (lineHandle) {
                this.match(lineHandle);
            } else {
                var max = this.cm.lineCount();

                for (var lineNo = 0; lineNo < max; lineNo++) {
                    this.match(lineNo);
                }
            }
        }
    }, {
        key: 'empty_marker',
        value: function empty_marker(lineNo, lineHandle) {
            var list = lineHandle.markedSpans || [];

            for (var i = 0, len = list.length; i < len; i++) {
                var key = this.key(lineNo, list[i].from);

                if (key && has_class(list[i].marker.replacedWith, colorpicker_class)) {
                    delete this.markers[key];
                    list[i].marker.clear();
                }
            }
        }
    }, {
        key: 'match_result',
        value: function match_result(lineHandle) {
            return Color$1.matches(lineHandle.text);
        }
    }, {
        key: 'submatch',
        value: function submatch(lineNo, lineHandle) {
            var _this = this;

            this.empty_marker(lineNo, lineHandle);

            var result = this.match_result(lineHandle);
            var obj = { next: 0 };

            result.forEach(function (item) {
                _this.render(obj, lineNo, lineHandle, item.color, item.nameColor);
            });
        }
    }, {
        key: 'match',
        value: function match(lineNo) {
            var lineHandle = this.cm.getLineHandle(lineNo);
            var self = this;
            this.cm.operation(function () {
                self.submatch(lineNo, lineHandle);
            });
        }
    }, {
        key: 'make_element',
        value: function make_element() {
            var el = document.createElement('div');

            el.className = colorpicker_class;

            if (this.is_edit_mode()) {
                el.title = "open color picker";
            } else {
                el.title = "";
            }

            el.back_element = this.make_background_element();
            el.appendChild(el.back_element);

            return el;
        }
    }, {
        key: 'make_background_element',
        value: function make_background_element() {
            var el = document.createElement('div');

            el.className = colorpicker_background_class;

            return el;
        }
    }, {
        key: 'set_state',
        value: function set_state(lineNo, start, color, nameColor) {
            var marker = this.create_marker(lineNo, start);

            marker.lineNo = lineNo;
            marker.ch = start;
            marker.color = color;
            marker.nameColor = nameColor;

            return marker;
        }
    }, {
        key: 'create_marker',
        value: function create_marker(lineNo, start) {

            if (!this.has_marker(lineNo, start)) {
                this.init_marker(lineNo, start);
            }

            return this.get_marker(lineNo, start);
        }
    }, {
        key: 'init_marker',
        value: function init_marker(lineNo, start) {
            this.markers[this.key(lineNo, start)] = this.make_element();
        }
    }, {
        key: 'has_marker',
        value: function has_marker(lineNo, start) {
            return !!this.get_marker(lineNo, start);
        }
    }, {
        key: 'get_marker',
        value: function get_marker(lineNo, start) {
            var key = this.key(lineNo, start);
            return this.markers[key];
        }
    }, {
        key: 'update_element',
        value: function update_element(el, color) {
            el.back_element.style.backgroundColor = color;
        }
    }, {
        key: 'set_mark',
        value: function set_mark(line, ch, el) {
            this.cm.setBookmark({ line: line, ch: ch }, { widget: el, handleMouseEvents: true });
        }
    }, {
        key: 'is_excluded_token',
        value: function is_excluded_token(line, ch) {
            var type = this.cm.getTokenTypeAt({ line: line, ch: ch });
            var count = 0;
            for (var i = 0, len = this.excluded_token.length; i < len; i++) {
                if (type === this.excluded_token[i]) {
                    count++;
                    break;
                }
            }

            return count > 0; // true is that it has a excluded token 
        }
    }, {
        key: 'render',
        value: function render(cursor, lineNo, lineHandle, color, nameColor) {
            var start = lineHandle.text.indexOf(color, cursor.next);

            if (this.is_excluded_token(lineNo, start) === true) {
                // excluded token do not show.
                return;
            }

            cursor.next = start + color.length;

            if (this.has_marker(lineNo, start)) {
                this.update_element(this.create_marker(lineNo, start), nameColor || color);
                this.set_state(lineNo, start, color, nameColor);
                return;
            }

            var el = this.create_marker(lineNo, start);

            this.update_element(el, nameColor || color);

            this.set_state(lineNo, start, color, nameColor || color);
            this.set_mark(lineNo, start, el);
        }
    }]);
    return ColorView;
}();

try {
    var CodeMirror$1 = require('codemirror');
} catch (e) {}

var CHECK_CODEMIRROR_OBJECT = function CHECK_CODEMIRROR_OBJECT() {
    return CodeMirror$1 || window.CodeMirror;
};
function LOAD_CODEMIRROR_COLORPICKER() {
    var CODEMIRROR_OBJECT = CHECK_CODEMIRROR_OBJECT();

    if (CODEMIRROR_OBJECT) {
        CODEMIRROR_OBJECT.defineOption("colorpicker", false, function (cm, val, old) {
            if (old && old != CODEMIRROR_OBJECT.Init) {

                if (cm.state.colorpicker) {
                    cm.state.colorpicker.destroy();
                    cm.state.colorpicker = null;
                }
                // remove event listener
            }

            if (val) {
                cm.state.colorpicker = new ColorView$2(cm, val);
            }
        });
    }
}

LOAD_CODEMIRROR_COLORPICKER();

var ColorPickerCodeMirror = {
    load: LOAD_CODEMIRROR_COLORPICKER
};

var ExportCodePenButton = function (_UIElement) {
    inherits(ExportCodePenButton, _UIElement);

    function ExportCodePenButton() {
        classCallCheck(this, ExportCodePenButton);
        return possibleConstructorReturn(this, (ExportCodePenButton.__proto__ || Object.getPrototypeOf(ExportCodePenButton)).apply(this, arguments));
    }

    createClass(ExportCodePenButton, [{
        key: "template",
        value: function template() {
            return "\n            <form class='codepen' action=\"https://codepen.io/pen/define\" method=\"POST\" target=\"_blank\">\n                <input type=\"hidden\" name=\"data\" ref=\"$codepen\" value=''>\n                <button type=\"submit\">CodePen</button>\n            </form>     \n        ";
        }
    }, {
        key: SUBMIT(),
        value: function value() {
            var generateCode = this.read('export/generate/code');
            this.refs.$codepen.val(this.read('export/codepen/code', {
                html: generateCode.html,
                css: generateCode.css
            }));

            return false;
        }
    }]);
    return ExportCodePenButton;
}(UIElement);

var ExportJSFiddleButton = function (_UIElement) {
    inherits(ExportJSFiddleButton, _UIElement);

    function ExportJSFiddleButton() {
        classCallCheck(this, ExportJSFiddleButton);
        return possibleConstructorReturn(this, (ExportJSFiddleButton.__proto__ || Object.getPrototypeOf(ExportJSFiddleButton)).apply(this, arguments));
    }

    createClass(ExportJSFiddleButton, [{
        key: "template",
        value: function template() {
            return "\n            <form class='jsfiddle' action=\"http://jsfiddle.net/api/post/library/pure/\" method=\"POST\" target=\"_blank\">\n                <input type=\"hidden\" name=\"title\" ref=\"$title\" value=''>\n                <input type=\"hidden\" name=\"description\" ref=\"$description\" value=''>\n                <input type=\"hidden\" name=\"html\" ref=\"$html\" value=''>\n                <input type=\"hidden\" name=\"css\" ref=\"$css\" value=''>\n                <input type=\"hidden\" name=\"dtd\" value='html 5'>\n                <button type=\"submit\">JSFiddle</button>\n            </form>     \n        ";
        }
    }, {
        key: SUBMIT(),
        value: function value() {
            var generateCode = this.read('export/generate/code');

            this.refs.$title.val('CSS Gradient Editor');
            this.refs.$description.val('EasyLogic Studio - https://css.easylogic.studio');
            this.refs.$html.val(generateCode.html);
            this.refs.$css.val(generateCode.css);

            return false;
        }
    }]);
    return ExportJSFiddleButton;
}(UIElement);

var EXPORT_GENERATE_CODE = 'export/generate/code';
var EXPORT_CODEPEN_CODE = 'export/codepen/code';

var ExportWindow = function (_UIElement) {
    inherits(ExportWindow, _UIElement);

    function ExportWindow() {
        classCallCheck(this, ExportWindow);
        return possibleConstructorReturn(this, (ExportWindow.__proto__ || Object.getPrototypeOf(ExportWindow)).apply(this, arguments));
    }

    createClass(ExportWindow, [{
        key: "components",
        value: function components() {
            return {
                ExportJSFiddleButton: ExportJSFiddleButton,
                ExportCodePenButton: ExportCodePenButton
            };
        }
    }, {
        key: "template",
        value: function template() {
            return "\n            <div class='export-view'>\n                <div class=\"color-view\">\n                    <div class=\"close\" ref=\"$close\">&times;</div>        \n                    <div class=\"codeview-container\">\n                        <div class=\"title\">\n                            <div class=\"tools\" ref=\"$title\">\n                                <div class=\"tool-item selected\" data-type=\"fullhtml\" ref=\"$fullhtmlTitle\">Full HTML</div>\n                                <div class=\"tool-item\" data-type=\"html\" ref=\"$htmlTitle\">HTML</div>\n                                <div class=\"tool-item\" data-type=\"css\" ref=\"$cssTitle\">CSS</div>\n                            </div>\n                            <div class=\"buttons\">\n                                <ExportCodePenButton />\n                                <ExportJSFiddleButton />\n                            </div>\n                        </div>\n                        <div class=\"codeview\">\n                            <div class=\"content-item selected\" data-type=\"fullhtml\" ref=\"$fullhtmlContent\">\n                                <textarea ref=\"$fullhtml\"></textarea>\n                            </div>\n                            <div class=\"content-item\" data-type=\"html\" ref=\"$htmlContent\">\n                                <textarea ref=\"$html\"></textarea>\n                            </div>\n                            <div class=\"content-item\" data-type=\"css\" ref=\"$cssContent\">\n                                <textarea ref=\"$css\"></textarea>\n                            </div>                            \n                        </div>\n                    </div>\n                    <div class=\"preview-container\">\n                        <div class=\"title\">Preview</div>\n                        <div class='preview' ref=\"$preview\"></div>\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "afterRender",
        value: function afterRender() {
            ColorPickerCodeMirror.load();
            if (!window.CodeMirror) return;
            var mixedMode = {
                name: "htmlmixed",
                scriptTypes: [{ matches: /\/x-handlebars-template|\/x-mustache/i,
                    mode: null }, { matches: /(text|application)\/(x-)?vb(a|script)/i,
                    mode: "vbscript" }]
            };
            this.cmFullHtml = CodeMirror.fromTextArea(this.refs.$fullhtml.el, {
                lineNumbers: true,
                readOnly: true,
                lineWrapping: true,
                mode: mixedMode,
                colorpicker: {
                    mode: 'view'
                }
            });

            this.cmHtml = CodeMirror.fromTextArea(this.refs.$html.el, {
                lineNumbers: true,
                readOnly: true,
                lineWrapping: true,
                mode: mixedMode
            });

            this.cmCss = CodeMirror.fromTextArea(this.refs.$css.el, {
                lineNumbers: true,
                readOnly: true,
                lineWrapping: true,
                mode: "text/css",
                colorpicker: {
                    mode: 'view'
                }
            });
        }
    }, {
        key: "loadCode",
        value: function loadCode() {
            var _mapGetters = this.mapGetters(SELECTION_CURRENT_PAGE, EXPORT_GENERATE_CODE),
                _mapGetters2 = slicedToArray(_mapGetters, 2),
                current_page = _mapGetters2[0],
                generate_code = _mapGetters2[1];

            var page = current_page();

            if (!page) {
                return EMPTY_STRING;
            }

            var generateCode = generate_code();

            if (this.cmFullHtml) {
                this.cmFullHtml.setValue(generateCode.fullhtml);
                this.cmFullHtml.refresh();
            }

            if (this.cmHtml) {
                this.cmHtml.setValue(generateCode.html);
                this.cmHtml.refresh();
            }

            if (this.cmCss) {
                this.cmCss.setValue(generateCode.css);
                this.cmCss.refresh();
            }

            this.refs.$preview.html(generateCode.fullhtml);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.loadCode();
        }
    }, {
        key: CLICK('$close'),
        value: function value$$1(e) {
            this.$el.hide();
        }
    }, {
        key: CLICK('$title .tool-item'),
        value: function value$$1(e) {
            var _this2 = this;

            var type = e.$delegateTarget.attr('data-type');

            Object.keys(this.refs).filter(function (it) {
                return it.includes('Title');
            }).forEach(function (key) {
                var obj = _this2.refs[key];
                obj.toggleClass('selected', "$" + type + "Title" == key);
            });

            Object.keys(this.refs).filter(function (it) {
                return it.includes('Content');
            }).forEach(function (key) {
                var obj = _this2.refs[key];
                obj.toggleClass('selected', "$" + type + "Content" == key);

                if (_this2.cmFullHtml) _this2.cmFullHtml.refresh();
                if (_this2.cmHtml) _this2.cmHtml.refresh();
                if (_this2.cmCss) _this2.cmCss.refresh();
            });
        }
    }, {
        key: EVENT('toggleExport'),
        value: function value$$1() {
            this.$el.toggle();
        }
    }, {
        key: EVENT('showExport'),
        value: function value$$1() {
            this.$el.show();
            this.refresh();
        }
    }, {
        key: EVENT('hideExport'),
        value: function value$$1() {
            this.$el.hide();
        }
    }]);
    return ExportWindow;
}(UIElement);

var _ScaleFunctions;

var ScaleFunctions = (_ScaleFunctions = {
    'color': 'makeScaleFunctionForColor',
    'number': 'makeScaleFunctionForNumber'
}, defineProperty(_ScaleFunctions, UNIT_PERCENT, 'makeScaleFunctionForPercent'), defineProperty(_ScaleFunctions, UNIT_PX, 'makeScaleFunctionForPx'), defineProperty(_ScaleFunctions, UNIT_EM, 'makeScaleFunctionForEm'), _ScaleFunctions);

var Scale = {
    makeScaleFunctionForColor: function makeScaleFunctionForColor(start, end) {
        return function (currentPercent) {
            var rate = (currentPercent - start.percent) / (end.percent - start.percent);

            return interpolateRGBObject(start, end, rate);
        };
    },
    makeScaleFunctionForNumber: function makeScaleFunctionForNumber(start, end) {
        return function (currentPercent) {
            var rate = (currentPercent - start.percent) / (end.percent - start.percent);

            return start.value + (end.value - start.value) * rate;
        };
    },
    makeScaleFunctionForPercent: function makeScaleFunctionForPercent(start, end) {
        return this.makeScaleFunctionForNumber(start, end);
    },
    makeScaleFunctionForPx: function makeScaleFunctionForPx(start, end) {
        return this.makeScaleFunctionForNumber(start, end);
    },
    makeScaleFunctionForEm: function makeScaleFunctionForEm(start, end) {
        return this.makeScaleFunctionForNumber(start, end);
    },
    makeScaleFunction: function makeScaleFunction(start, end, isLast) {
        var itemType = start.itemType || 'number';

        return this[ScaleFunctions[itemType]].call(this, start, end);
    },
    makeCheckFunction: function makeCheckFunction(start, end, isLast) {
        if (isLast) {
            return function (currentPercent) {
                return start.percent <= currentPercent && currentPercent <= end.percent;
            };
        } else {
            return function (currentPercent) {
                return start.percent <= currentPercent && currentPercent < end.percent;
            };
        }
    },
    makeSetupFunction: function makeSetupFunction(start, end, isLast) {
        var check = this.makeCheckFunction(start, end, isLast);
        var scale$$1 = this.makeScaleFunction(start, end, isLast);

        if (start.itemType == 'color') {
            return this.makeSetupColorScaleFunction(check, scale$$1, start, end);
        } else {
            return this.makeSetupNumberScaleFunction(check, scale$$1, start, end);
        }
    },
    makeSetupColorScaleFunction: function makeSetupColorScaleFunction(check, scale$$1, start, end) {
        return function (ani, progress) {
            if (check(progress)) {
                ani.obj[start.key] = rgb(scale$$1(ani.timing(progress, ani.duration, start, end)));
            }
        };
    },
    makeSetupNumberScaleFunction: function makeSetupNumberScaleFunction(check, scale$$1, start, end) {

        return function (ani, progress) {
            if (check(progress)) {
                var value$$1 = scale$$1(ani.timing(progress, ani.duration, start.value, end.value)) + start.type;

                ani.obj[start.key] = string2unit(value$$1);
            }
        };
    }
};

var ValueGenerator = {
    make: function make(key, percent, transitionPropertyValue) {

        // 색상 체크 
        var arr = matches$1(transitionPropertyValue);
        if (arr.length) {
            return _extends({ key: key, percent: percent, itemType: 'color' }, parse(arr[0].color)); // 색상 객체 
        } else if (isNumber(transitionPropertyValue)) {
            return { key: key, percent: percent, itemType: 'number', type: 'number', value: transitionPropertyValue };
        } else {
            if (transitionPropertyValue.includes('%')) {
                return { key: key, percent: percent, itemType: '%', type: '%', value: parseParamNumber$1(transitionPropertyValue) };
            } else if (transitionPropertyValue.includes('px')) {
                return { key: key, percent: percent, itemType: 'px', type: 'px', value: parseParamNumber$1(transitionPropertyValue) };
            } else if (transitionPropertyValue.includes('em')) {
                return { key: key, percent: percent, itemType: 'em', type: 'em', value: parseParamNumber$1(transitionPropertyValue) };
            }
        }

        return { key: key, percent: percent, itemType: 'number', type: 'number', value: +transitionPropertyValue };
    }
};

var KeyFrames = {
    parse: function parse(obj, ani) {
        var list = keyMap(obj, function (key, originAttrs) {
            var attrs = _extends({}, originAttrs);
            var percent$$1 = 0;
            if (key == 'from') {
                key = '0%';
            } else if (key == 'to') {
                key = '100%';
            }

            if (key.includes('%')) {
                percent$$1 = parseParamNumber$1(key) / 100;
            } else {
                var newKey = +key;

                if (newKey + EMPTY_STRING == key) {
                    // 시간 초 단위 
                    percent$$1 = newKey / ani.duration;
                }
            }

            return {
                percent: percent$$1,
                attrs: attrs,
                originAttrs: originAttrs
            };
        });

        return this.parseTiming.apply(this, toConsumableArray(this.parseAttrs.apply(this, toConsumableArray(list))));
    },
    parseTiming: function parseTiming() {
        for (var _len = arguments.length, list = Array(_len), _key = 0; _key < _len; _key++) {
            list[_key] = arguments[_key];
        }

        var transitionProperties = {};
        list.forEach(function (item) {
            keyEach(item.attrs, function (property) {
                transitionProperties[property] = true;
            });
        });

        var keyValueMapping = keyMap(transitionProperties, function (property) {
            return list.filter(function (it) {
                return it.attrs[property];
            }).map(function (it) {
                return it.attrs[property];
            });
        }).filter(function (it) {
            return it.length;
        });

        return keyValueMapping.map(function (transitionPropertyItem) {
            var functions$$1 = [];

            for (var i = 0, len = transitionPropertyItem.length - 1; i < len; i++) {
                functions$$1.push(Scale.makeSetupFunction(transitionPropertyItem[i], transitionPropertyItem[i + 1], len - 1 == i));
            }

            return {
                functions: functions$$1,
                type: transitionPropertyItem[0].itemType || UNIT_PX,
                values: transitionPropertyItem
            };
        });
    },
    parseAttrs: function parseAttrs() {
        for (var _len2 = arguments.length, list = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            list[_key2] = arguments[_key2];
        }

        list.sort(function (a, b) {
            if (a.percent == b.percent) return 0;
            return a.percent > b.percent ? 1 : -1;
        });

        list = list.map(function (item, index) {
            keyEach(item.attrs, function (key, value$$1) {
                item.attrs[key] = ValueGenerator.make(key, item.percent, value$$1);
            });

            return item;
        });

        return list;
    }
};

var DIRECTION_NORMAL = 'normal';
var DIRECTION_REVERSE = 'reverse';
var DIRECTION_ALTERNATE = 'alternate';
var DIRECTION_ALTERNATE_REVERSE = 'alternate-reverse';

var Timers = {
    parse: function parse(opt) {
        var ani = _extends({
            name: 'sample' + Date.now(),
            iteration: 1,
            duration: 1000,
            delay: 0,
            timing: Timing.linear,
            direction: DIRECTION_NORMAL, // reverse, alternate, alternate-reverse
            keyframes: {}
        }, opt);

        if (ani.iteration == 'infinite') {
            ani.iteration = Number.MAX_SAFE_INTEGER;
        } else {
            ani.iteration = Math.floor(ani.iteration);
        }

        ani.timing = Timing[ani.timing] || ani.timing;

        ani.realKeyframes = KeyFrames.parse(ani.keyframes, ani);

        ani.update = this.setupFunction(ani);

        return ani;
    },
    getDirection: function getDirection(ani, progress, runningTime) {
        if (ani.direction == DIRECTION_REVERSE) {
            // TODO: duration 안에서 reverse
            return 1 - progress;
        } else if (ani.direction == DIRECTION_ALTERNATE) {
            var targetIterator = Math.ceil(runningTime / ani.duration);
            var targetIterator2 = Math.floor(runningTime / ani.duration);

            if (targetIterator % 2 == 0) {
                return 1 - progress;
            }
        } else if (ani.direction == DIRECTION_ALTERNATE_REVERSE) {}

        return progress;
    },
    setupFunction: function setupFunction(ani) {
        var _this = this;

        return function (elapsed /* 전체 animation 실행 시간 */) {

            var runningTime = elapsed - ani.delay;
            if (runningTime < 0) {
                return false;
            }

            /* duration 안의 진행지점  */
            var progress = runningTime / ani.duration;

            if (ani.iteration > 1 && runningTime < ani.iteration * ani.duration) {
                // 기간이 지나지 않았으면 duration 기간만큼 나눠서 다시 구한다. 
                var newRunningTime = runningTime - ani.duration * Math.floor(runningTime / ani.duration);
                progress = newRunningTime / ani.duration;
            }

            if (progress > 1 && ani.finished) {
                return false;
            }

            if (progress > 1 && !ani.finished) {
                ani.finished = true;
                console.log('finished');
                // return true;     

                if (ani.direction == DIRECTION_NORMAL || ani.direction == DIRECTION_REVERSE) {
                    progress = 1;
                } else if (ani.direction == DIRECTION_ALTERNATE || ani.direction == DIRECTION_ALTERNATE_REVERSE) {
                    if (Math.floor(progress / ani.duration) % 2 == 0) {
                        progress = 0;
                    } else {
                        progress = 1;
                    }
                }
            }

            progress = _this.getDirection(ani, progress, runningTime);

            ani.realKeyframes.forEach(function (item) {
                item.functions.forEach(function (f) {
                    return f(ani, progress);
                });

                if (ani.finished == true) {
                    item.finished = true;

                    _this.setLastValue(ani, item);
                }
            });

            return true;
        };
    },
    setLastValue: function setLastValue(ani, item) {

        if (ani.direction == DIRECTION_ALTERNATE) {
            return;
        }

        var lastValue = item.values[item.values.length - 1];
        if (ani.direction == DIRECTION_REVERSE) {
            lastValue = item.values[0];
        }
        console.log(lastValue);
        if (item.itemType == 'color') {
            ani.obj[item.key] = rgb(lastValue);
        } else {
            ani.obj[item.key] = lastValue.value + lastValue.type;
        }
    },
    makeTimer: function makeTimer(list) {
        var _this2 = this;

        var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


        list = list.map(function (item) {
            return _this2.parse(item);
        });

        var timer = {
            id: 0,
            start: 0,
            pause: false
        };

        var frameStart = function frameStart() {
            timer.id = requestAnimationFrame(tick);
        };

        var move = function move(elapsed) {
            timer.elapsed = elapsed;
            list.forEach(function (ani) {
                return ani.update(timer.elapsed);
            });
            opt.callback && opt.callback();
        };

        var tick = function tick(now) {

            timer.elapsed = now - timer.start;
            var unfinished = list.filter(function (ani) {
                return !ani.finished;
            });

            // 끝나지 않음 
            if (!unfinished.length) {
                opt.callback && opt.callback();
                opt.done && opt.done();
                end();
                return false;
            }

            // delay 가 걸려 있으면 시간만 실행되고 실제 값을 업데이트 하지 않음. 
            list.forEach(function (ani) {
                return ani.update(timer.elapsed);
            });
            opt.callback && opt.callback();

            if (!timer.pause) {
                frameStart();
            }
        };

        var start = function start() {
            timer.start = performance.now();
            frameStart();
        };

        var end = function end() {
            cancelAnimationFrame(timer.id);
        };

        var pause = function pause() {
            timer.pause = true;
            cancelAnimationFrame(timer.id);
        };

        var restart = function restart() {
            timer.pause = false;
            frameStart();
        };

        return {
            start: start,
            end: end,
            pause: pause,
            restart: restart,
            tick: tick,
            move: move,
            timer: timer,
            list: list
        };
    }
};

function createTimeline() {
    var animations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var opt = arguments[1];

    return Timers.makeTimer(animations, opt);
}

var Animation = {
    KeyFrames: KeyFrames,
    Timers: Timers,
    createTimeline: createTimeline,
    Timing: Timing
};

var TIMELINE_PUSH = 'timeline/push';
var TIMELINE_LIST = 'timeline/list';
var TIMELINE_SEEK = 'timeline/seek';
var TIMELINE_NOT_EXISTS = 'timeline/not/exists';
var TIMELINE_NOT_EXISTS_KEYFRAME = 'timeline/not/exists/keyframe';
var TIMELINE_MIN_TIME_IN_KEYFRAMES = 'timeline/min/time/in/keyframes';
var TIMELINE_MAX_TIME_IN_KEYFRAMES = 'timeline/max/time/in/keyframes';
var TIMELINE_MAX_SECOND = 300;
var TIMELINE_1_SECOND_WIDTH = 100;
var TIMELINE_TOTAL_WIDTH = TIMELINE_1_SECOND_WIDTH * TIMELINE_MAX_SECOND;

var _templateObject$14 = taggedTemplateLiteral(["", ""], ["", ""]);
var _templateObject2$1 = taggedTemplateLiteral(["\n            <div class='timeline-collapse ", "' data-sub-key='", "' data-timeline-id=\"", "\">\n                <div class='property-title row' >", "</div>\n                <div class='timeline-property-list' data-property='", "'>\n                    ", "\n                </div>\n            </div>\n            "], ["\n            <div class='timeline-collapse ", "' data-sub-key='", "' data-timeline-id=\"", "\">\n                <div class='property-title row' >", "</div>\n                <div class='timeline-property-list' data-property='", "'>\n                    ", "\n                </div>\n            </div>\n            "]);

var TimelineObjectList = function (_UIElement) {
    inherits(TimelineObjectList, _UIElement);

    function TimelineObjectList() {
        classCallCheck(this, TimelineObjectList);
        return possibleConstructorReturn(this, (TimelineObjectList.__proto__ || Object.getPrototypeOf(TimelineObjectList)).apply(this, arguments));
    }

    createClass(TimelineObjectList, [{
        key: "templateClass",
        value: function templateClass() {
            return 'timeline-object-list';
        }
    }, {
        key: LOAD('$el'),
        value: function value$$1() {
            var _this2 = this;

            return this.read(TIMELINE_LIST).map(function (timeline, index) {
                return _this2.makeTimelineRow(timeline, index);
            });
        }
    }, {
        key: "makeTimelineRow",
        value: function makeTimelineRow(timeline, index) {

            var targetItem = this.get(timeline.targetId);

            return this.makeTimelineObjectForLayer(timeline, targetItem, index);
        }
    }, {
        key: "makeInputColor",
        value: function makeInputColor(sampleValue, targetItem, property, timeline) {
            var value$$1 = defaultValue(targetItem[property], sampleValue.defaultValue);
            return "\n            <div \n                class='input-color' \n                data-property='" + property + "' \n                data-timeline-id='" + timeline.id + "'\n            >\n                <div class='color-panel' style='background-color: " + value$$1 + ";'></div>\n            </div>\n        ";
        }
    }, {
        key: "makeInputNumber",
        value: function makeInputNumber(sampleValue, targetItem, property, timeline) {

            var value$$1 = unitValue(defaultValue(targetItem[property], sampleValue.defaultValue));

            return "\n            <span class='input-field' data-unit-string=\"" + sampleValue.unit + "\">\n            <input \n                type='number' \n                min=\"" + sampleValue.min + "\" \n                max=\"" + sampleValue.max + "\" \n                step=\"" + sampleValue.step + "\" \n                value=\"" + value$$1 + "\" \n                data-property='" + property + "' \n                data-timeline-id=\"" + timeline.id + "\" \n                /> \n            </span>";
        }
    }, {
        key: "makeInput",
        value: function makeInput(targetItem, property, timeline) {
            var sampleValue = PROPERTY_GET_DEFAULT_VALUE(property);
            if (sampleValue.type == 'color') {
                return this.makeInputColor(sampleValue, targetItem, property, timeline);
            } else {
                return this.makeInputNumber(sampleValue, targetItem, property, timeline);
            }
        }
    }, {
        key: "makeTimelineProperty",
        value: function makeTimelineProperty(property, timeline, targetItem, index) {
            return " \n            <div class='timeline-property row'>\n                <label>" + property + "</label>\n                " + this.makeInput(targetItem, property, timeline) + "\n            </div>    \n        ";
        }
    }, {
        key: "makeTimelinePropertyGroup",
        value: function makeTimelinePropertyGroup(timeline, targetItem, index) {
            var _this3 = this;

            var list = GET_PROPERTY_LIST(targetItem);

            return html(_templateObject$14, list.map(function (it) {
                var collapse = timeline.collapse[it.key] ? 'collapsed' : '';
                return html(_templateObject2$1, collapse, it.key, timeline.id, it.title, it.key, it.properties.map(function (property) {
                    return _this3.makeTimelineProperty(property, timeline, targetItem, index);
                }));
            }));
        }
    }, {
        key: "makeTimelineObjectForLayer",
        value: function makeTimelineObjectForLayer(timeline, targetItem, index) {
            var name = EMPTY_STRING;

            if (IS_LAYER(targetItem)) {
                name = LAYER_NAME(targetItem);
            } else if (IS_IMAGE(targetItem)) {
                var layer = this.get(targetItem.parentId);
                name = LAYER_NAME(layer) + " -&gt; " + targetItem.type;
            }
            var collapse = timeline.groupCollapsed ? 'group-collapsed' : '';
            return "\n            <div class='timeline-object " + collapse + "' data-type='" + targetItem.itemType + "' data-timeline-id=\"" + timeline.id + "\">\n                <div class='timeline-object-title row'>\n                    <div class='icon'></div>    \n                    <div class='title'>" + name + "</div>\n                </div>\n                <div class='timeline-group'>\n                    " + this.makeTimelinePropertyGroup(timeline, targetItem, index) + "\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: CLICK('$el .timeline-object-title'),
        value: function value$$1(e) {
            var $parent = e.$delegateTarget.parent();
            $parent.toggleClass('group-collapsed');

            var id = $parent.attr('data-timeline-id');

            var groupCollapsed = $parent.hasClass('group-collapsed');

            this.run(ITEM_SET, { id: id, groupCollapsed: groupCollapsed });
            this.emit('collapsedGroupTimelineTree', id, groupCollapsed);
        }
    }, {
        key: CLICK('$el .timeline-collapse > .property-title'),
        value: function value$$1(e) {
            var $parent = e.$delegateTarget.parent();
            $parent.toggleClass('collapsed');

            var _$parent$attrs = $parent.attrs('data-sub-key', 'data-timeline-id'),
                _$parent$attrs2 = slicedToArray(_$parent$attrs, 2),
                subkey = _$parent$attrs2[0],
                id = _$parent$attrs2[1];

            var timeline = this.get(id);
            var isCollapsed = $parent.hasClass('collapsed');
            var collapse = _extends({}, timeline.collapse, defineProperty({}, subkey, isCollapsed));

            this.run(ITEM_SET, { id: id, collapse: collapse });
            this.emit('collapsedTimelineTree', id, subkey, isCollapsed);
        }
    }, {
        key: EVENT('collapsedTimelineTree'),
        value: function value$$1(id, subkey, isCollapsed) {
            var $propertyGroup = this.$el.$("[data-sub-key=\"" + subkey + "\"][data-timeline-id=\"" + id + "\"]");
            $propertyGroup.toggleClass('collapsed', isCollapsed);
        }
    }, {
        key: EVENT('collapsedGroupTimelineTree'),
        value: function value$$1(id, isGroupCollapsed) {
            var $propertyGroup = this.$el.$(".timeline-object[data-timeline-id=\"" + id + "\"]");
            $propertyGroup.toggleClass('group-collapsed', isGroupCollapsed);
        }
    }, {
        key: EVENT(CHANGE_TIMELINE, ADD_TIMELINE),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: EVENT(MOVE_TIMELINE),
        value: function value$$1() {
            this.run(TIMELINE_SEEK, this.config('timeline.cursor.time'));
        }
    }, {
        key: CLICK('$el .group .title'),
        value: function value$$1(e) {
            var groupId = e.$delegateTarget.attr('id');

            var isShow = e.$delegateTarget.hasClass('show');

            e.$delegateTarget.toggleClass('show', !isShow);

            this.$el.$$("[group-id=\"" + groupId + "\"]").forEach(function ($dom) {
                $dom.toggleClass('show', !isShow);
            });
        }
    }, {
        key: EVENT(CHANGE_KEYFRAME_SELECTION),
        value: function value$$1() {
            var selectedId = this.config('timeline.keyframe.selectedId');
            var selectedType = this.config('timeline.keyframe.selectedType');
            var keyframe = this.get(selectedId);
            var property = keyframe.property;
            var timelineId = keyframe.parentId;
            var targetId = keyframe.targetId;
            var value$$1 = keyframe[selectedType + "Value"];
            var propertyInfo = PROPERTY_GET_DEFAULT_VALUE(property);
            var $input = this.$el.$("[data-property=\"" + property + "\"][data-timeline-id=\"" + timelineId + "\"]");

            if (propertyInfo.type == 'color') {
                var colorPanel = $input.$('.color-panel');
                if (colorPanel) {
                    colorPanel.css('background-color', value$$1);
                }
            } else {
                $input.val(value$$1);
            }

            this.commit(CHANGE_LAYER, defineProperty({ id: targetId }, property, value$$1));
        }
    }, {
        key: CHANGEINPUT('$el input[data-property]'),
        value: function value$$1(e) {
            var $t = e.$delegateTarget;

            var _$t$attrs = $t.attrs('data-property', 'data-timeline-id'),
                _$t$attrs2 = slicedToArray(_$t$attrs, 2),
                property = _$t$attrs2[0],
                timelineId = _$t$attrs2[1];

            var selectedId = this.config('timeline.keyframe.selectedId');
            var selectedType = this.config('timeline.keyframe.selectedType');
            var keyframe = this.get(selectedId);
            var targetId = keyframe.targetId;

            // 선택한 값에 대입 하도록 설정 
            if (timelineId == keyframe.parentId && property == keyframe.property) {
                var timeField = selectedType + "Time";
                var valueField = selectedType + "Value";
                var time = keyframe[timeField];
                var value$$1 = $t.float();

                if (keyframe && isNotUndefined(time)) {
                    keyframe[valueField] = value$$1;

                    this.run(ITEM_SET, defineProperty({ id: selectedId }, valueField, value$$1));
                    this.commit(CHANGE_LAYER, defineProperty({ id: targetId }, property, value$$1));
                }
            }
        }
    }, {
        key: CLICK('$el .input-color'),
        value: function value$$1(e) {
            var _this4 = this;

            var $t = e.$delegateTarget;
            var $colorPanel = $t.$('.color-panel');

            var _$t$attrs3 = $t.attrs('data-property', 'data-timeline-id'),
                _$t$attrs4 = slicedToArray(_$t$attrs3, 2),
                property = _$t$attrs4[0],
                timelineId = _$t$attrs4[1];

            var selectedId = this.config('timeline.keyframe.selectedId');
            var selectedType = this.config('timeline.keyframe.selectedType');
            var keyframe = this.get(selectedId);
            var targetId = keyframe.targetId;

            // 선택한 값에 대입 하도록 설정 
            if (timelineId == keyframe.parentId && property == keyframe.property) {
                var timeField = selectedType + "Time";
                var valueField = selectedType + "Value";
                var time = keyframe[timeField];
                var oldColor = e.$delegateTarget.css('background-color');

                if (keyframe && isNotUndefined(time)) {
                    this.emit('openTimelineColorPicker', e.xy, oldColor, function (newColor) {
                        $colorPanel.css('background-color', newColor);
                        _this4.run(ITEM_SET, defineProperty({ id: selectedId }, valueField, newColor));
                        _this4.commit(CHANGE_IMAGE, defineProperty({ id: targetId }, property, newColor));
                    });
                }
            }
        }
    }]);
    return TimelineObjectList;
}(UIElement);

var ITEM_MAP_KEYFRAME_CHILDREN = 'item/map/keyframe/children';

var _templateObject$15 = taggedTemplateLiteral(["\n            <div class='keyframe-property row' data-property='", "' data-timeline-id=\"", "\">\n            ", "\n            </div>"], ["\n            <div class='keyframe-property row' data-property='", "' data-timeline-id=\"", "\">\n            ", "\n            </div>"]);
var _templateObject2$2 = taggedTemplateLiteral(["", ""], ["", ""]);
var _templateObject3 = taggedTemplateLiteral(["\n            <div class='keyframe-collapse ", "' data-sub-key='", "' data-timeline-id=\"", "\">\n                <div class='property-title row'></div>\n                <div class='keyframe-property-list' data-property='", "'>\n                    ", "\n                </div>                            \n            </div>\n\n            "], ["\n            <div class='keyframe-collapse ", "' data-sub-key='", "' data-timeline-id=\"", "\">\n                <div class='property-title row'></div>\n                <div class='keyframe-property-list' data-property='", "'>\n                    ", "\n                </div>                            \n            </div>\n\n            "]);

var KeyframeObjectList = function (_UIElement) {
    inherits(KeyframeObjectList, _UIElement);

    function KeyframeObjectList() {
        classCallCheck(this, KeyframeObjectList);
        return possibleConstructorReturn(this, (KeyframeObjectList.__proto__ || Object.getPrototypeOf(KeyframeObjectList)).apply(this, arguments));
    }

    createClass(KeyframeObjectList, [{
        key: "templateClass",
        value: function templateClass() {
            return 'keyframe-list';
        }
    }, {
        key: LOAD(),
        value: function value$$1() {
            var _this2 = this;

            return this.read(TIMELINE_LIST).map(function (timeline, index) {
                return _this2.makeTimelineRow(timeline, index);
            });
        }
    }, {
        key: "setBackgroundGrid",
        value: function setBackgroundGrid() {

            var width = this.config('timeline.1ms.width');
            var cursorTime = this.config('timeline.cursor.time');
            var timeDist = 100; // 100ms = 0.1s 
            var currentPosition = width * cursorTime - 1;

            var fullWidth = Math.max(10, timeDist * width);
            var position = fullWidth - 0.5;
            this.$el.cssText("\n            background-size: 2px 100%, " + fullWidth + "px 100%;\n            background-position: " + currentPosition + "px 0px, " + position + "px 0px;\n        ");
        }
    }, {
        key: "updateKeyframeList",
        value: function updateKeyframeList(timeline) {
            timeline.keyframes = {};
            var children = this.read(ITEM_MAP_KEYFRAME_CHILDREN, timeline.id);
            children.forEach(function (it) {
                if (!timeline.keyframes[it.property]) {
                    timeline.keyframes[it.property] = [];
                }

                timeline.keyframes[it.property].push(it);
            });
        }
    }, {
        key: "makeTimelineRow",
        value: function makeTimelineRow(timeline, index) {
            var targetItem = this.get(timeline.targetId);

            return this.makeTimelineObject(timeline, targetItem);
        }
    }, {
        key: "makeKeyFrameItem",
        value: function makeKeyFrameItem(keyframe, keyframeIndex, timeline) {
            var msWidth = this.config('timeline.1ms.width');
            var startTime = keyframe.startTime;
            var endTime = keyframe.endTime;
            var left = pxUnit(startTime * msWidth);
            var width = pxUnit((endTime - startTime) * msWidth);

            var nested = unitValue(width) < 1 ? 'nested' : EMPTY_STRING;
            var show = unitValue(width) < 20 ? EMPTY_STRING : 'show';

            return "\n        <div \n            class='keyframe-item line " + nested + "' \n            style='left: " + stringUnit(left) + "; width: " + stringUnit(width) + ";' \n            keyframe-id=\"" + keyframe.id + "\" \n            keyframe-property=\"" + keyframe.property + "\"\n        >\n            <div class='bar'>\n                <div class='timing-icon " + keyframe.timing + " " + show + "'></div>\n            </div>\n            <div class='start' time=\"" + startTime + "\"></div>\n            <div class='end' time=\"" + endTime + "\"></div>\n        </div>\n        ";
        }
    }, {
        key: "makeKeyframeProperty",
        value: function makeKeyframeProperty(property, timeline) {
            var _this3 = this;

            var keyframes = timeline.keyframes[property] || [];

            return html(_templateObject$15, property, timeline.id, keyframes.map(function (keyframe) {
                return _this3.makeKeyFrameItem(keyframe, timeline);
            }));
        }
    }, {
        key: "makeTimelinePropertyGroup",
        value: function makeTimelinePropertyGroup(timeline, targetItem) {
            var _this4 = this;

            this.updateKeyframeList(timeline);

            targetItem = targetItem || this.get(timeline.targetId);
            var list = GET_PROPERTY_LIST(targetItem);

            return html(_templateObject2$2, list.map(function (it) {
                var collapse = timeline.collapse[it.key] ? 'collapsed' : '';
                return html(_templateObject3, collapse, it.key, timeline.id, it.key, it.properties.map(function (property) {
                    return _this4.makeKeyframeProperty(property, timeline);
                }));
            }));
        }
    }, {
        key: EVENT('collapsedTimelineTree'),
        value: function value$$1(id, subkey, isCollapsed) {
            var $propertyGroup = this.$el.$("[data-sub-key=\"" + subkey + "\"][data-timeline-id=\"" + id + "\"]");
            $propertyGroup.toggleClass('collapsed', isCollapsed);
        }
    }, {
        key: EVENT('collapsedGroupTimelineTree'),
        value: function value$$1(id, isGroupCollapsed) {
            var $propertyGroup = this.$el.$(".keyframe-object[data-timeline-id=\"" + id + "\"]");
            $propertyGroup.toggleClass('group-collapsed', isGroupCollapsed);
        }
    }, {
        key: "makeTimelineObject",
        value: function makeTimelineObject(timeline, targetItem) {
            var collapse = timeline.groupCollapsed ? 'group-collapsed' : '';
            return "\n            <div class='keyframe-object " + collapse + "' data-type='layer' data-timeline-id='" + timeline.id + "'>\n                <div class='keyframe-title row'></div>\n                <div class='keyframe-group'>" + this.makeTimelinePropertyGroup(timeline, targetItem) + "</div>\n            </div>\n        ";
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.px('width', TIMELINE_TOTAL_WIDTH);
            this.setBackgroundGrid();
            this.load();
        }
    }, {
        key: "refreshKeyframe",
        value: function refreshKeyframe(keyframeId) {
            var keyframe = this.get(keyframeId);
            var timelineId = keyframe.parentId;
            var timeline = this.get(timelineId);

            var $t = this.$el.$(".keyframe-object[data-timeline-id=\"" + timelineId + "\"]");

            if ($t) {
                $t.$('.keyframe-group').html(this.makeTimelinePropertyGroup(timeline));
            }
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: EVENT(ADD_TIMELINE),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: POINTERSTART('$el .bar') + SELF + MOVE('setBarPosition'),
        value: function value$$1(e) {
            this.msWidth = this.config('timeline.1ms.width');
            this.selectedElement = e.$delegateTarget.parent();
            this.selectedStartX = this.selectedElement.cssFloat('left');
            this.selectedStartWidth = this.selectedElement.cssFloat('width');
            this.selectedX = this.selectedStartX;
            this.selectedWidth = this.selectedStartWidth;
            this.selectedId = this.selectedElement.attr('keyframe-id');

            this.xy = e.xy;
            this.minX = 0;
            this.maxX = 10000;

            var minTime = this.read(TIMELINE_MIN_TIME_IN_KEYFRAMES, this.selectedId);
            this.minX = minTime * this.msWidth;

            var maxTime = this.read(TIMELINE_MAX_TIME_IN_KEYFRAMES, this.selectedId);
            this.maxX = maxTime * this.msWidth;

            this.setCurrentKeyframeItem(this.selectedId, 'bar');
        }
    }, {
        key: POINTERSTART('$el .start') + SELF + MOVE('setStartPosition'),
        value: function value$$1(e) {
            this.msWidth = this.config('timeline.1ms.width');
            if (this.selectedEl) {
                this.selectedEl.removeClass('selected');
            }
            this.selectedEl = e.$delegateTarget;
            this.selectedEl.addClass('selected');
            this.selectedElement = e.$delegateTarget.parent();
            this.selectedStartX = this.selectedElement.cssFloat('left');
            this.selectedStartWidth = this.selectedElement.cssFloat('width');
            this.selectedEndX = this.selectedStartX + this.selectedStartWidth;
            this.selectedX = this.selectedStartX;
            this.selectedWidth = this.selectedStartWidth;
            this.xy = e.xy;
            this.minX = 0;
            this.maxX = this.selectedEndX;
            this.selectedId = this.selectedElement.attr('keyframe-id');

            var minTime = this.read(TIMELINE_MIN_TIME_IN_KEYFRAMES, this.selectedId);
            this.minX = minTime * this.msWidth;

            // console.log('start', e.xy);
            this.setCurrentKeyframeItem(this.selectedId, 'start');
        }
    }, {
        key: POINTERSTART('$el .end') + SELF + MOVE('setEndPosition'),
        value: function value$$1(e) {
            this.msWidth = this.config('timeline.1ms.width');
            if (this.selectedEl) {
                this.selectedEl.removeClass('selected');
            }
            this.selectedEl = e.$delegateTarget;
            this.selectedEl.addClass('selected');
            this.selectedElement = e.$delegateTarget.parent();
            this.selectedStartX = this.selectedElement.cssFloat('left');
            this.selectedStartWidth = this.selectedElement.cssFloat('width');
            this.selectedEndX = this.selectedStartX + this.selectedStartWidth;
            this.selectedX = this.selectedStartX;
            this.selectedWidth = this.selectedStartWidth;
            this.xy = e.xy;
            this.minX = this.selectedStartX;
            this.maxX = 1000;
            this.selectedId = this.selectedElement.attr('keyframe-id');
            // console.log('start', e.xy);

            var maxTime = this.read(TIMELINE_MAX_TIME_IN_KEYFRAMES, this.selectedId);
            this.maxX = maxTime * this.msWidth;

            this.setCurrentKeyframeItem(this.selectedId, 'end');
        }
    }, {
        key: "setCurrentKeyframeItem",
        value: function setCurrentKeyframeItem(id, type) {
            this.initConfig('timeline.keyframe.selectedId', id);
            this.initConfig('timeline.keyframe.selectedType', type);

            if (type == 'start' || type == 'end') {
                this.emit(CHANGE_KEYFRAME_SELECTION);
            }
        }
    }, {
        key: "updateKeyframeTime",
        value: function updateKeyframeTime() {
            var id = this.selectedElement.attr('keyframe-id');
            var startTime = this.selectedX / this.msWidth;
            var endTime = startTime + this.selectedWidth / this.msWidth;
            this.commit(CHANGE_KEYFRAME, { id: id, startTime: startTime, endTime: endTime });
        }
    }, {
        key: "getTimeString",
        value: function getTimeString(pixel) {
            var unit$$1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ms';

            var time = Math.floor(pixel / this.msWidth);

            return "" + time + unit$$1;
        }
    }, {
        key: "setBarPosition",
        value: function setBarPosition() {
            var dx = this.config('pos').x - this.xy.x;
            var newX = this.match1ms(Math.min(Math.max(this.minX, this.selectedStartX + dx), this.maxX - this.selectedStartWidth), 10);
            this.selectedElement.px('left', newX);
            this.selectedElement.attr('data-start-time', this.getTimeString(newX));
            this.selectedElement.attr('data-end-time', this.getTimeString(newX + this.selectedStartWidth));
            this.selectedX = newX;

            this.updateKeyframeTime();
        }
    }, {
        key: "match1ms",
        value: function match1ms(x) {
            var baseTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var width = this.msWidth * baseTime;
            var time = Math.floor(x / width);
            return time * width;
        }
    }, {
        key: "setStartPosition",
        value: function setStartPosition() {
            var dx = this.config('pos').x - this.xy.x;
            var newX = this.match1ms(Math.min(Math.max(this.minX, this.selectedStartX + dx), this.maxX), 10);

            var newWidth = this.selectedEndX - newX;

            this.selectedElement.attr('data-start-time', this.getTimeString(newX));
            this.selectedElement.px('left', newX);
            this.selectedElement.px('width', newWidth);
            this.selectedElement.toggleClass('nested', newWidth < 1);
            this.selectedX = newX;
            this.selectedWidth = newWidth;

            this.updateKeyframeTime();
        }
    }, {
        key: "setEndPosition",
        value: function setEndPosition() {
            var dx = this.config('pos').x - this.xy.x;
            var newX = this.match1ms(Math.min(Math.max(this.minX, this.selectedEndX + dx), this.maxX), 10);
            var newWidth = Math.max(0, newX - this.selectedStartX);
            this.selectedElement.attr('data-end-time', this.getTimeString(newX));
            this.selectedElement.px('width', newWidth);
            this.selectedElement.toggleClass('nested', !newWidth);
            this.selectedWidth = newWidth;

            this.updateKeyframeTime();
        }
    }, {
        key: CLICK('$el .keyframe-property') + ALT,
        value: function value$$1(e) {
            var _this5 = this;

            var _e$$delegateTarget$at = e.$delegateTarget.attrs('data-timeline-id', 'data-property'),
                _e$$delegateTarget$at2 = slicedToArray(_e$$delegateTarget$at, 2),
                parentId = _e$$delegateTarget$at2[0],
                property = _e$$delegateTarget$at2[1];

            var startTime = (e.xy.x - e.$delegateTarget.offset().left) / this.config('timeline.1ms.width');
            var endTime = startTime;

            if (this.read(TIMELINE_NOT_EXISTS_KEYFRAME, parentId, property, startTime)) {
                var timeline = this.get(parentId);
                var targetItem = this.get(timeline.targetId);
                var startValue = targetItem[property] || 0;
                var endValue = targetItem[property] || 0;

                this.run(ITEM_ADD_KEYFRAME, parentId, { property: property, startTime: startTime, endTime: endTime, startValue: startValue, endValue: endValue }, function (keyframeId) {
                    _this5.refreshKeyframe(keyframeId);
                });
            } else {
                alert('Time can not nested');
            }
        }
    }, {
        key: DOUBLECLICK('$el .keyframe-item'),
        value: function value$$1(e) {
            var _e$$delegateTarget$at3 = e.$delegateTarget.attrs('keyframe-id', 'keyframe-property'),
                _e$$delegateTarget$at4 = slicedToArray(_e$$delegateTarget$at3, 2),
                keyframeId = _e$$delegateTarget$at4[0],
                property = _e$$delegateTarget$at4[1];

            console.log(keyframeId, property);
        }
    }, {
        key: EVENT(MOVE_TIMELINE),
        value: function value$$1() {
            this.setBackgroundGrid();
        }
    }, {
        key: EVENT(CHANGE_TOOL, RESIZE_TIMELINE),
        value: function value$$1() {
            this.refresh();
        }
    }]);
    return KeyframeObjectList;
}(UIElement);

var KeyframeTimeView = function (_UIElement) {
    inherits(KeyframeTimeView, _UIElement);

    function KeyframeTimeView() {
        classCallCheck(this, KeyframeTimeView);
        return possibleConstructorReturn(this, (KeyframeTimeView.__proto__ || Object.getPrototypeOf(KeyframeTimeView)).apply(this, arguments));
    }

    createClass(KeyframeTimeView, [{
        key: "template",
        value: function template() {
            return "<div class='keyframe-time-view'><canvas ref=\"$canvas\"></canvas></div>";
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.refreshCanvas();
        }
    }, {
        key: "resizeCanvas",
        value: function resizeCanvas() {
            this.refs.$canvas.resize(this.$el.rect());
        }
    }, {
        key: "refreshCanvas",
        value: function refreshCanvas() {

            var scrollLeft = this.config('timeline.scroll.left');
            var width = this.config('timeline.1ms.width');
            var cursorTime = this.config('timeline.cursor.time');
            var one_second = 1000;
            var currentTime = Math.floor(scrollLeft / width);
            var startTime = 0; // 0ms 
            var timeDist = 100; // 100ms = 0.1s 

            if (currentTime % timeDist != 0) {
                startTime = timeDist - currentTime % timeDist;
            }

            var viewTime = currentTime + startTime;

            var textOption = {
                textAlign: 'center',
                textBaseline: 'middle',
                font: '10px sans-serif'
            };

            this.refs.$canvas.update(function () {
                var rect = this.rect();

                this.drawOption(_extends({ strokeStyle: 'rgba(204, 204, 204, 0.3)', lineWidth: 0.5 }, textOption));
                var startSecond = startTime;
                var viewSecond = viewTime;
                var distSecond = timeDist;
                var startX = startSecond * width;

                while (startX < rect.width) {

                    if (startSecond !== 0) {
                        // 0 이 아닌 경우만 그리기 
                        var secondString = viewSecond / 1000; // 표시 지점 
                        var secondStringS = secondString;
                        if (viewSecond % one_second === 0) {
                            var y = rect.height / 2;
                            // this.drawLine(startX, y, startX, rect.height);
                            this.drawOption({ fillStyle: '#ececec' });
                            this.drawText(startX, y, secondStringS);
                        } else {
                            var y = rect.height / 2;

                            // this.drawLine(startX, y, startX, rect.height);

                            if (width > 0.4) {
                                this.drawOption({ fillStyle: '#ececec' });
                                this.drawText(startX, y, secondStringS);
                            } else {
                                var currentView = viewSecond % 1000 / 100;
                                if (currentView === 5) {
                                    this.drawOption({ fillStyle: '#ececec' });
                                    this.drawText(startX, y, secondString);
                                } else {
                                    this.drawOption({ fillStyle: 'rgba(204, 204, 204, 0.3)' });
                                    this.drawCircle(startX, y, 1);
                                }
                            }
                        }
                    }

                    startSecond += distSecond;
                    viewSecond += distSecond;
                    startX = startSecond * width;
                }

                var left = (cursorTime - currentTime) * width;
                var markTop = 10;
                var markWidth = 4;
                this.drawOption({ strokeStyle: 'rgba(204, 204, 204, 0.3)', fillStyle: 'rgba(204, 204, 204, 0.3)', lineWidth: 1 });
                this.drawPath([left - markWidth, rect.height - markTop], [left + markWidth, rect.height - markTop], [left + markWidth, rect.height - markWidth], [left, rect.height], [left - markWidth, rect.height - markWidth], [left - markWidth, rect.height - markTop]);
            });
        }
    }, {
        key: POINTERSTART('$canvas') + MOVE(),
        value: function value(e) {
            this.selectedCanvasOffset = this.refs.$canvas.offset();
        }
    }, {
        key: "move",
        value: function move() {
            var distX = this.config('pos').x - this.selectedCanvasOffset.left;
            var scrollLeft = this.config('timeline.scroll.left') + distX;
            this.initConfig('timeline.cursor.time', scrollLeft / this.config('timeline.1ms.width'));
            this.emit(MOVE_TIMELINE);
            this.refreshCanvas();
        }
    }, {
        key: EVENT(CHANGE_EDITOR, RESIZE_WINDOW, RESIZE_TIMELINE, SCROLL_LEFT_TIMELINE, MOVE_TIMELINE),
        value: function value() {
            this.resizeCanvas();
            this.refresh();
        }
    }]);
    return KeyframeTimeView;
}(UIElement);

var TimelineTopToolbar = function (_UIElement) {
    inherits(TimelineTopToolbar, _UIElement);

    function TimelineTopToolbar() {
        classCallCheck(this, TimelineTopToolbar);
        return possibleConstructorReturn(this, (TimelineTopToolbar.__proto__ || Object.getPrototypeOf(TimelineTopToolbar)).apply(this, arguments));
    }

    createClass(TimelineTopToolbar, [{
        key: "template",
        value: function template() {
            return "\n            <div class='timeline-top-toolbar'>\n                <div class='time-input' ref=\"$timeInputView\"></div>\n                <div class='time-play' ref=\"$timePlay\">\n                    <button type=\"button\">&lt;&lt;</button>\n                    <button type=\"button\">&gt;</button>\n                    <button type=\"button\">&gt;&gt;</button>\n                    <select>\n                        <option>1x</option>\n                        <option>2x</option>\n                        <option>3x</option>\n                        <option>4x</option>\n                        <option>5x</option>\n                    </select>\n                </div>\n            </div>\n        ";
        }
    }]);
    return TimelineTopToolbar;
}(UIElement);

var TimelineSplitter = function (_UIElement) {
    inherits(TimelineSplitter, _UIElement);

    function TimelineSplitter() {
        classCallCheck(this, TimelineSplitter);
        return possibleConstructorReturn(this, (TimelineSplitter.__proto__ || Object.getPrototypeOf(TimelineSplitter)).apply(this, arguments));
    }

    createClass(TimelineSplitter, [{
        key: "templateClass",
        value: function templateClass() {
            return 'timeline-splitter';
        }
    }, {
        key: "move",
        value: function move() {
            var dy = this.config('pos').y - this.initXY.y;
            this.emit(CHANGE_HEIGHT_TIMELINE, { dy: dy });
        }
    }, {
        key: POINTERSTART() + MOVE(),
        value: function value(e) {
            this.initXY = e.xy;
            this.emit(INIT_HEIGHT_TIMELINE);
        }
    }]);
    return TimelineSplitter;
}(UIElement);

var Timeline = function (_UIElement) {
    inherits(Timeline, _UIElement);

    function Timeline() {
        classCallCheck(this, Timeline);
        return possibleConstructorReturn(this, (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).apply(this, arguments));
    }

    createClass(Timeline, [{
        key: "afterRender",
        value: function afterRender() {
            this.colorPicker = ColorPicker.create({
                type: 'xd-tab',
                tabTitle: '',
                autoHide: false,
                position: 'absolute',
                width: '240px',
                container: this.$el.el
            });
        }
    }, {
        key: "components",
        value: function components() {
            return {
                TimelineSplitter: TimelineSplitter,
                TimelineTopToolbar: TimelineTopToolbar,
                KeyframeTimeView: KeyframeTimeView,
                TimelineObjectList: TimelineObjectList,
                KeyframeObjectList: KeyframeObjectList
            };
        }
    }, {
        key: "template",
        value: function template() {
            return "\n            <div class='timeline-view'>\n                <div class=\"timeline-top\" ref=\"$top\">\n                    <div class='timeline-toolbar'>\n                        <span ref='$title' class='title'>Timeline</span>\n                        <button type=\"button\" ref=\"$addSelection\">+</button>\n                    </div>\n                    <div class='keyframe-toolbar'>\n                        <TimelineTopToolbar />\n                    </div>                \n                </div>\n                <div class=\"timeline-header\" ref=\"$header\">\n                    <div class='timeline-toolbar'>\n                        \n                    </div>\n                    <div class='keyframe-toolbar' ref=\"$keyframeToolbar\">\n                        <KeyframeTimeView />\n                    </div>\n                </div>\n                <div class='timeline-body' ref=\"$timelineBody\">\n                    <div class='timeline-panel' ref='$keyframeList'>\n                        <KeyframeObjectList />\n                    </div>                \n                    <div class='timeline-list' ref='$timelineList'>\n                        <TimelineObjectList />\n                    </div>\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "startAnimation",
        value: function startAnimation() {
            var _this2 = this;

            this.run(TOOL_SAVE_DATA);

            this.read(SELECTION_CURRENT_LAYER, function (layer) {
                var obj = layer;
                var aniObject = Animation.createTimeline([{
                    duration: 1000,
                    obj: obj,
                    timing: 'ease-out-sine',
                    iteration: 3,
                    direction: 'alternate',
                    keyframes: {
                        '0%': {
                            'x': '0px',
                            'background-color': 'rgba(255, 255, 255, 0.5)'
                        },
                        '100%': {
                            'x': '250px',
                            'background-color': 'rgba(255, 0, 255, 1)'
                        }
                    }

                }], {
                    callback: function callback() {
                        _this2.run(ITEM_SET, layer);
                        _this2.emit('animationEditor');
                    },
                    done: function done() {
                        _this2.run(TOOL_RESTORE_DATA);
                    }
                });

                aniObject.start();
            });
        }
    }, {
        key: CLICK('$addSelection'),
        value: function value(e) {
            var _this3 = this;

            editor$1.selection.ids.forEach(function (id) {
                if (_this3.read(TIMELINE_NOT_EXISTS, id)) {
                    _this3.run(TIMELINE_PUSH, id);
                }
            });
        }
    }, {
        key: CLICK('$title'),
        value: function value() {
            this.emit(TOGGLE_TIMELINE);
        }
    }, {
        key: SCROLL('$timelineList') + DEBOUNCE(10),
        value: function value(e) {
            this.refs.$keyframeList.setScrollTop(this.refs.$timelineList.scrollTop());
        }
    }, {
        key: SCROLL('$keyframeList') + DEBOUNCE(10),
        value: function value(e) {
            this.refs.$timelineList.setScrollTop(this.refs.$keyframeList.scrollTop());
            this.initConfig('timeline.scroll.left', this.refs.$keyframeList.scrollLeft());
            this.emit(SCROLL_LEFT_TIMELINE);
        }
    }, {
        key: DROP('$timelineList'),
        value: function value(e) {
            e.preventDefault();
            var draggedId = e.dataTransfer.getData('text');

            if (this.read(TIMELINE_NOT_EXISTS, draggedId)) {
                this.run(TIMELINE_PUSH, draggedId);
            } else {
                alert("Item exists already in timeline.");
            }
        }
    }, {
        key: WHEEL('$timelineBody') + ALT,
        value: function value(e) {
            e.preventDefault();
            e.stopPropagation();

            // 현재 마우스 위치 저장 
            this.initConfig('timeline.mouse.pointer', e.xy);

            if (e.wheelDeltaY < 0) {
                // 확대 
                this.initConfig('timeline.1ms.width', Math.min(0.5, this.config('timeline.1ms.width') * 1.1));
            } else {
                // 축소 
                this.initConfig('timeline.1ms.width', Math.max(0.1, this.config('timeline.1ms.width') * 0.9));
            }

            this.emit(RESIZE_TIMELINE, e);
        }
    }, {
        key: EVENT('openTimelineColorPicker'),
        value: function value(xy, oldColor, callback) {
            this.colorPicker.show({
                left: xy.x + 30,
                top: 0,
                hideDelay: 100000000
            }, oldColor, /*show*/function (newColor) {
                if (isFunction(callback)) callback(newColor);
            }, /*hide*/function () {});
        }
    }]);
    return Timeline;
}(UIElement);

var IMAGE_LIST = ['jpg', 'jpeg', 'png', 'gif', 'svg'];

// refer to https://github.com/graingert/datauritoblob/blob/master/dataURItoBlob.js 
// MIT License 
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var dw = new DataView(ab);
    for (var i = 0; i < byteString.length; i++) {
        dw.setUint8(i, byteString.charCodeAt(i));
    }
    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], { type: mimeString });
}

var URLImageResource = function (_ImageResource) {
    inherits(URLImageResource, _ImageResource);

    function URLImageResource() {
        classCallCheck(this, URLImageResource);
        return possibleConstructorReturn(this, (URLImageResource.__proto__ || Object.getPrototypeOf(URLImageResource)).apply(this, arguments));
    }

    createClass(URLImageResource, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(URLImageResource.prototype.__proto__ || Object.getPrototypeOf(URLImageResource.prototype), 'getDefaultObject', this).call(this, _extends({
                type: 'url',
                url: '',
                datauri: ''
            }, obj));
        }
    }, {
        key: 'isUrl',
        value: function isUrl() {
            return true;
        }
    }, {
        key: 'toString',
        value: function toString() {
            var json = this.json;
            var url = json.url || json.datauri;
            return 'url(' + url + ')';
        }
    }], [{
        key: 'isImageFile',
        value: function isImageFile(fileExt) {
            return IMAGE_LIST.includes(fileExt);
        }
    }]);
    return URLImageResource;
}(ImageResource);

var FileImageResource = function (_URLImageResource) {
    inherits(FileImageResource, _URLImageResource);

    function FileImageResource() {
        classCallCheck(this, FileImageResource);
        return possibleConstructorReturn(this, (FileImageResource.__proto__ || Object.getPrototypeOf(FileImageResource)).apply(this, arguments));
    }

    createClass(FileImageResource, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(FileImageResource.prototype.__proto__ || Object.getPrototypeOf(FileImageResource.prototype), 'getDefaultObject', this).call(this, { type: 'file' });
        }
    }, {
        key: 'isUrl',
        value: function isUrl() {
            return false;
        }
    }, {
        key: 'isFile',
        value: function isFile() {
            return true;
        }
    }, {
        key: 'convert',
        value: function convert(json) {
            if (!json.url && json.datauri) {
                json.url = this.makeURL(json.datauri);
            }
            return json;
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.removeURL();
            get$1(FileImageResource.prototype.__proto__ || Object.getPrototypeOf(FileImageResource.prototype), 'remove', this).call(this);
        }
    }, {
        key: 'removeURL',
        value: function removeURL() {
            URL.revokeObjectURL(this.json.url);
        }
    }, {
        key: 'makeURL',
        value: function makeURL(datauri) {
            var file = dataURItoBlob(datauri);

            return URL.createObjectURL(file);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {

            return {
                type: 'file',
                id: this.json.id,
                datauri: this.json.datauri
            };
        }
    }]);
    return FileImageResource;
}(URLImageResource);

var DropView = function (_UIElement) {
    inherits(DropView, _UIElement);

    function DropView() {
        classCallCheck(this, DropView);
        return possibleConstructorReturn(this, (DropView.__proto__ || Object.getPrototypeOf(DropView)).apply(this, arguments));
    }

    createClass(DropView, [{
        key: "template",
        value: function template() {
            return "\n            <div class='drop-view'>\n                <div class='drop-overview'></div>\n            </div>\n        ";
        }
    }, {
        key: DRAGOVER('document'),
        value: function value(e) {
            e.preventDefault();
            this.$el.show();
        }
    }, {
        key: DRAGOUT('document'),
        value: function value(e) {
            e.preventDefault();
            this.$el.hide();
        }
    }, {
        key: "addImageResource",
        value: function addImageResource(dataTransfer) {

            var imageResources = [];

            var items = [].concat(toConsumableArray(dataTransfer.items));
            var dataList = [].concat(toConsumableArray(dataTransfer.types)).filter(function (type) {
                return type == 'text/uri-list';
            }).map(function (type) {
                return dataTransfer.getData(type);
            });

            if (dataList.length) {
                this.read(IMAGE_GET_URL, dataList, function (img) {
                    return imageResources.push(new URLImageResource(img));
                });
            }

            var files = [].concat(toConsumableArray(dataTransfer.files));

            if (files.length) {
                this.read(IMAGE_GET_FILE, files, function (img) {
                    return imageResources.push(new FileImageResource(img));
                });
            }

            var layer = editor$1.selection.currentLayer;
            if (layer) {
                imageResources.forEach(function (resource) {
                    //이미지 태그를 넣을까? 
                    var backgroundImage = layer.addBackgroundImage(new BackgroundImage({
                        index: -1 // 가장 앞으로 추가 
                    }));
                    backgroundImage.addImageResource(resource);
                });
            }
        }
    }, {
        key: DROP('document'),
        value: function value(e) {
            e.preventDefault();
            this.addImageResource(e.dataTransfer);
        }
    }, {
        key: PASTE('document'),
        value: function value(e) {
            this.addImageResource(e.clipboardData);
        }
    }]);
    return DropView;
}(UIElement);

var VerticalColorStep = function (_UIElement) {
    inherits(VerticalColorStep, _UIElement);

    function VerticalColorStep() {
        classCallCheck(this, VerticalColorStep);
        return possibleConstructorReturn(this, (VerticalColorStep.__proto__ || Object.getPrototypeOf(VerticalColorStep)).apply(this, arguments));
    }

    createClass(VerticalColorStep, [{
        key: "components",
        value: function components() {
            return {
                GradientSteps: GradientSteps
            };
        }
    }, {
        key: "template",
        value: function template() {
            return "\n            <div class='vertical-colorstep-container'>\n                <div class='vertical-colorstep' ref=\"$verticalColorstep\">\n                    <GradientSteps />\n                </div>\n            </div>\n        ";
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.toggle(this.isShow());
            this.refs.$verticalColorstep.px('width', editor$1.config.get('step.width'));
        }
    }, {
        key: EVENT(CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value() {
            this.refresh();
        }
    }, {
        key: "isShow",
        value: function isShow() {
            var item = editor$1.selection.backgroundImage;
            if (!item) return false;

            return item.isGradient();
        }
    }]);
    return VerticalColorStep;
}(UIElement);

var ArtBoard = function (_Item) {
    inherits(ArtBoard, _Item);

    function ArtBoard() {
        classCallCheck(this, ArtBoard);
        return possibleConstructorReturn(this, (ArtBoard.__proto__ || Object.getPrototypeOf(ArtBoard)).apply(this, arguments));
    }

    createClass(ArtBoard, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(ArtBoard.prototype.__proto__ || Object.getPrototypeOf(ArtBoard.prototype), "getDefaultObject", this).call(this, _extends({
                itemType: 'artboard',
                width: Length$1.px(300),
                height: Length$1.px(400),
                backgroundColor: 'white',
                name: 'New ArtBoard',
                x: Length$1.px(100),
                y: Length$1.px(100),
                perspectiveOriginPositionX: Length$1.percent(0),
                perspectiveOriginPositionY: Length$1.percent(0),
                display: new BlockDisplay()
            }, obj));
        }
    }, {
        key: "getArtBoard",
        value: function getArtBoard() {
            return this;
        }
    }, {
        key: "convert",
        value: function convert(json) {
            json = get$1(ArtBoard.prototype.__proto__ || Object.getPrototypeOf(ArtBoard.prototype), "convert", this).call(this, json);

            json.width = Length$1.parse(json.width);
            json.height = Length$1.parse(json.height);
            json.x = Length$1.parse(json.x);
            json.y = Length$1.parse(json.y);
            json.perspectiveOriginPositionX = Length$1.parse(json.perspectiveOriginPositionX);
            json.perspectiveOriginPositionY = Length$1.parse(json.perspectiveOriginPositionY);

            if (json.display) json.display = Display.parse(json.display);

            return json;
        }
    }, {
        key: "getDefaultTitle",
        value: function getDefaultTitle() {
            return 'ArtBoard';
        }
    }, {
        key: "traverse",
        value: function traverse(item, results, hasLayoutItem) {
            var _this2 = this;

            if (item.isAttribute()) return;
            if (!hasLayoutItem && item.isLayoutItem()) return;
            results.push(item);

            item.children.forEach(function (child) {
                _this2.traverse(child, results);
            });
        }
    }, {
        key: "tree",
        value: function tree(hasLayoutItem) {
            var _this3 = this;

            var results = [];

            this.children.forEach(function (item) {
                _this3.traverse(item, results, hasLayoutItem);
            });

            return results;
        }
    }, {
        key: "toString",
        value: function toString() {
            return CSS_TO_STRING(this.toCSS());
        }
    }, {
        key: "toCSS",
        value: function toCSS() {
            var json = this.json;
            var css = {
                overflow: json.overflow || EMPTY_STRING,
                'transform-style': json.preserve ? 'preserve-3d' : 'flat',
                position: 'absolute',
                'background-color': json.backgroundColor
            };

            return CSS_SORTING(_extends({}, css, this.toBoundCSS(), this.toLayoutCSS(), this.toPerspectiveCSS()));
        }
    }, {
        key: "toLayoutCSS",
        value: function toLayoutCSS() {
            return this.json.display.toCSS();
        }
    }, {
        key: "toPerspectiveCSS",
        value: function toPerspectiveCSS() {
            var css = {};
            var json = this.json;

            if (json.perspective) {
                css.perspective = json.perspective;
            }

            if (json.perspectiveOriginPositionX.isPercent() && json.perspectiveOriginPositionY.isPercent()) {
                css['perspective-origin'] = json.perspectiveOriginPositionX + " " + json.perspectiveOriginPositionY;
            }

            return css;
        }
    }, {
        key: "insertLast",
        value: function insertLast(source) {

            var sourceParent = source.parent();

            source.parentId = this.id;
            source.index = Number.MAX_SAFE_INTEGER;

            sourceParent.sort();
            this.sort();
        }
    }, {
        key: "directories",
        get: function get() {
            return this.search({ itemType: 'directory' });
        }
    }, {
        key: "layers",
        get: function get() {
            return this.search({ itemType: 'layer' });
        }
    }, {
        key: "allDirectories",
        get: function get() {
            return this.tree().filter(function (it) {
                return it.itemType == 'directory';
            });
        }
    }, {
        key: "allLayers",
        get: function get() {
            return this.tree(true).filter(function (it) {
                return it.itemType == 'layer';
            });
        }
    }, {
        key: "texts",
        get: function get() {
            return this.search({ itemType: 'layer', type: 'text' });
        }
    }, {
        key: "images",
        get: function get() {
            return this.search({ itemType: 'layer', type: 'image' });
        }
    }]);
    return ArtBoard;
}(Item);

var _right;
var _left;
var _top;
var _bottom;


var SEGMENT_TYPE_MOVE = 'move';
var SEGMENT_TYPE_TOP = 'to top';
var SEGMENT_TYPE_LEFT = 'to left';
var SEGMENT_TYPE_RIGHT = 'to right';
var SEGMENT_TYPE_BOTTOM = 'to bottom';
var SEGMENT_TYPE_TOP_RIGHT = 'to top right';
var SEGMENT_TYPE_TOP_LEFT = 'to top left';
var SEGMENT_TYPE_BOTTOM_RIGHT = 'to bottom right';
var SEGMENT_TYPE_BOTTOM_LEFT = 'to bottom left';

var move = defineProperty({}, SEGMENT_TYPE_MOVE, true);

var right = (_right = {}, defineProperty(_right, SEGMENT_TYPE_RIGHT, true), defineProperty(_right, SEGMENT_TYPE_TOP_RIGHT, true), defineProperty(_right, SEGMENT_TYPE_BOTTOM_RIGHT, true), _right);
var left = (_left = {}, defineProperty(_left, SEGMENT_TYPE_LEFT, true), defineProperty(_left, SEGMENT_TYPE_TOP_LEFT, true), defineProperty(_left, SEGMENT_TYPE_BOTTOM_LEFT, true), _left);
var top = (_top = {}, defineProperty(_top, SEGMENT_TYPE_TOP, true), defineProperty(_top, SEGMENT_TYPE_TOP_RIGHT, true), defineProperty(_top, SEGMENT_TYPE_TOP_LEFT, true), _top);

var bottom = (_bottom = {}, defineProperty(_bottom, SEGMENT_TYPE_BOTTOM, true), defineProperty(_bottom, SEGMENT_TYPE_BOTTOM_LEFT, true), defineProperty(_bottom, SEGMENT_TYPE_BOTTOM_RIGHT, true), _bottom);

var Segment = function () {
    function Segment() {
        classCallCheck(this, Segment);
    }

    createClass(Segment, null, [{
        key: 'isMove',
        value: function isMove(direction) {
            return move[direction];
        }
    }, {
        key: 'isTop',
        value: function isTop(direction) {
            return top[direction];
        }
    }, {
        key: 'isRight',
        value: function isRight(direction) {
            return right[direction];
        }
    }, {
        key: 'isBottom',
        value: function isBottom(direction) {
            return bottom[direction];
        }
    }, {
        key: 'isLeft',
        value: function isLeft(direction) {
            return left[direction];
        }
    }]);
    return Segment;
}();

Segment.MOVE = SEGMENT_TYPE_MOVE;
Segment.RIGHT = SEGMENT_TYPE_RIGHT;
Segment.TOP_RIGHT = SEGMENT_TYPE_TOP_RIGHT;
Segment.BOTTOM_RIGHT = SEGMENT_TYPE_BOTTOM_RIGHT;
Segment.LEFT = SEGMENT_TYPE_LEFT;
Segment.TOP_LEFT = SEGMENT_TYPE_TOP_LEFT;
Segment.BOTTOM_LEFT = SEGMENT_TYPE_BOTTOM_LEFT;
Segment.TOP = SEGMENT_TYPE_TOP;
Segment.BOTTOM = SEGMENT_TYPE_BOTTOM;

var MAX_DIST = 1;

var Guide = function () {
    function Guide() {
        classCallCheck(this, Guide);
    }

    createClass(Guide, [{
        key: "initialize",
        value: function initialize(rect, cachedItems, direction) {
            var _this = this;

            this.direction = direction;
            this.rect = rect;
            this.cachedItems = cachedItems;

            var project = editor$1.selection.currentProject;
            this.checkLayers = [];
            if (project) {
                if (this.cachedItems[0] instanceof ArtBoard) {
                    this.checkLayers = project.artboards.filter(function (item) {
                        return !_this.cachedItems[item.id];
                    });
                } else {
                    this.checkLayers = project.allItems.filter(function (item) {
                        return !_this.cachedItems[item.id];
                    });
                }
            }
        }
    }, {
        key: "compareX",
        value: function compareX(A, B) {
            var dist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MAX_DIST;

            var AX = [A.screenX.value, A.centerX.value, A.screenX2.value];
            var BX = [B.screenX.value, B.centerX.value, B.screenX2.value];

            var results = [];
            AX.forEach(function (ax, source) {
                BX.forEach(function (bx, target) {
                    var isSnap = Math.abs(ax - bx) <= dist;

                    if (isSnap) {
                        // ax -> bx <= dist 
                        results.push({ A: A, B: B, source: source, target: target, ax: ax, bx: bx });
                    }
                });
            });

            return results;
        }
    }, {
        key: "compareY",
        value: function compareY(A, B) {
            var dist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MAX_DIST;

            var AY = [A.screenY.value, A.centerY.value, A.screenY2.value];
            var BY = [B.screenY.value, B.centerY.value, B.screenY2.value];

            var results = [];
            AY.forEach(function (ay, source) {
                BY.forEach(function (by, target) {
                    var isSnap = Math.abs(ay - by) <= dist;

                    if (isSnap) {
                        // aY -> bY <= dist 
                        results.push({ A: A, B: B, source: source, target: target, ay: ay, by: by });
                    }
                });
            });

            return results;
        }
    }, {
        key: "compare",
        value: function compare(A, B) {
            var dist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MAX_DIST;


            var xCheckList = this.compareX(A, B, dist);
            var yCheckList = this.compareY(A, B, dist);

            return [].concat(toConsumableArray(xCheckList), toConsumableArray(yCheckList));
        }
    }, {
        key: "getLayers",
        value: function getLayers() {
            var _this2 = this;

            var dist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : MAX_DIST;


            var layers = this.checkLayers;
            var points = [];

            layers.forEach(function (B) {
                points.push.apply(points, toConsumableArray(_this2.compare(_this2.rect, B, dist)));
            });

            return points;
        }
    }, {
        key: "calculate",
        value: function calculate() {
            var _this3 = this;

            var dist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : MAX_DIST;


            var list = this.getLayers(dist);

            if (Segment.isMove(this.direction)) {
                list.forEach(function (it) {
                    return _this3.moveSnap(it);
                });
            } else {
                list.forEach(function (it) {
                    return _this3.sizeSnap(it);
                });
            }

            return list;
        }
    }, {
        key: "sizeSnap",
        value: function sizeSnap(it) {
            if (isNotUndefined(it.ax)) {
                var minX, maxX, width;
                switch (it.source) {
                    case 2:
                        minX = this.rect.screenX.value;
                        maxX = it.bx;
                        width = maxX - minX;
                        this.rect.width.set(width);
                        break;
                    // case 1: 
                    //     minX = this.rect.screenX.value; 
                    //     width = Math.round(it.bx - minX) * 2;   
                    //     this.rect.width.set(width);                            
                    //     break;                
                    case 0:
                        minX = it.bx;
                        maxX = this.rect.screenX2.value;
                        width = maxX - minX;
                        this.rect.x.set(minX);
                        this.rect.width.set(width);
                        break;
                }
            } else {
                var minY, maxY, height;

                switch (it.source) {
                    case 2:
                        minY = this.rect.screenY.value;
                        maxY = it.by;
                        height = maxY - minY;
                        this.rect.y.set(minY);
                        this.rect.height.set(height);
                        break;

                    // case 1: 
                    //     minY = this.rect.screenY.value; 
                    //     height = Math.round(it.by - minY) * 2;   
                    //     this.rect.height.set(height);
                    //     break;       
                    case 0:
                        minY = it.by;
                        maxY = this.rect.screenY2.value;
                        height = maxY - minY;
                        this.rect.y.set(minY);
                        this.rect.height.set(height);
                        break;
                }
            }
        }
    }, {
        key: "moveSnap",
        value: function moveSnap(it) {
            if (isNotUndefined(it.ax)) {
                var distX = Math.round(this.rect.width.value / 2 * it.source);
                var minX = it.bx - distX;
                this.rect.x.set(minX);
            } else if (isNotUndefined(it.ay)) {
                var distY = Math.round(this.rect.height.value / 2 * it.source);
                var minY = it.by - distY;
                this.rect.y.set(minY);
            }
        }
    }]);
    return Guide;
}();

var ItemPositionCalc = function () {
    function ItemPositionCalc() {
        classCallCheck(this, ItemPositionCalc);

        this.guide = new Guide();
    }

    createClass(ItemPositionCalc, [{
        key: "initialize",
        value: function initialize(direction) {
            var _this = this;

            this.direction = direction;
            this.cachedSelectionItems = {};
            editor$1.selection.items.map(function (it) {
                return it.clone();
            }).forEach(function (it) {
                _this.cachedSelectionItems[it.id] = it;
            });

            editor$1.selection.initRect();

            this.newRect = editor$1.selection.currentRect;
            this.rect = this.newRect.clone();

            this.cachedPosition = {};
            keyEach(this.cachedSelectionItems, function (id, item) {
                _this.cachedPosition[id] = {
                    x: _this.setupX(item),
                    y: _this.setupY(item)
                };
            });

            this.guide.initialize(this.newRect, this.cachedSelectionItems, this.direction);
        }
    }, {
        key: "recover",
        value: function recover(item) {
            var _cachedPosition$item$ = this.cachedPosition[item.id].x,
                xDistRate = _cachedPosition$item$.xDistRate,
                x2DistRate = _cachedPosition$item$.x2DistRate;
            var _cachedPosition$item$2 = this.cachedPosition[item.id].y,
                yDistRate = _cachedPosition$item$2.yDistRate,
                y2DistRate = _cachedPosition$item$2.y2DistRate;


            var minX = this.newRect.screenX.value;
            var maxX = this.newRect.screenX2.value;
            var minY = this.newRect.screenY.value;
            var maxY = this.newRect.screenY2.value;

            var totalWidth = maxX - minX;
            var xr = totalWidth * xDistRate;
            var x2r = totalWidth * x2DistRate;

            var totalHeight = maxY - minY;
            var yr = totalHeight * yDistRate;
            var y2r = totalHeight * y2DistRate;

            this.setX(item, minX, maxX, xr, x2r);
            this.setY(item, minY, maxY, yr, y2r);
        }
    }, {
        key: "calculate",
        value: function calculate(dx, dy) {
            var e = editor$1.config.get('bodyEvent');

            var isAlt = e.altKey;
            var direction = this.direction;

            if (Segment.isMove(direction)) {
                this.calculateMove(dx, dy, { isAlt: isAlt });
            } else {
                if (Segment.isRight(direction)) {
                    this.calculateRight(dx, dy, { isAlt: isAlt });
                }
                if (Segment.isBottom(direction)) {
                    this.calculateBottom(dx, dy, { isAlt: isAlt });
                }
                if (Segment.isTop(direction)) {
                    this.calculateTop(dx, dy, { isAlt: isAlt });
                }
                if (Segment.isLeft(direction)) {
                    this.calculateLeft(dx, dy, { isAlt: isAlt });
                }
            }

            return this.calculateGuide();
        }
    }, {
        key: "calculateGuide",
        value: function calculateGuide() {
            // TODO change newRect values 
            var list = this.guide.calculate(2);

            return list;
        }
    }, {
        key: "setupX",
        value: function setupX(cacheItem) {
            var minX = this.rect.screenX.value;
            var maxX = this.rect.screenX2.value;
            var width = maxX - minX;

            var xDistRate = (cacheItem.screenX.value - minX) / width;
            var x2DistRate = (cacheItem.screenX2.value - minX) / width;

            return { xDistRate: xDistRate, x2DistRate: x2DistRate };
        }
    }, {
        key: "setupY",
        value: function setupY(cacheItem) {
            var minY = this.rect.screenY.value;
            var maxY = this.rect.screenY2.value;
            var height = maxY - minY;

            var yDistRate = (cacheItem.screenY.value - minY) / height;
            var y2DistRate = (cacheItem.screenY2.value - minY) / height;

            return { yDistRate: yDistRate, y2DistRate: y2DistRate };
        }
    }, {
        key: "setY",
        value: function setY(item, minY, maxY, yrate, y2rate) {
            var distY = Math.round(yrate);
            var distY2 = Math.round(y2rate);
            var height = distY2 - distY;

            item.y.set(distY + minY);
            if (item instanceof Layer) {
                item.y.sub(editor$1.get(item.parentPosition).screenY);
            }

            item.height.set(height);
        }
    }, {
        key: "setX",
        value: function setX(item, minX, maxX, xrate, x2rate) {
            var distX = Math.round(xrate);
            var distX2 = Math.round(x2rate);
            var width = distX2 - distX;

            item.x.set(distX + minX);
            if (item instanceof Layer) {
                item.x.sub(editor$1.get(item.parentPosition).screenX);
            }

            item.width.set(width);
        }
    }, {
        key: "calculateMove",
        value: function calculateMove(dx, dy, opt) {
            this.newRect.x.set(this.rect.x.value + dx);
            this.newRect.y.set(this.rect.y.value + dy);
        }
    }, {
        key: "calculateRight",
        value: function calculateRight(dx, dy, opt) {

            var minX = this.rect.screenX.value;
            var maxX = this.rect.screenX2.value;

            if (maxX + dx >= minX) {
                var newX = maxX + dx;
                var dist = newX - minX;
                this.newRect.width.set(dist);
            }
        }
    }, {
        key: "calculateBottom",
        value: function calculateBottom(dx, dy, opt) {
            var minY = this.rect.screenY.value;
            var maxY = this.rect.screenY2.value;
            var centerY = this.rect.centerY.value;

            var newY = minY;
            var newY2 = maxY + dy;

            if (newY2 < minY) {
                this.newRect.y.set(minY);
                this.newRect.height.set(1);
                return;
            }

            if (opt.isAlt && newY2 < centerY) {
                this.newRect.y.set(centerY);
                this.newRect.height.set(1);
                return;
            }

            if (opt.isAlt) newY -= dy;

            var dist = newY2 - newY;
            this.newRect.y.set(newY);
            this.newRect.height.set(dist);
        }
    }, {
        key: "calculateTop",
        value: function calculateTop(dx, dy, opt) {
            var minY = this.rect.screenY.value;
            var maxY = this.rect.screenY2.value;
            var centerY = this.rect.centerY.value;

            var newY = minY + dy;
            var newY2 = maxY;

            if (newY > maxY) {
                this.newRect.y.set(maxY - 1);
                this.newRect.height.set(1);
                return;
            }

            if (opt.isAlt && newY > centerY) {
                this.newRect.y.set(centerY);
                this.newRect.height.set(1);
                return;
            }

            if (opt.isAlt) newY2 += -dy;

            var dist = newY2 - newY;
            this.newRect.y.set(newY);
            this.newRect.height.set(dist);
        }
    }, {
        key: "calculateLeft",
        value: function calculateLeft(dx, dy) {
            var minX = this.rect.screenX.value;
            var maxX = this.rect.screenX2.value;

            var newX = minX + dx;

            if (newX <= maxX) {
                var dist = maxX - newX;
                this.newRect.x.set(newX);
                this.newRect.width.set(dist);
            }
        }
    }]);
    return ItemPositionCalc;
}();

var StaticGradient = function (_Gradient) {
    inherits(StaticGradient, _Gradient);

    function StaticGradient() {
        classCallCheck(this, StaticGradient);
        return possibleConstructorReturn(this, (StaticGradient.__proto__ || Object.getPrototypeOf(StaticGradient)).apply(this, arguments));
    }

    createClass(StaticGradient, [{
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(StaticGradient.prototype.__proto__ || Object.getPrototypeOf(StaticGradient.prototype), 'getDefaultObject', this).call(this, {
                type: 'static-gradient',
                static: true,
                color: 'rgba(0, 0, 0, 0)'
            });
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'linear-gradient(to right, ' + this.json.color + ', ' + this.json.color + ')';
        }
    }, {
        key: 'isStatic',
        value: function isStatic() {
            return true;
        }
    }]);
    return StaticGradient;
}(Gradient);

var _templateObject$16 = taggedTemplateLiteral(['\n            <div \n                class=\'layer ', '\' \n                item-id="', '" \n                style="', '" \n                title="', '" >\n                ', '\n                <div class=\'text-layer\' style="pointer-events: none;"></div>\n            </div>'], ['\n            <div \n                class=\'layer ', '\' \n                item-id="', '" \n                style="', '" \n                title="', '" >\n                ', '\n                <div class=\'text-layer\' style="pointer-events: none;"></div>\n            </div>']);
var _templateObject2$3 = taggedTemplateLiteral(['\n            <div  \n                class=\'artboard\' \n                item-id="', '" \n                title="', '" \n                style=\'', ';\'>\n                    <div class=\'artboard-title\' style="cursor:pointer;position:absolute;bottom:100%;left:0px;right:0px;display:inline-block;">', '</div>\n            </div>\n        '], ['\n            <div  \n                class=\'artboard\' \n                item-id="', '" \n                title="', '" \n                style=\'', ';\'>\n                    <div class=\'artboard-title\' style="cursor:pointer;position:absolute;bottom:100%;left:0px;right:0px;display:inline-block;">', '</div>\n            </div>\n        ']);

var CanvasView = function (_UIElement) {
    inherits(CanvasView, _UIElement);

    function CanvasView() {
        classCallCheck(this, CanvasView);
        return possibleConstructorReturn(this, (CanvasView.__proto__ || Object.getPrototypeOf(CanvasView)).apply(this, arguments));
    }

    createClass(CanvasView, [{
        key: 'initialize',
        value: function initialize() {
            get$1(CanvasView.prototype.__proto__ || Object.getPrototypeOf(CanvasView.prototype), 'initialize', this).call(this);

            this.initializeLayerCache();
            this.itemPositionCalc = new ItemPositionCalc();
        }
    }, {
        key: 'makeResizer',
        value: function makeResizer() {
            return '<div class=\'item-resizer\' ref="$itemResizer">\n            <button type="button" class=\'segment\' data-value="' + Segment.MOVE + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.RIGHT + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.LEFT + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.TOP + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.BOTTOM + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.TOP_RIGHT + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.BOTTOM_RIGHT + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.BOTTOM_LEFT + '"></button>\n            <button type="button" class=\'segment\' data-value="' + Segment.TOP_LEFT + '"></button>\n        </div>';
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n            <div class=\'page-view\'>\n                <div class=\'page-content\' ref="$board">\n                    <div class="page-scroll-panel" style="position:relative" ref="$panel">\n                        <div class="page-canvas" ref="$canvas">\n                            <div class=\'area drag-area\' ref="$dragArea"></div>\n                            <div class=\'area artboard-area\' ref="$artboardArea"></div>\n                            <div class=\'area layer-area\' ref="$layerArea"></div>\n                        </div>          \n                        <div class="page-selection">\n                            <div class=\'page-guide-line\' ref="$guide"></div>\n                            ' + this.makeResizer() + '\n                            <div class="drag-area-view" ref="$dragAreaView"></div>\n\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'initializeLayerCache',
        value: function initializeLayerCache() {
            this.layerItems = {};
        }
    }, {
        key: 'getCachedLayerElement',
        value: function getCachedLayerElement(id) {

            if (!this.layerItems[id]) {
                var $el = this.$el.$('[item-id="' + id + '"]');

                this.layerItems[id] = $el;
            }

            return this.layerItems[id];
        }
    }, {
        key: 'refreshLayerPosition',
        value: function refreshLayerPosition(item) {
            var _this2 = this;

            if (item instanceof ArtBoard) {
                item.allLayers.forEach(function (layer) {
                    var $el = _this2.getCachedLayerElement(layer.id);
                    if ($el) $el.css(layer.toBoundCSS());
                });
            }
        }
    }, {
        key: 'makeLayer',
        value: function makeLayer(layer) {
            var _this3 = this;

            var selected = editor$1.selection.check(layer) ? 'selected' : EMPTY_STRING;
            var children = layer.children;
            return html(_templateObject$16, selected, layer.id, layer.toBoundString(), layer.title, children.map(function (it) {
                return _this3.makeLayer(it);
            }));
        }
    }, {
        key: 'makeArtBoard',
        value: function makeArtBoard(artboard) {
            return html(_templateObject2$3, artboard.id, artboard.title, artboard.toString(), artboard.title);
        }
    }, {
        key: LOAD('$artboardArea'),
        value: function value$$1() {
            var _this4 = this;

            var project = editor$1.selection.currentProject;
            if (!project) return EMPTY_STRING;

            var list = project.artboards;

            return list.map(function (artboard) {
                return _this4.makeArtBoard(artboard);
            });
        }
    }, {
        key: LOAD('$layerArea'),
        value: function value$$1() {
            var _this5 = this;

            var project = editor$1.selection.currentProject;
            if (!project) return EMPTY_STRING;

            this.initializeLayerCache();

            var list = project.artboards;

            return list.map(function (artboard) {
                return artboard.allLayers.map(function (layer) {
                    return _this5.makeLayer(layer);
                });
            });
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.setBackgroundColor();
            this.load();
            this.setItemResizer();
            this.removeGuideLine();
        }
    }, {
        key: 'cacheSelectedItem',
        value: function cacheSelectedItem($target) {

            if ($target) {
                this.item = editor$1.get($target.attr('item-id'));
                this.$item = $target;
                this.item.select();
            } else {
                this.item = editor$1.selection.current;
                this.$item = this.$el.$('[item-id="' + this.item.id + '"]');
            }

            this.x = +this.item.screenX.clone();
            this.y = +this.item.screenY.clone();
            this.width = +this.item.width.clone();
            this.height = +this.item.height.clone();
            this.x2 = this.x + this.width;
            this.y2 = this.y + this.height;

            this.itemPositionCalc.initialize(this.direction);
        }
    }, {
        key: 'selectItem',
        value: function selectItem($target) {
            this.cacheSelectedItem($target);
            this.removeGuideLine();
        }
    }, {
        key: POINTERSTART('$artboardArea .artboard-title') + MOVE('moveArtBoard') + END('moveEndArtBoard'),
        value: function value$$1(e) {
            this.targetXY = e.xy;
            this.$artboard = e.$delegateTarget.closest('artboard');
            this.artboard = editor$1.get(this.$artboard.attr('item-id'));
            this.artboard.select();
            this.refs.$itemResizer.addClass('artboard').removeClass('layer');
            this.selectItem();
        }
    }, {
        key: 'moveEndArtBoard',
        value: function moveEndArtBoard() {
            this.artboard.select();
            this.setItemResizer();
        }
    }, {
        key: POINTERSTART('$layerArea .layer') + MOVE('moveLayer') + END('moveEndLayer'),
        value: function value$$1(e) {
            this.targetXY = e.xy;
            this.$layer = e.$delegateTarget;
            this.selectItem(this.$layer);
            this.refs.$itemResizer.addClass('layer').removeClass('artboard');
        }
    }, {
        key: 'moveEndLayer',
        value: function moveEndLayer() {
            this.item.select();
            this.setItemResizer();
        }
    }, {
        key: POINTERSTART('$dragArea') + MOVE('dragArea') + END('dragAreaEnd'),
        value: function value$$1(e) {
            this.targetXY = e.xy;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;
            this.removeGuideLine();
        }
    }, {
        key: POINTERSTART('$itemResizer button') + SELF + MOVE('moveResize'),
        value: function value$$1(e) {
            this.targetXY = e.xy;
            this.$target = e.$delegateTarget;
            this.direction = this.$target.attr('data-value');
            this.cacheSelectedItem();
        }
    }, {
        key: 'getDragRect',
        value: function getDragRect() {
            var pos = editor$1.config.get('pos');

            var dx = pos.x - this.targetXY.x;
            var dy = pos.y - this.targetXY.y;

            var x = dx > -1 ? this.offsetX : this.offsetX + dx;
            var y = dy > -1 ? this.offsetY : this.offsetY + dy;

            var rect = {
                x: Length$1.px(x),
                y: Length$1.px(y),
                width: Length$1.px(Math.abs(dx)),
                height: Length$1.px(Math.abs(dy))
            };

            rect.x2 = Length$1.px(rect.x.value + rect.width.value);
            rect.y2 = Length$1.px(rect.y.value + rect.height.value);

            return rect;
        }
    }, {
        key: 'getDragCSS',
        value: function getDragCSS() {
            var rect = this.getDragRect();

            return {
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height
            };
        }
    }, {
        key: 'dragArea',
        value: function dragArea() {
            this.refs.$dragAreaView.css(this.getDragCSS());
        }
    }, {
        key: 'dragAreaEnd',
        value: function dragAreaEnd() {
            this.refs.$dragAreaView.css({ left: Length$1.px(-10000) });
            editor$1.selection.area(this.getDragRect());
            this.setItemResizer();

            editor$1.send(CHANGE_SELECTION, null, this);
        }
    }, {
        key: 'moveResize',
        value: function moveResize() {
            var pos = editor$1.config.get('pos');

            var dx = pos.x - this.targetXY.x;
            var dy = pos.y - this.targetXY.y;

            var guideList = this.itemPositionCalc.calculate(dx, dy);
            this.setGuideLine(guideList);

            this.matchPosition();

            this.emit(CHANGE_RECT);
        }
    }, {
        key: 'matchPosition',
        value: function matchPosition(guideList) {
            var _this6 = this;

            editor$1.selection.items.forEach(function (item) {
                _this6.itemPositionCalc.recover(item);
                _this6.getCachedLayerElement(item.id).css(item.toBoundCSS());
            });

            this.setItemResizer();
        }
    }, {
        key: 'movePosition',
        value: function movePosition() {
            var pos = editor$1.config.get('pos');

            var dx = pos.x - this.targetXY.x;
            var dy = pos.y - this.targetXY.y;

            this.itemPositionCalc.calculateMove(dx, dy);

            this.matchPosition();
        }
    }, {
        key: 'moveArtBoard',
        value: function moveArtBoard() {
            this.movePosition();
            this.refreshLayerPosition(this.item);
            editor$1.send(CHANGE_RECT, this.item, this);
        }
    }, {
        key: 'moveLayer',
        value: function moveLayer() {
            this.movePosition();
            editor$1.send(CHANGE_RECT, this.item, this);
        }
    }, {
        key: 'refreshLayer',
        value: function refreshLayer() {
            var _this7 = this;

            editor$1.selection.layers.forEach(function (item) {
                var $el = _this7.getCachedLayerElement(item.id);

                var content = item.content || EMPTY_STRING;
                $el.$('.text-layer').html(content);
                $el.cssText(item.toBoundString());
            });
        }
    }, {
        key: 'setBackgroundColor',
        value: function setBackgroundColor() {

            var canvasCSS = { width: Length$1.px(2000), height: Length$1.px(2000) };

            this.refs.$panel.css(canvasCSS);
        }
    }, {
        key: 'removeGuideLine',
        value: function removeGuideLine() {
            this.refs.$guide.cssText('');
        }
    }, {
        key: 'setGuideLine',
        value: function setGuideLine(list) {
            if (!list.length) {
                this.removeGuideLine();
                return;
            }

            var layer = new Layer();

            var lineWidth = Length$1.px(1.5);

            list.forEach(function (it) {

                var target = it.B;

                if (isNotUndefined(it.ax)) {

                    var background = layer.addBackgroundImage(new BackgroundImage());
                    background.addGradient(new StaticGradient({ color: '#e600ff' }));
                    background.repeat = 'no-repeat';
                    background.width = lineWidth;
                    background.height = it.A.height;
                    background.x = Length$1.px(it.bx - 1);
                    background.y = it.A.screenY;

                    if (target instanceof Layer) {
                        var background = layer.addBackgroundImage(new BackgroundImage());
                        background.addGradient(new StaticGradient({ color: '#e600ff' }));
                        background.repeat = 'no-repeat';
                        background.width = lineWidth;
                        background.height = target.height;
                        background.x = Length$1.px(it.bx - 1);
                        background.y = target.screenY;
                    }

                    var minY = Length$1.min(target.screenY, it.A.screenY);
                    var maxY = Length$1.max(target.screenY2, it.A.screenY2);

                    var background = layer.addBackgroundImage(new BackgroundImage());
                    background.addGradient(new StaticGradient({ color: '#4877ff' }));
                    background.repeat = 'no-repeat';
                    background.width = lineWidth;
                    background.height = Length$1.px(maxY.value - minY.value);
                    background.x = Length$1.px(it.bx - 1);
                    background.y = minY;
                } else {
                    var background = layer.addBackgroundImage(new BackgroundImage());
                    background.addGradient(new StaticGradient({ color: '#e600ff' }));
                    background.repeat = 'no-repeat';
                    background.width = it.A.width;
                    background.height = lineWidth;
                    background.x = it.A.screenX;
                    background.y = Length$1.px(it.by);

                    var minX = Length$1.min(target.screenX, it.A.screenX);
                    var maxX = Length$1.max(target.screenX2, it.A.screenX2);

                    var background = layer.addBackgroundImage(new BackgroundImage());
                    background.addGradient(new StaticGradient({ color: '#4877ff' }));
                    background.repeat = 'no-repeat';
                    background.width = Length$1.px(maxX.value - minX.value);
                    background.height = lineWidth;
                    background.x = minX;
                    background.y = Length$1.px(it.by);
                }
            });

            layer.remove();

            var css = layer.toBackgroundImageCSS();

            this.refs.$guide.cssText(CSS_TO_STRING(css));
        }
    }, {
        key: 'setItemResizer',
        value: function setItemResizer() {

            if (editor$1.selection.artboard || editor$1.selection.layer) {
                var current = editor$1.selection.currentRect;
                if (current) {
                    this.refs.$itemResizer.css({
                        left: current.screenX,
                        top: current.screenY,
                        width: current.width,
                        height: current.height
                    });
                }
            } else {
                this.refs.$itemResizer.css({ left: '-10000px' });
            }
        }
    }, {
        key: EVENT(CHANGE_ARTBOARD),
        value: function value$$1() {
            this.setBackgroundColor();
        }

        // indivisual layer effect 

    }, {
        key: EVENT(CHANGE_LAYER),
        value: function value$$1() {
            this.refreshLayer();
        }
    }, {
        key: EVENT(CHANGE_RECT),
        value: function value$$1() {

            var guideList = this.itemPositionCalc.calculateGuide();
            this.setGuideLine(guideList);
            this.matchPosition();
        }
    }, {
        key: EVENT(CHANGE_SELECTION),
        value: function value$$1() {

            var item = editor$1.selection.current;
            if (item) {
                var $item = this.refs.$canvas.$('[item-id="' + item.id + '"]');
                if (!$item) {
                    this.refresh();
                } else {}

                this.setItemResizer();
            } else {
                console.log('empty', item);
            }
        }

        // all effect 

    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value$$1() {
            this.refresh();
        }
    }]);
    return CanvasView;
}(UIElement);

var DEFAULT_TITLE = EMPTY_STRING;
var DEFAULT_ICON = EMPTY_STRING;
var DEFAULT_CHECKED = false;

var MenuItem = function (_UIElement) {
    inherits(MenuItem, _UIElement);

    function MenuItem() {
        classCallCheck(this, MenuItem);
        return possibleConstructorReturn(this, (MenuItem.__proto__ || Object.getPrototypeOf(MenuItem)).apply(this, arguments));
    }

    createClass(MenuItem, [{
        key: "template",
        value: function template() {
            return "\n            <button type=\"button\" class='menu-item' checked=\"" + (this.getChecked() ? 'checked' : EMPTY_STRING) + "\">\n                <div class=\"icon " + this.getIcon() + "\">" + this.getIconString() + "</div>\n                <div class=\"title\">" + this.getTitle() + "</div>\n            </button>\n        ";
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {}
    }, {
        key: "getChecked",
        value: function getChecked() {
            return DEFAULT_CHECKED;
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return DEFAULT_TITLE;
        }
    }, {
        key: "getIcon",
        value: function getIcon() {
            return DEFAULT_ICON;
        }
    }, {
        key: "getIconString",
        value: function getIconString() {
            return DEFAULT_ICON;
        }
    }, {
        key: CLICK(),
        value: function value$$1(e) {
            this.clickButton(e);
        }
    }]);
    return MenuItem;
}(UIElement);

var chevron_right = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n    <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z\"/>\n</svg>";

var create_folder = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n    <path d=\"M22 6H12l-2-2H2v16h20V6zm-3 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z\"/>\n</svg>";

var add_box = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>";

var visible = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z\"/></svg>";

var remove = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/></svg>";

var copy = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z\"/></svg>";

var lock = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z\"/></svg>";

var undo = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z\"/></svg>";

var redo = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z\"/></svg>";

var save = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z\"/><path fill=\"none\" d=\"M0 0h24v24H0z\"/></svg>";

var exportIcon = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>";

var add = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"/></svg>";

var add_note = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z\"/></svg>";

var publish = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z\"/></svg>";

var folder = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z\"/></svg>";

var artboard = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z\"/></svg>";

var icon = {
    artboard: artboard,
    folder: folder,
    publish: publish,
    add_note: add_note,
    add: add,
    save: save,
    export: exportIcon,
    redo: redo,
    undo: undo,
    lock: lock,
    remove: remove,
    copy: copy,
    visible: visible,
    add_box: add_box,
    create_folder: create_folder,
    chevron_right: chevron_right
};

var Export = function (_MenuItem) {
    inherits(Export, _MenuItem);

    function Export() {
        classCallCheck(this, Export);
        return possibleConstructorReturn(this, (Export.__proto__ || Object.getPrototypeOf(Export)).apply(this, arguments));
    }

    createClass(Export, [{
        key: "getIconString",
        value: function getIconString() {
            return icon.publish;
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return 'Export';
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {
            this.emit('showExport');
        }
    }]);
    return Export;
}(MenuItem);

var Redo = function (_MenuItem) {
    inherits(Redo, _MenuItem);

    function Redo() {
        classCallCheck(this, Redo);
        return possibleConstructorReturn(this, (Redo.__proto__ || Object.getPrototypeOf(Redo)).apply(this, arguments));
    }

    createClass(Redo, [{
        key: "getIconString",
        value: function getIconString() {
            return icon.redo;
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return 'Redo';
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {}
    }]);
    return Redo;
}(MenuItem);

var Undo = function (_MenuItem) {
    inherits(Undo, _MenuItem);

    function Undo() {
        classCallCheck(this, Undo);
        return possibleConstructorReturn(this, (Undo.__proto__ || Object.getPrototypeOf(Undo)).apply(this, arguments));
    }

    createClass(Undo, [{
        key: "getIconString",
        value: function getIconString() {
            return icon.undo;
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return 'Undo';
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {}
    }]);
    return Undo;
}(MenuItem);

var STORAGE_PAGES = 'storage/pages';
var STORAGE_LAYERS = 'storage/layers';
var STORAGE_IMAGES = 'storage/images';



var STORAGE_REMOVE_PAGE = 'storage/remove/page';

var STORAGE_ADD_PAGE = 'storage/add/page';

var STORAGE_ADD_IMAGE = 'storage/add/image';


var STORAGE_SAVE = 'storage/save';



var STORAGE_LOAD_LAYER = 'storage/load/layer';

var STORAGE_LOAD_IMAGE = 'storage/load/image';

var Save = function (_MenuItem) {
    inherits(Save, _MenuItem);

    function Save() {
        classCallCheck(this, Save);
        return possibleConstructorReturn(this, (Save.__proto__ || Object.getPrototypeOf(Save)).apply(this, arguments));
    }

    createClass(Save, [{
        key: "getIconString",
        value: function getIconString() {
            return icon.save;
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return 'Save';
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {
            this.run(STORAGE_SAVE);
        }
    }]);
    return Save;
}(MenuItem);

var ShowGrid = function (_MenuItem) {
    inherits(ShowGrid, _MenuItem);

    function ShowGrid() {
        classCallCheck(this, ShowGrid);
        return possibleConstructorReturn(this, (ShowGrid.__proto__ || Object.getPrototypeOf(ShowGrid)).apply(this, arguments));
    }

    createClass(ShowGrid, [{
        key: "getIcon",
        value: function getIcon() {
            return 'show-grid';
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return 'Show Grid';
        }
    }, {
        key: "getChecked",
        value: function getChecked() {
            return editor$1.config.get('show.grid');
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {

            this.checked = !this.checked;
            editor$1.config.set('show.grid', this.checked);
            editor$1.config.set('snap.grid', this.checked);
            editor$1.send(CHANGE_TOOL);
            this.refresh();
        }
    }, {
        key: EVENT(CHANGE_TOOL, CHANGE_EDITOR, CHANGE_SELECTION),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.$el.attr('checked', this.checked ? 'checked' : EMPTY_STRING);
        }
    }]);
    return ShowGrid;
}(MenuItem);

var Github = function (_MenuItem) {
    inherits(Github, _MenuItem);

    function Github() {
        classCallCheck(this, Github);
        return possibleConstructorReturn(this, (Github.__proto__ || Object.getPrototypeOf(Github)).apply(this, arguments));
    }

    createClass(Github, [{
        key: 'getIcon',
        value: function getIcon() {
            return 'github';
        }
    }, {
        key: 'getTitle',
        value: function getTitle() {
            return 'Github';
        }
    }, {
        key: 'clickButton',
        value: function clickButton(e) {
            window.open('https://github.com/easylogic/css', 'github-window');
        }
    }]);
    return Github;
}(MenuItem);

var ExportCodePen = function (_MenuItem) {
    inherits(ExportCodePen, _MenuItem);

    function ExportCodePen() {
        classCallCheck(this, ExportCodePen);
        return possibleConstructorReturn(this, (ExportCodePen.__proto__ || Object.getPrototypeOf(ExportCodePen)).apply(this, arguments));
    }

    createClass(ExportCodePen, [{
        key: "template",
        value: function template() {
            return "\n            <form class='codepen' action=\"https://codepen.io/pen/define\" method=\"POST\" target=\"_blank\">\n                <input type=\"hidden\" name=\"data\" ref=\"$codepen\" value=''>\n                <button type=\"submit\">\n                    <div class='icon codepen'></div>\n                    <div class='titie'>CodePen</div>\n                </button>\n            </form>     \n        ";
        }
    }, {
        key: SUBMIT(),
        value: function value() {
            var generateCode = this.read(EXPORT_GENERATE_CODE);
            this.refs.$codepen.val(this.read(EXPORT_CODEPEN_CODE, {
                html: generateCode.html,
                css: generateCode.css
            }));

            return false;
        }
    }]);
    return ExportCodePen;
}(MenuItem);

var ExportJSFiddle = function (_MenuItem) {
    inherits(ExportJSFiddle, _MenuItem);

    function ExportJSFiddle() {
        classCallCheck(this, ExportJSFiddle);
        return possibleConstructorReturn(this, (ExportJSFiddle.__proto__ || Object.getPrototypeOf(ExportJSFiddle)).apply(this, arguments));
    }

    createClass(ExportJSFiddle, [{
        key: "template",
        value: function template() {
            return "\n            <form class='jsfiddle' action=\"http://jsfiddle.net/api/post/library/pure/\" method=\"POST\" target=\"_blank\">\n                <input type=\"hidden\" name=\"title\" ref=\"$title\" value=''>\n                <input type=\"hidden\" name=\"description\" ref=\"$description\" value=''>\n                <input type=\"hidden\" name=\"html\" ref=\"$html\" value=''>\n                <input type=\"hidden\" name=\"css\" ref=\"$css\" value=''>\n                <input type=\"hidden\" name=\"dtd\" value='html 5'>\n                <button type=\"submit\">\n                    <div class='icon jsfiddle'></div>\n                    <div class='titie'>JSFiddle</div>\n                </button>                \n            </form>     \n        ";
        }
    }, {
        key: SUBMIT(),
        value: function value() {
            var generateCode = this.read('export/generate/code');

            this.refs.$title.val('CSS Gradient Editor');
            this.refs.$description.val('EasyLogic Studio - https://css.easylogic.studio');
            this.refs.$html.val(generateCode.html);
            this.refs.$css.val(generateCode.css);

            return false;
        }
    }]);
    return ExportJSFiddle;
}(MenuItem);

var Rect = function (_Layer) {
    inherits(Rect, _Layer);

    function Rect() {
        classCallCheck(this, Rect);
        return possibleConstructorReturn(this, (Rect.__proto__ || Object.getPrototypeOf(Rect)).apply(this, arguments));
    }

    createClass(Rect, [{
        key: 'getDefaultTitle',
        value: function getDefaultTitle() {
            return 'Rectangle';
        }
    }, {
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(Rect.prototype.__proto__ || Object.getPrototypeOf(Rect.prototype), 'getDefaultObject', this).call(this, {
                type: 'rect'
            });
        }
    }]);
    return Rect;
}(Layer);

var Project = function (_Item) {
    inherits(Project, _Item);

    function Project() {
        classCallCheck(this, Project);
        return possibleConstructorReturn(this, (Project.__proto__ || Object.getPrototypeOf(Project)).apply(this, arguments));
    }

    createClass(Project, [{
        key: 'add',
        value: function add(item) {
            if (item.itemType == 'artboard') {
                return get$1(Project.prototype.__proto__ || Object.getPrototypeOf(Project.prototype), 'add', this).call(this, item);
            } else {
                throw new Error('It is able to only artboard in project ');
            }
        }
    }, {
        key: 'traverse',
        value: function traverse(item, depth, results) {
            var _this2 = this;

            if (item.isAttribute()) return;
            item.depth = depth;
            results.push(item);

            item.children.forEach(function (child) {
                _this2.traverse(child, depth + 1, results);
            });
        }
    }, {
        key: 'tree',
        value: function tree() {
            var _this3 = this;

            var results = [];

            this.artboards.forEach(function (artboard) {
                _this3.traverse(artboard, 1, results);
            });

            return results;
        }
    }, {
        key: 'getDefaultTitle',
        value: function getDefaultTitle() {
            return 'New Project';
        }
    }, {
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(Project.prototype.__proto__ || Object.getPrototypeOf(Project.prototype), 'getDefaultObject', this).call(this, _extends({
                itemType: 'project'
            }, obj));
        }
    }, {
        key: 'artboards',
        get: function get() {
            return this.children.filter(function (it) {
                return it.itemType === 'artboard';
            });
        }
    }, {
        key: 'layers',
        get: function get() {
            var results = [];
            this.artboards.forEach(function (artboard) {
                results.push.apply(results, toConsumableArray(artboard.allLayers));
            });

            return results;
        }
    }, {
        key: 'allItems',
        get: function get() {
            var results = [];
            this.artboards.forEach(function (artboard) {
                results.push.apply(results, [artboard].concat(toConsumableArray(artboard.allLayers)));
            });

            return results;
        }
    }]);
    return Project;
}(Item);

var AddRect = function (_MenuItem) {
    inherits(AddRect, _MenuItem);

    function AddRect() {
        classCallCheck(this, AddRect);
        return possibleConstructorReturn(this, (AddRect.__proto__ || Object.getPrototypeOf(AddRect)).apply(this, arguments));
    }

    createClass(AddRect, [{
        key: "getIcon",
        value: function getIcon() {
            return 'rect';
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return 'Rectangle';
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {
            this.add();
        }
    }, {
        key: "add",
        value: function add() {
            var project = editor$1.selection.currentProject;
            if (!project) {
                project = editor$1.addProject(new Project({ name: 'New Project' }));
                project.select();
            }

            var artboard = project.artboard || editor$1.selection.currentArtBoard;
            if (!artboard) {
                artboard = project.add(new ArtBoard({ name: 'New ArtBoard' }));
                artboard.select();
            }

            var current = editor$1.selection.current;

            var layer = current.add(new Rect());
            layer.select();

            this.emit(CHANGE_EDITOR);
        }
    }]);
    return AddRect;
}(MenuItem);

var Circle = function (_Layer) {
    inherits(Circle, _Layer);

    function Circle() {
        classCallCheck(this, Circle);
        return possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).apply(this, arguments));
    }

    createClass(Circle, [{
        key: "getDefaultTitle",
        value: function getDefaultTitle() {
            return 'Circle';
        }
    }, {
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(Circle.prototype.__proto__ || Object.getPrototypeOf(Circle.prototype), "getDefaultObject", this).call(this, {
                type: 'circle',
                width: Length$1.px(100),
                height: Length$1.px(100)
            });
        }

        /**
         * circle has only border-radius: 100%; 
         */

    }, {
        key: "toBorderRadiusCSS",
        value: function toBorderRadiusCSS() {
            var css = {
                'border-radius': Length$1.percent(100)
            };
            return css;
        }
    }]);
    return Circle;
}(Layer);

var AddCircle = function (_MenuItem) {
    inherits(AddCircle, _MenuItem);

    function AddCircle() {
        classCallCheck(this, AddCircle);
        return possibleConstructorReturn(this, (AddCircle.__proto__ || Object.getPrototypeOf(AddCircle)).apply(this, arguments));
    }

    createClass(AddCircle, [{
        key: "getIcon",
        value: function getIcon() {
            return 'circle';
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return 'Circle';
        }
    }, {
        key: "clickButton",
        value: function clickButton(e) {
            this.add();
        }
    }, {
        key: "add",
        value: function add() {
            var project = editor$1.selection.currentProject;
            if (!project) {
                project = editor$1.addProject(new Project({ name: 'New Project' }));
                project.select();
            }

            var artboard = project.artboard || editor$1.selection.currentArtBoard;
            if (!artboard) {
                artboard = project.add(new ArtBoard({ name: 'New ArtBoard' }));
                artboard.select();
            }

            var current = editor$1.selection.current;

            var layer = current.add(new Circle());
            layer.select();

            this.emit(CHANGE_EDITOR);
        }
    }]);
    return AddCircle;
}(MenuItem);

var menuItems = {
    AddRect: AddRect,
    AddCircle: AddCircle,
    ExportJSFiddle: ExportJSFiddle,
    ExportCodePen: ExportCodePen,
    Github: Github,
    Export: Export,
    Redo: Redo,
    Undo: Undo,
    Save: Save,
    ShowGrid: ShowGrid
};

var ToolMenu = function (_UIElement) {
    inherits(ToolMenu, _UIElement);

    function ToolMenu() {
        classCallCheck(this, ToolMenu);
        return possibleConstructorReturn(this, (ToolMenu.__proto__ || Object.getPrototypeOf(ToolMenu)).apply(this, arguments));
    }

    createClass(ToolMenu, [{
        key: 'components',
        value: function components() {
            return menuItems;
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n            <div class=\'tool-menu\'>\n                <div class=\'items left\'>\n                    <Undo />\n                    <Redo />\n                </div>\n                <div class="items left">\n                    <ShowGrid />\n                    <ShowClipPath />\n                    <ShowBackgroundImageSize />\n                </div>\n                <div class=\'items flex-2\'>\n                    <AddRect />\n                    <AddCircle />\n                </div>\n                <div class=\'items  right\'>\n                    <Save />\n                    <Export />\n                    <ExportCodePen />\n                    <ExportJSFiddle />\n                    <Github />\n                </div>                \n            </div>\n        ';
        }
    }]);
    return ToolMenu;
}(UIElement);

var BaseTab = function (_UIElement) {
    inherits(BaseTab, _UIElement);

    function BaseTab() {
        classCallCheck(this, BaseTab);
        return possibleConstructorReturn(this, (BaseTab.__proto__ || Object.getPrototypeOf(BaseTab)).apply(this, arguments));
    }

    createClass(BaseTab, [{
        key: "template",
        value: function template() {
            return "\n        <div class=\"tab\">\n            <div class=\"tab-header\" ref=\"$header\">\n                <div class=\"tab-item selected\" data-id=\"1\">1</div>\n                <div class=\"tab-item\" data-id=\"2\">2</div>\n            </div>\n            <div class=\"tab-body\" ref=\"$body\">\n                <div class=\"tab-content selected\" data-id=\"1\"></div>\n                <div class=\"tab-content\" data-id=\"2\"></div>\n            </div>\n        </div>\n        ";
        }
    }, {
        key: "isNotSelectedTab",
        value: function isNotSelectedTab(e) {
            return !e.$delegateTarget.hasClass('selected');
        }
    }, {
        key: CLICK('$header .tab-item') + IF('isNotSelectedTab'),
        value: function value$$1(e, $dt) {
            this.selectTab($dt.attr('data-id'));
        }
    }, {
        key: "selectTab",
        value: function selectTab(id) {

            this.selectedTabId = id;

            this.refs.$header.children().forEach(function ($dom) {
                $dom.toggleClass('selected', $dom.attr('data-id') == id);
            });

            this.refs.$body.children().forEach(function ($dom) {
                $dom.toggleClass('selected', $dom.attr('data-id') == id);
            });

            this.onTabShow();
        }
    }, {
        key: "onTabShow",
        value: function onTabShow() {}
    }, {
        key: "setScrollTabTitle",
        value: function setScrollTabTitle($scrollPanel) {
            var offset = $scrollPanel.offset();
            var $tabElementTitle = $scrollPanel.$(".tab-element-title");

            if (!$tabElementTitle) {
                $scrollPanel.append(new Dom('div', 'tab-element-title'));
                $tabElementTitle = $scrollPanel.$(".tab-element-title");
            }

            var elementsInViewport = $scrollPanel.children().map(function ($dom) {
                var rect = $dom.rect();
                if (offset.top <= rect.bottom) {
                    return { $dom: $dom, isElementInViewport: true };
                }
                return { $dom: $dom, isElementInViewport: false };
            });

            var title = EMPTY_STRING;
            if (elementsInViewport.length) {

                var viewElement = elementsInViewport.filter(function (it) {
                    return it.isElementInViewport;
                });

                if (viewElement.length) {
                    var $dom = viewElement[0].$dom;
                    var $title = $dom.$(".title");

                    if ($title && offset.top > $title.rect().bottom) {
                        title = $title.text();
                    }
                }
            }

            if (title) {
                if ($tabElementTitle.css('display') == 'none') {
                    $tabElementTitle.show();
                }
                $tabElementTitle.px('top', $scrollPanel.scrollTop()).text(title);
            } else {
                $tabElementTitle.hide();
            }
        }
    }]);
    return BaseTab;
}(UIElement);

var RepeatingLinearGradient = function (_LinearGradient) {
    inherits(RepeatingLinearGradient, _LinearGradient);

    function RepeatingLinearGradient() {
        classCallCheck(this, RepeatingLinearGradient);
        return possibleConstructorReturn(this, (RepeatingLinearGradient.__proto__ || Object.getPrototypeOf(RepeatingLinearGradient)).apply(this, arguments));
    }

    createClass(RepeatingLinearGradient, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(RepeatingLinearGradient.prototype.__proto__ || Object.getPrototypeOf(RepeatingLinearGradient.prototype), "getDefaultObject", this).call(this, { type: 'repeating-linear-gradient', angle: 0 });
        }
    }]);
    return RepeatingLinearGradient;
}(LinearGradient);

var _DEFINED_POSITIONS$1;

var DEFINED_POSITIONS$1 = (_DEFINED_POSITIONS$1 = {}, defineProperty(_DEFINED_POSITIONS$1, 'center', true), defineProperty(_DEFINED_POSITIONS$1, 'top', true), defineProperty(_DEFINED_POSITIONS$1, 'left', true), defineProperty(_DEFINED_POSITIONS$1, 'right', true), defineProperty(_DEFINED_POSITIONS$1, 'bottom', true), _DEFINED_POSITIONS$1);

var RadialGradient = function (_Gradient) {
    inherits(RadialGradient, _Gradient);

    function RadialGradient() {
        classCallCheck(this, RadialGradient);
        return possibleConstructorReturn(this, (RadialGradient.__proto__ || Object.getPrototypeOf(RadialGradient)).apply(this, arguments));
    }

    createClass(RadialGradient, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(RadialGradient.prototype.__proto__ || Object.getPrototypeOf(RadialGradient.prototype), "getDefaultObject", this).call(this, _extends({
                type: 'radial-gradient',
                radialType: 'ellipse'
            }, obj));
        }
    }, {
        key: "isRadial",
        value: function isRadial() {
            return true;
        }
    }, {
        key: "toString",
        value: function toString() {
            var colorString = this.getColorString();
            var json = this.json;
            var opt = EMPTY_STRING;
            var radialType = json.radialType;
            var radialPosition = json.radialPosition || ['center', 'center'];

            radialPosition = DEFINED_POSITIONS$1[radialPosition] ? radialPosition : radialPosition.join(WHITE_STRING$1);

            opt = radialPosition ? radialType + " at " + radialPosition : radialType;

            return json.type + "(" + opt + ", " + colorString + ")";
        }
    }]);
    return RadialGradient;
}(Gradient);

var RepeatingRadialGradient = function (_RadialGradient) {
    inherits(RepeatingRadialGradient, _RadialGradient);

    function RepeatingRadialGradient() {
        classCallCheck(this, RepeatingRadialGradient);
        return possibleConstructorReturn(this, (RepeatingRadialGradient.__proto__ || Object.getPrototypeOf(RepeatingRadialGradient)).apply(this, arguments));
    }

    createClass(RepeatingRadialGradient, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(RepeatingRadialGradient.prototype.__proto__ || Object.getPrototypeOf(RepeatingRadialGradient.prototype), "getDefaultObject", this).call(this, { type: 'repeating-radial-gradient', angle: 0 });
        }
    }]);
    return RepeatingRadialGradient;
}(RadialGradient);

var _DEFINED_POSITIONS$2;

var DEFINED_POSITIONS$2 = (_DEFINED_POSITIONS$2 = {}, defineProperty(_DEFINED_POSITIONS$2, 'center', true), defineProperty(_DEFINED_POSITIONS$2, 'top', true), defineProperty(_DEFINED_POSITIONS$2, 'left', true), defineProperty(_DEFINED_POSITIONS$2, 'right', true), defineProperty(_DEFINED_POSITIONS$2, 'bottom', true), _DEFINED_POSITIONS$2);

var DEFINED_ANGLES$3 = {
    'to top': 0,
    'to top right': 45,
    'to right': 90,
    'to bottom right': 135,
    'to bottom': 180,
    'to bottom left': 225,
    'to left': 270,
    'to top left': 315

};

var ConicGradient = function (_Gradient) {
    inherits(ConicGradient, _Gradient);

    function ConicGradient() {
        classCallCheck(this, ConicGradient);
        return possibleConstructorReturn(this, (ConicGradient.__proto__ || Object.getPrototypeOf(ConicGradient)).apply(this, arguments));
    }

    createClass(ConicGradient, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return get$1(ConicGradient.prototype.__proto__ || Object.getPrototypeOf(ConicGradient.prototype), "getDefaultObject", this).call(this, _extends({
                type: 'conic-gradient',
                angle: 0,
                radialPosition: [Position$1.CENTER, Position$1.CENTER]
            }, obj));
        }
    }, {
        key: "isConic",
        value: function isConic() {
            return true;
        }
    }, {
        key: "hasAngle",
        value: function hasAngle() {
            return true;
        }
    }, {
        key: "getColorString",
        value: function getColorString() {
            var colorsteps = this.colorsteps;
            if (!colorsteps) return EMPTY_STRING;

            colorsteps.sort(function (a, b) {
                if (a.percent == b.percent) {
                    if (a.index > b.index) return 1;
                    if (a.index < b.index) return 0;
                    return 0;
                }
                return a.percent > b.percent ? 1 : -1;
            });

            var newColors = [];
            colorsteps.forEach(function (c, index) {
                if (c.cut && index > 0) {
                    var prevItem = colorsteps[index - 1];
                    newColors.push(new ColorStep({
                        color: c.color,
                        unit: prevItem.unit,
                        percent: prevItem.percent,
                        px: prevItem.px,
                        em: prevItem.em
                    }));
                }

                newColors.push(c);
            });

            return newColors.map(function (f) {
                var deg$$1 = Math.floor(f.percent * 3.6);
                return f.color + " " + deg$$1 + "deg";
            }).join(',');
        }
    }, {
        key: "toString",
        value: function toString() {
            var colorString = this.getColorString();

            var opt = [];
            var json = this.json;
            var conicAngle = json.angle;
            var conicPosition = json.radialPosition;

            conicPosition = DEFINED_POSITIONS$2[conicPosition] ? conicPosition : conicPosition.join(WHITE_STRING$1);

            if (isNotUndefined(conicAngle)) {
                conicAngle = +(DEFINED_ANGLES$3[conicAngle] || conicAngle);
                opt.push("from " + conicAngle + "deg");
            }

            if (conicPosition) {
                opt.push("at " + conicPosition);
            }

            var optString = opt.length ? opt.join(WHITE_STRING$1) + ',' : EMPTY_STRING;

            return json.type + "(" + optString + " " + colorString + ")";
        }
    }]);
    return ConicGradient;
}(Gradient);

var RepeatingConicGradient = function (_ConicGradient) {
    inherits(RepeatingConicGradient, _ConicGradient);

    function RepeatingConicGradient() {
        classCallCheck(this, RepeatingConicGradient);
        return possibleConstructorReturn(this, (RepeatingConicGradient.__proto__ || Object.getPrototypeOf(RepeatingConicGradient)).apply(this, arguments));
    }

    createClass(RepeatingConicGradient, [{
        key: "getDefaultObject",
        value: function getDefaultObject() {
            return get$1(RepeatingConicGradient.prototype.__proto__ || Object.getPrototypeOf(RepeatingConicGradient.prototype), "getDefaultObject", this).call(this, { type: 'repeating-conic-gradient' });
        }
    }]);
    return RepeatingConicGradient;
}(ConicGradient);

var GradientClassList = {
    'linear': LinearGradient,
    'repeating-linear': RepeatingLinearGradient,
    'radial': RadialGradient,
    'repeating-radial': RepeatingRadialGradient,
    'conic': ConicGradient,
    'conic-linear': RepeatingConicGradient
};

var BasicGradient = function (_UIElement) {
    inherits(BasicGradient, _UIElement);

    function BasicGradient() {
        classCallCheck(this, BasicGradient);
        return possibleConstructorReturn(this, (BasicGradient.__proto__ || Object.getPrototypeOf(BasicGradient)).apply(this, arguments));
    }

    createClass(BasicGradient, [{
        key: "template",
        value: function template() {

            return "\n        <div class=\"gradient-sample-list\">\n            <h1>Basic gradient</h1>\n            <div class='gradient-type' ref=\"$gradientType\">\n                <div>\n                    <div class=\"gradient-item linear\" data-type=\"linear\" title=\"Linear\"></div>\n                    <div class=\"gradient-item radial\" data-type=\"radial\" title=\"Radial\"></div>\n                    <div class=\"gradient-item conic\" data-type=\"conic\" title=\"Conic\"></div>                            \n                    <div class=\"gradient-item static\" data-type=\"static\" title=\"Static\"></div>                                                    \n                </div>\n                <div>\n                    <div class=\"gradient-item repeating-linear\" data-type=\"repeating-linear\" title=\"Linear\"></div>\n                    <div class=\"gradient-item repeating-radial\" data-type=\"repeating-radial\" title=\"Radial\"></div>\n                    <div class=\"gradient-item repeating-conic\" data-type=\"repeating-conic\" title=\"Conic\"></div>                            \n\n                    <div class=\"gradient-item image\" data-type=\"image\" title=\"Image\">\n                        <div>\n                            <div class=\"m1\"></div>\n                            <div class=\"m2\"></div>\n                            <div class=\"m3\"></div> \n                        </div>\n                    </div>                                                  \n                </div>\n            </div>\n        </div>\n        ";
        }
    }, {
        key: CLICK('$gradientType .gradient-item'),
        value: function value(e) {
            var image = editor$1.selection.layer.addBackgroundImage(new BackgroundImage$1({
                index: -1
            }));

            var type = e.$delegateTarget.attr('data-type');

            var gradient,
                GradientClass = GradientClassList[type];
            gradient = image.add(new GradientClass());
            gradient.addColorStep(new ColorStep({ color: 'rgba(255, 255, 255, 0)', precent: 0 }));
            gradient.addColorStep(new ColorStep({ color: 'rgba(222, 222, 222, 1)', precent: 100 }));

            image.select();
        }
    }]);
    return BasicGradient;
}(UIElement);

var COLLECT_IMAGE_ONE = 'collect/image/one';







var COLLECT_PAGE_ONE = 'collect/page/one';

var GradientSampleList = function (_UIElement) {
    inherits(GradientSampleList, _UIElement);

    function GradientSampleList() {
        classCallCheck(this, GradientSampleList);
        return possibleConstructorReturn(this, (GradientSampleList.__proto__ || Object.getPrototypeOf(GradientSampleList)).apply(this, arguments));
    }

    createClass(GradientSampleList, [{
        key: "initialize",
        value: function initialize() {
            get$1(GradientSampleList.prototype.__proto__ || Object.getPrototypeOf(GradientSampleList.prototype), "initialize", this).call(this);

            this.list = this.read('gradient/list/sample', this.props.type);
            this.dispatch(STORAGE_LOAD_IMAGE);
        }
    }, {
        key: "template",
        value: function template() {

            return "\n        <div class=\"gradient-sample-list\">\n            <div class='layer-title'>User gradient</div>\n            <div class='cached-list' ref=\"$cachedList\"></div>\n        </div>\n        ";
        }
    }, {
        key: LOAD('$cachedList'),
        value: function value() {
            var _this2 = this;

            var list = this.list.map(function (item, index) {
                var newImage = _extends({}, item.image, { colorsteps: item.colorsteps });
                return "\n            <div class='gradient-sample-item' data-index=\"" + index + "\">\n                <div class='preview' style='" + _this2.read(IMAGE_TO_STRING, newImage) + "'></div>                \n                <div class='item-tools'>\n                    <button type=\"button\" class='add-item'  data-index=\"" + index + "\" title=\"Addd\">&times;</button>                \n                    <button type=\"button\" class='change-item'  data-index=\"" + index + "\" title=\"Change\"></button>\n                </div>          \n            </div>";
            });

            var storageList = this.read(STORAGE_IMAGES).map(function (item, index) {
                var newImage = _extends({}, item.image, { colorsteps: item.colorsteps });
                return "\n                <div class='gradient-cached-item' data-index=\"" + index + "\">\n                    <div class='preview' style='" + _this2.read(IMAGE_TO_STRING, newImage) + "'></div>                \n                    <div class='item-tools'>\n                        <button type=\"button\" class='add-item'  data-index=\"" + index + "\" title=\"Add\">&times;</button>                \n                        <button type=\"button\" class='change-item'  data-index=\"" + index + "\" title=\"Change\"></button>\n                    </div>          \n                </div>\n            ";
            });

            var results = [].concat(toConsumableArray(list), toConsumableArray(storageList), ["<button type=\"button\" class=\"add-current-image\" title=\"Cache a image\">+</button>"]);

            var emptyCount = 5 - results.length % 5;

            var arr = repeat$1(emptyCount);

            arr.forEach(function (it) {
                results.push("<div class='empty'></div>");
            });

            return results;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: EVENT('changeStorage'),
        value: function value() {
            this.refresh();
        }
    }, {
        key: CLICK('$el .gradient-sample-item .change-item'),
        value: function value(e) {
            var index = +e.$delegateTarget.attr('data-index');

            this.dispatch('gradient/select', this.props.type, index);
        }
    }, {
        key: CLICK('$el .gradient-sample-item .add-item'),
        value: function value(e) {
            var index = +e.$delegateTarget.attr('data-index');

            this.dispatch('gradient/add', this.props.type, index);
        }
    }, {
        key: CLICK('$el .gradient-cached-item .add-item'),
        value: function value(e) {
            var index = +e.$delegateTarget.attr('data-index');
            var image = this.read(STORAGE_IMAGES, index);
            var newImage = _extends({}, image.image, { colorsteps: image.colorsteps });

            this.dispatch('gradient/image/add', this.read(ITEM_CONVERT_STYLE, newImage));
        }
    }, {
        key: CLICK('$el .gradient-cached-item .change-item'),
        value: function value(e) {
            var index = +e.$delegateTarget.attr('data-index');
            var image = this.read(STORAGE_IMAGES, index);
            var newImage = _extends({}, image.image, { colorsteps: image.colorsteps });

            this.dispatch('gradient/image/select', this.read(ITEM_CONVERT_STYLE, newImage));
        }
    }, {
        key: CLICK('$el .add-current-image'),
        value: function value(e) {
            var _this3 = this;

            this.read(SELECTION_CURRENT_IMAGE_ID, function (id) {
                var newImage = _this3.read(COLLECT_IMAGE_ONE, id);

                _this3.dispatch(STORAGE_ADD_IMAGE, newImage);
                _this3.refresh();
            });
        }
    }]);
    return GradientSampleList;
}(UIElement);

var LAYER_LIST_SAMPLE = 'layer/list/sample';

var LAYER_CACHE_TO_STRING = 'layer/cache/toString';

var LayerSampleList = function (_UIElement) {
    inherits(LayerSampleList, _UIElement);

    function LayerSampleList() {
        classCallCheck(this, LayerSampleList);
        return possibleConstructorReturn(this, (LayerSampleList.__proto__ || Object.getPrototypeOf(LayerSampleList)).apply(this, arguments));
    }

    createClass(LayerSampleList, [{
        key: "initialize",
        value: function initialize() {
            get$1(LayerSampleList.prototype.__proto__ || Object.getPrototypeOf(LayerSampleList.prototype), "initialize", this).call(this);

            this.list = this.read(LAYER_LIST_SAMPLE, this.props.type);
            this.dispatch(STORAGE_LOAD_LAYER);
        }
    }, {
        key: "template",
        value: function template() {

            return "\n        <div class=\"layer-sample-list\">\n            <div class='layer-title'>User Layer</div>        \n            <div class='cached-list' ref=\"$cachedList\"></div>\n        </div>\n        ";
        }
    }, {
        key: LOAD('$cachedList'),
        value: function value$$1() {
            var _mapGetters = this.mapGetters(LAYER_CACHE_TO_STRING, STORAGE_LAYERS),
                _mapGetters2 = slicedToArray(_mapGetters, 2),
                cache_to_string = _mapGetters2[0],
                storage_layers = _mapGetters2[1];

            var list = this.list.map(function (item, index) {

                var data = cache_to_string(item);

                var rateX = 60 / unitValue(data.obj.width);
                var rateY = 62 / unitValue(data.obj.height);

                var transform = "transform: scale(" + rateX + " " + rateY + ")";

                return "\n            <div class='layer-sample-item'  data-sample-id=\"" + item.id + "\">\n                <div class=\"layer-view\" style=\"" + data.css + "; " + transform + "\"></div>\n\n                <div class='item-tools'>\n                    <button type=\"button\" class='add-item'  data-index=\"" + index + "\" title=\"Addd\">&times;</button>\n                </div>          \n            </div>";
            });

            var storageList = storage_layers().map(function (item) {
                var data = cache_to_string(item);

                var rateX = 60 / unitValue(item.layer.width);
                var rateY = 62 / unitValue(item.layer.height);

                var minRate = Math.min(rateY, rateX);

                var transform = "transform-origin: left top;transform: scale(" + minRate + ")";

                return "\n                <div class='layer-cached-item' data-sample-id=\"" + item.id + "\">\n                    <div class=\"layer-view\" style=\"" + data.css + "; " + transform + "\"></div>\n                    <div class='item-tools'>\n                        <button type=\"button\" class='add-item'  data-sample-id=\"" + item.id + "\" title=\"Add\">&times;</button>                \n                        <button type=\"button\" class='delete-item'  data-sample-id=\"" + item.id + "\" title=\"Delete\">&times;</button>\n                    </div>          \n                </div>\n            ";
            });

            var results = [].concat(toConsumableArray(list), toConsumableArray(storageList), ["<button type=\"button\" class=\"add-current-layer\" title=\"Cache a layer\">+</button>"]);

            var emptyCount = 5 - results.length % 5;

            var arr = repeat(emptyCount);

            arr.forEach(function (it) {
                results.push("<div class='empty'></div>");
            });

            return results;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: EVENT('changeStorage'),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: CLICK('$el .layer-sample-item .add-item'),
        value: function value$$1(e) {
            var index = +e.$delegateTarget.attr('data-index');

            var newLayer = this.list[index];

            if (newLayer) {
                editor$1.selection.addCurrent(newLayer);
            }
        }
    }, {
        key: CLICK('$el .layer-cached-item .add-item'),
        value: function value$$1(e) {
            var newLayer = editor$1.storage.get(e.$delegateTarget.attr('data-sample-id'));

            if (newLayer) {
                editor$1.selection.addCurrent(newLayer);
            }
        }
    }, {
        key: CLICK('$el .layer-cached-item .delete-item'),
        value: function value$$1(e) {
            var sampleId = e.$delegateTarget.attr('data-sample-id');
            editor$1.storage.layerList.remove(sampleId);
        }
    }, {
        key: CLICK('$el .add-current-layer'),
        value: function value$$1(e) {
            var rect = new Rect();
            editor$1.selection.addCurrent(rect);
            rect.select();
        }
    }]);
    return LayerSampleList;
}(UIElement);

var SHAPE_LIST = 'shape/list';
var SHAPE_GET = 'shape/get';


var SHAPE_TO_CSS_TEXT = 'shape/toCSSText';

var Shape = function (_Layer) {
    inherits(Shape, _Layer);

    function Shape() {
        classCallCheck(this, Shape);
        return possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).apply(this, arguments));
    }

    createClass(Shape, [{
        key: 'getDefaultTitle',
        value: function getDefaultTitle() {
            return 'Shape';
        }
    }, {
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            return get$1(Shape.prototype.__proto__ || Object.getPrototypeOf(Shape.prototype), 'getDefaultObject', this).call(this, { type: 'shape' });
        }
    }]);
    return Shape;
}(Layer);

var _templateObject$17 = taggedTemplateLiteral(["\n            <div class='shapes'>         \n                <div class='layer-title'>Basic Layer</div>\n                <div class=\"shapes-list\" ref=\"$shapeList\">\n                    ", "\n                </div>\n            </div>\n        "], ["\n            <div class='shapes'>         \n                <div class='layer-title'>Basic Layer</div>\n                <div class=\"shapes-list\" ref=\"$shapeList\">\n                    ", "\n                </div>\n            </div>\n        "]);

var ShapeListView = function (_UIElement) {
    inherits(ShapeListView, _UIElement);

    function ShapeListView() {
        classCallCheck(this, ShapeListView);
        return possibleConstructorReturn(this, (ShapeListView.__proto__ || Object.getPrototypeOf(ShapeListView)).apply(this, arguments));
    }

    createClass(ShapeListView, [{
        key: "template",
        value: function template() {
            var _this2 = this;

            return html(_templateObject$17, this.read(SHAPE_LIST).map(function (key) {
                return "<button type=\"button\" class='add-layer' data-shape='" + key + "'>\n                            <div class='shape' style='" + _this2.read(SHAPE_TO_CSS_TEXT, key) + "'></div>\n                        </button>";
            }));
        }
    }, {
        key: CLICK('$shapeList .add-layer'),
        value: function value(e) {
            var $button = e.$delegateTarget;
            var key = $button.attr('data-shape');

            editor$1.selection.add(new Shape({ data: this.read(SHAPE_GET, key) }));
        }
    }]);
    return ShapeListView;
}(UIElement);

var ProjectListView = function (_UIElement) {
    inherits(ProjectListView, _UIElement);

    function ProjectListView() {
        classCallCheck(this, ProjectListView);
        return possibleConstructorReturn(this, (ProjectListView.__proto__ || Object.getPrototypeOf(ProjectListView)).apply(this, arguments));
    }

    createClass(ProjectListView, [{
        key: "template",
        value: function template() {
            return "\n        <div class='project-list-view'>         \n            <div class='project-toolbar'>\n                <span class='title'>Project</span>\n                <span class='project-tools'>\n                    <div class=\"button-group\">\n                        <button type=\"button\" ref=\"$addProject\">" + icon.add + "</button>\n                    </div>\n                </span>\n            </div>\n            <div class=\"project-list\" ref=\"$projectList\"></div>\n        </div>";
        }
    }, {
        key: "makeItemNodeProject",
        value: function makeItemNodeProject(project) {
            var selected = project.selected ? 'selected' : EMPTY_STRING;
            return "<div class='tree-item " + selected + "' item-id=\"" + project.id + "\" type='project'>\n            <div class=\"item-title\">" + project.title + "</div>   \n        </div>";
        }
    }, {
        key: LOAD('$projectList'),
        value: function value$$1() {
            var _this2 = this;

            return editor$1.projects.map(function (project) {
                return _this2.makeItemNodeProject(project);
            });
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: "toggleSelectedItem",
        value: function toggleSelectedItem(id) {
            var selected = this.refs.$projectList.$('.selected');
            if (selected) {
                selected.removeClass('selected');
            }

            var item = this.refs.$projectList.$("[item-id=\"" + id + "\"]");
            if (item) {
                item.addClass('selected');
            }
        }
    }, {
        key: "refreshSelection",
        value: function refreshSelection() {
            var project = editor$1.selection.currentProject;
            if (project) {
                this.toggleSelectedItem(project.id);
            }
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: EVENT(CHANGE_SELECTION),
        value: function value$$1() {
            this.refreshSelection();
        }
    }, {
        key: CLICK('$addProject'),
        value: function value$$1(e) {
            var project = editor$1.addProject(new Project({ name: 'New Project' }));
            project.select();
            editor$1.send(CHANGE_EDITOR);
        }
    }]);
    return ProjectListView;
}(UIElement);

var Directory = function (_Item) {
    inherits(Directory, _Item);

    function Directory() {
        classCallCheck(this, Directory);
        return possibleConstructorReturn(this, (Directory.__proto__ || Object.getPrototypeOf(Directory)).apply(this, arguments));
    }

    createClass(Directory, [{
        key: 'getDefaultTitle',
        value: function getDefaultTitle() {
            return 'Directory';
        }
    }, {
        key: 'add',
        value: function add(item) {
            if (item.itemType == 'directory' || item.itemType == 'layer') {
                return get$1(Directory.prototype.__proto__ || Object.getPrototypeOf(Directory.prototype), 'add', this).call(this, item);
            } else {
                throw new Error('잘못된 객체입니다.');
            }
        }
    }, {
        key: 'getDefaultObject',
        value: function getDefaultObject() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return _extends({}, get$1(Directory.prototype.__proto__ || Object.getPrototypeOf(Directory.prototype), 'getDefaultObject', this).call(this), { itemType: 'directory' }, obj);
        }
    }, {
        key: 'directories',
        get: function get() {
            return this.search({ itemType: 'directory' });
        }
    }, {
        key: 'layers',
        get: function get() {
            return this.search({ itemType: 'layer' });
        }
    }, {
        key: 'texts',
        get: function get() {
            return this.search({ itemType: 'layer', type: 'text' });
        }
    }, {
        key: 'images',
        get: function get() {
            return this.search({ itemType: 'layer', type: 'image' });
        }
    }]);
    return Directory;
}(Item);

var _templateObject$18 = taggedTemplateLiteral(["\n            <div class='tree-item depth-", " ", " ", "' item-id=\"", "\" item-type='", "' ", ">\n                <div class=\"item-depth\"></div>            \n                ", "\n                ", "\n                <div class=\"item-title\"> ", "</div> \n                <div class='item-tools'>          \n                    ", "\n                    ", "\n                    <button type=\"button\" class='delete-item' title=\"Remove\">", "</button>\n                    <button type=\"button\" class='copy-item' title=\"Copy\">", "</button>\n                </div>                \n            </div>\n            ", "\n        "], ["\n            <div class='tree-item depth-", " ", " ", "' item-id=\"", "\" item-type='", "' ", ">\n                <div class=\"item-depth\"></div>            \n                ", "\n                ", "\n                <div class=\"item-title\"> ", "</div> \n                <div class='item-tools'>          \n                    ", "\n                    ", "\n                    <button type=\"button\" class='delete-item' title=\"Remove\">", "</button>\n                    <button type=\"button\" class='copy-item' title=\"Copy\">", "</button>\n                </div>                \n            </div>\n            ", "\n        "]);
var _templateObject2$4 = taggedTemplateLiteral(["<div class='tree-children'>\n                ", "\n            </div>"], ["<div class='tree-children'>\n                ", "\n            </div>"]);

var LayerListView = function (_UIElement) {
    inherits(LayerListView, _UIElement);

    function LayerListView() {
        classCallCheck(this, LayerListView);
        return possibleConstructorReturn(this, (LayerListView.__proto__ || Object.getPrototypeOf(LayerListView)).apply(this, arguments));
    }

    createClass(LayerListView, [{
        key: "template",
        value: function template() {
            return "\n            <div class='layer-list-view'>\n                <div class=\"layer-list-toolbar\">\n                    <span class='title' ref=\"$title\"></span>\n                    <span class='layer-tools'>\n                        <div class=\"button-group\">\n                            <button type=\"button\" ref=\"$addArtBoard\" title=\"add ArtBoard\">" + icon.add_note + "</button>\n                            <button type=\"button\" ref=\"$addDirectory\" title=\"add Directory\">" + icon.create_folder + "</button>\n                        </div>\n                    </span> \n                </div>\n                <div class=\"layer-list\" ref=\"$layerList\"></div>\n            </div>\n        ";
        }
    }, {
        key: "makeItem",
        value: function makeItem(item, depth) {
            var _this2 = this;

            var isArtBoard = item.itemType == 'artboard';
            var isDirectory = item.itemType == 'directory';
            var isLayer = item.itemType == 'layer';

            var children = item.children;

            var isGroup = isArtBoard || isDirectory || children.length;
            var hasLock = isDirectory || isLayer;
            var isDraggable = isLayer;
            var hasIcon = isArtBoard || isDirectory || isLayer;
            var hasVisible = isDirectory || isLayer;

            var draggable = isDraggable ? 'draggable="true"' : EMPTY_STRING;
            var lock = hasLock && item.lock ? 'lock' : EMPTY_STRING;
            var visible = item.visible ? 'visible' : EMPTY_STRING;
            var selected = item.selectedOne ? 'selected' : EMPTY_STRING;

            var iconString = EMPTY_STRING;
            if (isArtBoard) {
                iconString = "" + icon.artboard;
            } else if (isDirectory) {
                iconString = "" + icon.folder;
            } else if (isLayer) {
                iconString = "<span class='icon-" + item.type + "'></span>";
            }

            return html(_templateObject$18, depth, selected, item.index, item.id, item.itemType, draggable, isGroup && "<div class='item-icon-group'>" + icon.chevron_right + "</div>", !isGroup && hasIcon && "<div class='item-icon'>" + iconString + "</div>", item.title, hasLock && "<button type=\"button\" class='lock-item " + lock + "' title=\"Visible\">" + icon.lock + "</button>", hasVisible && "<button type=\"button\" class='visible-item " + visible + "' title=\"Visible\">" + icon.visible + "</button>", icon.remove, icon.copy, isGroup && html(_templateObject2$4, item.children.map(function (child) {
                return _this2.makeItem(child, depth + 1);
            })));
        }
    }, {
        key: LOAD('$title'),
        value: function value$$1() {
            var project = editor$1.selection.currentProject;
            var title = project ? project.title : 'ArtBoard';
            return "<span>" + title + "</span>";
        }
    }, {
        key: LOAD('$layerList'),
        value: function value$$1() {
            var _this3 = this;

            var project = editor$1.selection.currentProject || editor$1.selection.project;
            if (!project) return EMPTY_STRING;

            return project.artboards.map(function (item, index) {
                return _this3.makeItem(item, 0, index);
            });
        }
    }, {
        key: "refresh",
        value: function refresh() {
            console.log('load');
            this.load();
        }
    }, {
        key: "refreshSelection",
        value: function refreshSelection(id) {
            var $selected = this.$el.$(".selected");

            if ($selected) {
                $selected.removeClass('selected');
            }

            this.$el.$("[id=\"" + id + "\"]").addClass('selected');
        }

        // all effect 

    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: EVENT(CHANGE_SELECTION),
        value: function value$$1() {
            var current = editor$1.selection.current;
            if (current) {
                this.toggleSelectedItem(current.id);
            }
        }
    }, {
        key: CLICK('$addArtBoard'),
        value: function value$$1() {
            var project = editor$1.selection.currentProject;
            if (project) {
                var artboard = project.addArtBoard(new ArtBoard({
                    name: 'New ArtBoard'
                }));
                artboard.select();
                editor$1.send(CHANGE_EDITOR);
            }
        }
    }, {
        key: CLICK('$addDirectory'),
        value: function value$$1() {
            var currentItem = editor$1.selection.current;
            if (currentItem) {

                if (currentItem instanceof ArtBoard || currentItem instanceof Directory) {
                    var directory = currentItem.add(new Directory({
                        name: 'New Directory'
                    }));
                } else if (currentItem instanceof Layer) {
                    var directory = currentItem.parentDirectory().add(new Directory({
                        name: 'New Directory',
                        index: currentItem.index + 1
                    }));
                }
                directory.select();
                this.refresh();
                editor$1.send(CHANGE_SELECTION);
            }
        }
    }, {
        key: "toggleSelectedItem",
        value: function toggleSelectedItem(id) {
            var selected = this.refs.$layerList.$('.selected');
            if (selected) {
                selected.removeClass('selected');
            }

            var item = this.refs.$layerList.$("[item-id=\"" + id + "\"]");
            if (item) {
                item.addClass('selected');
            }
        }
    }, {
        key: "getItem",
        value: function getItem(e) {
            var $dt = e.$delegateTarget.closest('tree-item');
            var id = $dt.attr('item-id');
            var item = editor$1.get(id);

            return { item: item, $dt: $dt };
        }
    }, {
        key: CLICK('$layerList .copy-item'),
        value: function value$$1(e) {
            var _getItem = this.getItem(e),
                item = _getItem.item;

            item.copy();

            editor$1.emit(CHANGE_EDITOR);
        }
    }, {
        key: CLICK('$layerList .delete-item'),
        value: function value$$1(e) {
            var _getItem2 = this.getItem(e),
                item = _getItem2.item;

            item.remove();
            editor$1.emit(CHANGE_EDITOR, null, this);
        }
    }, {
        key: CLICK('$layerList .visible-item'),
        value: function value$$1(e) {
            var _getItem3 = this.getItem(e),
                item = _getItem3.item;

            e.$delegateTarget.toggleClass('visible');
            item.toggle('visible');

            editor$1.emit(CHANGE_LAYER, null, this);
        }
    }, {
        key: CLICK('$layerList .lock-item'),
        value: function value$$1(e) {
            var _getItem4 = this.getItem(e),
                item = _getItem4.item;

            e.$delegateTarget.toggleClass('lock');
            item.toggle('lock');

            editor$1.emit(CHANGE_LAYER, null, this);
        }
    }, {
        key: CLICK('$layerList .item-icon-group'),
        value: function value$$1(e) {
            var _getItem5 = this.getItem(e),
                item = _getItem5.item,
                $dt = _getItem5.$dt;

            item.collapsed = true;
            $dt.toggleClass('collapsed');
        }
    }, {
        key: CLICK('$layerList .item-title'),
        value: function value$$1(e) {
            var _getItem6 = this.getItem(e),
                item = _getItem6.item;

            this.toggleSelectedItem(item.id);
            item.select();
            editor$1.send(CHANGE_SELECTION, null, this);
        }
    }, {
        key: DRAGSTART('$layerList .tree-item'),
        value: function value$$1(e) {
            this.draggedLayer = e.$delegateTarget;
            this.draggedLayerId = e.$delegateTarget.attr('item-id');
            this.draggedLayer.css('opacity', 0.5).css('background-color', 'yellow');
            e.dataTransfer.setData('text', e.$delegateTarget.attr('item-id'));
            this.$el.addClass('dragging');
        }
    }, {
        key: DRAGEND('$layerList .tree-item'),
        value: function value$$1(e) {
            if (this.draggedLayer) {
                this.draggedLayer.css('opacity', 1).css('background-color', '');
                this.draggedLayer = null;
                this.draggedLayerId = null;
            }
            this.$el.removeClass('dragging');
        }
    }, {
        key: DRAGOVER('$layerList .tree-item') + PREVENT,
        value: function value$$1(e) {
            // PREVENT
        }
    }, {
        key: DROP('$layerList .tree-item') + SELF + PREVENT,
        value: function value$$1(e) {
            var $item = e.$delegateTarget;
            if (this.draggedLayerId) {
                var source = editor$1.get(this.draggedLayerId);
                var target = editor$1.get($item.attr('item-id'));

                target.insertLast(source);
                source.select();

                editor$1.send(CHANGE_EDITOR);
            }

            this.$el.removeClass('dragging');
        }
    }]);
    return LayerListView;
}(UIElement);

var ITEM_ADD_CACHE = 'item/addCache';

var PAGE_CACHE_TO_STRING = 'page/cache/toString';

var _templateObject$19 = taggedTemplateLiteral(["\n            <div class='page-sample-item'  data-sample-id=\"", "\">\n                <div class=\"page-view\" style=\"", "; ", "\">\n                ", "\n                </div>\n\n                <div class='item-tools'>\n                    <button type=\"button\" class='add-item'  data-index=\"", "\" title=\"Addd\">&times;</button>\n                </div>           \n            </div>"], ["\n            <div class='page-sample-item'  data-sample-id=\"", "\">\n                <div class=\"page-view\" style=\"", "; ", "\">\n                ", "\n                </div>\n\n                <div class='item-tools'>\n                    <button type=\"button\" class='add-item'  data-index=\"", "\" title=\"Addd\">&times;</button>\n                </div>           \n            </div>"]);
var _templateObject2$5 = taggedTemplateLiteral(["\n                <div class='page-cached-item' data-sample-id=\"", "\">\n                    <div class=\"page-view\" style=\"", "; ", "\">\n                    ", "\n                    </div>\n                    <div class='item-tools'>\n                        <button type=\"button\" class='add-item'  data-sample-id=\"", "\" title=\"Add\">&times;</button>                \n                        <button type=\"button\" class='delete-item'  data-sample-id=\"", "\" title=\"Delete\">&times;</button>\n                    </div>          \n                </div>\n            "], ["\n                <div class='page-cached-item' data-sample-id=\"", "\">\n                    <div class=\"page-view\" style=\"", "; ", "\">\n                    ", "\n                    </div>\n                    <div class='item-tools'>\n                        <button type=\"button\" class='add-item'  data-sample-id=\"", "\" title=\"Add\">&times;</button>                \n                        <button type=\"button\" class='delete-item'  data-sample-id=\"", "\" title=\"Delete\">&times;</button>\n                    </div>          \n                </div>\n            "]);

var PageSampleList = function (_UIElement) {
    inherits(PageSampleList, _UIElement);

    function PageSampleList() {
        classCallCheck(this, PageSampleList);
        return possibleConstructorReturn(this, (PageSampleList.__proto__ || Object.getPrototypeOf(PageSampleList)).apply(this, arguments));
    }

    createClass(PageSampleList, [{
        key: "initialize",
        value: function initialize() {
            get$1(PageSampleList.prototype.__proto__ || Object.getPrototypeOf(PageSampleList.prototype), "initialize", this).call(this);

            this.list = [];
            // this.dispatch(STORAGE_LOAD_PAGE)
        }
    }, {
        key: "template",
        value: function template() {

            return "<div class=\"page-sample-list\"><div class='cached-list' ref=\"$cachedList\"></div></div>";
        }
    }, {
        key: LOAD('$cachedList'),
        value: function value$$1() {
            var _this2 = this;

            var list = this.list.map(function (page, index) {
                var data = _this2.read(PAGE_CACHE_TO_STRING, page);

                var rateX = 72 / unitValue(defaultValue(data.obj.width, pxUnit(400)));
                var rateY = 70 / unitValue(defaultValue(data.obj.height, pxUnit(300)));

                var transform = "transform: scale(" + rateX + " " + rateY + ")";

                return html(_templateObject$19, page.id, data.css, transform, page.layers.map(function (layer) {
                    var data = _this2.read(LAYER_CACHE_TO_STRING, layer);
                    return "<div class=\"layer-view\" style=\"" + data.css + "\"></div>";
                }), index);
            });

            var storageList = this.read(STORAGE_PAGES).map(function (page) {
                var samplePage = _this2.read(ITEM_CONVERT_STYLE, page.page);

                var data = _this2.read(PAGE_CACHE_TO_STRING, samplePage);
                var rateX = 72 / unitValue(defaultValue(samplePage.width, pxUnit(400)));
                var rateY = 70 / unitValue(defaultValue(samplePage.height, pxUnit(300)));

                var minRate = Math.min(rateY, rateX);

                var transform = "left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%) scale(" + minRate + ")";

                return html(_templateObject2$5, page.id, data.css, transform, page.layers.map(function (layer) {
                    var data = _this2.read(LAYER_CACHE_TO_STRING, layer);
                    return "<div class=\"layer-view\" style=\"" + data.css + "\"></div>";
                }), page.id, page.id);
            });

            var results = [].concat(toConsumableArray(list), toConsumableArray(storageList), ["<button type=\"button\" class=\"add-current-page\" title=\"Cache a page\">+</button>"]);

            var emptyCount = 5 - results.length % 5;

            var arr = repeat(emptyCount);

            arr.forEach(function (it) {
                results.push("<div class='empty'></div>");
            });

            return results;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.load();
        }
    }, {
        key: EVENT('changeStorage'),
        value: function value$$1() {
            this.refresh();
        }
    }, {
        key: CLICK('$el .page-sample-item .add-item'),
        value: function value$$1(e) {
            var _this3 = this;

            var index = +e.$delegateTarget.attr('data-index');

            var newPage = this.list[index];

            if (newPage) {
                this.read(SELECTION_CURRENT_PAGE_ID, function (id) {
                    _this3.dispatch(ITEM_ADD_CACHE, newPage, id);
                    _this3.emit(CHANGE_ARTBOARD);
                });
            }
        }
    }, {
        key: CLICK('$el .page-cached-item .add-item'),
        value: function value$$1(e) {
            var _this4 = this;

            var newPage = this.read(STORAGE_PAGES, e.$delegateTarget.attr('data-sample-id'));
            if (newPage) {
                this.read(SELECTION_CURRENT_PAGE_ID, function (id) {
                    _this4.dispatch(ITEM_ADD_CACHE, newPage, id);
                    _this4.emit(CHANGE_ARTBOARD);
                });
            }
        }
    }, {
        key: CLICK('$el .page-cached-item .delete-item'),
        value: function value$$1(e) {
            this.dispatch(STORAGE_REMOVE_PAGE, e.$delegateTarget.attr('data-sample-id'));
            this.refresh();
        }
    }, {
        key: CLICK('$el .add-current-page'),
        value: function value$$1(e) {
            var _this5 = this;

            this.read(SELECTION_CURRENT_PAGE_ID, function (id) {
                var newPage = _this5.read(COLLECT_PAGE_ONE, id);

                _this5.dispatch(STORAGE_ADD_PAGE, newPage);
                _this5.refresh();
            });
        }
    }]);
    return PageSampleList;
}(UIElement);

var PageSampleListView = function (_UIElement) {
    inherits(PageSampleListView, _UIElement);

    function PageSampleListView() {
        classCallCheck(this, PageSampleListView);
        return possibleConstructorReturn(this, (PageSampleListView.__proto__ || Object.getPrototypeOf(PageSampleListView)).apply(this, arguments));
    }

    createClass(PageSampleListView, [{
        key: "components",
        value: function components() {
            return { PageSampleList: PageSampleList };
        }
    }, {
        key: "template",
        value: function template() {
            return "<div class='pages'>         \n            <PageSampleList />\n        </div>";
        }
    }]);
    return PageSampleListView;
}(UIElement);

var layerItems = {
    LayerListView: LayerListView,
    ProjectListView: ProjectListView,
    PageSampleListView: PageSampleListView,
    ShapeListView: ShapeListView,
    LayerSampleList: LayerSampleList,
    GradientSampleList: GradientSampleList,
    BasicGradient: BasicGradient
};

var OutlineTabView = function (_BaseTab) {
    inherits(OutlineTabView, _BaseTab);

    function OutlineTabView() {
        classCallCheck(this, OutlineTabView);
        return possibleConstructorReturn(this, (OutlineTabView.__proto__ || Object.getPrototypeOf(OutlineTabView)).apply(this, arguments));
    }

    createClass(OutlineTabView, [{
        key: "template",
        value: function template() {
            return "    \n            <div class=\"outline\">\n                <ProjectListView />                    \n                <LayerListView />\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return _extends({}, layerItems);
        }
    }]);
    return OutlineTabView;
}(BaseTab);

var SelectLayerView = function (_BaseTab) {
    inherits(SelectLayerView, _BaseTab);

    function SelectLayerView() {
        classCallCheck(this, SelectLayerView);
        return possibleConstructorReturn(this, (SelectLayerView.__proto__ || Object.getPrototypeOf(SelectLayerView)).apply(this, arguments));
    }

    createClass(SelectLayerView, [{
        key: "template",
        value: function template() {
            return "    \n            <div class=\"select-layer-view\">\n                <OutlineTabView />\n            </div>\n        ";
        }
    }, {
        key: "components",
        value: function components() {
            return _extends({}, layerItems, {
                OutlineTabView: OutlineTabView
            });
        }
    }]);
    return SelectLayerView;
}(BaseTab);

var LayerTabView = function (_BaseTab) {
    inherits(LayerTabView, _BaseTab);

    function LayerTabView() {
        classCallCheck(this, LayerTabView);
        return possibleConstructorReturn(this, (LayerTabView.__proto__ || Object.getPrototypeOf(LayerTabView)).apply(this, arguments));
    }

    createClass(LayerTabView, [{
        key: 'template',
        value: function template() {
            return '\n        <div class="tab horizontal">\n            <div class="tab-header no-border" ref="$header">\n                <div class="tab-item" data-id="page">Page</div>\n                <div class="tab-item selected" data-id="property">Property</div>\n                <div class="tab-item" data-id="border">Border</div>       \n                <div class="tab-item" data-id="fill">Fill</div>       \n                <div class="tab-item" data-id="text">Text</div>\n                <div class="tab-item small-font" data-id="clip-path">Clip Path</div>\n                <div class="tab-item small-font" data-id="transform">Transform</div>\n                <div class="tab-item" data-id="transform3d">3D</div>\n                <div class="tab-item" data-id="css">CSS</div>\n            </div>\n            <div class="tab-body" ref="$body">\n                <div class="tab-content" data-id="page">\n                    <PageProperty />\n                </div>\n                <div class="tab-content selected flex" data-id="property">\n                    <!-- <div class=\'fixed\'><LayerInfoColorPickerPanel /></div> -->\n                    <div class=\'scroll\' ref="$layerInfoScroll">\n                        <LayerProperty />\n                    </div>\n                </div>\n                <div class="tab-content flex" data-id="border">\n                    <!-- <div class=\'fixed\'><LayerBorderColorPickerPanel /></div> -->\n                    <div class=\'scroll\' ref="$layerBorderScroll">\n                        <LayerBorderProperty />\n                        <LayerBorderRadiusProperty />\n                    </div>\n                </div>                \n                <div class="tab-content flex" data-id="text">\n                    <!-- <div class=\'fixed\'><LayerTextColorPickerPanel /></div> -->\n                    <div class=\'scroll\' ref="$layerTextScroll">\n                        <LayerFontProperty />\n                        <LayerTextProperty />\n                        <TextShadowProperty />\n                    </div>\n                </div>\n                <div class="tab-content flex" data-id="fill">\n                    <!--<div class=\'fixed\'><FillColorPickerPanel /></div> -->\n                    <div class=\'scroll\' ref="$layerFillScroll">\n                        <BoxShadowProperty />\n                        <FilterProperty />\n                        <BackdropProperty />\n                        <EmptyArea height="100px" />      \n                    </div>\n                </div>                \n                <div class="tab-content" data-id="clip-path">\n                    <ClipPathProperty />\n                </div>\n                <div class="tab-content" data-id="transform">\n                    <Transform2DProperty />\n                </div>\n                <div class="tab-content" data-id="transform3d">\n                    <Transform3DProperty />\n                </div>\n                <div class="tab-content" data-id="css">\n                    <LayerCodeProperty/>\n                </div>\n            </div>\n        </div>';
        }
    }, {
        key: SCROLL('$layerInfoScroll'),
        value: function value(e) {
            this.setScrollTabTitle(this.refs.$layerInfoScroll);
        }
    }, {
        key: SCROLL('$layerBorderScroll'),
        value: function value(e) {
            this.setScrollTabTitle(this.refs.$layerBorderScroll);
        }
    }, {
        key: SCROLL('$layerTextScroll'),
        value: function value(e) {
            this.setScrollTabTitle(this.refs.$layerTextScroll);
        }
    }, {
        key: SCROLL('$layerFillScroll'),
        value: function value(e) {
            this.setScrollTabTitle(this.refs.$layerFillScroll);
        }
    }, {
        key: 'onTabShow',
        value: function onTabShow() {
            editor$1.config.set('tool.tabs.layer.selectedId', this.selectedTabId);
            this.emit(SELECT_TAB_LAYER, this.selectedTabId);
        }
    }, {
        key: 'components',
        value: function components() {
            return _extends({}, property, items$1);
        }
    }]);
    return LayerTabView;
}(BaseTab);

var LayerView = function (_UIElement) {
    inherits(LayerView, _UIElement);

    function LayerView() {
        classCallCheck(this, LayerView);
        return possibleConstructorReturn(this, (LayerView.__proto__ || Object.getPrototypeOf(LayerView)).apply(this, arguments));
    }

    createClass(LayerView, [{
        key: "template",
        value: function template() {
            return "<div class='property-view'><LayerTabView /></div>";
        }
    }, {
        key: "components",
        value: function components() {
            return { LayerTabView: LayerTabView };
        }
    }]);
    return LayerView;
}(UIElement);

var ImageTabView = function (_BaseTab) {
    inherits(ImageTabView, _BaseTab);

    function ImageTabView() {
        classCallCheck(this, ImageTabView);
        return possibleConstructorReturn(this, (ImageTabView.__proto__ || Object.getPrototypeOf(ImageTabView)).apply(this, arguments));
    }

    createClass(ImageTabView, [{
        key: 'template',
        value: function template() {
            return '\n            <div class="tab horizontal">\n                <div class="tab-header no-border" ref="$header">\n                    <div class="tab-item selected small-font" data-id="gradient">Background</div>\n                    <div class="tab-item small-font" data-id="background">Background</div>\n                    <div class="tab-item" data-id="pattern">Pattern</div>\n                    <div class="tab-item" data-id="css">CSS</div>\n                </div>\n                <div class="tab-body" ref="$body">\n                    <div class="tab-content flex selected" data-id="gradient">\n                        <div class=\'fixed\'><!-- ColorPickerPanel /--></div>\n                        <div class=\'scroll\'><ImageSortingProperty /><ColorStepProperty /></div>    \n                    </div>\n                    <div class="tab-content flex" data-id="background">\n                        <BackgroundProperty></BackgroundProperty>\n                    </div>\n                    <div class="tab-content flex" data-id="pattern">\n                        <!-- <RotatePatternProperty /> -->\n                    </div>                    \n                    <div class="tab-content" data-id="css"><BackgroundCodeProperty /></div>\n                </div>\n            </div> \n        ';
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            this.load();
        }
    }, {
        key: EVENT(CHANGE_SELECTION, CHANGE_EDITOR, CHANGE_IMAGE),
        value: function value() {
            this.refresh();
        }
    }, {
        key: 'onTabShow',
        value: function onTabShow() {
            this.load();
            editor.config.set('tool.tabs.image.selectedId', this.selectedTabId);
            this.emit(SELECT_TAB_IMAGE, this.selectedTabId);
        }
    }, {
        key: 'components',
        value: function components() {
            return _extends({}, property, items$1);
        }
    }]);
    return ImageTabView;
}(BaseTab);

var ImageView = function (_UIElement) {
    inherits(ImageView, _UIElement);

    function ImageView() {
        classCallCheck(this, ImageView);
        return possibleConstructorReturn(this, (ImageView.__proto__ || Object.getPrototypeOf(ImageView)).apply(this, arguments));
    }

    createClass(ImageView, [{
        key: "template",
        value: function template() {
            return "<div class='property-view'><ImageTabView /></div>";
        }
    }, {
        key: "components",
        value: function components() {
            return {
                ImageTabView: ImageTabView
            };
        }
    }]);
    return ImageView;
}(UIElement);

var ORDERING_TYPE = 'ordering/type';
var ORDERING_INDEX = 'ordering/index';

var Alignment = function (_UIElement) {
    inherits(Alignment, _UIElement);

    function Alignment() {
        classCallCheck(this, Alignment);
        return possibleConstructorReturn(this, (Alignment.__proto__ || Object.getPrototypeOf(Alignment)).apply(this, arguments));
    }

    createClass(Alignment, [{
        key: "template",
        value: function template() {
            return "\n            <div class='alignment'>\n                <div class=\"button-group group-align\" ref=\"$groupAlign\">\n                    <button type=\"button\" title=\"left\" data-value=\"left\"></button>\n                    <button type=\"button\" title=\"center\" data-value=\"center\"></button>\n                    <button type=\"button\" title=\"right\" data-value=\"right\"></button>\n                    <button type=\"button\" title=\"top\" data-value=\"top\"></button>\n                    <button type=\"button\" title=\"middle\" data-value=\"middle\"></button>\n                    <button type=\"button\" title=\"bottom\" data-value=\"bottom\"></button>\n                    <button type=\"button\" title=\"vertical\" data-value=\"vertical\"></button>\n                    <button type=\"button\" title=\"horizontal\" data-value=\"horizontal\"></button>\n                </div>\n\n                <div class=\"button-group group-order\" ref=\"$groupOrdering\">\n                    <button type=\"button\" title=\"front\" data-value=\"front\"></button>\n                    <button type=\"button\" title=\"back\" data-value=\"back\"></button>\n                    <button type=\"button\" title=\"forward\" data-value=\"forward\"></button>\n                    <button type=\"button\" title=\"backward\" data-value=\"backward\"></button>\n                </div>                \n                        \n            </div>\n        ";
        }
    }, {
        key: CLICK('$groupAlign button'),
        value: function value(e) {
            console.log('sstart', e);
            this.dispatch(ORDERING_TYPE, e.$delegateTarget.attr('data-value'));
            console.log('end', e);
        }
    }, {
        key: CLICK('$groupOrdering button'),
        value: function value(e) {
            this.dispatch(ORDERING_INDEX, e.$delegateTarget.attr('data-value'));
        }
    }]);
    return Alignment;
}(UIElement);

var HotKey = function (_UIElement) {
    inherits(HotKey, _UIElement);

    function HotKey() {
        classCallCheck(this, HotKey);
        return possibleConstructorReturn(this, (HotKey.__proto__ || Object.getPrototypeOf(HotKey)).apply(this, arguments));
    }

    createClass(HotKey, [{
        key: KEYDOWN('document'),
        value: function value(e) {
            // this.dispatch(HOTKEY_EXECUTE, e);
        }
    }]);
    return HotKey;
}(UIElement);

var LOAD_START = 'load/start';

var CSSEditor$1 = function (_UIElement) {
    inherits(CSSEditor, _UIElement);

    function CSSEditor() {
        classCallCheck(this, CSSEditor);
        return possibleConstructorReturn(this, (CSSEditor.__proto__ || Object.getPrototypeOf(CSSEditor)).apply(this, arguments));
    }

    createClass(CSSEditor, [{
        key: 'afterRender',
        value: function afterRender() {
            var _this2 = this;

            setTimeout(function () {
                _this2.emit(RESIZE_WINDOW);
                _this2.emit(CHANGE_EDITOR);
            }, 100);
        }
    }, {
        key: 'template',
        value: function template() {
            return '\n            <div class="layout-main -show-timeline" ref="$layoutMain">\n                <div class="layout-header">\n                    <div class="page-tab-menu"><ToolMenu /></div>\n                </div>\n                <div class="layout-middle">\n                    <div class="layout-left">      \n                        <SelectLayerView/>\n                    </div>\n                    <div class="layout-body">\n                        <LayerToolbar />\n                        <VerticalColorStep />\n                        <CanvasView />\n                    </div>                \n                    <div class="layout-right">\n                        <Alignment />\n                        <FeatureControl />\n                    </div>\n                </div>\n                <div class="layout-footer" ref="$footer">\n                    <!-- TimelineSplitter /-->\n                    <!-- Timeline /-->\n                </div>\n                <ExportWindow />\n                <DropView />\n                <HotKey />                \n            </div>\n  \n        ';
        }
    }, {
        key: 'components',
        value: function components() {
            return {
                HotKey: HotKey,
                Alignment: Alignment,
                SelectLayerView: SelectLayerView,
                ToolMenu: ToolMenu,
                LayerToolbar: LayerToolbar,
                VerticalColorStep: VerticalColorStep,
                DropView: DropView,
                ExportWindow: ExportWindow,
                CanvasView: CanvasView,
                FeatureControl: FeatureControl,
                SubFeatureControl: SubFeatureControl,
                TimelineSplitter: TimelineSplitter,
                Timeline: Timeline
            };
        }
    }, {
        key: EVENT(CHANGE_EDITOR),
        value: function value() {
            /*
            this.read(SELECTION_CURRENT_LAYER, (layer) => {
                var self = this; 
                var obj = layer.style
                var aniObject = Animation.createTimeline([{
                    duration: 1000, 
                    obj,
                    timing: 'ease-out-sine',
                    iteration: 3, 
                    direction: 'alternate',
                    keyframes : {
                        '0%': {
                            'x': '0px',
                            'background-color': 'rgba(255, 255, 255, 0.5)',
                        },
                        '100%': {
                            'x': '250px',
                            'background-color': 'rgba(255, 0, 255, 1)'
                        }
                    } 
                 }], {
                    callback() {
                        self.run('item/set', layer);
                        self.emit('animationEditor')
                    }
                });
                 aniObject.start();
                 })
            */

        }
    }, {
        key: EVENT(LOAD_START),
        value: function value(isAdd) {
            console.log('최초 로딩은 어디서 할까요?');
            // this.dispatch(STORAGE_LOAD, (isLoaded) => {
            //     if (!isLoaded && isAdd) { 
            //         this.dispatch(ITEM_ADD_PAGE, true)
            //     } else {
            //         this.dispatch(ITEM_LOAD);
            //     }
            //     this.emit(CHANGE_ARTBOARD)
            // });
        }
    }, {
        key: EVENT(TOGGLE_TIMELINE),
        value: function value() {
            this.$el.toggleClass('show-timeline');
        }
    }, {
        key: EVENT('togglePagePanel'),
        value: function value() {
            this.$el.toggleClass('has-page-panel');
        }
    }, {
        key: EVENT('toggleLayerPanel'),
        value: function value() {
            this.$el.toggleClass('has-layer-panel');
        }
    }, {
        key: RESIZE('window') + DEBOUNCE(100),
        value: function value(e) {
            this.emit(RESIZE_WINDOW);
        }
    }, {
        key: EVENT(INIT_HEIGHT_TIMELINE),
        value: function value() {
            this.initFooterHeight = this.refs.$footer.height();
        }
    }, {
        key: EVENT(CHANGE_HEIGHT_TIMELINE),
        value: function value(size) {
            this.refs.$footer.px('height', this.initFooterHeight - size.dy);
        }
    }]);
    return CSSEditor;
}(UIElement);

var CSSEditor = {
    createCSSEditor: function createCSSEditor() {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { type: 'white' };

        switch (opts.type) {
            default:
                return start({
                    components: { CSSEditor: CSSEditor$1 },
                    template: '<CSSEditor />'
                });
        }
    },

    CSSEditor: CSSEditor$1
};

var index = _extends({}, Util, ColorPicker, CSSEditor);

return index;

}());
