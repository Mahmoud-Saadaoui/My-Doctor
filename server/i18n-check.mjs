import assert from 'node:assert/strict';
import { app } from './app.js';

const server = app.listen(0);
await new Promise(resolve => server.once('listening', resolve));
const { port } = server.address();

try {
  const arabicResponse = await fetch(`http://127.0.0.1:${port}/missing-route`);
  assert.equal(arabicResponse.status, 404);
  assert.equal(arabicResponse.headers.get('content-language'), 'ar');
  assert.equal((await arabicResponse.json()).messageKey, 'errors.routeNotFound');

  const englishResponse = await fetch(`http://127.0.0.1:${port}/missing-route?lang=en`);
  assert.equal(englishResponse.status, 404);
  assert.equal(englishResponse.headers.get('content-language'), 'en');
  assert.equal((await englishResponse.json()).message, 'This route does not exist.');

  const validationResponse = await fetch(`http://127.0.0.1:${port}/api/v1/account/signup`, {
    method: 'POST',
    headers: {
      'Accept-Language': 'en',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const validationBody = await validationResponse.json();
  assert.equal(validationResponse.status, 400);
  assert.equal(validationBody.language, 'en');
  assert.equal(validationBody.errors[0].messageKey, 'validation.nameLength');

  console.log('i18n checks passed');
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
