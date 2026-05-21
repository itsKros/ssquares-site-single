import { Routes, Route } from "react-router-dom";
import HomePage        from "./pages/Home.jsx";
import BlogArchive     from "./pages/BlogArchive.jsx";
import BlogPost        from "./pages/BlogPost.jsx";
import PortfolioArchive from "./pages/PortfolioArchive.jsx";
import PortfolioSingle  from "./pages/PortfolioSingle.jsx";
import DashboardApp    from "./dashboard/DashboardApp.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/"                  element={<HomePage />} />
      <Route path="/blog"              element={<BlogArchive />} />
      <Route path="/blog/:slug"        element={<BlogPost />} />
      <Route path="/portfolio"         element={<PortfolioArchive />} />
      <Route path="/portfolio/:slug"   element={<PortfolioSingle />} />
      <Route path="/dashboard/*"       element={<DashboardApp />} />
    </Routes>
  );
}
