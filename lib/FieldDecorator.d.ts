import Vue, { ComponentOptions } from 'vue';
import { TValidatorDecoratorOptions } from './types';
export declare function ValidateApply(opts: ComponentOptions<Vue>, handler: string, options?: TValidatorDecoratorOptions): void;
export declare function Validate(options?: TValidatorDecoratorOptions): import("vue-class-component").VueDecorator;
