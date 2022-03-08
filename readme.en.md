# Sibirix Vue Form Validator

[RU](readme.md) | [EN](readme.en.md)

Vue component properties (data etc) validation library

## License

MIT

## Install

```bash
npm i sx-vue-form-validator
```

## Usage example

```ts
import { Component, Vue, Mixins } from 'vue-property-decorator';

import FormValidate, {Validate, required, email} from 'sx-vue-form-validator';

@Component
export default class Form extends Mixins(Vue, FormValidate) {

    @Validate({required})
    name: string = '';

    @Validate({required, email})
    email: string = '';

}
```

## Using @Validate decorator
Pass to the ```@Validate``` object in the following form:

```{ruleName: (val) => true|string}```

```ts
@Validate({required})
name: string = '';
```

Passed validators are computed with **AND** logic

### Built-in validators
Name | Default message                       | Description                                                 | Example
---- |---------------------------------------|-------------------------------------------------------------| ---- |
**required** | Field is required                     | Non-empty value                                             | ```@Validate({required})```
**email** | Invalid email                         | Email validity check                                        | ```@Validate({email})```
**phone** | Invalid phone                         | Phone validity check                                        | ```@Validate({phone})```
**emailOrPhone** | Enter phone or email                  | Validated value must be phone or email                      | ```@Validate({emailOrPhone})```
**fileExt** | Allowed extensions: {extensions list} | File(s) extensions validation                               | ```@Validate({fileExt: fileExt(['pdf'])})```
**fileIsImage** | File must be an image                 | Validated file(s) must be an image(s)                       | ```@Validate({fileIsImage})```
**fileSize** | Max file size: ```size``` mb          | Validate file size not exceeds ```size```                   | ```@Validate({fileSize: fileSize(20)})```
**requiredIfEmpty** | One of the fields is required         | Validates field is required if the specified field is empty | ```@Validate({requiredIfEmpty: requiredIfEmpty('email')})```
**requiredIf** | Field is required                     | Field is required, if the specified argument is not empty   | ```@Validate({requiredIf: requiredIf('email')})```
**or** | Validator errors joined by 'or'       | Any validator passed as argument                            | ```@Validate({or: or({email, phone}})})```

### Custom validator
Custom validator function may be passed in to the validator's decorator. 
The function must return ```true``` if validation is successfull or ```error message``` in case of validation error.
The context of the function - Vue component, validator is set up on.

```ts
function myValidator(this: Vue, val: string): true | string {
    return val.length >= this.minLength ? true : `Minimum length - ${this.minLength}`;
}
```
### Custom error messages
Custom messages dictionary may be passed as an `message` argument to the validator decorator
```ts
{
    rules: {ruleName: validator},
    message: {
        ruleName: 'custom message'
    }
}
```
```ts
@Validate({rules: {required, phone}, message: {required: 'Please, specify contact phone'}})
phone: string = '';
```

## `validation` object
```validation``` object is available via component data-property

##### validation.getField(name): TValidatorFieldState | undefined
Field current validator state. Returns object:
```json
{
    "_active": true,
    "valid": false,
    "rules": {
        "required": {
            "active": true,
            "valid": true,
            "error": "",
            "message": null
        }
    },
    "fieldName": "name"
}
```
Property | Description                                         |
---- |-----------------------------------------------------|
_active | Field's validation activity                      
valid | Field's validation result (boolean)                        
rules | Field's validation rule states                              
rules.ruleName.active | Rule's activity                        
rules.ruleName.valid | Rule's validation result (boolean)                
rules.ruleName.error | Current error message (if invalid)       
rules.ruleName.message | Custom error message (if specified) 
fieldName | Component's validated field name                         

##### validation.validateField(fieldName): TValidatorFieldState | undefined
Validate specified field

##### validation.getFieldValid(fieldName: string): boolean
Get specified field validation result

##### validation.customError(fieldName: string, error: string): void
Set field custom error. Used for displaying server-side validation messages

##### validation.isValid(): boolean
Runs all fields validation. Returns ```false```, if any of the field's validation is invalid. Used as a guard for form submitting

##### validation.fieldMessages(name: string): string[]
Get field's validation error messages (if any invalid)

##### validation.firstFieldError(name: string): string | undefined
Get field's first error (multiple validator rules)

##### validation.setValidator(name: string, validatorFunctions: TValidatorRuleSet): void
Set field's validator rules 
```ts
const validatorFunctions = {
    ruleName: validationCollback
}
```
##### validation.forgetValidator(name: string, ruleName: string): void
Remove field's validator rule

##### validation.clearErrors(): void
Clear all fields errors

##### validation.clearFieldErrors(name: string): void
Clear field's errors

##### validation.activate(): void
Activate validator

##### validation.deactivate(): void
Deactivate validator

## Events
##### validator.field.valid
Successfull field validation. Argument:
```
{   
    field: string, 
    state: TValidatorFieldState 
}
```

##### validator.field.invalid
Failed field validation. Argument:
```
{   
    field: string, 
    state: TValidatorFieldState 
}
```

##### validator.valid
Successfull validation (all fields). Argument: ```validation``` object (validator itself)

##### validator.invalid
Failed validation (any of the fields). Argument: ```validation``` object (validator itself)

##### validator.firstInvalid
Emited when validation is failed. Argument - name of the first invalid field

## Example
```vue
<template>
    <div>
        <form>
            <div>
                <label for="name">Employee name</label>
                <input id="name" type="text" v-model="name">
                <div class="error" v-if="!validation.getField('name').valid">
                    {{ validation.firstFieldError('name') }}
                </div>
            </div>

            <div>
                <label for="phone">Employee phone</label>
                <input id="phone" type="tel" v-model="phone">
                <div class="error" v-if="!validation.getField('phone').valid">
                    {{ validation.firstFieldError('phone') }}
                </div>
            </div>
        </form>
    </div>
</template>


<script lang="ts">
    import { Component, Vue, Mixins } from 'vue-property-decorator';
    import FormValidate, { Validate, required, phone } from 'sx-vue-form-validator';

    function myValidator(this: Vue, val: string): true | string {
        return val.length > this.minLength ? true : `Minimum length - ${this.minLength}`;
    }

    @Component
    export default class Form extends Mixins(Vue, FormValidate) {

        minLength = 5
        
        mounted() {
            this.$on('validator.valid', () => {
                console.log('Form is valid');
            })
        }

        destroyed() {
            this.$off('validator.valid');
        }

        @Validate({required, myValidator})
        name: string = '';

        @Validate({rules: {phone}, message: {phone: 'Please, enter employee contact phone'}})
        phone: string = '';
    }
</script>

```
