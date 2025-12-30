import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  const loginPayload = JSON.stringify({
    username: 'admin',
    userId: '123',
    roles: ['admin']
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 1. Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);
  
  check(loginRes, {
    'login status is 201': (r) => r.status === 201,
    'has access token': (r) => r.json('access_token') !== undefined,
  });

  const token = loginRes.json('access_token');
  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  sleep(1);

  // 2. Get Profile
  const profileRes = http.get(`${BASE_URL}/users/profile`, authHeaders);
  check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 3. Browse Marketplace
  const marketRes = http.get(`${BASE_URL}/marketplace/products`);
  check(marketRes, {
    'marketplace status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
