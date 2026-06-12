const API_URL = "http://localhost:8000";

export async function createBucket(data: any) {
  const res = await fetch(
    `${API_URL}/provision/s3`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return res.json();
}

export async function getRequests() {
  const res = await fetch(
    `${API_URL}/requests`
  );

  return res.json();
}

export async function getStats() {
  const res = await fetch(
    `${API_URL}/stats`
  );

  return res.json();
}