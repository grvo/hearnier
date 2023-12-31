'use strict';

export const empty: IDisposable = Object.freeze({
	dispose() { }
});

export interface IDisposable {
	dispose(): void;
}

export function disposeAll<T extends IDisposable>(arr: T[]): T[] {
	for (var i = 0, len = arr.length; i < len; i++) {
		if(arr[i]) {
			arr[i].dispose();
		}
	}

	return [];
}

export function combinedDispose(...disposables: IDisposable[]): IDisposable {
	return {
		dispose: () => disposeAll(disposables)
	};
}

export function combinedDispose2(disposables: IDisposable[]): IDisposable {
	return {
		dispose: () => disposeAll(disposables)
	};
}

export function fnToDisposable(fn: ()=>void): IDisposable {
	return {
		dispose: () => fn()
	};
}

export function toDisposable(...fns: (()=>void)[]): IDisposable {
	return combinedDispose2(fns.map(fnToDisposable));
}

function callAll(arg:any):any {
	if (!arg) {
		return null;
	} else if(typeof arg === 'function') {
		arg();

		return null;
	} else if(Array.isArray(arg)) {
		while(arg.length > 0) {
			arg.pop()();
		}

		return arg;
	} else {
		return null;
	}
}

export interface CallAll {
	(fn: Function): Function;
	(fn: Function[]): Function[];
}

/**
 * chama por todas as funções que serão passadas para isso
 */
export var cAll: CallAll = callAll;