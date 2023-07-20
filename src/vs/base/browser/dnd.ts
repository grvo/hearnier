'use strict';

import Builder = require('vs/base/browser/builder');

var $ = Builder.$;

/**
 * um ajudante que executará a função fornecida quando o HTMLElement fornecido receber um evento para 800ms
 */
export class DelayedDragHandler {
    private timeout: number;

    constructor(container: HTMLElement, callback: () => void) {
        $(container).on('dragover', () => {
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    callback();

                    delete this.timeout;
                }, 800);
            }
        });

        $(container).on([
            'dragleave',
            'drop',
            'dragend'
        ], () => this.clearDragTimeout());
    }

    private clearDragTimeout(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);

            delete this.timeout;
        }
    }

    public dispose(): void {
        this.clearDragTimeout();
    }
}