import assert from 'node:assert/strict';
import { test } from 'node:test';
import { profileSchema } from './profile';

test('persisted profile images remain valid when editing the profile again', () => {
  const image = profileSchema.shape.image;
  for (const type of ['jpeg', 'png', 'webp', 'gif']) {
    assert.equal(image.safeParse(`data:image/${type};base64,aGVsbG8=`).success, true);
  }
  assert.equal(image.safeParse('/profile-existing.jpg').success, true);
});

test('profile images reject unsupported, malformed, and oversized data URLs', () => {
  for (const value of ['data:image/svg+xml;base64,aGVsbG8=', 'data:image/png;base64,%%%', `data:image/png;base64,${'A'.repeat(7000000)}`]) {
    assert.equal(profileSchema.shape.image.safeParse(value).success, false);
  }
});
