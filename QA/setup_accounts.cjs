const { Client } = require('pg');

async function checkAndCreateAccounts() {
  const client = new Client({
    connectionString: 'postgresql://postgres:password@localhost:5432/gramer_bazar',
  });
  await client.connect();
  
  const res = await client.query(`
    SELECT phone, roles.name as role 
    FROM users 
    JOIN user_roles ON users.id = user_roles.user_id 
    JOIN roles ON roles.id = user_roles.role_id
  `);
  console.log("Current accounts:");
  console.table(res.rows);

  const hasSeller = res.rows.some(r => r.role === 'SELLER');
  
  if (!hasSeller) {
    console.log("Creating test SELLER account (01900000000)...");
    
    // Hash for '123456' using bcrypt (cost 10)
    const hash = '$2b$10$EP0cE6K/bQjUXYBqP.2tOup9f36WJq6Mpx9H9R5P.r.bA8hJ4R.7C';
    
    const roleRes = await client.query("SELECT id FROM roles WHERE name='SELLER'");
    const sellerRoleId = roleRes.rows[0].id;
    
    const userRes = await client.query(`
      INSERT INTO users (phone, password, first_name, last_name, status, is_email_verified)
      VALUES ('01900000000', $1, 'Test', 'Seller', 'ACTIVE', true)
      RETURNING id;
    `, [hash]);
    
    const userId = userRes.rows[0].id;
    
    await client.query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2);
    `, [userId, sellerRoleId]);
    
    // Create seller profile
    await client.query(`
      INSERT INTO sellers (user_id, shop_name, shop_description, status, address_street, verified)
      VALUES ($1, 'Test Shop', 'A QA testing shop', 'APPROVED', '123 Test St', true);
    `, [userId]);
    
    console.log("SELLER account created successfully.");
  }
  
  await client.end();
}

checkAndCreateAccounts().catch(console.error);
