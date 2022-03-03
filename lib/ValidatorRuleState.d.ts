import { TValidatorFieldset, TValidatorRule, TValidatorRuleState } from './types';
export declare class ValidatorRuleState implements TValidatorRuleState {
    active: boolean;
    valid: boolean;
    error: string;
    _callback: TValidatorRule;
    constructor(callback: TValidatorRule);
    validate(component: TValidatorFieldset, value: any): boolean;
    clearErrors(): void;
}
