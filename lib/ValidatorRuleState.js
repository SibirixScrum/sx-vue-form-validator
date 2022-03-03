export class ValidatorRuleState {
    constructor(callback) {
        this.active = true;
        this.valid = true;
        this.error = '';
        this._callback = callback;
    }
    validate(component, value) {
        const validationResult = this.active ? this._callback.apply(component, [value]) : true;
        if (validationResult === true) {
            this.clearErrors();
        }
        else {
            this.valid = false;
            this.error = validationResult;
        }
        return this.valid;
    }
    clearErrors() {
        this.valid = true;
        this.error = '';
    }
}
