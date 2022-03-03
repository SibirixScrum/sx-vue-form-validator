import { createDecorator } from 'vue-class-component';
export function ValidateApply(opts, handler, options) {
    const componentOptions = opts;
    componentOptions.fieldsList = componentOptions.fieldsList || [];
    componentOptions.validators = componentOptions.validators || [];
    componentOptions.message = componentOptions.message || {};
    if (options) {
        if (options.rules) {
            const rules = options.rules;
            const messages = options.message;
            componentOptions.validators[handler] = rules;
            componentOptions.message[handler] = messages;
        }
        else {
            componentOptions.validators[handler] = options;
        }
    }
    componentOptions.fieldsList.push(handler);
}
export function Validate(options) {
    return createDecorator((opts, handler) => ValidateApply(opts, handler, options));
}
