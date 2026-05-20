// src/Contact.jsx
// ─────────────────────────────────────────────────────────────────
// Drop-in replacement for the Contact section in App.jsx
//
// Setup:
//   1. npm install react-google-recaptcha
//   2. Replace SITE_KEY below with your reCAPTCHA v2 Site Key
//   3. Make sure contact.php is deployed at /api/contact.php
// ─────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

// ── ↓ Replace with your reCAPTCHA v2 SITE KEY (public key) ───────
const RECAPTCHA_SITE_KEY = "6LfWhussAAAAAOESeSvkEz6TwWGWFtQJrSCY6ThN";

// ── ↓ PHP endpoint — works on same domain after build + deploy ───
const API_ENDPOINT = "/api/contact.php";

export default function Contact({ bannerSrc }) {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [status, setStatus]   = useState("idle"); // idle | loading | success | error
  const [errMsg, setErrMsg]   = useState("");
  const recaptchaRef          = useRef(null);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    // 1. Get the reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setStatus("error");
      setErrMsg("Please complete the reCAPTCHA check.");
      return;
    }

    // 2. POST to PHP
    try {
      const res = await fetch(API_ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, recaptchaToken }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
        recaptchaRef.current?.reset();
      } else {
        setStatus("error");
        setErrMsg(json.message || "Something went wrong. Please try again.");
        recaptchaRef.current?.reset();
      }
    } catch {
      setStatus("error");
      setErrMsg("Network error. Please check your connection and try again.");
      recaptchaRef.current?.reset();
    }
  };

  /* ── Section Banner (same pattern as rest of the site) ─────── */
  function SB({ src, alt }) {
    return (
      <div className="sb in">
        <img src={src} alt={alt} />
      </div>
    );
  }

  return (
    <section id="contact" className="contact-section">
      {bannerSrc && <SB src={bannerSrc} alt="Contact" />}

      <div className="ct-grid">

        {/* ── Col 1 : Form ──────────────────────────────────────── */}
        <div>
          <span className="ct-col-title">Send Us an Email</span>

          {status === "success" ? (
            <div className="ct-success-box">
              <span className="ct-success-icon">✓</span>
              <p className="ct-success-msg">
                Thank you! We've received your message and will get back to
                you shortly.
              </p>
              <button
                className="outline-btn"
                style={{ marginTop: "20px" }}
                onClick={() => setStatus("idle")}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form className="ct-form" onSubmit={submit} noValidate>

              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={change}
                required
                disabled={status === "loading"}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={change}
                required
                disabled={status === "loading"}
              />

              <textarea
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={change}
                required
                rows={4}
                disabled={status === "loading"}
              />

              {/* ── reCAPTCHA v2 widget ────────────────────────── */}
              <div className="ct-recaptcha-wrap">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  theme="light"
                />
              </div>

              {/* ── Error message ──────────────────────────────── */}
              {status === "error" && (
                <p className="ct-error-msg">{errMsg}</p>
              )}

              <button
                type="submit"
                className="send-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending…" : "Send"}
              </button>

            </form>
          )}
        </div>

        {/* ── Col 2 : Contact Info ───────────────────────────────── */}
        <div>
          <span className="ct-col-title">Get in touch</span>
          <p className="ct-line">
            Phone:{" "}
            <a href="tel:+919827482972">+91 9827482972</a>
          </p>
          <p className="ct-line">
            <a href="mailto:info@ssquares.co.in">info@ssquares.co.in</a>
          </p>
          <p className="ct-line">
            <a
              href="https://goo.gl/maps/1gyBNBM5f7SAQb6E6"
              target="_blank"
              rel="noreferrer"
            >
              412 &amp; 413, Chouhan Park View,
              <br />
              Bhilai, Chhattisgarh 490020
            </a>
          </p>
        </div>

        {/* ── Col 3 : Social ────────────────────────────────────── */}
        <div>
          <span className="ct-col-title">Follow us</span>
          <p className="ct-line">
            <a
              href="https://www.facebook.com/SsquaresInteractive"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </p>
          <p className="ct-line">
            <a
              href="https://www.linkedin.com/company/ssquares-interactive"
              target="_blank"
              rel="noreferrer"
            >
              Linkedin
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}
