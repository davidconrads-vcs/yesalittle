// The play() rejection path has to tell two unlike failures apart, and getting it
// wrong is near-invisible: on a high media-engagement origin autoplay is permitted,
// so the blocked branch never runs and the bug hides. Pinned here instead.
//
// Run with `npm test`.

import test from 'node:test'
import assert from 'node:assert/strict'
import { isAutoplayBlocked } from './useAudio'

test('recognizes the autoplay-blocked rejection', () => {
  // What Chrome/Safari/Firefox actually reject play() with when there has been no
  // user gesture. DOMException isn't available in the Node test env, so this is the
  // shape rather than the class — which is also why the check is name-based.
  assert.equal(isAutoplayBlocked({ name: 'NotAllowedError', message: 'play() failed' }), true)
})

test('treats real playback failures as fallback-worthy', () => {
  // These are what the speech-synthesis fallback exists for: the file is missing or
  // unusable, so saying it with a browser voice is strictly better than silence.
  for (const name of ['NotSupportedError', 'AbortError', 'NetworkError', 'EncodingError']) {
    assert.equal(isAutoplayBlocked({ name }), false, `${name} should still fall back`)
  }
})

test('does not mistake a non-error rejection for an autoplay block', () => {
  // A rejection can carry anything. Anything unrecognized keeps today's behavior.
  for (const value of [undefined, null, 'NotAllowedError', 0, {}, { name: undefined }, []]) {
    assert.equal(isAutoplayBlocked(value), false, `${JSON.stringify(value)} should not match`)
  }
})
