const readResponse = async (response) => {
    if (!response.ok) throw new Error(`${response.status} API error`);
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
};

export const BASE_URL = (process.env.REACT_APP_API_URL || "https://vegan-backend-server.onrender.com").replace(/\/+$/, "");

export const get = async (endpoint) => {
    const token = localStorage.getItem('token');
    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
    return readResponse(res);
};

export const post = async (endpoint, data) => {
    const token = localStorage.getItem('token');
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });
    return readResponse(res);
};

export const put = async (endpoint, data) => {
    const token = localStorage.getItem('token');
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });
    return readResponse(res);
};

// Hàm DELETE hỗ trợ truyền body nếu có data, nếu không có thì không truyền body
export const del = async (endpoint, data) => {
    const token = localStorage.getItem('token');
    const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(data && { "Content-Type": "application/json" }),
    };
    const options = {
        method: "DELETE",
        headers,
        ...(data && { body: JSON.stringify(data) }),
    };
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    return readResponse(res);
};

export const putWithParams = async (endpoint, params = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Gắn query string vào endpoint
    const query = new URLSearchParams(params).toString();
    const urlWithParams = `${BASE_URL}${endpoint}?${query}`;

    const res = await fetch(urlWithParams, {
        method: "PUT",
        headers,
    });

    return readResponse(res);
};

export const delWithParams = async (endpoint, params = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const query = new URLSearchParams(params).toString();
  const urlWithParams = `${BASE_URL}${endpoint}?${query}`;

  const res = await fetch(urlWithParams, {
    method: "DELETE",
    headers,
  });

  return readResponse(res);
};
