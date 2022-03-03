import { createDecorator } from 'vue-class-component';
export function ValidateApply(opts, handler, options) {
    const componentOptions = opts;
    componentOptions.fieldsList = componentOptions.fieldsList || [];
    componentOptions.validators = componentOptions.validators || [];
    if (options) {
        componentOptions.validators[handler] = options;
    }
    componentOptions.fieldsList.push(handler);
}
export function Validate(options) {
    return createDecorator((opts, handler) => ValidateApply(opts, handler, options));
}
