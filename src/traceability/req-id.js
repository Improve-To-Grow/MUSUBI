/**
 * Requirement id pattern (constitution Article IV): REQ-<AREA>[-<AREA>...]-<NNN>, such as REQ-001,
 * REQ-RSVP-001 and the REQ-MEETING-RSVP-001 that musubi-requirements writes for a feature named
 * meeting-rsvp. Every module that finds requirement ids uses this one pattern.
 */

const REQ_ID_SOURCE = 'REQ-(?:[A-Z0-9]+-)*\\d+';

/**
 * A new RegExp for requirement ids
 * @param {string} [flags='g'] - RegExp flags; '' for a single `test()`
 * @returns {RegExp}
 */
function reqIdPattern(flags = 'g') {
  return new RegExp(REQ_ID_SOURCE, flags);
}

/**
 * Whether the whole value is one requirement id
 * @param {string} value
 * @returns {boolean}
 */
function isReqId(value) {
  return new RegExp(`^${REQ_ID_SOURCE}$`).test(value);
}

module.exports = { REQ_ID_SOURCE, reqIdPattern, isReqId };
