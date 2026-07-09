/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Nexus Integration Test Suite
 * Powered by Node.js native test runner.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { app } from '../server.js';
import http from 'http';

let server: http.Server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

describe('Nexus SaaS Backend Integration Tests', () => {
  before(() => {
    process.env.NODE_ENV = 'test';
    // Start server manually on the test port
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Test server running on ${BASE_URL}`);
    });
  });

  after(() => {
    if (server) {
      server.close();
      console.log('Test server shut down.');
    }
  });

  // 1. Health Check
  test('GET /api/health returns status ok', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.database, 'resilient_local_json');
  });

  // 2. Auth: Register New Entrepreneur
  let userToken = '';
  const testEmail = `founder_${Date.now()}@nexus-test.com`;

  test('POST /api/auth/register creates new user and returns token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        role: 'entrepreneur',
        name: 'Test Founder',
        industry: 'Fintech'
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.token, 'Registration should return token');
    assert.strictEqual(data.user.email, testEmail);
    assert.strictEqual(data.user.role, 'entrepreneur');
    assert.ok(data.profile, 'Profile should be returned');
    assert.ok(data.wallet, 'Wallet should be returned');

    userToken = data.token;
  });

  // 3. Auth: Duplicate Register Prevention
  test('POST /api/auth/register rejects duplicate emails', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'anotherpassword',
        role: 'investor',
        name: 'Imposter',
        industry: 'Fintech'
      })
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.error, 'An account with this email already exists');
  });

  // 4. Auth: Login
  test('POST /api/auth/login succeeds with correct password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Login should return token');
    assert.strictEqual(data.user.email, testEmail);
  });

  test('POST /api/auth/login fails with wrong password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword'
      })
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.error, 'Invalid email or password');
  });

  // 5. Authenticated Profile & Wallet Endpoint Access
  test('GET /api/auth/me returns details for authenticated user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, testEmail);
    assert.ok(data.profile);
    assert.ok(data.wallet);
  });

  test('GET /api/auth/me rejects unauthenticated requests', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert.strictEqual(res.status, 401);
  });
});
