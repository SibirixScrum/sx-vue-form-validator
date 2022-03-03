# Sibirix Vue From Validator
Библиотека валидации data параметров Vue компонента

## Лицензия

MIT

## Установка

```bash
npm i sx-vue-form-validator --save
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
Эта функция должна вернуть ```true``` в случае успешной валидации или _текст ошибки_ в случае ошибки.
Контент этой функции - компонент Vue, в котором она вызывается.

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

##### validation.validateField(name)
Запустить валидацию конкретного поля


##### validation.getField(name)
Текущее состояние валидатора параметра.  Возвращает объект:
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

