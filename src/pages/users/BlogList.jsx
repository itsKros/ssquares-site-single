// UserList — file kept as BlogList.jsx for folder compatibility
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../dashboard/api.js";

export default function UserList() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch("/api/users/index.php")
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const del = async () => {
    await apiFetch(`/api/users/item.php?id=${confirm}`, { method: "DELETE" });
    setConfirm(null);
    load();
  };

  if (loading) return <div className="db-loading">Loading…</div>;

  return (
    <div>
      <div className="db-toolbar">
        <span className="db-toolbar-title">{users.length} user{users.length !== 1 ? "s" : ""}</span>
        <Link to="/dashboard/users/new" className="db-btn db-btn-primary">+ New User</Link>
      </div>

      <div className="db-card">
        {users.length === 0 ? (
          <div className="db-empty"><p>No users found.</p></div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Username</th><th>Role</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td style={{ color: "#6b7280" }}>{u.username}</td>
                    <td><span className={`db-badge db-badge-${u.role}`}>{u.role}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <Link to={`/dashboard/users/edit/${u.id}`} className="db-btn db-btn-ghost db-btn-sm" style={{ marginRight: 6 }}>Edit</Link>
                      <button className="db-btn db-btn-danger db-btn-sm" onClick={() => setConfirm(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <h3>Delete User?</h3>
            <p>This action cannot be undone.</p>
            <div className="db-modal-actions">
              <button className="db-btn db-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="db-btn db-btn-danger" onClick={del}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
