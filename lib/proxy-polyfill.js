'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by shivani.tiwari on 21/09/17.
 */

function Proxy(target, handler, revocable) {
    var self = this; //because life
    //override Object.prototype properties
    Object.defineProperty(this, '__lookupGetter__', { value: target.__lookupSetter__.bind(target) });
    Object.defineProperty(this, '__lookupSetter__', { value: target.__lookupSetter__.bind(target) });
    Object.defineProperty(this, '__defineGetter__', { value: target.__defineGetter__.bind(target) });
    Object.defineProperty(this, '__defineSetter__', { value: target.__defineSetter__.bind(target) });
    Object.defineProperty(this, 'toString', { value: target.toString.bind(target) });
    Object.defineProperty(this, 'valueOf', { value: target.valueOf.bind(target) });
    Object.defineProperty(this, '__proto__', { get: function get() {
            if ('getPrototypeOf' in handler) return handler.getPrototypeOf(target);else return target.__proto__;
        }, set: function set(val) {
            if ('setPrototypeOf' in handler) handler.setPrototypeOf(target, val);else target.__proto__ = val;
        }
    }); //let's see if this is a bad idea

    //for handler.apply
    Object.defineProperty(this, 'apply', { value: function value() {
            if ('apply' in handler) return handler.apply.apply(handler, target, this == self ? handler : this, arguments);else return target.apply.apply(this == self ? target : this, arguments);
        } });

    //for handler.has (not a full implementation, but as good as I could do)
    Object.defineProperty(this, 'hasOwnProperty', { value: function value(property) {
            if ('has' in handler) {
                return handler.has(target, property);
            } else {
                return target.hasOwnProperty(property);
            }
        } });

    //default getters and setters, to either update the target object or to call the handler's function
    var get, set;
    if ('get' in handler) get = function get(property) {
        return handler.get(target, property, this);
    };else get = function get(property) {
        return target[property];
    };

    if ('set' in handler) set = function set(property, value) {
        handler.set(target, property, value, this);
    };else set = function set(property, value) {
        targetObserver.doIgnore(property, 'update');
        target[property] = value;
    };

    //Functions to be used with Object.observe
    var selfObserver = function (changes) {
        changes.forEach(function (change) {
            if ((selfObserver.ignore[change.name] || []).includes(change.type)) {
                delete selfObserver.ignore[change.name];
                return;
            }
            if (change.type == 'add') {
                if ('defineProperty' in handler) {
                    handler.definePropery(target, change.name, (0, _getOwnPropertyDescriptor2.default)(target, key));
                } else {
                    targetObserver.doIgnore(change.name, 'add', 'reconfigure', 'update');
                    (0, _defineProperty2.default)(target, change.name, (0, _getOwnPropertyDescriptor2.default)(this, change.name));
                    bind(change.name); //update getters/setters
                }
            } else if (change.type == 'delete') {
                if ('deleteProperty' in handler) {
                    targetObserver.doIgnore(change.name, 'delete');
                    if (!handler.deleteProperty(target, change.name)) {
                        targetObserver.dontIgnore(change.name, 'delete');
                        bind(change.name);
                    }
                } else {
                    targetObserver.doIgnore(change.name, 'delete');
                    if (!delete target[change.name]) {
                        targetObserver.dontIgnore(change.name, 'delete'); //it wasn't deleted successfully
                        bind(change.name);
                    }
                }
            }
        }.bind(this));
    }.bind(this);
    selfObserver.ignore = {};
    selfObserver.doIgnore = function () {
        selfObserver.ignore[arguments[0]] = Array.prototype.slice.call(arguments, 1);
    };
    selfObserver.dontIgnore = function () {
        var name = arguments[0];
        if (!(name in selfObserver.ignore)) return;
        var events = Array.prototype.slice(arguments, 1);
        for (var i in events) {
            if (selfObserver.ignore[name].includes(events[i])) selfObserver.ignore[name].splice(selfObserver.ignore[name].indexOf(events[i]), 1);
        }if (selfObserver.ignore[name].length == 0) delete selfObserver.ignore[name];
    };

    var targetObserver = function (changes) {
        changes.forEach(function (change) {
            if ((targetObserver.ignore[change.name] || []).includes(change.type)) {
                delete targetObserver.ignore[change.name];
                return;
            }
            if (change.type == 'add' || change.type == 'reconfigure' || change.type == 'update') {
                bind(change.name);
            } else if (change.type == 'delete') {
                selfObserver.doIgnore(change.name, 'delete');
                if (!delete this[change.name]) selfObserver.dontIgnore(change.name, 'delete'); //TODO check why
            }
        });
        targetObserver.ignore = {};
    }.bind(this);
    targetObserver.ignore = {};
    targetObserver.doIgnore = function () {
        targetObserver.ignore[arguments[0]] = Array.prototype.slice.call(arguments, 1);
    };
    targetObserver.dontIgnore = function () {
        var name = arguments[0];
        if (!(name in targetObserver.ignore)) return;
        var events = Array.prototype.slice(arguments, 1);
        for (var i in events) {
            if (targetObserver.ignore[name].includes(events[i])) targetObserver.ignore[name].splice(targetObserver.ignore[name].indexOf(events[i]), 1);
        }if (targetObserver.ignore[name].length == 0) delete targetObserver.ignore[name];
    };

    //function to bind the getter and setter to the given object
    var bind = function (key) {
        var descriptor = (0, _getOwnPropertyDescriptor2.default)(target, key);

        //Make sure that these updates won't be sent to the handler
        selfObserver.doIgnore(key, 'add', 'reconfigure');

        //Set the property
        (0, _defineProperty2.default)(this, key, {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            get: get.bind(this, key),
            set: set.bind(this, key)
        });
    }.bind(this);

    //bind to each existing property
    for (var key in target) {
        bind(key);
    }if ('observe' in Object) {
        Object.observe(this, selfObserver);
        Object.observe(target, targetObserver);
    } else {
        selfObserver = undefined;
        targetObserver = undefined;
    }

    //Add support for Proxy.revocable (kinda)
    if (revocable == true) this.revoke = function () {
        if ('unobserve' in Object) {
            Object.unobserve(this, selfObserver);
            Object.unobserve(target, targetObserver);
        }
        selfObserver = undefined;
        targetObserver = undefined;
        bind = undefined;
        get = undefined;
        set = undefined;
        for (var i in this) {
            delete this[i];
        }
    }.bind(this);
    return this;
};
Proxy.prototype = Function.prototype;
Proxy.revocable = function (target, handler) {
    return new Proxy(target, handler, true);
};

exports.default = Proxy;