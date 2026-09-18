import pg from 'pg';
const { Client } = pg;
const client = new Client('postgresql://postgres:password@localhost:5432/postgres');
client.connect()
  .then(() => client.query('CREATE DATABASE gramer_bazar_test'))
  .then(() => { console.log("Created test database"); client.end(); })
  .catch(e => { console.log(e.message); client.end(); });
