import { StancerError } from '#error/base-error.js';

import pkg from './../../package.json' with { type: 'json' };
import { httpClient } from './http/fetch-http-client.js';
import { type Http } from './http/index.js';
import { ApiVersion } from './version.js';

export class _Configuration {
  //#region Properties

  private _apiVersion: ApiVersion = ApiVersion.Default;
  // Host is not publicly settable. It already point to the API.
  private _host: string = 'api.stancer.com';
  private _httpClient: Http.Client = httpClient;
  private _httpUserAgent: string = `libstancer-ts/${pkg.version} node-fetch`;
  private _keys: {
    privateLiveKey: string | null;
    privateTestKey: string | null;
  } = {
    privateLiveKey: null,
    privateTestKey: null,
  };

  private _mode: 'prod' | 'test' = 'test';
  public port?: number;
  //#endregion

  //#region Getters

  private get _privateKey(): string | null {
    switch (this._mode) {
      case 'prod':
        return this._keys.privateLiveKey;
      case 'test':
        return this._keys.privateTestKey;
      default:
        return null;
    }
  }

  get apiVersion(): string {
    return this._apiVersion;
  }

  get baseUrl(): string {
    return this.port
      ? `https://${this.host}:${this.port}/${this.apiVersion}`
      : `https://${this.host}/${this.apiVersion}`;
  }

  get defaultHttpHeaders(): Record<string, string> {
    return {
      'user-agent': this.httpUserAgent,
    };
  }

  get host(): string {
    return this._host;
  }

  get httpBasicAuthHeader() {
    if (!this._privateKey) {
      return {};
    }
    return {
      // This api only run in node env if private key is malformed we get an unauthorized error.
      authorization: `Basic ${Buffer.from(`${this._privateKey}:`).toString('base64')}`,
    };
  }

  get httpClient(): Http.Client {
    return this._httpClient;
  }

  get httpUserAgent(): string {
    return this._httpUserAgent;
  }

  public get mode(): 'prod' | 'test' {
    return this._mode;
  }

  //#endregion

  //#region Methods

  init({ keys, mode }: { keys: Partial<_Configuration['_keys']>; mode: _Configuration['mode'] }) {
    if (mode !== 'prod' && mode !== 'test') {
      throw new StancerError(`Invalid mode: ${mode}. Must be 'prod' or 'test'`);
    }
    if (mode === 'prod' && !keys.privateLiveKey) {
      throw new StancerError(`Prod key is required for production mode`);
    }
    if (mode === 'test' && !keys.privateTestKey) {
      throw new StancerError(`Test key is required for test mode`);
    }
    this._keys = Object.assign({}, this._keys, keys);
    this._mode = mode;
    return this;
  }

  setApiVersion(apiVersion: ApiVersion) {
    this._apiVersion = apiVersion;
  }

  setKey(keys: Partial<_Configuration['_keys']>) {
    this._keys = Object.assign({}, this._keys, keys);
  }

  setMode(mode: 'test' | 'prod') {
    if ((mode === 'prod' && this._keys.privateLiveKey) || (mode === 'test' && this._keys.privateTestKey)) {
      this._mode = mode;
      return;
    }
    throw new StancerError(`key matching mode ${mode} is necessary to set it`);
  }

  setUserAgent(userAgent: string) {
    this._httpUserAgent = userAgent;
  }

  //#endregion
}

export const Configuration = new _Configuration();
