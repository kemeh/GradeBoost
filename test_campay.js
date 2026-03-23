import fetch from "node-fetch";

async function test() {
  const username = process.env.CAMPAY_APP_USERNAME;
  const password = process.env.CAMPAY_APP_PASSWORD;
  
  if (!username || !password) {
    console.log("No credentials. Using dummy ones to see error format.");
  }

  const user = username || "dummy";
  const pass = password || "dummy";

  const baseUrl = "https://demo.campay.net/api";
  
  // Try token endpoint
  try {
    const res = await fetch(`${baseUrl}/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });
    const text = await res.text();
    console.log(`POST /token/ -> ${res.status}`);
    console.log(text);
  } catch (e) {
    console.log(`POST /token/ -> ERROR`, e);
  }
}

test();
