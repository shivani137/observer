"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _utils = require("./utils");

var _proxyPolyfill = require("./proxy-polyfill");

var _proxyPolyfill2 = _interopRequireDefault(_proxyPolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var callOnchange = function callOnchange(ctx, oldCtx, target, name, val) {
    if (ctx && ctx.onChange && typeof ctx.onChange === "function") {
        ctx.onChange((0, _utils.getObject)(ctx), (0, _utils.getObject)(target), name, val);
    }
};

var proxyHandler = function proxyHandler(ctx) {
    return {
        get: function get(target, prop, receiver) {
            return target[prop];
        },

        deleteProperty: function deleteProperty(target, property) {
            var deletedItem = void 0;
            var oldVal = (0, _utils.getObject)(ctx);

            if ((0, _utils.isObject)(target) || Array.isArray(target)) {
                deletedItem = delete target[property];
            }

            callOnchange(ctx, oldVal, target, property);
            return deletedItem;
        },

        set: function set(target, name, value) {
            var oldVal = (0, _utils.getObject)(ctx);

            if (Array.isArray(target) && name === 'length') {
                target[name] = value;
                return target;
            }
            if (Array.isArray(value)) {
                target[name] = new Proxy(value, proxyHandler);
            }

            if ((0, _utils.isObject)(value) && !Array.isArray(value)) {
                target[name] = Observer(value, {}, ctx);
            }

            if (!(0, _utils.isObject)(value)) {
                target[name] = value;
            }

            callOnchange(ctx, oldVal, target, name, value);
            return target;
        }
    };
};

var Observer = function Observer(state, that, originalState) {
    if ((0, _utils.isObject)(state) && !Array.isArray(state)) {
        var keys = (0, _keys2.default)(state);
        for (var i = 0; i < keys.length; i++) {
            if ((0, _typeof3.default)(state[keys[i]]) === "object") {
                that[keys[i]] = Observer(state[keys[i]], {}, originalState);
            } else {
                that[keys[i]] = state[keys[i]];
            }
        }
        return new Proxy(that, proxyHandler(originalState || state));
    }
    if (Array.isArray(state)) {
        return new Proxy(state, proxyHandler(originalState || state));
    }
    if (!(0, _utils.isObject)(state)) {
        return state;
    }
};

var Observe = function Observe(state) {
    var isProxyAvailable = typeof Proxy === "function";
    var newState = {};

    if (!isProxyAvailable) {
        window.Proxy = _proxyPolyfill2.default;
        console.log(typeof Proxy === "function");
    }
    try {
        return Observer(state, newState, newState);
    } catch (e) {
        console.log(e);
        return state;
    }
};

exports.default = Observe;