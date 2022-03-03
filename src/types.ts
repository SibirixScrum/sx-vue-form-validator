import {Vue} from 'vue-property-decorator';

export type TValidatorDecoratorOptions = TValidatorRuleSet;

export type TValidatorFieldset = Vue; // this для валидаторов

export type TValidatorRuleResult = string | true;
export type TValidatorRule = (this: TValidatorFieldset, value: any) => TValidatorRuleResult;
export type TValidatorRuleSet = { [ruleName: string]: TValidatorRule };

export interface TValidatorRuleState {
    active: boolean;
    valid: boolean;
    error: string;
    _callback: TValidatorRule;
    validate(context: TValidatorFieldset, value: any): boolean;
    clearErrors: () => void;
}

export interface TValidatorFieldState {
    //_component: TValidatorFieldset;
    active: boolean;
    valid: boolean;
    rules: { [ruleName: string]: TValidatorRuleState };
    messages: Array<string>;
    firstMessage: string | undefined;

    destroy(): void;
    isValid(): boolean;
    validate(value: any): boolean;
    computeValid: () => void;
    reduceValid: () => boolean;
    clearErrors: () => void;
}

export type TValidatorFieldStateSet = { [fieldName: string]: TValidatorFieldState };

export interface TValidator {
    active: boolean;
    activate(delay?: number): void;
    deactivate(): void;

    getField(fieldName: string): TValidatorFieldState | undefined;
    getFieldValid(fieldName: string): boolean;

    customError(fieldName: string, error: string): void;
    firstFieldError(fieldName: string): string | undefined;
    clearErrors(): void;
    clearFieldErrors(fieldName: string): void;
    isValid(): boolean;
}
