import { TValidatorFieldState, TValidatorFieldset, TValidatorRuleState } from './types';
export declare class ValidatorFieldState implements TValidatorFieldState {
    private readonly _component;
    private _watchesList;
    private _active;
    fieldName: string;
    valid: boolean;
    rules: {
        [ruleName: string]: TValidatorRuleState;
    };
    constructor(component: TValidatorFieldset, fieldName: string);
    destroy(): void;
    clearErrors(): void;
    isValid(): boolean;
    get active(): boolean;
    set active(value: boolean);
    validate(value?: any): boolean;
    computeValid(): void;
    reduceValid(): boolean;
    get messages(): Array<string>;
    get firstMessage(): string | undefined;
}
