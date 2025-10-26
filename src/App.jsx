import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Choose from "./pages/Choose";
import SamplePage from "./pages/SamplePage";
import SampleDetailPage from "./pages/SampleDetailPage";
import Login from "./pages/Auth/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import "./index.css";

// ✅ Handles scroll-to-top or scroll-to-hero
function ScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === "hero") {
      const hero = document.getElementById("hero");
      if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/choose" element={<Choose />} />

      {/* Sample gallery pages */}
      <Route path="/samples" element={<SamplePage />} />
      <Route path="/samples/:sampleId" element={<SampleDetailPage />} />

      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollHandler />
        <div className="app-container">
          <Navbar />
          <main>
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
