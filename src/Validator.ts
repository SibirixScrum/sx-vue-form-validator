import {
    TValidator,
    TValidatorFieldState,
    TValidatorFieldStateSet,
    TValidatorFieldset,
    TValidatorRuleSet,
} from './types';
import {Vue} from 'vue-property-decorator';
import {ValidatorFieldState} from './ValidatorFieldState';
import {ValidatorRuleState} from './ValidatorRuleState';

export class Validator implements TValidator {
    _activeTimer?: number;
    _active: boolean = true;

    private readonly _component: TValidatorFieldset;

    fieldState: TValidatorFieldStateSet = {};

    constructor(component: TValidatorFieldset) {
        // Убираем от $watch(..., {deep:true}), чтобы не зацикливался
        Object.defineProperty(this, '_component', {
            enumerable: false,
            writable: true,
        });

        this._component = component;

        this.init();
    }

    destroy(): void {
        this.clearFieldState();
    }

    init(): void {
        this.clearFieldState();

        const ctor = this._component.$vnode?.componentOptions?.Ctor as (typeof Vue & { options: any });

        const fieldsList: Array<string> = ctor.options.fieldsList || [];
        const validatorList: { [fieldName: string]: TValidatorRuleSet } = ctor.options.validators || {};

        if (!fieldsList || !fieldsList.length) return;

        fieldsList.forEach(fieldName => {
            this.fieldState[fieldName] = Vue.observable(new ValidatorFieldState(this._component, fieldName));
        });

        for (let fieldName in validatorList) {
            if (!validatorList.hasOwnProperty(fieldName)) continue;

            const validatorFunctions = validatorList[fieldName];

            for (let ruleName in validatorFunctions) {
                if (!validatorFunctions.hasOwnProperty(ruleName)) continue;

                let ruleState = new ValidatorRuleState(validatorFunctions[ruleName]);

                this.fieldState[fieldName].rules[ruleName] = Vue.observable(ruleState);
            }
        }
    }

    clearFieldState(): void {
        for (let fieldName in this.fieldState) {
            if (!this.fieldState.hasOwnProperty(fieldName)) continue;

            this.fieldState[fieldName].destroy();
            delete this.fieldState[fieldName];
        }
    }

    validateFieldRule(fieldName: string, ruleName: string, value: any): void {
        if (!this.fieldState[fieldName]) return;

        if (fieldName !== 'custom' && this.fieldState[fieldName].rules['custom']) {
            this.fieldState[fieldName].rules['custom'].clearErrors();
        }

        this.fieldState[fieldName].rules[ruleName].validate(this._component, value);
        this.fieldState[fieldName].computeValid();

        if (this.fieldState[fieldName].valid) {
            this._component.$emit('validator.field.valid', {field: fieldName, state: this.fieldState[fieldName]});
        } else {
            this._component.$emit('validator.field.invalid', {field: fieldName, state: this.fieldState[fieldName]});
        }
    }

    validateField(fieldName: string): TValidatorFieldState | undefined {
        if (!this.fieldState[fieldName]) return;

        this.fieldState[fieldName].validate(this._component[fieldName]);

        return this.fieldState[fieldName];
    }

    getField(fieldName: string): TValidatorFieldState | undefined {
        return this.fieldState[fieldName];
    }

    getFieldValid(fieldName: string): boolean {
        return this.fieldState[fieldName] ? this.fieldState[fieldName].valid : true;
    }

    customError(fieldName: string, error: string) {
        if (!this.fieldState[fieldName]) return null;

        if (!this.fieldState[fieldName].rules['custom']) {
            this.fieldState[fieldName].rules['custom'] = Vue.observable(new ValidatorRuleState(() => error));
        } else {
            this.fieldState[fieldName].rules['custom'].clearErrors();
            this.fieldState[fieldName].rules['custom']._callback = () => error;
        }

        this.validateFieldRule(fieldName, 'custom', null);
    }

    isValid(): boolean {
        let isValid = true;

        for (let fieldName in this.fieldState) {
            if (!this.fieldState.hasOwnProperty(fieldName)) continue;

            this.validateField(fieldName);
            isValid = isValid && this.fieldState[fieldName].valid;
        }

        if (isValid) {
            this._component.$emit('validator.valid', this);
        } else {
            this._component.$emit('validator.invalid', this);
        }

        if (!isValid) {
            let firstInvalid;

            for (let fieldName in this.fieldState) {
                if (!this.fieldState.hasOwnProperty(fieldName)) continue;

                if (this.fieldState[fieldName].valid) continue;

                firstInvalid = fieldName;
                break;
            }

            this._component.$emit('validator.firstInvalid', firstInvalid);
        }

        return isValid;
    }

    fieldMessages(fieldName: string): Array<string> {
        return this.fieldState[fieldName] ? this.fieldState[fieldName].messages : [];
    }

    firstFieldError(fieldName: string): string | undefined {
        const errors = this.fieldMessages(fieldName);

        return errors.length ? errors[0] : undefined;
    }

    setValidator(fieldName: string, validatorFunctions: TValidatorRuleSet): void {
        if (!this.fieldState[fieldName]) return;

        for (let ruleName in validatorFunctions) {
            if (!validatorFunctions.hasOwnProperty(ruleName)) continue;

            if (!this.fieldState[fieldName].rules[ruleName]) {
                const ruleState = new ValidatorRuleState(validatorFunctions[ruleName]);

                this.fieldState[fieldName].rules[ruleName] = Vue.observable(ruleState);
            } else {
                this.fieldState[fieldName].rules[ruleName].clearErrors();
                this.fieldState[fieldName].rules[ruleName]._callback = validatorFunctions[ruleName];
            }
        }
    }

    forgetValidator(fieldName: string, ruleName: string): void {
        if (!this.fieldState[fieldName]) return;

        if (this.fieldState[fieldName].rules[ruleName] !== undefined) {
            delete this.fieldState[fieldName].rules[ruleName];
        }
    }

    clearErrors(): void {
        for (let fieldName in this.fieldState) {
            if (!this.fieldState.hasOwnProperty(fieldName)) continue;
            this.fieldState[fieldName].clearErrors();
        }
    }

    clearFieldErrors(fieldName: string): void {
        if (!this.fieldState[fieldName]) return;

        this.fieldState[fieldName].clearErrors();
    }

    _clearActiveTimer() {
        if (!this._activeTimer) return;

        clearTimeout(this._activeTimer);
        this._activeTimer = undefined;
    }

    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        if (!value) {
            this._clearActiveTimer();
        }

        if (this._active == value) return;

        this._active = value;

        for (let fieldName in this.fieldState) {
            if (!this.fieldState.hasOwnProperty(fieldName)) continue;

            this.fieldState[fieldName].active = this._active;
        }
    }

    activate(delay: number = 0) {
        // @ts-ignore
        this._activeTimer = setTimeout(() => {
            this._clearActiveTimer();
            this.active = true;
        }, delay)
    }

    deactivate() {
        this._clearActiveTimer();
        this.active = false;
    }
}
