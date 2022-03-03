export class ValidatorRuleState {
    constructor(callback, message) {
        this.active = true;
        this.valid = true;
        this.error = '';
        this.message = null;
        this._callback = callback;
        this.message = message || null;
    }
    validate(component, value) {
        const validationResult = this.active ? this._callback.apply(component, [value]) : true;
        if (validationResult === true) {
            this.clearErrors();
        }
        else {
            this.valid = false;
            this.error = this.message || validationResult;
        }
        return this.valid;
    }
    clearErrors() {
        this.valid = true;
        this.error = '';
    }
}
