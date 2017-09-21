import { isObject, getObject } from "./utils";

let callOnchange = function callOnchange(ctx, oldCtx, target, name, val) {
    if (ctx && ctx.onChange && typeof ctx.onChange === "function") {
        ctx.onChange(getObject(ctx), getObject(target), name, val);
    }
};

let proxyHandler = function (ctx) {
    return {
        get: function (target, prop, receiver) {
            return target[prop];
        },

        deleteProperty: function (target, property) {
            let deletedItem;
            let oldVal = getObject(ctx);

            if (isObject(target) || Array.isArray(target)) {
                deletedItem = delete target[property];
            }

            callOnchange(ctx, oldVal, target, property);
            return deletedItem;
        },

        set: function (target, name, value) {
            let oldVal = getObject(ctx);

            if (Array.isArray(target) && name === 'length') {
                target[name] = value;
                return target;
            }
            if (Array.isArray(value)) {
                target[name] = new Proxy(value, proxyHandler);
            }

            if (isObject(value) && !Array.isArray(value)) {
                target[name] = ObservuI(value, {}, ctx);
            }

            if (!isObject(value)) {
                target[name] = value;
            }

            callOnchange(ctx, oldVal, target, name, value);
            return target;
        }
    };
};

let ObservuI = function ObservuI(state, that, originalState) {
    if (isObject(state) && !Array.isArray(state)) {
        /* Object.keys(state).forEach((key) => {
             if(isObject(state[key])){
                 that[key] = ObservuI(state[key], {}, originalState);
             } else {
                 that[key] = state[key];
             }
         });*/

        var keys = Object.keys(state);
        for (var i = 0; i < keys.length; i++) {
            if (typeof state[keys[i]] === "object") {
                that[keys[i]] = ObservuI(state[keys[i]], {}, originalState);
            } else {
                that[keys[i]] = state[keys[i]];
            }
        }

        return new Proxy(that, proxyHandler(originalState || state));
    }

    if (Array.isArray(state)) {
        return new Proxy(state, proxyHandler(originalState || state));
    }

    if (!isObject(state)) {
        return state;
    }
};

let Observu = function Observu(state) {
    let isProxyAvailable = typeof Proxy === "function";
    let newState = {};

    if (!isProxyAvailable) {
        require("./proxy-polyfill");
    }
    try {
        return ObservuI(state, newState, newState);
    } catch (e) {
        console.log(e);
        return state;
    }
};

export default Observu;