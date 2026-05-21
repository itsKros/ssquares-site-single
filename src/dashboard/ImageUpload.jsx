import { useRef, useState } from "react";
import { uploadImage } from "./api.js";

export default function ImageUpload({ value, onChange, label = "Cover Image" }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const pick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const data = await uploadImage(file);
    setUploading(false);
    if (data.url) onChange(data.url);
    else setError(data.error || "Upload failed");
  };

  return (
    <div>
      <div className="db-upload-box" onClick={() => ref.current.click()}>
        <input type="file" accept="image/*" ref={ref} onChange={pick} />
        {uploading ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>Uploading…</p>
        ) : value ? (
          <img src={value} alt="preview" className="db-upload-preview" />
        ) : (
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Click to upload {label}</p>
        )}
      </div>
      {error && <p style={{ color: "#c30c19", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}
