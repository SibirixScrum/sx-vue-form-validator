import {TValidatorFieldState, TValidatorFieldset, TValidatorRuleState} from './types';

export class ValidatorFieldState implements TValidatorFieldState {
    private readonly _component: TValidatorFieldset;
    private _watchesList: Array<Function> = [];
    private _active: boolean = true;

    fieldName: string;
    valid: boolean = true;
    rules: { [ruleName: string]: TValidatorRuleState } = {};

    constructor(component: TValidatorFieldset, fieldName: string) {
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

    clearErrors(): void {
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName)) continue;

            this.rules[ruleName].clearErrors();
        }

        this.valid = true;
    }

    isValid(): boolean {
        return this.valid;
    }

    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        if (this._active == value) return;

        this._active = value;

        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName)) continue;

            this.rules[ruleName].active = this._active;
        }

        this.computeValid();
    }

    validate(value?: any): boolean {
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName)) continue;
            this.rules[ruleName].validate(this._component, arguments.length ? value : this._component[this.fieldName]);
        }

        this.computeValid();

        this._component.$emit(`validator.field.${this.valid ? 'valid' : 'invalid'}`, {field: this.fieldName, state: this});

        return this.valid;
    }

    computeValid(): void {
        this.valid = this.reduceValid();
    }

    reduceValid(): boolean {
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName)) continue;

            if (!this.rules[ruleName].valid) {
                return false;
            }
        }

        return true;
    }

    get messages(): Array<string> {
        const result: Array<string> = [];

        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName) || !this.rules[ruleName].active) continue;

            if (this.rules[ruleName].valid) continue;

            if (!(this.rules[ruleName].error + '').trim().length) continue;

            result.push(this.rules[ruleName].error);
        }

        return result;
    }

    get firstMessage(): string | undefined {
        const messages = this.messages;

        if (!messages.length) return;

        return messages[0];
    }
}
