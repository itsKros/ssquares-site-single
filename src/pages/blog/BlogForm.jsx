import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../dashboard/api.js";
import CategorySelector from "../../dashboard/CategorySelector.jsx";
import TagSelector      from "../../dashboard/TagSelector.jsx";
import ImageUpload      from "../../dashboard/ImageUpload.jsx";

const EMPTY = {
  title: "", excerpt: "", content: "", cover_image: "",
  author: "", category_ids: [], tag_ids: [], status: "draft",
};

export default function BlogForm() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [form, setForm]     = useState(EMPTY);
  const [slug, setSlug]     = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/blog/item.php?id=${id}`).then((d) => {
      if (d.error) { setError(d.error); return; }
      setSlug(d.slug ?? "");
      setForm({
        title:        d.title        ?? "",
        excerpt:      d.excerpt      ?? "",
        content:      d.content      ?? "",
        cover_image:  d.cover_image  ?? "",
        author:       d.author       ?? "",
        status:       d.status       ?? "draft",
        category_ids: (d.categories  ?? []).map((c) => c.id),
        tag_ids:      (d.tags        ?? []).map((t) => t.id),
      });
    });
  }, [id]);

  const set    = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const change = (e) => set(e.target.name, e.target.value);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError("");
    const url    = id ? `/api/blog/item.php?id=${id}` : "/api/blog/index.php";
    const method = id ? "PUT" : "POST";
    const data   = await apiFetch(url, { method, body: JSON.stringify(form) });
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    if (data.slug) setSlug(data.slug);
    navigate("/dashboard/blog");
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="db-alert db-alert-error">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* ── Main column ── */}
        <div className="db-card">
          <div className="db-form-grid">
            <div className="db-form-group">
              <label>Title *</label>
              <input name="title" value={form.title} onChange={change} required placeholder="Post title" />
            </div>

            <div className="db-form-group">
              <label>Author Name</label>
              <input name="author" value={form.author} onChange={change} placeholder="e.g. Ssquares Team" />
            </div>

            <div className="db-form-group">
              <label>Excerpt</label>
              <textarea name="excerpt" value={form.excerpt} onChange={change} rows={2}
                placeholder="Short description shown in listings" />
            </div>

            <div className="db-form-group">
              <label>Content</label>
              <textarea name="content" value={form.content} onChange={change} rows={14}
                placeholder="Full post content (HTML supported)" />
            </div>
          </div>
        </div>

        {/* ── Side column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Publish */}
          <div className="db-card">
            <div className="db-form-group" style={{ marginBottom: 14 }}>
              <label>Status</label>
              <select name="status" value={form.status} onChange={change}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="db-form-actions">
              <button type="submit" className="db-btn db-btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                {saving ? "Saving…" : id ? "Update Post" : "Publish Post"}
              </button>
              <button type="button" className="db-btn db-btn-ghost" onClick={() => navigate("/dashboard/blog")}>
                Cancel
              </button>
            </div>
            {id && slug && (
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 13, color: "#747efe", textDecoration: "none" }}
              >
                View Post →
              </a>
            )}
          </div>

          {/* Cover image */}
          <div className="db-card">
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>Cover Image</label>
            <ImageUpload value={form.cover_image} onChange={(v) => set("cover_image", v)} label="cover image" />
          </div>

          {/* Categories */}
          <div className="db-card">
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>Categories</label>
            <CategorySelector type="blog" value={form.category_ids} onChange={(v) => set("category_ids", v)} />
          </div>

          {/* Tags */}
          <div className="db-card">
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>Tags</label>
            <TagSelector type="blog" value={form.tag_ids} onChange={(v) => set("tag_ids", v)} />
          </div>

        </div>
      </div>
    </form>
  );
}
