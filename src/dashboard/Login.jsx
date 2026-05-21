import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function Login({ onLogin }) {
  const [form, setForm]   = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login.php", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      localStorage.setItem("db_token", data.token);
      localStorage.setItem("db_user",  JSON.stringify(data.user));
      onLogin(data.user);
      navigate("/dashboard");
    } catch {
      setError("Network error. Is WAMP running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-login-wrap">
      <div className="db-login-card">
        <div className="db-login-logo">
          <img src="/assets/imgs/NewLogo-small.png" alt="Ssquares" />
          <h2>Dashboard</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="db-alert db-alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="db-form-group" style={{ marginBottom: 14 }}>
            <label>Username or Email</label>
            <input name="username" value={form.username} onChange={change} required autoFocus />
          </div>
          <div className="db-form-group" style={{ marginBottom: 20 }}>
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={change} required />
          </div>
          <button className="db-btn db-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
