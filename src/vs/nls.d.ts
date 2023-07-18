export interface ILocalizeInfo {
    key: string;
    comment: string[];
}

export declare function localize(
    info:ILocalizeInfo,
    message:string, 
    
    ...args:any[]
):string;

export declare function localize(
    key:string,
    message:string,
    
    ...args:any[]
):string;