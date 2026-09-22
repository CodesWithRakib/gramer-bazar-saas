const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:5432/gramer_bazar');
client.connect()
  .then(() => client.query('SELECT * FROM messages ORDER BY "createdAt" DESC LIMIT 5'))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(console.error);
