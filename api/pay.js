export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, amount, description, external_reference } = req.body;
    
    const username = process.env.CAMPAY_APP_USERNAME;
    const password = process.env.CAMPAY_APP_PASSWORD;
    const env = process.env.CAMPAY_ENVIRONMENT || 'DEMO';
    
    if (!username || !password) {
      console.warn("CamPay credentials not configured. Using mock payment gateway.");
      return res.json({ reference: `mock_ref_${Date.now()}` });
    }

    const isDemo = env.toUpperCase() === 'DEMO' || env.toUpperCase() === 'DEV';
    const baseUrl = isDemo ? 'https://demo.campay.net/api' : 'https://www.campay.net/api';
    
    // 1. Get Token
    const tokenRes = await fetch(`${baseUrl}/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("CamPay token error:", tokenData);
      return res.status(500).json({ error: "Failed to authenticate with payment gateway" });
    }

    const token = tokenData.token;

    // 2. Initiate Payment
    const response = await fetch(`${baseUrl}/collect/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        currency: "XAF",
        from: phone,
        description: description || "GradeBoost Payment",
        external_reference: external_reference
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Payment collect error response:", data);
      const errorMsg = data.message || data.detail || (typeof data === 'string' ? data : JSON.stringify(data));
      return res.status(response.status).json({ error: errorMsg });
    }

    res.json(data);
  } catch (error) {
    console.error("Payment collect error:", error.message);
    res.status(500).json({ error: "Payment failed" });
  }
}
