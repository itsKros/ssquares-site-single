import { useState, useEffect } from "react";
import { apiFetch } from "./api.js";

export default function CategorySelector({ type, value = [], onChange }) {
  const [cats, setCats]     = useState([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding]   = useState(false);
  const [err, setErr]         = useState("");

  useEffect(() => {
    apiFetch(`/api/categories/index.php?type=${type}`)
      .then((d) => setCats(Array.isArray(d) ? d : []));
  }, [type]);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  const addNew = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setErr("");
    const data = await apiFetch("/api/categories/index.php", {
      method: "POST",
      body: JSON.stringify({ name, type }),
    });
    setAdding(false);
    if (data.error) { setErr(data.error); return; }
    const fresh = { id: data.id, name, slug: data.slug, type };
    setCats((c) => [...c, fresh].sort((a, b) => a.name.localeCompare(b.name)));
    onChange([...value, data.id]);
    setNewName("");
  };

  return (
    <div className="db-cat-selector">
      <div className="db-cat-list">
        {cats.length === 0 && (
          <p style={{ fontSize: 13, color: "#9ca3af", padding: "4px 6px" }}>
            No categories yet — add one below.
          </p>
        )}
        {cats.map((c) => (
          <label key={c.id} className="db-cat-check">
            <input
              type="checkbox"
              checked={value.includes(c.id)}
              onChange={() => toggle(c.id)}
            />
            {c.name}
          </label>
        ))}
      </div>

      <div className="db-cat-add">
        <input
          placeholder="+ New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNew())}
          disabled={adding}
        />
        <button type="button" className="db-btn db-btn-ghost db-btn-sm" onClick={addNew} disabled={adding}>
          {adding ? "Adding…" : "Add"}
        </button>
      </div>
      {err && <p style={{ fontSize: 12, color: "#c30c19" }}>{err}</p>}
    </div>
  );
}
