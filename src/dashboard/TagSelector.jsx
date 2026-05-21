import { useState, useEffect } from "react";
import { apiFetch } from "./api.js";

export default function TagSelector({ type, value = [], onChange }) {
  const [tags, setTags]       = useState([]);
  const [input, setInput]     = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiFetch(`/api/tags/index.php?type=${type}`)
      .then((d) => setTags(Array.isArray(d) ? d : []));
  }, [type]);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  const addOrCreate = async (raw) => {
    const name = raw.trim().toLowerCase();
    if (!name) return;
    setInput("");

    const existing = tags.find((t) => t.name.toLowerCase() === name);
    if (existing) {
      if (!value.includes(existing.id)) onChange([...value, existing.id]);
      return;
    }

    setCreating(true);
    const data = await apiFetch("/api/tags/index.php", {
      method: "POST",
      body: JSON.stringify({ name, type }),
    });
    setCreating(false);
    if (!data.id) return;
    const fresh = { id: data.id, name: data.name, slug: data.slug, type };
    setTags((t) => [...t, fresh].sort((a, b) => a.name.localeCompare(b.name)));
    onChange([...value, data.id]);
  };

  const keyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addOrCreate(input); }
    if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const selectedTags  = tags.filter((t) => value.includes(t.id));
  const availableTags = tags.filter((t) => !value.includes(t.id));

  return (
    <div>
      {/* Selected tags as dismissible chips */}
      <div className="db-tags-wrap" onClick={() => document.getElementById(`tag-input-${type}`).focus()}>
        {selectedTags.map((t) => (
          <span key={t.id} className="db-tag">
            {t.name}
            <button type="button" onClick={() => toggle(t.id)}>×</button>
          </span>
        ))}
        <input
          id={`tag-input-${type}`}
          className="db-tags-input"
          placeholder={value.length === 0 ? "Type to add tags, press Enter…" : ""}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={keyDown}
          onBlur={() => input && addOrCreate(input)}
          disabled={creating}
        />
      </div>

      {/* Available tags to click-add */}
      {availableTags.length > 0 && (
        <div className="db-tag-pool">
          {availableTags.map((t) => (
            <button key={t.id} type="button" className="db-tag-pill" onClick={() => toggle(t.id)}>
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
