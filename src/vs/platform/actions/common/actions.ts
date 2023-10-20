'use strict';

// importação de propriedades do diretório base
import Actions = require('vs/base/common/actions');
import WinJS = require('vs/base/common/winjs.base');
import Assert = require('vs/base/common/assert');
import EventEmitter = require('vs/base/common/eventEmitter');

// importação de propriedades do diretório de plataforma
import Descriptors = require('vs/platform/instantiation/common/descriptors');
import Instantiation = require('vs/platform/instantiation/common/instantiation');

import {
    IKeybindingContextRule,
    IKeybindings
} from 'vs/platform/keybinding/common/keybindingService';

import {
    createDecorator,
    ServiceIdentifier
} from 'vs/platform/instantiation/common/instantiation';

export var IActionsService = createDecorator<IActionsService>('actionsService');

export interface IActionsService {
    serviceId: ServiceIdentifier<any>;

    getActions(): Actions.IAction[];
}

export class SyncActionDescriptor {
    private _descriptor: Descriptors.SyncDescriptor0<Actions.Action>;

    private _id: string;
    private _label: string;

    // keybindings
    private _keybindings: IKeybindings;
    private _keybindingContext: IKeybindingContextRule[];
    private _keybindingWeight: number;

    constructor(ctor: Instantiation.INewConstructorSignature2<string, string, Actions.Action>,
        id: string,
        label: string,
        
        keybindings?: IKeybindings,
        keybindingContext?: IKeybindingContextRule[],
        keybindingWeight?: number
    ) {
        this._id = id;
        this._label = label;

        this._keybindings = keybindings;
        this._keybindingContext = keybindingContext;
        this._keybindingWeight = keybindingWeight;

        this._descriptor = Descriptors.createSyncDescriptor(ctor, this._id, this._label);
    }

    public get syncDescriptor(): Descriptors.SyncDescriptor0<Actions.Action> {
        return this._descriptor;
    }

    public get id(): string {
        return this._id;
    }

    public get label(): string {
        return this._label;
    }

    public get keybindings(): IKeybindings {
        return this._keybindings;
    }

    public get keybindingContext(): IKeybindingContextRule[] {
        return this._keybindingContext;
    }

    public get keybindingWeight(): number {
        return this._keybindingWeight;
    }
}

/**
 * proxy para uma ação que precisa carregar o código em ordem para confunção
 * pode ser utilizado pelas contribuições para carregamento do módulo até que o método seja executado
 */
export class DeferredAction extends Actions.Action {
    private _cachedAction: Actions.Action;
    private _emitterUnbind: EventEmitter.ListenerUnbind;

    constructor(private _instantiationService: Instantiation.IInstantiationService, private _descriptor: Descriptors.AsyncDescriptor<Actions.Action>,
        id: string,

        label = '',
        cssClass = '',
        enabled = true
    ) {
        super(id, label, cssClass, enabled);
    }

    public get cachedAction(): Actions.IAction {
        return this._cachedAction;
    }

    public set cachedAction(action: Actions.IAction) {
        this._cachedAction = action;
    }

    public get id(): string {
        if (this._cachedAction instanceof Actions.Action) {
            return this._cachedAction.id;
        }

        return this._id;
    }

    public get label(): string {
        if (this._cachedAction instanceof Actions.Action) {
            return this._cachedAction.label;
        }

        return this._label;
    }

    public set label(value: string) {
        if (this._cachedAction instanceof Actions.Action) {
            this._cachedAction.label = value;
        } else {
            this._setLabel(value);
        }
    }

    public get class(): string {
        if (this._cachedAction instanceof Actions.Action) {
            return this._cachedAction.class;
        }

        return this._cssClass;
    }

    public set class(value: string) {
		if (this._cachedAction instanceof Actions.Action) {
			this._cachedAction.class = value;
		} else {
			this._setClass(value);
		}
	}

	public get enabled(): boolean {
		if (this._cachedAction instanceof Actions.Action) {
			return this._cachedAction.enabled;
		}

		return this._enabled;
	}

	public set enabled(value: boolean) {
		if (this._cachedAction instanceof Actions.Action) {
			this._cachedAction.enabled = value;
		} else {
			this._setEnabled(value);
		}
	}

    public get order(): number {
		if (this._cachedAction instanceof Actions.Action) {
			return (<Actions.Action>this._cachedAction).order;
		}
		return this._order;
	}

	public set order(order: number) {
		if (this._cachedAction instanceof Actions.Action) {
			(<Actions.Action>this._cachedAction).order = order;
		} else {
			this._order = order;
		}
	}

	public run(event?: any): WinJS.Promise {
		if(this._cachedAction) {
			return this._cachedAction.run(event);
		}

		return this._createAction().then((action: Actions.IAction) => {
			return action.run(event);
		});
	}

    private _createAction(): WinJS.TPromise<Actions.IAction> {
		var promise = WinJS.TPromise.as(undefined);

		return promise.then(() => {
			return this._instantiationService.createInstance(this._descriptor);
		}).then((action) => {
			Assert.ok(action instanceof Actions.Action, 'ação deve ser uma base action de instanceof');

			this._cachedAction = action;

			// pipar eventos da ação instanciada dentro dessa ação deferred
			this._emitterUnbind = this.addEmitter(<Actions.Action>this._cachedAction);

			return action;
		});
	}

	public dispose(): void {
		if (this._emitterUnbind) {
			this._emitterUnbind();
		}

		if(this._cachedAction) {
			this._cachedAction.dispose();
		}
		
        super.dispose();
	}
}
