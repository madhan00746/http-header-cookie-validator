
async function testCookie() {
  const response = await fetch("http://localhost:5000/api/validation/cookie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "sessionId",
      value: "abc123"
    })
  });

  const data = await response.json();
  console.log(data);
}

testCookie();
