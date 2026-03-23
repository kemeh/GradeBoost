const getCampayAuth = () => {
  const username = process.env.CAMPAY_APP_USERNAME;
  const password = process.env.CAMPAY_APP_PASSWORD;
  const env = process.env.CAMPAY_ENVIRONMENT || 'dev';
  
  if (!username || !password) {
    console.warn("CamPay credentials not configured. Using mock payment gateway.");
    return { authHeader: 'mock_token', baseUrl: 'mock' };
  }

  const baseUrl = env === 'dev' ? 'https://demo.campay.net/api' : 'https://www.campay.net/api';
  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  return { authHeader, baseUrl };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, amount, description, external_reference } = req.body;
    
    const { authHeader, baseUrl } = getCampayAuth();

    if (authHeader === 'mock_token') {
      return res.json({ reference: `mock_ref_${Date.now()}` });
    }

    const response = await fetch(`${baseUrl}/collect/`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
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
      return res.status(response.status).json({ error: data.message || data || "Failed to initiate payment" });
    }

    res.json(data);
  } catch (error) {
    console.error("Payment collect error:", error.message);
    res.status(500).json({ error: "Payment failed" });
  }
}
