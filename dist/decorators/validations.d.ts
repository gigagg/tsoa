export interface DateOption {
    minDate?: Date;
    maxDate?: Date;
}
export interface NumberOption {
    min?: number;
    max?: number;
}
export interface StringOption {
    minLength?: number;
    maxLength?: number;
    pattern?: number;
}
export interface ArrayOption {
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
}
export declare function IsInt(options?: NumberOption): any;
export declare function IsLong(options?: NumberOption): any;
export declare function IsFloat(options?: NumberOption): any;
export declare function IsDouble(options?: NumberOption): any;
export declare function IsDate(options?: DateOption): any;
export declare function IsDateTime(options?: DateOption): any;
export declare function IsString(options?: StringOption): any;
export declare function IsArray(options?: ArrayOption): any;
