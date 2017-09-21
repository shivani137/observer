"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

exports.isObject = isObject;
exports.getObject = getObject;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isObject(x) {
    return x != null && (typeof x === "undefined" ? "undefined" : (0, _typeof3.default)(x)) === 'object';
}

function getObject(ctx) {
    var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!ctx || isObject(ctx)) {
        return ctx;
    }
    var clonedCtx = JSON.parse((0, _stringify2.default)(ctx));
    for (var i in clonedCtx) {
        if ((0, _typeof3.default)(clonedCtx[i]) !== "object") {
            root[i] = clonedCtx[i];
        } else if ((0, _typeof3.default)(clonedCtx[i]) === "object" && typeof clonedCtx[i].___value !== "undefined") {
            root[i] = clonedCtx[i].___value;
        } else if (Array.isArray(clonedCtx[i])) {
            root[i] = clonedCtx[i].splice(0);
        } else if ((0, _typeof3.default)(clonedCtx[i]) === "object") {
            root[i] = getObject(clonedCtx[i], {});
        }
    }
    return root;
}