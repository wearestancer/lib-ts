import type { Url } from 'url';

import type { AbstractModel, ModelType } from '#core/abstract-model.js';
import type { EndpointGenerator, EndpointInterface, ListParams } from '#core/endpoint-interface.js';
import type { Validator } from '#core/validator.js';
import { StancerError } from '#error/base-error.js';
import { UnsendableError } from '#error/unsendable-error.js';

import { IdValue } from './common/branded-type.js';

//#region type & interfaces
interface CustomIteratorMapperInterface {
  map: <Data extends ModelType, CurrentModel extends AbstractModel<Data>>(
    func: (id?: Partial<Data>) => CurrentModel,
    gen: EndpointGenerator<Data>,
  ) => ModelGenerator<Data, CurrentModel>;
}

export type ModelGenerator<
  Data extends ModelType,
  CurrentModel extends AbstractModel<Data>,
  ReturnType = void,
> = AsyncGenerator<CurrentModel, ReturnType, CurrentModel>;

export interface Repository<Data extends ModelType, CurrentModel extends AbstractModel<Data>> {
  /**
   * Create a model or get it from the API if Id is given.
   * @param id either the Id of the object or data to construct our model
   * @returns the created model.
   */
  create: (id?: Data['id'] | Partial<Data>) => Promise<CurrentModel>;
  /**
   * Get a model from the API
   * @param id The id of the model
   * @returns the model from the API whose id is the given id
   */
  get: (id: IdValue) => Promise<CurrentModel>;
  /**
   * Delete a model in API
   * @param model the model to be deleted
   * @returns the deleted model
   */
  delete: (model: CurrentModel) => Promise<CurrentModel>;
  /**
   * Send a model in the API
   * if The model has Id it will try to patch otherwise it will try to send.
   * @param model the model to be sent
   * @returns the sent model with data populated.
   */
  send: (model: CurrentModel) => Promise<CurrentModel>;
  /**
   * List models.
   * @param params listing parameters (start,limit,end...)
   * @returns async generator of models
   */
  list: (params?: ListParams, endpointUrl?: Url) => ModelGenerator<Data, CurrentModel>;
}

/**
 * Static model type definition
 * Omit all the non static Method
 */
export interface StaticModel<Data extends ModelType> extends Omit<
  AbstractModel<Data>,
  | 'id'
  | 'delete'
  | 'populate'
  | 'send'
  | 'mutations'
  | 'dataTrackMutations'
  | 'data'
  | 'created'
  | 'createdAt'
  | 'deleted'
> {
  new (validator: Validator<Data>, id: string | Partial<Data> | undefined): AbstractModel<Data>;
}

export interface RepositoryParameters<Data extends ModelType, Endpoint extends EndpointInterface<Data>> {
  endpoint: Endpoint;
  model: StaticModel<Data>;
  validator: Validator<Data>;
}

const CustomIteratorMapper: CustomIteratorMapperInterface = {
  map: <Data extends ModelType, CurrentModel extends AbstractModel<Data>>(
    func: (id?: Partial<Data>) => CurrentModel,
    gen: EndpointGenerator<Data>,
  ): ModelGenerator<Data, CurrentModel> =>
    (async function* () {
      let curr;
      while (!(curr = await gen.next()).done) {
        const populated = func(curr.value);
        yield populated;
      }

      return;
    })(),
};

//#endregion

//#region Repository class

/**
 * @remarks Type assertions (`as CurrentModel`) are used throughout this class
 * due to TypeScript's limitation with abstract class constructors in generic
 * contexts. The staticModel constructor returns AbstractModel<Data>, but we
 * guarantee it's CurrentModel at runtime through proper inheritance.
 */
export abstract class AbstractRepository<
  Data extends ModelType,
  CurrentModel extends AbstractModel<Data>,
  Endpoint extends EndpointInterface<Data> = EndpointInterface<Data>,
> implements Repository<Data, CurrentModel> {
  protected endpoint: Endpoint;
  protected staticModel: StaticModel<Data>;
  protected validator: Validator<Data>;

  constructor({ endpoint, model, validator }: RepositoryParameters<Data, Endpoint>) {
    this.endpoint = endpoint;
    this.staticModel = model;
    this.validator = validator;
  }

  public async create(id?: Data['id'] | Partial<Data>): Promise<CurrentModel> {
    if (typeof id === 'string') {
      return this.get(IdValue(id));
    }

    return this.createNew(id);
  }

  /**
   * Create a new model
   * @param data initial data that will populate the model
   * @returns a new model
   */
  public createNew(data?: Partial<Data>): CurrentModel {
    return new this.staticModel(this.validator, data) as CurrentModel;
  }

  public async delete(model: CurrentModel) {
    if (!model.id) {
      throw new StancerError('could not delete the model, missing id');
    }

    const deletedData = await this.endpoint.delete(model.id);
    if (deletedData) {
      model.dataTrackMutations(deletedData);
    }

    return model;
  }

  /**
   * Get a model from the API
   * @param id the Id of the model
   * @returns the model got from the API
   */
  public async get(id: IdValue): Promise<CurrentModel> {
    const model = new this.staticModel(this.validator, id) as CurrentModel;
    const data = await this.endpoint.get(id);
    if (data) {
      model.dataTrackMutations(data);
    }

    return model;
  }

  async *list(params?: ListParams, endpointUrl?: Url): ModelGenerator<Data, CurrentModel> {
    const generator = this.endpoint.list(params ?? {}, endpointUrl);
    yield* CustomIteratorMapper.map((item) => this.createNew(item), generator);
    return;
  }

  /**
   * Send a model to the API only mutated fields will be sent.
   *
   * @param model the model whose data will be sent to the api
   * @returns the model populated With data from the API
   */
  public async send(model: CurrentModel) {
    try {
      const newData = await this.endpoint.send(model.id, model.mutations);
      if (!newData) {
        return model;
      }

      model.dataTrackMutations(newData);
      return model;
    } catch (err) {
      if (err instanceof UnsendableError) {
        throw new UnsendableError(`${err.message} is required to send ${this.staticModel.name}`, { cause: err });
      }

      throw err;
    }
  }
}
//#endregion
