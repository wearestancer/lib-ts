import { ApiEndpoint, Restriction, baseHandler } from '#api/abstract-api-endpoint.js';
import { ModelType } from '#core/abstract-model.js';
import { IdValue } from '#core/common/branded-type.js';
import { defaultHandler } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';

export interface StubData extends ModelType {
  id: IdValue;
  default: string;
  defaultNumber: number;
  untouchable: boolean;
  allAuthorized: boolean;
  ungettable: boolean;
  unmodifiable: boolean;
}
const StubModel = { regex: /^stub_[a-zA-Z0-9]{24}$/ };
export class StubEndpoint extends ApiEndpoint<StubData> {
  protected _handler = {
    id: IdHandler(StubModel.regex),
    default: defaultHandler<StubData['default']>('string'),
    defaultNumber: defaultHandler<StubData['defaultNumber']>('number'),
    untouchable: defaultHandler<StubData['untouchable']>('boolean', {
      gettable: false,
      postable: false,
      patchable: false,
    }),
    allAuthorized: defaultHandler<StubData['allAuthorized']>('boolean'),
    ungettable: defaultHandler<StubData['ungettable']>('boolean', { gettable: false }),
    unmodifiable: defaultHandler<StubData['unmodifiable']>('boolean', { postable: false, patchable: false }),
    ...baseHandler('created'),
  };
  constructor(restriction?: Restriction) {
    super({
      name: 'stubs',
      ...restriction, // We should not create a new object with variable restriction but it is more practical for testing.
    });
  }

  endpointUrl(id?: IdValue) {
    return this._getResourceUri(id);
  }
}
