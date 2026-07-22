import { IdStub, StubData } from '#test/stub/stub-model.js';
import { randomNumber, randomString } from '#test/test-helper.js';

const listModel: StubData[] = [
  {
    id: ('stub_' + randomString(24, 24)) as IdStub,
    default: randomString(1, 50),
    defaultNumber: randomNumber(12, 100),
    untouchable: true,
    allAuthorized: true,
    ungettable: true,
    unmodifiable: true,
  },
  {
    id: ('stub_' + randomString(24, 24)) as IdStub,
    default: randomString(1, 50),
    defaultNumber: randomNumber(12, 100),
    untouchable: true,
    allAuthorized: true,
    ungettable: true,
    unmodifiable: true,
  },
];
export default listModel;
