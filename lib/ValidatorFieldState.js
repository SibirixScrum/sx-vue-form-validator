export class ValidatorFieldState {
    constructor(component, fieldName) {
        this._watchesList = [];
        this._active = true;
        this.valid = true;
        this.rules = {};
        // Убираем от $watch(..., {deep:true}), чтобы не зацикливался
        Object.defineProperty(this, '_component', {
            enumerable: false,
            writable: true,
        });
        // Убираем от $watch(..., {deep:true}), чтобы не зацикливался
        Object.defineProperty(this, '_watchesList', {
            enumerable: false,
            writable: true,
        });
        this._component = component;
        this.fieldName = fieldName;
        this._watchesList.push(component.$watch(fieldName, (newValue) => {
            if (this.rules.hasOwnProperty('custom')) {
                this.rules['custom']._callback = () => true;
                this.rules['custom'].clearErrors();
            }
            this.validate(newValue);
        }));
    }
    destroy() {
        this._watchesList.forEach(watch => watch());
    }
    clearErrors() {
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName))
                continue;
            this.rules[ruleName].clearErrors();
        }
        this.valid = true;
    }
    isValid() {
        return this.valid;
    }
    get active() {
        return this._active;
    }
    set active(value) {
        if (this._active == value)
            return;
        this._active = value;
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName))
                continue;
            this.rules[ruleName].active = this._active;
        }
        this.computeValid();
    }
    validate(value) {
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName))
                continue;
            this.rules[ruleName].validate(this._component, arguments.length ? value : this._component[this.fieldName]);
        }
        this.computeValid();
        this._component.$emit(`validator.field.${this.valid ? 'valid' : 'invalid'}`, { field: this.fieldName, state: this });
        return this.valid;
    }
    computeValid() {
        this.valid = this.reduceValid();
    }
    reduceValid() {
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName))
                continue;
            if (!this.rules[ruleName].valid) {
                return false;
            }
        }
        return true;
    }
    get messages() {
        const result = [];
        for (let ruleName in this.rules) {
            if (!this.rules.hasOwnProperty(ruleName) || !this.rules[ruleName].active)
                continue;
            if (this.rules[ruleName].valid)
                continue;
            if (!(this.rules[ruleName].error + '').trim().length)
                continue;
            result.push(this.rules[ruleName].error);
        }
        return result;
    }
    get firstMessage() {
        const messages = this.messages;
        if (!messages.length)
            return;
        return messages[0];
    }
}
