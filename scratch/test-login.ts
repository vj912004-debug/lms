
async function testLogin() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@lms.com", password: "admin123" }),
    });

    const status = response.status;
    const text = await response.text();
    console.log(`Status: ${status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

testLogin();
