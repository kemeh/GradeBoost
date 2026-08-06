const getCampayToken = async () => {
  const username = process.env.CAMPAY_APP_USERNAME;
  const password = process.env.CAMPAY_APP_PASSWORD;
  const env = process.env.CAMPAY_ENVIRONMENT || 'dev';
  
  if (!username || !password) {
    console.warn("CamPay credentials not configured. Using mock payment gateway.");
    return { token: 'mock_token', baseUrl: 'mock' };
  }

  const baseUrl = env === 'dev' ? 'https://demo.campay.net/api' : 'https://www.campay.net/api';
  
  try {
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
      throw new Error("Failed to authenticate with payment gateway");
    }

    return { token: tokenData.token, baseUrl };
  } catch (err) {
    console.error("Error getting CamPay token:", err);
    throw err;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, amount, description, external_reference } = req.body;
    
    const { token, baseUrl } = await getCampayToken();

    if (token === 'mock_token') {
      return res.json({ reference: `mock_ref_${Date.now()}` });
    }

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
        description: description || "Edulpha Payment",
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
