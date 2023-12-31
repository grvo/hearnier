'use strict';

import types = require('vs/base/common/types');
import * as Platform from 'vs/base/common/platform';

interface ISafeWindow {
    Worker: any;
}

interface ISafeDocument {
    URL: string;

    createElement(tagName: 'div'): HTMLDivElement;
    createElement(tagName: string): HTMLElement;
}

interface INavigator {
    userAgent: string;
}

interface ILocation {
    search: string;
}

interface IGlobalScope {
    window: ISafeWindow;
    navigator:INavigator;
	parent:IGlobalScope;
	document:ISafeDocument;

	history: {
		pushState:any
	};

	isTest:boolean;
	location: ILocation;
}

var globals = <IGlobalScope> <any> (
    typeof self === 'object' ? self : global
);

// mac:
// chrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.874.100 Safari/535.2"
// safari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.51.22 (KHTML, like Gecko) Version/5.1.1 Safari/534.51.22"
//
// windows:
// chrome: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.874.102 Safari/535.2"
// ie: "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; MS-RTC LM 8; InfoPath.3; Zune 4.7)"
// opera: "Opera/9.80 (Windows NT 6.1; U; en) Presto/2.9.168 Version/11.52"
// firefox: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:8.0) Gecko/20100101 Firefox/8.0"
//
// linux:
// chrome: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
// firefox: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:34.0) Gecko/20100101 Firefox/34.0"

var userAgent = globals.navigator ? globals.navigator.userAgent : '';
var isTest = !!globals.isTest;
var isPseudo = globals.document && globals.document.URL.match(/[^\?]*\?[^\#]*pseudo=true/);

// documentado para futura referência:
//
// ao rodar ie11 em um documento modo ie10, o código irá identificar o navegador como ie10
export const isIE11 = (userAgent.indexOf('Trident') >= 0 && userAgent.indexOf('MSIE') < 0);
export const isIE10 = (userAgent.indexOf('MSIE 10') >= 0);
export const isIE9 = (userAgent.indexOf('MSIE 9') >= 0);

export const isIE11orEarlier = isIE11 || isIE10 || isIE9;
export const isIE10orEarlier = isIE10 || isIE9;
export const isIE10orLater = isIE11 || isIE10;

export const isOpera = (userAgent.indexOf('Opera') >= 0);
export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
export const isChrome = (userAgent.indexOf('Chrome') >= 0);
export const isSafari = (userAgent.indexOf('Chrome') === -1) && (userAgent.indexOf('Safari') >= 0);
export const isIPad = (userAgent.indexOf('iPad') >= 0);

export const canUseTranslate3d = !isIE9 && !isFirefox;

export const enableEmptySelectionClipboard = isWebKit;

/**
 * retorna se o navegador suporta a função history.pushState ou não
 */
export function canPushState() {
    return (!_disablePushState && globals.history && globals.history.pushState);
};

var _disablePushState = false;

/**
 * útil quando detecta que estado pushing não funciona por alguma razão
 */
export function disablePushState() {
	_disablePushState = true;
}

/**
 * retorna se o navegador suporta animações css3
 */
export function hasCSSAnimationSupport() {
	if (this._hasCSSAnimationSupport === true || this._hasCSSAnimationSupport === false) {
		return this._hasCSSAnimationSupport;
	}

	if (!globals.document) {
		return false;
	}

	var supported = false;
	var element = globals.document.createElement('div');

	var properties = [
        'animationName',
        'webkitAnimationName',
        'msAnimationName',
        'MozAnimationName',
        'OAnimationName'
    ];

	for (var i = 0; i < properties.length; i++) {
		var property = properties[i];

		if (!types.isUndefinedOrNull(element.style[property]) || element.style.hasOwnProperty(property)) {
			supported = true;

			break;
		}
	}

	if (supported) {
		this._hasCSSAnimationSupport = true;
	} else {
		this._hasCSSAnimationSupport = false;
	}

	return this._hasCSSAnimationSupport;
}

/**
 * retorna se o navegador suporta o tipo mime do vídeo fornecido ou não
 */
export function canPlayVideo(type: string) {
	if (!globals.document) {
		return false;
	}

	var video: HTMLVideoElement = <HTMLVideoElement>globals.document.createElement('video');

	if (video.canPlayType) {
		var canPlay = video.canPlayType(type);

		return canPlay === 'maybe' || canPlay === 'probably';
	}

	return false;
}

/**
 * retorna se o navegador suporta o tipo mime do áudio fornecido ou não
 */
export function canPlayAudio(type: string) {
	if (!globals.document) {
		return false;
	}

	var audio: HTMLAudioElement = <HTMLAudioElement>globals.document.createElement('audio');

	if (audio.canPlayType) {
		var canPlay = audio.canPlayType(type);

		return canPlay === 'maybe' || canPlay === 'probably';
	}

	return false;
}

export function isInWebWorker(): boolean {
	return !globals.document && typeof((<any>globals).importScripts) !== 'undefined';
}

export function supportsExecCommand(command: string): boolean {
	return (
		(isIE11orEarlier || Platform.isNative) && document.queryCommandSupported(command)
	);
}