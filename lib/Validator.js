import { Vue } from 'vue-property-decorator';
import { ValidatorFieldState } from './ValidatorFieldState';
import { ValidatorRuleState } from './ValidatorRuleState';
export class Validator {
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
            this.fieldState[fieldName] = Vue.observable(new ValidatorFieldState(this._component, fieldName));
        });
        for (let fieldName in validatorList) {
            if (!validatorList.hasOwnProperty(fieldName))
                continue;
            const validatorFunctions = validatorList[fieldName];
            for (let ruleName in validatorFunctions) {
                if (!validatorFunctions.hasOwnProperty(ruleName))
                    continue;
                let ruleState = new ValidatorRuleState(validatorFunctions[ruleName]);
                this.fieldState[fieldName].rules[ruleName] = Vue.observable(ruleState);
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
            this.fieldState[fieldName].rules['custom'] = Vue.observable(new ValidatorRuleState(() => error));
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
                this.fieldState[fieldName].rules[ruleName] = Vue.observable(ruleState);
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
