const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  const client = new Client('postgresql://postgres:password@localhost:5432/gramer_bazar');
  await client.connect();
  
  const hash = await bcrypt.hash('123456', 10);
  
  const resRole = await client.query("SELECT id FROM roles WHERE name = 'RIDER';");
  let roleId;
  if (resRole.rowCount === 0) {
    const insertR = await client.query("INSERT INTO roles (name, description) VALUES ('RIDER', 'RIDER') RETURNING id;");
    roleId = insertR.rows[0].id;
  } else {
    roleId = resRole.rows[0].id;
  }
  
  const resUser = await client.query(`INSERT INTO users ("firstName", "lastName", "email", "phone", "passwordHash", "status", "isEmailVerified", "isPhoneVerified") VALUES ('Speedy', 'Rider', 'rider@gramerbazar.com', '01500000000', $1, 'ACTIVE', true, true) ON CONFLICT DO NOTHING RETURNING id;`, [hash]);
  
  let userId;
  if (resUser.rowCount === 0) {
    const existing = await client.query("SELECT id FROM users WHERE phone = '01500000000'");
    userId = existing.rows[0].id;
  } else {
    userId = resUser.rows[0].id;
  }
  
  await client.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;", [userId, roleId]);
  
  console.log('Rider created successfully!');
  await client.end();
}

run().catch(console.error);
