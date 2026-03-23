import fetch from "node-fetch";

async function test() {
  const username = process.env.CAMPAY_APP_USERNAME || "dummy";
  const password = process.env.CAMPAY_APP_PASSWORD || "dummy";
  
  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
  const baseUrl = "https://demo.campay.net/api";
  
  try {
    const res = await fetch(`${baseUrl}/collect/`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: 100,
        currency: "XAF",
        from: "237677123456",
        description: "Test",
        external_reference: "test1234"
      })
    });
    const text = await res.text();
    console.log(`POST /collect/ -> ${res.status}`);
    console.log(text);
  } catch (e) {
    console.log(`POST /collect/ -> ERROR`, e);
  }
}

test();
