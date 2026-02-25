/* eslint-disable @typescript-eslint/no-require-imports */

const fetch = require('node-fetch');

async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        console.log('Status:', res.status);
        console.log('Headers:', res.headers.get('content-type'));
        const data = await res.json();
        console.log('Data:', JSON.stringify(data, null, 2));
        console.log('Is Array:', Array.isArray(data));
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testApi();
