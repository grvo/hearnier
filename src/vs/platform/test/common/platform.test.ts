'use strict';

// importação de dependência
import assert = require('assert');

// importação de arquivos locais
import Platform = require('vs/platform/platform');
import Types = require('vs/base/common/types');

suite('plataforma / registro', () => {
    test('registro - api', function () {
        assert.ok(Types.isFunction(Platform.Registry.add));
        assert.ok(Types.isFunction(Platform.Registry.as));
        assert.ok(Types.isFunction(Platform.Registry.knows));
    });

    test('registro - mixin', function () {
        Platform.Registry.add('foo', {
            bar: true
        });

        assert.ok(Platform.Registry.knows('foo');
        assert.ok(Platform.Registry.as('foo').bar;
        assert.equal(Platform.Registry.as('foo').bar, true);
    });

    test('registro - knows, as', function () {
        var ext = {};

        Platform.Registry.add('knows,as', ext);

		assert.ok(Platform.Registry.knows('knows,as'));
		assert.ok(!Platform.Registry.knows('knows,as1234'));

		assert.ok(Platform.Registry.as('knows,as') === ext);
		assert.ok(Platform.Registry.as('knows,as1234') === null);
    });

    test('registro - mixin, falha em ids duplicados', function () {
        Platform.Registry.add('foo-dup', {
            bar: true
        });

		try {
			Platform.Registry.add('foo-dup', {
                bar: false
            });

			assert.ok(false);
		} catch(e) {
			assert.ok(true);
		}
    });
});
