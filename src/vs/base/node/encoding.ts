'use strict';

import stream = require('vs/base/node/stream');

export var UTF8 = 'utf8';
export var UTF16be = 'utf16be';
export var UTF16le = 'utf16le';

export function detectEncodingByBOMFromBuffer(buffer: NodeBuffer, bytesRead: number): string {
    if (!buffer || bytesRead < 2) {
        return null;
    }

    var b0 = buffer.readUInt8(0);
    var b1 = buffer.readUInt8(1);

    // utf-16 be
    if (b0 === 0xFE && b1 === 0xFF) {
		return UTF16be;
	}

    // utf-16 le
    if (b0 === 0xFF && b1 === 0xFE) {
		return UTF16le;
	}

    if (bytesRead < 3) {
		return null;
	}

	var b2 = buffer.readUInt8(2);

    // utf-8
    if (b0 === 0xEF && b1 === 0xBB && b2 === 0xBF) {
		return UTF8;
	}

	return null;
};

/**
 * detecta o byte order mark em um arquivo fornecido
 * 
 * se o bom não for detectado, `encoding` será nulo
 */
export function detectEncodingByBOM(
    file: string,
    
    callback: (
        error: Error,
        encoding: string
    ) => void
): void {
	stream.readExactlyByFile(
        file, 3, (
            err: Error,
            buffer: NodeBuffer,
            bytesRead: number
        ) => {
            if (err) {
                return callback(err, null);
            }

            return callback(
                null, detectEncodingByBOMFromBuffer(
                    buffer,
                    bytesRead
                )
            );
	    }
    );
}