import { describe, it } from 'vitest';
import { expect } from 'vitest';

import { trackObjectMutations } from '#core/common/mutation-tracked-object.ts';

describe('mutation tracked object', () => {
  it('set new data in mutation', () => {
    const validator = () => true;
    const data = {};
    const tracked = trackObjectMutations(data, validator);
    tracked['test'] = 'test';
    expect(tracked.getMutations()).toStrictEqual({ test: 'test' });
  });

  it('modify initialized data ', () => {
    const validator = () => true;
    const data = { truc: '12', machin: 'x' };
    const tracked = trackObjectMutations(data, validator);
    expect(tracked.getMutations()).toStrictEqual({});
    expect(tracked.toRaw()).toStrictEqual(data);
    tracked['truc'] = 'machin';
    expect(tracked.getMutations()).toStrictEqual({ truc: 'machin' });
  });
});
