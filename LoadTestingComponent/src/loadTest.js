import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  scenarios: {
    constant_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000, // 1000 requests per minute
      timeUnit: '1m', // per minute
      duration: '4m', // total duration of 4 minutes (1 min ramp-up, 2 min test, 1 min ramp-down)
      preAllocatedVUs: 100, // number of pre-allocated VUs
      maxVUs: 1000, // maximum number of VUs
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_duration: ['avg<500'], // average latency should be around 500ms
    errors: ['rate<0.01'], // less than 1% error rate
  },
};

const properties = [1, 2, 3, 4, 5]; // properties ids

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export default function () {
  const propertyId = properties[Math.floor(Math.random() * properties.length)];
  const startDate = getRandomDate(new Date('2024-06-20'), new Date('2030-07-31'));
  const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000); // end date is 2 days after start date

  let url = 'http://host.docker.internal:3002/api/reservations';
  let payload = JSON.stringify({
    address: '123 Main St, City, Country',
    nationality: 'Uruguaya',
    country: 'Uruguay',
    propertyId: propertyId,
    adults: 2,
    children: 1,
    startDate: startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0],
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImF1dGgwfDY2NzQ3NTUyOTc4MGIzOTE4ZDE0NTU4OCIsImVtYWlsIjoiaW5xdWlsaW5vM0BjYXJtZWxhLmNvbSIsInJvbGUiOiJJbnF1aWxpbm8iLCJpYXQiOjE3MTg5MDgzMTYsImV4cCI6MTcxODk5NDcxNn0.3aEv6KQHsZEG7JRdwLxkurrBiQrY4sSAaQjD7yTmLkE',
    },
  };

  let res = http.post(url, payload, params);

  let success = check(res, {
    'latency is below 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);

  sleep(1);
}
