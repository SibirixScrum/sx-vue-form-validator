export function required(val: any): string | true {
    const message = 'Заполните поле';

    if (typeof val === 'undefined' || val === null) return message;

    if (typeof val === 'string' && val.trim().length === 0) return message;

    if (Array.isArray(val) && val.length === 0) return message;

    return true;
}

export function email(val: any): string | true {
    const message = 'Некорректный Email';

    if (!val) return true;

    if (typeof val !== 'string') return message;

    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const res = re.test(val.toLowerCase());

    if (!res) {
        return message;
    }

    return true;
}

export function phone(val: any): string | true {
    const message = 'Некорректный телефон';

    if (!val) return true;

    let numbers = '';

    if (val.length < 1) {
        return true;
    }

    for (let i = 0; i < val.length; i++) {
        if (!isNaN(parseInt(val[i]))) {
            numbers += val[i];
        }
    }

    const res = numbers.length === 11;

    if (!res) {
        return message;
    }

    return true;
}

export function emailOrPhone(val: any): string | true {
    const message = 'Некорректный телефон или Email';

    if (!val) return true;

    const isValidEmail = email(val) === true;
    const isValidPhone = phone(val) === true;

    if (isValidEmail || isValidPhone) {
        return true;
    }

    return message;
}

export function fileExt(ext: Array<string> = []): (val: any) => string | true {
    return (val: any) => {
        const message = 'Допустимые форматы: ' + ext.join(', ');

        if (!val || (!(val instanceof File) && !(val instanceof Map))) return true;

        let valid = true;

        if (val instanceof Map) {
            val.forEach((item: File) => {
                const curFileExt = item.name.split('.').pop();

                if (!curFileExt) {
                    valid = false;

                    return;
                }

                if (!ext.includes(curFileExt.toLocaleLowerCase())) {
                    valid = false;
                }
            })
        }

        if (valid) {
            return true;
        }

        return message;
    };
}

export function fileIsImage(val: any): string | true {
    const message = 'Файл должен быть изображением';

    const valid =  fileExt(['gif', 'jpeg','jpg', 'png', 'bmp'])(val);

    if (valid === true) {
        return true;
    }

    return message;
}

export function or(validator: {[ruleName: string]: (value: any) => string | true}): (val: any) => string | true {
    return (val: any) => {
        const resultList: Array<string | true> = [];

        for (let item in validator) {
            if (!validator.hasOwnProperty(item)) continue;

            resultList.push(validator[item](val))
        }

        const totalResult = resultList.filter(resItem => resItem === true);

        if (totalResult.length > 0) {
            return true;
        }

        return resultList.join(' или ');
    }
}

export function fileSize(size: number = 1): (val: any) => string | true {
    return (val: any) => {
        const message = 'Максимальный размер: ' + size + ' мб';

        if (!val || (!(val instanceof File) && !(val instanceof Map))) return true;

        let valid = true;

        if (val instanceof Map) {
            val.forEach((item: File) => {

                if (item.size > size * 1024 * 1024) {
                    valid = false;
                }
            })
        }

        if (valid) {
            return true;
        }

        return message;
    };
}

export function requiredIfEmpty(prop: string = ''): (this: Vue, val: any) => string | true {
    return function(this: Vue, val: any) {
        if (required(this[prop]) === true) {
            return true;
        } else {
            return required(val);
        }
    };
}

export function requiredIf(prop: string = ''): (this: Vue, val: any) => string | true {
    return function(this: Vue, val: any) {
        if (!!this[prop]) {
            return required(val);
        } else {
            return true;
        }
    };
}
