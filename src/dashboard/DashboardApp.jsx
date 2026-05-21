import { useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import "./dashboard.css";

import Login         from "./Login.jsx";
import Overview      from "./Overview.jsx";
import BlogList      from "../pages/blog/BlogList.jsx";
import BlogForm      from "../pages/blog/BlogForm.jsx";
import PortfolioList from "../pages/portfolio/PortfolioList.jsx";
import PortfolioForm from "../pages/portfolio/PortfolioForm.jsx";
import UserList      from "../pages/users/BlogList.jsx";
import UserForm      from "../pages/users/BlogForm.jsx";
import TaxonomyPage  from "../pages/taxonomy/TaxonomyPage.jsx";

function IconHome()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconFile()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function IconBriefcase() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>; }
function IconUsers()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconTag()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function IconFolder()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>; }

function Sidebar({ user, onLogout }) {
  return (
    <aside className="db-sidebar">
      <div className="db-sidebar-logo">
        <img src="/assets/imgs/NewLogo-small.png" alt="Ssquares" />
        <span>Admin Panel</span>
      </div>

      <nav className="db-nav">
        <div className="db-nav-section">Main</div>
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "active" : ""}>
          <IconHome /> Overview
        </NavLink>

        <div className="db-nav-section">Content</div>
        <NavLink to="/dashboard/blog" className={({ isActive }) => isActive ? "active" : ""}>
          <IconFile /> Blog Posts
        </NavLink>
        <NavLink to="/dashboard/portfolio" className={({ isActive }) => isActive ? "active" : ""}>
          <IconBriefcase /> Portfolio
        </NavLink>

        <div className="db-nav-section">Blog Taxonomy</div>
        <NavLink to="/dashboard/blog-categories" className={({ isActive }) => isActive ? "active" : ""}>
          <IconFolder /> Blog Categories
        </NavLink>
        <NavLink to="/dashboard/blog-tags" className={({ isActive }) => isActive ? "active" : ""}>
          <IconTag /> Blog Tags
        </NavLink>

        <div className="db-nav-section">Portfolio Taxonomy</div>
        <NavLink to="/dashboard/portfolio-categories" className={({ isActive }) => isActive ? "active" : ""}>
          <IconFolder /> Portfolio Categories
        </NavLink>
        <NavLink to="/dashboard/portfolio-tags" className={({ isActive }) => isActive ? "active" : ""}>
          <IconTag /> Portfolio Tags
        </NavLink>

        {user?.role === "admin" && (
          <>
            <div className="db-nav-section">Admin</div>
            <NavLink to="/dashboard/users" className={({ isActive }) => isActive ? "active" : ""}>
              <IconUsers /> Users
            </NavLink>
          </>
        )}
      </nav>

      <div className="db-sidebar-footer">
        <div className="db-sidebar-user">
          <strong>{user?.name}</strong>
          {user?.role}
        </div>
        <button className="db-logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </aside>
  );
}

function Topbar({ title }) {
  return (
    <div className="db-topbar">
      <h1>{title}</h1>
      <a href="/" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>← View Site</a>
    </div>
  );
}

function Shell({ user, onLogout, children, title }) {
  return (
    <div className="db-shell">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="db-main">
        <Topbar title={title} />
        <div className="db-content">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardApp() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("db_user")); } catch { return null; }
  });
  const navigate = useNavigate();

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem("db_token");
    localStorage.removeItem("db_user");
    setUser(null);
    navigate("/dashboard/login");
  };

  function Protected({ title, children }) {
    if (!user) return <Navigate to="/dashboard/login" replace />;
    return <Shell user={user} onLogout={handleLogout} title={title}>{children}</Shell>;
  }

  return (
    <Routes>
      <Route path="login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />

      <Route path="" element={<Protected title="Overview"><Overview /></Protected>} />

      {/* Blog */}
      <Route path="blog"          element={<Protected title="Blog Posts"><BlogList /></Protected>} />
      <Route path="blog/new"      element={<Protected title="New Post"><BlogForm /></Protected>} />
      <Route path="blog/edit/:id" element={<Protected title="Edit Post"><BlogForm /></Protected>} />

      {/* Portfolio */}
      <Route path="portfolio"            element={<Protected title="Portfolio"><PortfolioList /></Protected>} />
      <Route path="portfolio/new"        element={<Protected title="New Portfolio Item"><PortfolioForm /></Protected>} />
      <Route path="portfolio/edit/:id"   element={<Protected title="Edit Portfolio Item"><PortfolioForm /></Protected>} />

      {/* Blog taxonomy */}
      <Route path="blog-categories"
        element={<Protected title="Blog Categories"><TaxonomyPage taxonomy="category" type="blog" /></Protected>} />
      <Route path="blog-tags"
        element={<Protected title="Blog Tags"><TaxonomyPage taxonomy="tag" type="blog" /></Protected>} />

      {/* Portfolio taxonomy */}
      <Route path="portfolio-categories"
        element={<Protected title="Portfolio Categories"><TaxonomyPage taxonomy="category" type="portfolio" /></Protected>} />
      <Route path="portfolio-tags"
        element={<Protected title="Portfolio Tags"><TaxonomyPage taxonomy="tag" type="portfolio" /></Protected>} />

      {/* Users */}
      <Route path="users"          element={<Protected title="Users"><UserList /></Protected>} />
      <Route path="users/new"      element={<Protected title="New User"><UserForm /></Protected>} />
      <Route path="users/edit/:id" element={<Protected title="Edit User"><UserForm /></Protected>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
