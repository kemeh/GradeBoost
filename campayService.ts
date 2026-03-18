import axios from 'axios';

const CAMPAY_BASE_URL = process.env.CAMPAY_ENV === 'PROD' 
  ? 'https://www.campay.net/api' 
  : 'https://demo.campay.net/api';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getCamPayToken() {
  // Token is valid for 24h, but let's refresh every 23h
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${CAMPAY_BASE_URL}/token/`, {
      username: process.env.CAMPAY_APP_USERNAME,
      password: process.env.CAMPAY_APP_PASSWORD,
    });

    cachedToken = response.data.token;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 hours from now
    return cachedToken;
  } catch (error: any) {
    console.error('CamPay Token Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with CamPay');
  }
}

export async function initiateCollect(amount: string, phoneNumber: string, description: string, externalReference: string) {
  const token = await getCamPayToken();

  try {
    const response = await axios.post(
      `${CAMPAY_BASE_URL}/collect/`,
      {
        amount,
        currency: 'XAF',
        from: phoneNumber,
        description,
        external_reference: externalReference,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data; // { reference: "...", ussd_code: "..." }
  } catch (error: any) {
    console.error('CamPay Collect Error:', error.response?.data || error.message);
    throw new Error('Failed to initiate payment with CamPay');
  }
}

export async function checkTransactionStatus(reference: string) {
  const token = await getCamPayToken();

  try {
    const response = await axios.get(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return response.data; // { status: "SUCCESSFUL" | "FAILED" | "PENDING", ... }
  } catch (error: any) {
    console.error('CamPay Status Error:', error.response?.data || error.message);
    throw new Error('Failed to check payment status with CamPay');
  }
}
