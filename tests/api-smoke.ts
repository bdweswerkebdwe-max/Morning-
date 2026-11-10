import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

async function check(path: string, init?: RequestInit) {
  const response = await fetch(new URL(path, baseUrl), init);
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function main() {
  const health = await check('/api/health');
  assert.equal(health.response.status, 200, 'health endpoint should respond 200');
  assert.equal(health.payload?.success, true, 'health endpoint should report server availability');
  assert.equal(typeof health.payload?.hasApiKey, 'boolean', 'health should report key presence without disclosing it');

  for (const path of ['/api/projects', '/api/auth/me', '/api/admin/stats']) {
    const result = await check(path);
    assert.equal(result.response.status, 401, `${path} should require Firebase authentication`);
    assert.equal(result.payload?.success, false, `${path} should reject unauthenticated requests`);
  }

  const noPaymentProof = await check('/api/user/subscription', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tier: 'pro' }),
  });
  assert.equal(noPaymentProof.response.status, 401, 'subscription endpoint should require authentication');

  console.log('API smoke checks passed: health and authentication boundaries.');
}

main().catch((error) => {
  console.error('API smoke checks failed:', error);
  process.exitCode = 1;
});
