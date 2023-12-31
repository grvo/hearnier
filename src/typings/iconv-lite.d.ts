/// <reference path='./node.d.ts'/>

declare module 'iconv-lite' {
	export function decode(buffer: NodeBuffer, encoding:string, options?:any): string;
	export function encode(content:string, encoding:string, options?:any): NodeBuffer;

	export function encodingExists(encoding:string): boolean;

	export function decodeStream(encoding:string): NodeJS.EventEmitter;
	export function encodeStream(encoding:string): NodeJS.EventEmitter;
}