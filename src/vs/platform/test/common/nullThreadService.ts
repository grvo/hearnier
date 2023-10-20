'use strict';

// importação de atributos de diretório common
import winjs = require('vs/base/common/winjs.base');

// importação de atributos de diretório de plataforma
import abstractThreadService = require('vs/platform/thread/common/abstractThreadService');

// importação de atributos do diretório de instantiação
import instantiationService = require('vs/platform/instantiation/common/instantiationService');
import {SyncDescriptor0} from 'vs/platform/instantiation/common/descriptors';

// threads
import {
    IThreadService,
    IThreadServiceStatusListener,
    IThreadSynchronizableObject,
    ThreadAffinity
} from 'vs/platform/thread/common/thread';

export class NullThreadService extends abstractThreadService.AbstractThreadService implements IThreadService {
    public serviceId = IThreadService;

    constructor() {
        super(true);

        this.setInstantiationService(instantiationService.create({
            threadService: this
        }));
    }

    protected _doCreateInstance(params: any[]): any {
        return super._doCreateInstance(params);
    }

    MainThread(obj: IThreadSynchronizableObject<any>, methodName: string, target: Function, params: any[]): winjs.Promise {
        return target.apply(obj, params);
    }

    OneWorker(obj: IThreadSynchronizableObject<any>, methodName: string, target: Function, params: any[], affinity: ThreadAffinity): winjs.Promise {
        return winjs.Promise.as(null);
    }

    AllWorkers(obj: IThreadSynchronizableObject<any>, methodName: string, target: Function, params: any[]): winjs.Promise {
		return winjs.Promise.as(null);
	}

	Everywhere(obj: IThreadSynchronizableObject<any>, methodName: string, target: Function, params: any[]): any {
		return target.apply(obj, params);
	}

    ensureWorkers(): void {
        // nada a se fazer
    }

    addStatusListener(listener: IThreadServiceStatusListener): void {
		// nada a se fazer
	}

	removeStatusListener(listener: IThreadServiceStatusListener): void {
		// nada a se fazer
	}

	protected _registerAndInstantiateMainProcessActor<T>(id: string, descriptor: SyncDescriptor0<T>): T {
		return this._getOrCreateLocalInstance(id, descriptor);
	}

	protected _registerMainProcessActor<T>(id: string, actor:T): void {
		this._registerLocalInstance(id, actor);
	}

    protected _registerAndInstantiatePluginHostActor<T>(id: string, descriptor: SyncDescriptor0<T>): T {
		return this._getOrCreateLocalInstance(id, descriptor);
	}

	protected _registerPluginHostActor<T>(id: string, actor:T): void {
		throw new Error('não suportado nesse contexto de runtime!');
	}

	protected _registerAndInstantiateWorkerActor<T>(id: string, descriptor: SyncDescriptor0<T>, whichWorker:ThreadAffinity): T {
		return this._getOrCreateProxyInstance({
			callOnRemote: (proxyId: string, path: string, args:any[]): winjs.Promise => {
				return winjs.Promise.as(null);
			}
		}, id, descriptor);
	}

	protected _registerWorkerActor<T>(id: string, actor:T): void {
		throw new Error('não suportado nesse contexto de runtime!');
	}
}

export var NULL_THREAD_SERVICE = new NullThreadService();
