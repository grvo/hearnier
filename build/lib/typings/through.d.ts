// definições de type para o through
//
// projeto: https://github.com/dominictarr/through
// definições por: andrew gaspar <https://github.com/AndrewGaspar>
// definições: https://github.com/borisyankov/DefinitelyTyped

declare module "through" {
	import stream = require("stream");

	function through(write?: (data:any) => void,
		end?: () => void,
		opts?: {
			autoDestroy: boolean;
		}): through.ThroughStream;

	module through {
		export interface ThroughStream extends stream.Transform {
			autoDestroy: boolean;
		}
	}

	export = through;
}
