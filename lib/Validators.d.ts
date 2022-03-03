export declare function required(val: any): string | true;
export declare function email(val: any): string | true;
export declare function phone(val: any): string | true;
export declare function emailOrPhone(val: any): string | true;
export declare function fileExt(ext?: Array<string>): (val: any) => string | true;
export declare function fileIsImage(val: any): string | true;
export declare function or(validator: {
    [ruleName: string]: (value: any) => string | true;
}): (val: any) => string | true;
export declare function fileSize(size?: number): (val: any) => string | true;
export declare function requiredIfEmpty(prop?: string): (this: Vue, val: any) => string | true;
export declare function requiredIf(prop?: string): (this: Vue, val: any) => string | true;
