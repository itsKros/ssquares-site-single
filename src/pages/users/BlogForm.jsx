// UserForm — file kept as BlogForm.jsx for folder compatibility
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../dashboard/api.js";

const EMPTY = { name: "", email: "", username: "", password: "", role: "editor" };

export default function UserForm() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (id) {
      apiFetch(`/api/users/item.php?id=${id}`).then((d) => {
        if (d.error) { setError(d.error); return; }
        setForm({ name: d.name, email: d.email, username: d.username || "", password: "", role: d.role });
      });
    }
  }, [id]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!id && !form.password) { setError("Password is required for new users"); return; }
    setSaving(true);
    setError("");
    const url    = id ? `/api/users/item.php?id=${id}` : "/api/users/index.php";
    const method = id ? "PUT" : "POST";
    const body   = { ...form };
    if (id && !body.password) delete body.password;
    const data = await apiFetch(url, { method, body: JSON.stringify(body) });
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    navigate("/dashboard/users");
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="db-alert db-alert-error">{error}</div>}

      <div className="db-card" style={{ maxWidth: 560 }}>
        <div className="db-form-grid">

          <div className="db-form-group">
            <label>Full Name *</label>
            <input name="name" value={form.name} onChange={change} required placeholder="John Doe" />
          </div>

          <div className="db-form-group">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={change} required placeholder="john@example.com" />
          </div>

          {!id && (
            <div className="db-form-group">
              <label>Username *</label>
              <input name="username" value={form.username} onChange={change} required placeholder="johndoe" />
            </div>
          )}

          <div className="db-form-group">
            <label>{id ? "New Password (leave blank to keep)" : "Password *"}</label>
            <input name="password" type="password" value={form.password} onChange={change} placeholder="••••••••" />
          </div>

          <div className="db-form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={change}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

        </div>

        <div className="db-form-actions" style={{ marginTop: 20 }}>
          <button type="submit" className="db-btn db-btn-primary" disabled={saving}>
            {saving ? "Saving…" : id ? "Update User" : "Create User"}
          </button>
          <button type="button" className="db-btn db-btn-ghost" onClick={() => navigate("/dashboard/users")}>Cancel</button>
        </div>
      </div>
    </form>
  );
}
