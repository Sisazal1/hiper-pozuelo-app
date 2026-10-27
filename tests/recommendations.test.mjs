import test from 'node:test';
import assert from 'node:assert/strict';
import {getRecommendations} from '../src/lib/recommendations.ts';

test('recommendations do not recommend already in cart', () => {
  const recs = getRecommendations({currentSlug: 'bano', cartSlugs: ['bano']});
  assert.ok(!recs.find(r => r.slug === 'bano'));
});

test('recommendations structure', () => {
  const recs = getRecommendations({currentSlug: 'bano'});
  assert.ok(Array.isArray(recs));
});

test('bundle has real or honest reason if present', () => {
  const recs = getRecommendations({currentSlug: 'bano'});
  const bundle = recs.find(r => r.type === 'bundle');
  if (bundle) {
    assert.ok(bundle.reason);
  }
});