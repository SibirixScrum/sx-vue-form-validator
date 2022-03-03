import {TValidatorFieldset, TValidatorRule, TValidatorRuleState} from './types';

export class ValidatorRuleState implements TValidatorRuleState {
    active: boolean = true;
    valid: boolean = true;
    error: string = '';
    _callback: TValidatorRule;
    message:string | null = null;

    constructor(callback: TValidatorRule, message?:string) {
        this._callback = callback;
        this.message = message || null;
    }

    validate(component: TValidatorFieldset, value: any): boolean {
        const validationResult = this.active ? this._callback.apply(component, [value]) : true;

        if (validationResult === true) {
            this.clearErrors();
        } else {
            this.valid = false;
            this.error = this.message || validationResult;
        }

        return this.valid;
    }

    clearErrors(): void {
        this.valid = true;
        this.error = '';
    }
}
