const API_URL = "/api/auth";

const login = async (data) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    const error = new Error(responseData.message || "Login failed");
    error.response = { data: responseData };
    throw error;
  }

  return responseData;
};

const register = async (data) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    const error = new Error(responseData.message || "Registration failed");
    error.response = { data: responseData };
    throw error;
  }

  return responseData;
};

const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const responseData = await res.json();

  if (!res.ok) {
    const error = new Error(responseData.message || "Request failed");
    error.response = { data: responseData };
    throw error;
  }

  return responseData;
};

const resetPassword = async (token, newPassword) => {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Password reset failed");
  }

  return data;
};

export default { login, register, forgotPassword, resetPassword };
