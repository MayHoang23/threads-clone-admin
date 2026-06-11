const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function fetchAPI(endpoint, options = {}) {
  const { getAccessToken, getRefreshToken, getCurrentUser, saveAuth, clearAuth } =
    await import("./auth");
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  // Auto refresh nếu 401
  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const refreshData = await refreshRes.json();
      if (refreshData?.success) {
        // Backend chỉ trả về accessToken mới — giữ nguyên refreshToken & user đã lưu
        const { accessToken } = refreshData.data;
        saveAuth(accessToken, refreshToken, getCurrentUser());
        headers["Authorization"] = `Bearer ${accessToken}`;
        res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
      } else {
        clearAuth();
        window.location.href = "/login";
        return null;
      }
    }
  }
  return res.json();
}
