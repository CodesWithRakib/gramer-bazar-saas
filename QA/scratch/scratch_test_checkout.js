const test = async () => {
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone: '01800000000', password: '123456' })
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  
  if (!token) {
    console.log("Login failed", loginData);
    return;
  }

  const checkoutRes = await fetch('http://localhost:4000/api/v1/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      addressId: "fcfa05ee-ca95-4e5b-904d-bd612434fe0c",
      paymentMethod: "COD",
      items: [{ sellerProductId: "fa8fc224-8fe3-49b4-8849-7ca7670da897", quantity: 6 }]
    })
  });
  
  const checkoutData = await checkoutRes.json();
  console.log(JSON.stringify(checkoutData, null, 2));
};
test();
