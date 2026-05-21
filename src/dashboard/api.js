export function getToken() {
  return localStorage.getItem("db_token") || "";
}

export async function apiFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && typeof options.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("db_token");
    localStorage.removeItem("db_user");
    window.location.href = "/dashboard/login";
  }
  return res.json();
}

export async function uploadImage(file) {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload.php", {
    method:  "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    fd,
  });
  return res.json();
}
