(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue-property-decorator'), require('vue-class-component')) :
    typeof define === 'function' && define.amd ? define(['exports', 'vue-property-decorator', 'vue-class-component'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SxVueFormValidator = {}, global.vuePropertyDecorator, global.VueClassComponent));
})(this, (function (exports, vuePropertyDecorator, vueClassComponent) { 'use strict';

    class ValidatorFieldState {
        constructor(component, fieldName) {
            this._watchesList = [];
            this._active = true;
            this.valid = true;
            this.rules = {};
            // Убираем от $watch(..., {deep:true}), чтобы не зацикливался
            Object.defineProperty(this, '_component', {
                enumerable: false,
                writable: true,
            });
            // Убираем от $watch(..., {deep:true}), чтобы не зацикливался
            Object.defineProperty(this, '_watchesList', {
                enumerable: false,
                writable: true,
            });
            this._component = component;
            this.fieldName = fieldName;
            this._watchesList.push(component.$watch(fieldName, (newValue) => {
                if (this.rules.hasOwnProperty('custom')) {
                    this.rules['custom']._callback = () => true;
                    this.rules['custom'].clearErrors();
                }
                this.validate(newValue);
            }));
        }
        destroy() {
            this._watchesList.forEach(watch => watch());
        }
        clearErrors() {
            for (let ruleName in this.rules) {
                if (!this.rules.hasOwnProperty(ruleName))
                    continue;
                this.rules[ruleName].clearErrors();
            }
            this.valid = true;
        }
        isValid() {
            return this.valid;
        }
        get active() {
            return this._active;
        }
        set active(value) {
            if (this._active == value)
                return;
            this._active = value;
            for (let ruleName in this.rules) {
                if (!this.rules.hasOwnProperty(ruleName))
                    continue;
                this.rules[ruleName].active = this._active;
            }
            this.computeValid();
        }
        validate(value) {
            for (let ruleName in this.rules) {
                if (!this.rules.hasOwnProperty(ruleName))
                    continue;
                this.rules[ruleName].validate(this._component, arguments.length ? value : this._component[this.fieldName]);
            }
            this.computeValid();
            this._component.$emit(`validator.field.${this.valid ? 'valid' : 'invalid'}`, { field: this.fieldName, state: this });
            return this.valid;
        }
        computeValid() {
            this.valid = this.reduceValid();
        }
        reduceValid() {
            for (let ruleName in this.rules) {
                if (!this.rules.hasOwnProperty(ruleName))
                    continue;
                if (!this.rules[ruleName].valid) {
                    return false;
                }
            }
            return true;
        }
        get messages() {
            const result = [];
            for (let ruleName in this.rules) {
                if (!this.rules.hasOwnProperty(ruleName) || !this.rules[ruleName].active)
                    continue;
                if (this.rules[ruleName].valid)
                    continue;
                if (!(this.rules[ruleName].error + '').trim().length)
                    continue;
                result.push(this.rules[ruleName].error);
            }
            return result;
        }
        get firstMessage() {
            const messages = this.messages;
            if (!messages.length)
                return;
            return messages[0];
        }
    }

    class ValidatorRuleState {
        constructor(callback) {
            this.active = true;
            this.valid = true;
            this.error = '';
            this._callback = callback;
        }
        validate(component, value) {
            const validationResult = this.active ? this._callback.apply(component, [value]) : true;
            if (validationResult === true) {
                this.clearErrors();
            }
            else {
                this.valid = false;
                this.error = validationResult;
            }
            return this.valid;
        }
        clearErrors() {
            this.valid = true;
            this.error = '';
        }
    }

    class Validator {
        constructor(component) {
            this._active = true;
            this.fieldState = {};
            // Убираем от $watch(..., {deep:true}), чтобы не зацикливался
            Object.defineProperty(this, '_component', {
                enumerable: false,
                writable: true,
            });
            this._component = component;
            this.init();
        }
        destroy() {
            this.clearFieldState();
        }
        init() {
            var _a, _b;
            this.clearFieldState();
            const ctor = (_b = (_a = this._component.$vnode) === null || _a === void 0 ? void 0 : _a.componentOptions) === null || _b === void 0 ? void 0 : _b.Ctor;
            const fieldsList = ctor.options.fieldsList || [];
            const validatorList = ctor.options.validators || {};
            if (!fieldsList || !fieldsList.length)
                return;
            fieldsList.forEach(fieldName => {
                this.fieldState[fieldName] = vuePropertyDecorator.Vue.observable(new ValidatorFieldState(this._component, fieldName));
            });
            for (let fieldName in validatorList) {
                if (!validatorList.hasOwnProperty(fieldName))
                    continue;
                const validatorFunctions = validatorList[fieldName];
                for (let ruleName in validatorFunctions) {
                    if (!validatorFunctions.hasOwnProperty(ruleName))
                        continue;
                    let ruleState = new ValidatorRuleState(validatorFunctions[ruleName]);
                    this.fieldState[fieldName].rules[ruleName] = vuePropertyDecorator.Vue.observable(ruleState);
                }
            }
        }
        clearFieldState() {
            for (let fieldName in this.fieldState) {
                if (!this.fieldState.hasOwnProperty(fieldName))
                    continue;
                this.fieldState[fieldName].destroy();
                delete this.fieldState[fieldName];
            }
        }
        validateFieldRule(fieldName, ruleName, value) {
            if (!this.fieldState[fieldName])
                return;
            if (fieldName !== 'custom' && this.fieldState[fieldName].rules['custom']) {
                this.fieldState[fieldName].rules['custom'].clearErrors();
            }
            this.fieldState[fieldName].rules[ruleName].validate(this._component, value);
            this.fieldState[fieldName].computeValid();
            if (this.fieldState[fieldName].valid) {
                this._component.$emit('validator.field.valid', { field: fieldName, state: this.fieldState[fieldName] });
            }
            else {
                this._component.$emit('validator.field.invalid', { field: fieldName, state: this.fieldState[fieldName] });
            }
        }
        validateField(fieldName) {
            if (!this.fieldState[fieldName])
                return;
            this.fieldState[fieldName].validate(this._component[fieldName]);
            return this.fieldState[fieldName];
        }
        getField(fieldName) {
            return this.fieldState[fieldName];
        }
        getFieldValid(fieldName) {
            return this.fieldState[fieldName] ? this.fieldState[fieldName].valid : true;
        }
        customError(fieldName, error) {
            if (!this.fieldState[fieldName])
                return null;
            if (!this.fieldState[fieldName].rules['custom']) {
                this.fieldState[fieldName].rules['custom'] = vuePropertyDecorator.Vue.observable(new ValidatorRuleState(() => error));
            }
            else {
                this.fieldState[fieldName].rules['custom'].clearErrors();
                this.fieldState[fieldName].rules['custom']._callback = () => error;
            }
            this.validateFieldRule(fieldName, 'custom', null);
        }
        isValid() {
            let isValid = true;
            for (let fieldName in this.fieldState) {
                if (!this.fieldState.hasOwnProperty(fieldName))
                    continue;
                this.validateField(fieldName);
                isValid = isValid && this.fieldState[fieldName].valid;
            }
            if (isValid) {
                this._component.$emit('validator.valid', this);
            }
            else {
                this._component.$emit('validator.invalid', this);
            }
            if (!isValid) {
                let firstInvalid;
                for (let fieldName in this.fieldState) {
                    if (!this.fieldState.hasOwnProperty(fieldName))
                        continue;
                    if (this.fieldState[fieldName].valid)
                        continue;
                    firstInvalid = fieldName;
                    break;
                }
                this._component.$emit('validator.firstInvalid', firstInvalid);
            }
            return isValid;
        }
        fieldMessages(fieldName) {
            return this.fieldState[fieldName] ? this.fieldState[fieldName].messages : [];
        }
        firstFieldError(fieldName) {
            const errors = this.fieldMessages(fieldName);
            return errors.length ? errors[0] : undefined;
        }
        setValidator(fieldName, validatorFunctions) {
            if (!this.fieldState[fieldName])
                return;
            for (let ruleName in validatorFunctions) {
                if (!validatorFunctions.hasOwnProperty(ruleName))
                    continue;
                if (!this.fieldState[fieldName].rules[ruleName]) {
                    const ruleState = new ValidatorRuleState(validatorFunctions[ruleName]);
                    this.fieldState[fieldName].rules[ruleName] = vuePropertyDecorator.Vue.observable(ruleState);
                }
                else {
                    this.fieldState[fieldName].rules[ruleName].clearErrors();
                    this.fieldState[fieldName].rules[ruleName]._callback = validatorFunctions[ruleName];
                }
            }
        }
        forgetValidator(fieldName, ruleName) {
            if (!this.fieldState[fieldName])
                return;
            if (this.fieldState[fieldName].rules[ruleName] !== undefined) {
                delete this.fieldState[fieldName].rules[ruleName];
            }
        }
        clearErrors() {
            for (let fieldName in this.fieldState) {
                if (!this.fieldState.hasOwnProperty(fieldName))
                    continue;
                this.fieldState[fieldName].clearErrors();
            }
        }
        clearFieldErrors(fieldName) {
            if (!this.fieldState[fieldName])
                return;
            this.fieldState[fieldName].clearErrors();
        }
        _clearActiveTimer() {
            if (!this._activeTimer)
                return;
            clearTimeout(this._activeTimer);
            this._activeTimer = undefined;
        }
        get active() {
            return this._active;
        }
        set active(value) {
            if (!value) {
                this._clearActiveTimer();
            }
            if (this._active == value)
                return;
            this._active = value;
            for (let fieldName in this.fieldState) {
                if (!this.fieldState.hasOwnProperty(fieldName))
                    continue;
                this.fieldState[fieldName].active = this._active;
            }
        }
        activate(delay = 0) {
            // @ts-ignore
            this._activeTimer = setTimeout(() => {
                this._clearActiveTimer();
                this.active = true;
            }, delay);
        }
        deactivate() {
            this._clearActiveTimer();
            this.active = false;
        }
    }

    var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let FormValidate = class FormValidate extends vuePropertyDecorator.Vue {
        created() {
            this.validation = vuePropertyDecorator.Vue.observable(new Validator(this));
            vuePropertyDecorator.Vue.set(this, 'validation', this.validation);
        }
        beforeDestroy() {
            this.validation.destroy();
        }
    };
    FormValidate = __decorate([
        vuePropertyDecorator.Component
    ], FormValidate);
    var FormValidate$1 = FormValidate;

    function ValidateApply(opts, handler, options) {
        const componentOptions = opts;
        componentOptions.fieldsList = componentOptions.fieldsList || [];
        componentOptions.validators = componentOptions.validators || [];
        if (options) {
            componentOptions.validators[handler] = options;
        }
        componentOptions.fieldsList.push(handler);
    }
    function Validate(options) {
        return vueClassComponent.createDecorator((opts, handler) => ValidateApply(opts, handler, options));
    }

    function required(val) {
        const message = 'Заполните поле';
        if (typeof val === 'undefined' || val === null)
            return message;
        if (typeof val === 'string' && val.trim().length === 0)
            return message;
        if (Array.isArray(val) && val.length === 0)
            return message;
        return true;
    }
    function email(val) {
        const message = 'Некорректный Email';
        if (!val)
            return true;
        if (typeof val !== 'string')
            return message;
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const res = re.test(val.toLowerCase());
        if (!res) {
            return message;
        }
        return true;
    }
    function phone(val) {
        const message = 'Некорректный телефон';
        if (!val)
            return true;
        let numbers = '';
        if (val.length < 1) {
            return true;
        }
        for (let i = 0; i < val.length; i++) {
            if (!isNaN(parseInt(val[i]))) {
                numbers += val[i];
            }
        }
        const res = numbers.length === 11;
        if (!res) {
            return message;
        }
        return true;
    }
    function emailOrPhone(val) {
        const message = 'Некорректный телефон или Email';
        if (!val)
            return true;
        const isValidEmail = email(val) === true;
        const isValidPhone = phone(val) === true;
        if (isValidEmail || isValidPhone) {
            return true;
        }
        return message;
    }
    function fileExt(ext = []) {
        return (val) => {
            const message = 'Допустимые форматы: ' + ext.join(', ');
            if (!val || (!(val instanceof File) && !(val instanceof Map)))
                return true;
            let valid = true;
            if (val instanceof Map) {
                val.forEach((item) => {
                    const curFileExt = item.name.split('.').pop();
                    if (!curFileExt) {
                        valid = false;
                        return;
                    }
                    if (!ext.includes(curFileExt.toLocaleLowerCase())) {
                        valid = false;
                    }
                });
            }
            if (valid) {
                return true;
            }
            return message;
        };
    }
    function fileIsImage(val) {
        const message = 'Файл должен быть изображением';
        const valid = fileExt(['gif', 'jpeg', 'jpg', 'png', 'bmp'])(val);
        if (valid === true) {
            return true;
        }
        return message;
    }
    function or(validator) {
        return (val) => {
            const resultList = [];
            for (let item in validator) {
                if (!validator.hasOwnProperty(item))
                    continue;
                resultList.push(validator[item](val));
            }
            const totalResult = resultList.filter(resItem => resItem === true);
            if (totalResult.length > 0) {
                return true;
            }
            return resultList.join(' или ');
        };
    }
    function fileSize(size = 1) {
        return (val) => {
            const message = 'Максимальный размер: ' + size + ' мб';
            if (!val || (!(val instanceof File) && !(val instanceof Map)))
                return true;
            let valid = true;
            if (val instanceof Map) {
                val.forEach((item) => {
                    if (item.size > size * 1024 * 1024) {
                        valid = false;
                    }
                });
            }
            if (valid) {
                return true;
            }
            return message;
        };
    }
    function requiredIfEmpty(prop = '') {
        return function (val) {
            if (required(this[prop]) === true) {
                return true;
            }
            else {
                return required(val);
            }
        };
    }
    function requiredIf(prop = '') {
        return function (val) {
            if (!!this[prop]) {
                return required(val);
            }
            else {
                return true;
            }
        };
    }

    exports.Validate = Validate;
    exports["default"] = FormValidate$1;
    exports.email = email;
    exports.emailOrPhone = emailOrPhone;
    exports.fileExt = fileExt;
    exports.fileIsImage = fileIsImage;
    exports.fileSize = fileSize;
    exports.or = or;
    exports.phone = phone;
    exports.required = required;
    exports.requiredIf = requiredIf;
    exports.requiredIfEmpty = requiredIfEmpty;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
