import { TValidatorFieldset, TValidatorRule, TValidatorRuleState } from './types';
export declare class ValidatorRuleState implements TValidatorRuleState {
    active: boolean;
    valid: boolean;
    error: string;
    _callback: TValidatorRule;
    message: string | null;
    constructor(callback: TValidatorRule, message?: string);
    validate(component: TValidatorFieldset, value: any): boolean;
    clearErrors(): void;
}
