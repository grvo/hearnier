'use strict';

import Browser = require('vs/base/browser/browser');

export interface IBrowserServiceData {
    document: Document;
    window: Window;

    isHTMLElement: (o: any) => boolean;
}

export interface IBrowserService extends IBrowserServiceData {
    /**
     * zomba o dom com objetos fictícios
     */
    mock(source: IBrowserServiceData): void;

    /**
     * restaura o dom normal
     */
    restore(): void;
}

export function regularIsHTMLElement(o: any): boolean {
    if (typeof HTMLElement === 'object') {
        return o instanceof HTMLElement;
    }

    return o
        && typeof o === 'object'
        && o.nodeType === 1
        && typeof o.nodeName === 'string';
}

class BrowserService implements IBrowserService {
    public document: Document;
    public window: Window;

    public isHTMLElement: (o: any) => boolean;

    constructor() {
        this.restore();
    }

    public mock(source: IBrowserServiceData): void {
        this.document = source.document;
        this.window = source.window;

        this.isHTMLElement = source.isHTMLElement;
    }

    public restore(): void {
        this.isHTMLElement = regularIsHTMLElement;

        if (Browser.isInWebWorker()) {
            this.document = null;
            this.window = null;
        } else {
            this.document = window.document;
            this.window = window;
        }
    }
}

var browserService = new BrowserService();

export function getService(): IBrowserService {
    return browserService;
}