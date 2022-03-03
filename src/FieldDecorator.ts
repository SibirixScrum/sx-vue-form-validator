import { createDecorator } from 'vue-class-component';
import Vue, { ComponentOptions } from 'vue';
import {TValidatorDecoratorOptions, TValidatorRuleSet, TValidatorRuleMessage} from './types';

type TOpts = ComponentOptions<Vue> & {fieldsList: Array<string>, validators: {[field: string]: TValidatorRuleSet}, message: {[field: string]: TValidatorRuleMessage}};

export function ValidateApply(opts: ComponentOptions<Vue>, handler: string, options?: TValidatorDecoratorOptions) {
    const componentOptions = opts as TOpts;

    componentOptions.fieldsList = componentOptions.fieldsList || [];
    componentOptions.validators = componentOptions.validators || [];
    componentOptions.message = componentOptions.message || {};

    if (options) {
        if (options.rules) {
            const rules = options.rules as TValidatorRuleSet;
            const messages = options.message as TValidatorRuleMessage

            componentOptions.validators[handler] = rules;
            componentOptions.message[handler] = messages;
        } else {
            componentOptions.validators[handler] = options as TValidatorRuleSet;
        }
    }

    componentOptions.fieldsList.push(handler);
}

export function Validate(options?: TValidatorDecoratorOptions) {
    return createDecorator((opts, handler): void => ValidateApply(opts, handler, options));
}
