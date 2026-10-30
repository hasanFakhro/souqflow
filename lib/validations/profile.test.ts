import assert from 'node:assert/strict';
import { test } from 'node:test';
import { profileSchema } from './profile';

const profile = { name: 'Seller', email: 'seller@example.com', phone: '+14155552671' };

test('profile updates do not require a personal picture', () => {
  assert.equal(profileSchema.safeParse(profile).success, true);
});

test('legacy personal image fields are excluded from profile updates', () => {
  const result = profileSchema.parse({ ...profile, image: '/old-profile.png', imageFile: 'old-upload' });
  assert.equal('image' in result, false);
  assert.equal('imageFile' in result, false);
});
