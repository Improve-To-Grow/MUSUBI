/**
 * Shared requirement id pattern (CHANGE-010)
 */

const { reqIdPattern, isReqId } = require('../../src/traceability/req-id');

describe('req-id', () => {
  it('finds ids with one or more area segments', () => {
    const text =
      'REQ-001, REQ-RSVP-002 and REQ-MEETING-RSVP-003; not REQ-meeting-rsvp-004 or REQ-XXX-NNN';
    expect(text.match(reqIdPattern())).toEqual(['REQ-001', 'REQ-RSVP-002', 'REQ-MEETING-RSVP-003']);
  });

  it('checks a whole value', () => {
    expect(isReqId('REQ-MEETING-RSVP-001')).toBe(true);
    expect(isReqId('REQ-meeting-rsvp-001')).toBe(false);
    expect(isReqId('REQ-RSVP-001 extra')).toBe(false);
  });

  it('gives a stateless pattern for test()', () => {
    const pattern = reqIdPattern('');
    expect([pattern.test('REQ-A-001'), pattern.test('REQ-A-001')]).toEqual([true, true]);
  });
});
