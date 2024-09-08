/*! == LbDate version: 1.5.0 | Copyright (c) 2020 Leon Bernstein | LbJS | Released under the MIT license == */
/*!
 * MIT License
 *
 * Copyright (c) 2020 Leon Bernstein
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.__lbdateModule = {}));
})(this, (function (exports) { 'use strict';

    function cloneDate(date) {
        return new Date(date);
    }

    function isDate(value) {
        return value instanceof Date;
    }

    // tslint:disable-next-line: ban-types
    function isFunction(value) {
        return typeof value == 'function';
    }

    function isObject(value) {
        return value && typeof value == 'object';
    }

    function isMoment(value) {
        return isObject(value) && value._isAMomentObject && isDate(value._d) && isFunction(value.valueOf);
    }

    function isNumber(value) {
        return typeof value == 'number';
    }

    // tslint:disable: no-bitwise
    function uuid() {
        let d = new Date().getTime();
        let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16;
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            }
            else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function createMomentToDateMethod(toISOString) {
        return function () {
            const date = new Date(this.valueOf());
            date.toISOString = toISOString;
            return date;
        };
    }

    function formatTimeZone(mins) {
        const isNegative = mins < 0;
        if (isNegative)
            mins = mins * -1;
        const hours = mins / 60;
        const hoursStr = (hours - hours % 1).toString();
        const minsStr = (mins % 60).toString();
        const padTime = (n) => n.length == 1 ? '0' + n : n;
        return `${isNegative || mins == 0 ? '+' : '-'}${padTime(hoursStr)}:${padTime(minsStr)}`;
    }

    function overrideDatesToJson(method) {
        Date.prototype.toJSON = method;
    }

    function restoreDatesToJson(lastToNativeJsonName, lastToNativeJsonNameSetter) {
        if (lastToNativeJsonName) {
            overrideDatesToJson(Date.prototype[lastToNativeJsonName]);
            delete Date.prototype[lastToNativeJsonName];
            lastToNativeJsonNameSetter(null);
        }
    }

    // tslint:disable-next-line: ban-types
    function setMethodToDatesProto(methodName, method) {
        Date.prototype[methodName] = method;
    }

    function toJsonMethodFactory(mergedOptions, lastToNativeJsonName) {
        const { timezone, toNativeJsonName, manualTimeZoneOffset, precision } = mergedOptions;
        const msInMin = 6e4;
        const charsToRemove = precision == 0 ? -4 : precision - 3;
        const nativeToJsonFuncKey = lastToNativeJsonName ||
            Date.prototype.hasOwnProperty(toNativeJsonName) ?
            toNativeJsonName :
            Date.prototype.toISOString.name;
        let toJsonMethod;
        switch (timezone) {
            case "Auto" /* auto */:
                toJsonMethod = function () {
                    const offSetMins = this.getTimezoneOffset();
                    const date = cloneDate(this.getTime() - offSetMins * msInMin);
                    let stringDate = date[nativeToJsonFuncKey]();
                    stringDate = stringDate.slice(0, -1 + charsToRemove);
                    return stringDate + formatTimeZone(offSetMins);
                };
                break;
            case "Manual" /* manual */:
                toJsonMethod = function () {
                    const offSetMins = manualTimeZoneOffset || 0;
                    const date = cloneDate(this.getTime() - offSetMins * msInMin);
                    let stringDate = date[nativeToJsonFuncKey]();
                    stringDate = stringDate.slice(0, -1 + charsToRemove);
                    return stringDate + formatTimeZone(offSetMins);
                };
                break;
            case "None" /* none */:
                toJsonMethod = function () {
                    const offSetMins = this.getTimezoneOffset();
                    const date = cloneDate(this.getTime() - offSetMins * msInMin);
                    const stringDate = date[nativeToJsonFuncKey]();
                    return stringDate.slice(0, -1 + charsToRemove);
                };
                break;
            case "UTC" /* utc */:
                toJsonMethod = function () {
                    const date = cloneDate(this);
                    const stringDate = date[nativeToJsonFuncKey]();
                    return stringDate.slice(0, -1 + charsToRemove) + 'Z';
                };
                break;
        }
        return function () {
            let date = null;
            if (isMoment(this))
                date = new Date(this.valueOf());
            return toJsonMethod.call(date || this);
        };
    }

    function mathRound(value) {
        return Math.round(value);
    }

    function objectAssign(target, source1, source2, source3) {
        return Object.assign(target, source1, source2, source3);
    }

    const DEFAULT_LBDATE_OPTIONS = {
        timezone: "Auto" /* auto */,
        manualTimeZoneOffset: null,
        toNativeJsonName: 'toNativeJSON',
        precision: 3,
    };
    function getDefaultLbDateConfig() {
        return objectAssign({}, DEFAULT_LBDATE_OPTIONS);
    }

    let globalLbDateOptions = {};
    function setGlobalLbDateOptions(options) {
        globalLbDateOptions = options;
    }
    function getGlobalLbDateConfig() {
        return objectAssign({}, globalLbDateOptions);
    }

    function createMergedLbdateOptions(lastToNativeJsonName, options) {
        if (options) {
            const { manualTimeZoneOffset, precision } = options;
            if (isNumber(manualTimeZoneOffset))
                options.manualTimeZoneOffset = mathRound(manualTimeZoneOffset);
            if (isNumber(precision))
                options.precision = mathRound(precision);
        }
        const mergedOptions = objectAssign(getDefaultLbDateConfig(), getGlobalLbDateConfig(), options);
        mergedOptions.timezone = resolveTimezone(mergedOptions.timezone);
        mergedOptions.toNativeJsonName = resolveToNativeJsonName(lastToNativeJsonName, mergedOptions.toNativeJsonName);
        mergedOptions.manualTimeZoneOffset = resolveManualTimeZoneOffset(mergedOptions.manualTimeZoneOffset);
        mergedOptions.precision = resolvePrecision(mergedOptions.precision);
        return mergedOptions;
    }
    function resolveTimezone(timezone) {
        const isValidTimezoneOption = ["Auto" /* auto */, "Manual" /* manual */, "None" /* none */, "UTC" /* utc */].includes(timezone);
        return isValidTimezoneOption ? timezone : "Auto" /* auto */;
    }
    function resolveToNativeJsonName(lastToNativeJsonName, toNativeJsonName) {
        const isNameValid = lastToNativeJsonName === toNativeJsonName || !Date.prototype.hasOwnProperty(toNativeJsonName);
        return isNameValid ? toNativeJsonName : getDefaultLbDateConfig().toNativeJsonName;
    }
    function resolveManualTimeZoneOffset(manualTimeZoneOffset) {
        if (manualTimeZoneOffset) {
            if (manualTimeZoneOffset > 840)
                return 840;
            if (manualTimeZoneOffset < -840)
                return -840;
        }
        return manualTimeZoneOffset;
    }
    function resolvePrecision(precision) {
        if (precision > 3)
            return 3;
        if (precision < 0)
            return 0;
        return precision;
    }

    let lastToNativeJsonName = null;
    function getLastToNativeJsonName() {
        return lastToNativeJsonName;
    }
    function setLastToNativeJsonName(value) {
        lastToNativeJsonName = value;
    }

    let momentRef = null;
    let momentToDateMethodCache = null;
    const momentRefTemp = new Map();
    const momentToDateMethodCacheTemp = new Map();
    function setMoment(moment, dateToISOString, guid) {
        if (guid) {
            momentRefTemp.set(guid, moment);
            momentToDateMethodCacheTemp.set(guid, moment.prototype.toDate);
            moment.prototype.toDate = createMomentToDateMethod(dateToISOString);
            return;
        }
        momentRef = moment;
        momentToDateMethodCache = momentRef.prototype.toDate;
        momentRef.prototype.toDate = createMomentToDateMethod(dateToISOString);
    }
    function restoreMomentsToDateMethod(guid) {
        if (guid) {
            let moment = null;
            let toDate = null;
            if (momentRefTemp.has(guid)) {
                moment = momentRefTemp.get(guid);
                momentRefTemp.delete(guid);
            }
            if (momentToDateMethodCacheTemp.has(guid)) {
                toDate = momentToDateMethodCacheTemp.get(guid);
                momentToDateMethodCacheTemp.delete(guid);
                if (moment)
                    moment.prototype.toDate = toDate;
            }
            return;
        }
        if (!momentRef || !momentToDateMethodCache)
            return;
        momentRef.prototype.toDate = momentToDateMethodCache;
    }

    const lbDate = (() => {
        const _f = (options) => {
            const mergedOptions = createMergedLbdateOptions(getLastToNativeJsonName(), options);
            const toNativeJsonName = mergedOptions.toNativeJsonName;
            const createToJsonMethod = () => toJsonMethodFactory(mergedOptions, getLastToNativeJsonName());
            return {
                init: (moment) => {
                    restoreDatesToJson(getLastToNativeJsonName(), setLastToNativeJsonName);
                    setLastToNativeJsonName(toNativeJsonName);
                    setGlobalLbDateOptions(mergedOptions);
                    setMethodToDatesProto(toNativeJsonName, Date.prototype.toJSON);
                    const toJsonMethod = createToJsonMethod();
                    overrideDatesToJson(toJsonMethod);
                    if (moment)
                        setMoment(moment, toJsonMethod);
                },
                toJSON: createToJsonMethod(),
                override: (date) => {
                    const toJsonMethod = createToJsonMethod();
                    if (isMoment(date)) {
                        date.toDate = createMomentToDateMethod(toJsonMethod);
                    }
                    else {
                        date.toJSON = createToJsonMethod();
                    }
                    return date;
                },
                run: (fn, moment) => {
                    const originalToJson = Date.prototype.toJSON;
                    const isSameToNativeJsonName = toNativeJsonName === getLastToNativeJsonName();
                    if (!isSameToNativeJsonName)
                        setMethodToDatesProto(toNativeJsonName, originalToJson);
                    const toJsonMethod = createToJsonMethod();
                    overrideDatesToJson(toJsonMethod);
                    let guid = null;
                    if (moment) {
                        guid = uuid();
                        setMoment(moment, toJsonMethod, guid);
                    }
                    let error = null;
                    let result;
                    try {
                        result = fn();
                    }
                    catch (e) {
                        error = e;
                    }
                    if (!isSameToNativeJsonName) {
                        delete Date.prototype[toNativeJsonName];
                    }
                    overrideDatesToJson(originalToJson);
                    if (guid && moment)
                        restoreMomentsToDateMethod(guid);
                    if (error)
                        throw error;
                    return result;
                },
                getReplacer: (continuation) => {
                    const toJSON = createToJsonMethod();
                    return function (key, value) {
                        const val = this[key];
                        if (isDate(val)) {
                            const date = cloneDate(val);
                            date.toJSON = toJSON;
                            value = date.toJSON();
                        }
                        else if (isMoment(val)) {
                            const moment = val.clone();
                            moment.toJSON = toJSON;
                            value = moment.toJSON();
                        }
                        return continuation ? continuation.call(this, key, value) : value;
                    };
                },
                restore: () => {
                    restoreDatesToJson(getLastToNativeJsonName(), setLastToNativeJsonName);
                    setGlobalLbDateOptions({});
                    restoreMomentsToDateMethod();
                },
                getGlobalConfig: () => getGlobalLbDateConfig(),
                getDefaultConfig: () => getDefaultLbDateConfig(),
            };
        };
        const _o = {
            init: (moment) => _f().init(moment),
            toJSON: _f().toJSON,
            override: (date) => _f().override(date),
            run: (fn, moment) => _f().run(fn, moment),
            getReplacer: (continuation) => _f().getReplacer(continuation),
            restore: () => _f().restore(),
            getGlobalConfig: () => _f().getGlobalConfig(),
            getDefaultConfig: () => _f().getDefaultConfig(),
        };
        return objectAssign(_f, _o);
    })();

    exports["default"] = lbDate;
    exports.lbDate = lbDate;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
typeof window == 'object' && (window.lbDate = window.__lbdateModule.lbDate);
//# sourceMappingURL=lbdate.umd.js.map