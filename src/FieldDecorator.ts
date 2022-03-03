import { createDecorator } from 'vue-class-component';
import Vue, { ComponentOptions } from 'vue';
import {TValidatorDecoratorOptions, TValidatorRuleSet} from './types';


type TOpts = ComponentOptions<Vue> & {fieldsList: Array<string>, validators: {[field: string]: TValidatorRuleSet}};

export function ValidateApply(opts: ComponentOptions<Vue>, handler: string, options?: TValidatorDecoratorOptions) {
    const componentOptions = opts as TOpts;

    componentOptions.fieldsList = componentOptions.fieldsList || [];
    componentOptions.validators = componentOptions.validators || [];

    if (options) {
        componentOptions.validators[handler] = options;
    }

    componentOptions.fieldsList.push(handler);
}

export function Validate(options?: TValidatorDecoratorOptions) {
    return createDecorator((opts, handler): void => ValidateApply(opts, handler, options));
}
