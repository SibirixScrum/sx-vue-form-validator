import { TValidator, TValidatorFieldState, TValidatorFieldStateSet, TValidatorFieldset, TValidatorRuleSet } from './types';
export declare class Validator implements TValidator {
    _activeTimer?: number;
    _active: boolean;
    private readonly _component;
    fieldState: TValidatorFieldStateSet;
    constructor(component: TValidatorFieldset);
    destroy(): void;
    init(): void;
    clearFieldState(): void;
    validateFieldRule(fieldName: string, ruleName: string, value: any): void;
    validateField(fieldName: string): TValidatorFieldState | undefined;
    getField(fieldName: string): TValidatorFieldState | undefined;
    getFieldValid(fieldName: string): boolean;
    customError(fieldName: string, error: string): null | undefined;
    isValid(): boolean;
    fieldMessages(fieldName: string): Array<string>;
    firstFieldError(fieldName: string): string | undefined;
    setValidator(fieldName: string, validatorFunctions: TValidatorRuleSet): void;
    forgetValidator(fieldName: string, ruleName: string): void;
    clearErrors(): void;
    clearFieldErrors(fieldName: string): void;
    _clearActiveTimer(): void;
    get active(): boolean;
    set active(value: boolean);
    activate(delay?: number): void;
    deactivate(): void;
}
