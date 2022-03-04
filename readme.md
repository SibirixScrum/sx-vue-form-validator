# Sibirix Vue From Validator
Библиотека валидации data параметров Vue компонента

## Лицензия

MIT

## Установка

```bash
npm i sx-vue-form-validator
```

## Подключение

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

## Указание валидоторов @Validate
В аргемент декоратора ```@Validate``` необходимо передать объект вида ```{ruleName: (val) => true|string}```

```ts
@Validate({required})
name: string = '';
```

Переданные валидаторы выполняются с условием **И**

### Список валидаторов
Название | Текст ошибки по умолчанию | Описание | Пример использования
---- | ---- | ---- | ---- |
**required** | Заполните поле | Зачение не пустое | ```@Validate({required})```
**email** | Некорректный Email | Проверка на корректность Email | ```@Validate({email})```
**phone** | Некорректный телефон | Проверка на корректность номера телефона | ```@phone({phone})```
**emailOrPhone** | Некорректный телефон или Email | Проверка на корректность номера телефона либо Email | ```@Validate({emailOrPhone})```
**fileExt** | Допустимые форматы: {список форматов} | Проверка расширения файла(ов) | ```@Validate({fileExt: fileExt(['pdf'])})```
**fileIsImage** | Файл должен быть изображением | Переданный файл(ы) является изображением | ```@Validate({fileIsImage})```
**fileSize** | Максимальный размер: ```size``` мб | Проверка на размер файла | ```@Validate({fileSize: fileSize(20)})```
**requiredIfEmpty** | Заполните поле | Значение обязательно, если переданный аргумент пустой | ```@Validate({requiredIfEmpty: requiredIfEmpty('email')})```
**requiredIf** | Заполните поле | Значение обязательно, если переданный аргумент не пустой | ```@Validate({requiredIf: requiredIf('email')})```
**or** | Ошибки валидоторов через слово "или" | Любой из переданных валидаторов | ```@Validate({or: or({email, phone}})})```

### Кастомный валидатор
В аргумет декоратора возможно передать кастомную функцию валидатора. 
Эта функция должна вернуть ```true``` в случае успешной валидации или ```текст ошибки``` в случае ошибки.
Контекст этой функции - компонент Vue, в котором она вызывается.

```ts
function myValidator(this: Vue, val: string): true | string {
    return val.length >= this.minLength ? true : `Минимальная длина строки - ${this.minLength}`;
}
```
### Кастомные сообщения об ошибках
В аргемент декоратора возможно передать справочник своих сообщений об ошибках
```ts
{
    rules: {ruleName: validator},
    message: {
        ruleName: 'сообщение'
    }
}
```
```ts
@Validate({rules: {required, phone}, message: {required: 'Укажите контактный телефон'}})
phone: string = '';
```

## Объет валидатора validation
Объект ```validation``` доступен в компоненте.

##### validation.getField(name): TValidatorFieldState | undefined
Текущее состояние валидатора параметра. Возвращает объект:
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
Поле | Описание |
---- | ---- |
_active | Активность вадилации параметра
valid | Текущее состояние валидности
rules | Набор правил валидации
rules.ruleName.active | Активность правила валидации
rules.ruleName.valid | Текущее состояние валидности правила
rules.ruleName.error | Текст текущей ошибки (в случае не валидности)
rules.ruleName.message | Текст кастомной ошибки (в случае, если она указана)
fieldName | Имя валидируемого параметра

##### validation.validateField(name): TValidatorFieldState | undefined
Запустить валидацию конкретного поля

##### validation.getFieldValid(name: string): boolean
Валидность конретного поля

##### validation.customError(name: string, error: string): void
Показать указанную ошибку на поле. Рекомендуется использовать для отображения ошибок, полученных от сервера

##### validation.isValid(): boolean
Запуск всех валидаций. Возвращает ```false```, если хотя бы одно правило не прошло валидацию. Рекомендуется использовать для финальной валидации формы перед отправкой на сервер

##### validation.fieldMessages(name: string): string[]
Возвращает массив всех ошибок неуспешных валидаторов

##### validation.firstFieldError(name: string): string | undefined
Возвращает текст первой ошибки (в случа нескольких валидаторов)

##### validation.setValidator(name: string, validatorFunctions: TValidatorRuleSet): void
Программно установить валидатор на поле.
```ts
const validatorFunctions = {
    ruleName: validationCollback
}
```
##### validation.forgetValidator(name: string, ruleName: string): void
Программно удалить валидатор на поле.

##### validation.clearErrors(): void
Очистить все ошибки со всех полей

##### validation.clearFieldErrors(name: string): void
Очистить все ошибки с одного поля

##### validation.activate(): void
Активировать валидатор

##### validation.deactivate(): void
Деактивировать валидатор

## События
##### validator.field.valid
Вызывается в момент успешной валидации поля. Аргумент:
```json
{   
    field: string, 
    state: TValidatorFieldState 
}
```

##### validator.field.invalid
Вызывается в момент неуспешной валидации поля. Аргумент:
```json
{   
    field: string, 
    state: TValidatorFieldState 
}
```

##### validator.valid
Вызывается в момент неуспешной валидации всех валидаторов. В аргументе передается объект ```validation```

##### validator.invalid
Вызывается если хотя бы один валидатор не прошел валидацию. В аргументе передается объект ```validation```

##### validator.firstInvalid
Вызывается в момент неуспешной валидации. В аргументе передается название первого невалидного поля

## Пример
```vue
<template>
    <div>
        <form>
            <div>
                <label for="name">Имя сотрудника</label>
                <input id="name" type="text" v-model="name">
                <div class="error" v-if="!validation.getField('name').valid">
                    {{ validation.firstFieldError('name') }}
                </div>
            </div>

            <div>
                <label for="phone">Телефон сотрудника</label>
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
        return val.length > this.minLength ? true : `Минимальная длина строки - ${this.minLength}`;
    }

    @Component
    export default class Form extends Mixins(Vue, FormValidate) {

        minLength = 5
        
        mounted() {
            this.$on('validator.valid', () => {
                console.log('Форма валидная');
            })
        }

        destroyed() {
            this.$off('validator.valid');
        }

        @Validate({required, myValidator})
        name: string = '';

        @Validate({rules: {phone}, message: {phone: 'Введите контактный телефон сотрудника'}})
        phone: string = '';
    }
</script>

```
