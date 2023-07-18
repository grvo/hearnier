declare module winreg {
    export interface IRegValue {
        host: string;
        hive: any;
        key: string;
        name: string;
        type: string;
        value: any;
    }

    export interface IWinRegConfig {
        hive: any;
        key: string;
    }

    export interface IRegValuesCallback {
        (error: Error, items: IRegValue[]): void;
    }

    export interface IWinReg {
        /**
         * listar os valores abaixo desta chave
         */
        values(callback: IRegValuesCallback): void;

        /**
         * listar as sub-chaves desta chave
         */
        keys(callback: (error: Error, keys: string[]) => void): void;

        /**
         * obtém um valor por meio do nome
         */
        get(name: string, callback: (error: Error, item: IRegValue) => void): void;

        /**
         * determina um valor
         */
        set(name:string, type: string, value: string, callback: (error:string) => void): void;

        /**
         * remove o valor com a chave recebida
         */
        remove(name: string, callback: (error: void) => void): void;

        /**
         * cria essa chave
         */
        create(callback: (error:Error) => void): void;

        /**
         * remove essa chave
         */
        erase(callback: (error:Error)=> void): void;

        /**
         * uma nova instância de winreg inicializada com a parent ke
         */
        parent: IWinReg;

        host: string;
        hive: string;
        key: string;
        path: string;
    }

    export interface IWinRegFactory {
        new(config: IWinRegConfig): IWinReg;

        // hives
        HKLM: string;
		HKCU: string;
		HKCR: string;
		HKCC: string;
		HKU: string;

        // tipos
        REG_SZ: string;
 		REG_MULTI_SZ: string;
   		REG_EXPAND_SZ: string;
   		REG_DWORD: string;
   		REG_QWORD: string;
   		REG_BINARY: string;
        REG_NONE: string;
    }
}

declare module 'winreg' {
    var winreg: winreg.IWinRegFactory;

    export = winreg;
}