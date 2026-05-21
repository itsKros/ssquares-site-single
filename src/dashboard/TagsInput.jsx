import { useState } from "react";

export default function TagsInput({ value = [], onChange }) {
  const [input, setInput] = useState("");

  const add = (raw) => {
    const tag = raw.trim().toLowerCase();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  const keyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
    if (e.key === "Backspace" && !input && value.length) remove(value[value.length - 1]);
  };

  return (
    <div className="db-tags-wrap" onClick={() => document.getElementById("tags-input-field").focus()}>
      {value.map((t) => (
        <span key={t} className="db-tag">
          {t}
          <button type="button" onClick={() => remove(t)}>×</button>
        </span>
      ))}
      <input
        id="tags-input-field"
        className="db-tags-input"
        placeholder={value.length === 0 ? "Add tags…" : ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={keyDown}
        onBlur={() => input && add(input)}
      />
    </div>
  );
}
