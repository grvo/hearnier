'use strict';

import Types = require('vs/base/common/types');
import Assert = require('vs/base/common/assert');

import {
    IInstantiationService,

    IConstructorSignature0,
    INewConstructorSignature0
} from 'vs/platform/instantiation/common/instantiation';

export interface IRegistry {
    /**
     * adiciona as funções e as propriedades da extensão pelo dado para a plataforma
     * o id fornecido precisa ser único
     * 
     * @param id um identificado único
     * @param data uma contribuição
     */
    add(id: string, data: any): void;

    /**
     * retorna true caso tenha uma extensão com o id fornecido
     * 
     * @param id um identificador da extensão
     */
    knows(id: string): boolean;

    /**
     * retorna as funções e propriedades da extensão definidos pela key específica ou nula
     * 
     * @param id um identificador da extensão
     */
    as(id: string): any;
}

class RegistryImpl implements IRegistry {
    private data: {
        [id: string]: any;
    };

    constructor() {
        this.data = {};
    }

    public add(id: string, data: any): void {
        Assert.ok(Types.isString(id));
        Assert.ok(Types.isObject(data));

        Assert.ok(!this.data.hasOwnProperty(id), 'já existe alguma extensão com esse id');

        this.data[id] = data;
    }

    public knows(id: string): boolean {
        return this.data.hasOwnProperty(id);
    }

    public as(id: string): any {
        return this.data[id] || null;
    }
}

export var Registry = <IRegistry> new RegistryImpl();

/**
 * classe base para registros que criam instâncias
 */
export class BaseRegistry<T> {
    private toBeInstantiated: IConstructorSignature0<T>[] = [];
	private instances: T[] = [];
	private instantiationService: IInstantiationService;

    public setInstantiationService(service: IInstantiationService): void {
        this.instantiationService = service;

        while (this.toBeInstantiated.length > 0) {
            var entry = this.toBeInstantiated.shift();

            this.instantiate(entry);
        }
    }

    private instantiate(ctor: IConstructorSignature0<T> | INewConstructorSignature0<T>): void {
        var instance = this.instantiationService.createInstance(ctor);

        this.instances.push(instance);
    }

    _register(ctor: IConstructorSignature0<T> | INewConstructorSignature0<T>): void {
        if (this.instantiationService) {
            this.instantiate(ctor);
        } else {
            this.toBeInstantiated.push(ctor);
        }
    }

    _getInstances():T[] {
		return this.instances.slice(0);
	}

	_setInstances(instances:T[]):void {
		this.instances = instances;
	}
}