import type { Temporal } from 'temporal-polyfill';

import { type ValidationFunction, type Validator, processValidator } from '#core/validator.js';

import { IdValue } from './common/branded-type.js';
import { type MutationTrackedObject, trackObjectMutations } from './common/mutation-tracked-object.js';

//#region Types & Interfaces

export interface ModelData {
  createdAt: Temporal.Instant;
  deleted: boolean;
}

export interface ModelType extends ModelData {
  id: IdValue;
}

//#endregion

/**
 * All setters and getters of AbstractModel and their children will be inconsistent.
 * This is intentional to help users use only the values accessible to them.
 */
export abstract class AbstractModel<Data extends ModelType> {
  //#region Properties

  protected _data: MutationTrackedObject<Partial<Data>>;
  protected _id: Data['id'] | undefined;
  protected validator: ValidationFunction<Data>;

  //#endregion

  //#region Constructor

  /**
   * Construct a model object.
   * Prefer using repository.create() instead of constructing it directly.
   * @param validator - The validator function for this model
   * @param id - Optional ID string or partial data object
   */
  constructor(validator: Validator<Data>, id?: string | Partial<Data>) {
    this.validator = processValidator(validator);
    this._data = trackObjectMutations<Data>({}, this.validator);

    if (typeof id === 'object' && id !== null) {
      const data = id;
      const keys = Object.keys(data) as (keyof Partial<Data>)[];
      keys.forEach((key) => {
        if (data[key] === undefined) {
          return;
        }
        this.validator(key, data[key]);
        (this._data[key] as Partial<Data>[keyof Data]) = data[key];
      });
      this._id = data.id ?? undefined;
      return;
    }

    if (id) {
      const stringID = IdValue(id);
      this.validator('id', stringID);
      this._id = stringID;
      this._data['id'] = this._id;
    }
  }

  //#endregion

  //#region Public Methods

  /**
   * Recreate a DataTrackObject with no mutations.
   * Call when data has been synced and is no longer considered mutated.
   * @param data - The data to be tracked
   */
  public dataTrackMutations(data: Partial<Data>): void {
    const keys = Object.keys(data) as (keyof Partial<Data>)[];
    keys.forEach((key) => {
      if (data[key] === undefined) {
        return;
      }
      this.validator(key, data[key]);
    });
    this._id = data.id;
    this._data = trackObjectMutations<Data>(data, this.validator);
  }

  //#endregion

  //#region Getters

  /**
   * Date of creation of this model in our API.
   * Alias: createdAt
   */
  get created(): Temporal.Instant | undefined {
    return this._data.createdAt;
  }

  /**
   * Date of creation of this model in our API.
   * Alias: created
   */
  get createdAt(): Temporal.Instant | undefined {
    return this._data.createdAt;
  }

  get deleted(): boolean | undefined {
    return this._data.deleted;
  }

  get id(): Data['id'] | undefined {
    return this._id;
  }

  /**
   * Get mutated data.
   * This is what will be sent to our endpoint.
   */
  get mutations() {
    return this._data.getMutations();
  }

  //#endregion
}
