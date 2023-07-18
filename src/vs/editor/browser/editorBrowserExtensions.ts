'use strict';

// imports locais
import {TPromise} from 'vs/base/common/winjs.base';
import EditorBrowser = require('vs/editor/browser/editorBrowser');
import EditorCommon = require('vs/editor/common/editorCommon');
import Platform = require('vs/platform/platform');
import Errors = require('vs/base/common/errors');
import Strings = require('vs/base/common/strings');
import config = require('vs/editor/common/config/config');

import {
    IInstantiationService,
    INewConstructorSignature1
} from 'vs/platform/instantiation/common/instantiation';

export namespace EditorBrowserRegistry {
    // --- contribuições de editor
    export function registerEditorContribution(ctor:EditorBrowser.ISimpleEditorContributionCtor): void {
        (<EditorContributionRegistry>Platform.Registry.as(Extensions.EditorContributions)).registerEditorBrowserContribution(ctor);
    }

    export function getEditorContributions(): EditorBrowser.IEditorContributionDescriptor[] {
        return (<EditorContributionRegistry>Platform.Registry.as(Extensions.EditorContributions)).getEditorBrowserContributions();
    }
}

class SimpleEditorContributionDescriptor implements EditorBrowser.IEditorContributionDescriptor {
    private _ctor:EditorBrowser.ISimpleEditorContributionCtor;

    constructor(ctor:EditorBrowser.ISimpleEditorContributionCtor) {
        this._ctor = ctor;
    }

    public createInstance(instantiationService:IInstantiationService, editor:EditorBrowser.ICodeEditor): EditorCommon.IEditorContribution {
        // cast adicionado para ajudar o compilador, pode ser removido assim que IConstructorSignature1 for removido
        return instantiationService.createInstance(<INewConstructorSignature1<EditorBrowser.ICodeEditor, EditorCommon.IEditorContribution>> this._ctor, editor);
    }
}

// pontos de extensão de editor
var Extensions = {
    EditorContributions: 'editor.contributions'
};

class EditorContributionRegistry {
    private editorContributions: EditorBrowser.IEditorContributionDescriptor[];

    constructor() {
        this.editorContributions = [];
    }

    public registerEditorBrowserContribution(ctor:EditorBrowser.ISimpleEditorContributionCtor): void {
		this.editorContributions.push(new SimpleEditorContributionDescriptor(ctor));
	}

	public getEditorBrowserContributions(): EditorBrowser.IEditorContributionDescriptor[] {
		return this.editorContributions.slice(0);
	}
}

Platform.Registry.add(Extensions.EditorContributions, new EditorBrowserRegistry());