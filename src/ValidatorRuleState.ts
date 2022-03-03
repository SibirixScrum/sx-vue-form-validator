import {TValidatorFieldset, TValidatorRule, TValidatorRuleState} from './types';

export class ValidatorRuleState implements TValidatorRuleState {
    active: boolean = true;
    valid: boolean = true;
    error: string = '';
    _callback: TValidatorRule;

    constructor(callback: TValidatorRule) {
        this._callback = callback;
    }

    validate(component: TValidatorFieldset, value: any): boolean {
        const validationResult = this.active ? this._callback.apply(component, [value]) : true;

        if (validationResult === true) {
            this.clearErrors();
        } else {
            this.valid = false;
            this.error = validationResult;
        }

        return this.valid;
    }

    clearErrors(): void {
        this.valid = true;
        this.error = '';
    }
}
