// definições type para vinyl v0.4.3
//
// projeto: https://github.com/wearefractal/vinyl
// definições por: vvakame <https://github.com/vvakame>, jedmao <https://github.com/jedmao>
// definições: https://github.com/borisyankov/DefinitelyTyped

declare module 'vinyl' {
    // import de dependência
    import fs = require('fs');

    /**
     * um formato de arquivo virtual
     */
    class File {
        constructor(options?: {
            /**
             * padrão: process.cwd()
             */
            cwd?: string;

            /**
             * utilizado para pathing relativo
             * tipicamente quando um glob inicia
             */
            base?: string;

            /**
             * path completo para o arquivo
             */
            path?: string;

            /**
             * tipo: buffer|stream|null (padrão: null)
             */
            contents?: any;
        });

        /**
         * padrão: process.cwd()
         */
        public cwd: string;

        /**
         * utilizado para pathing relativo
         * tipicamente quando um glob inicia
         */
        public base: string;

        /**
         * tipo: buffer|stream|null (padrão: null)
         */
        public contents: any;

        /**
         * retorna path.relative para a base e path do arquivo
         * 
         * exemplo:
         * var file = new File({
         *     cwd: "/",
         *     base: "/test/",
         *     path: "/test/file.js"
         * });
         * 
         * console.log(file.relative); // file.js
         */
        public relative: string;

        public isBuffer(): boolean;

		public isStream(): boolean;

		public isNull(): boolean;

		public isDirectory(): boolean;

        /**
         * retorna um novo objeto file com todos os atributos clonados
         * atributos personalizados são deep-cloned
         */
        public clone(opts?: { contents?: boolean }): File;

        /**
         * caso file.contents seja um buffer, irá escrever isso para a stream
         * caso file.contents seja uma stream, irá pipar isso para a stream
         * caso file.contents seja nulo, nada acontecerá
         */
        public pipe<T extends NodeJS.ReadWriteStream>(
            stream: T,
            opts?: {
                /**
                 * caso seja falso, a stream destinada não será encerrada (assim como o core do node)
                 */
                end?: boolean;
            }
        ): T;

        /**
         * retorna uma interpretação da string do file
         * útil para o console.log
         */
        public inspect(): string;
    }

    export = File;
}
