import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Choose from "./pages/Choose";
import SamplePage from "./pages/SamplePage";
import SampleDetailPage from "./pages/SampleDetailPage";
import "./index.css";

// ✅ Handles scroll-to-top or scroll-to-hero
function ScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    // If navigation has "scrollTo: hero" in state
    if (location.state?.scrollTo === "hero") {
      const hero = document.getElementById("hero");
      if (hero) {
        hero.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Default: always scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      {/* Scroll handler works globally for all routes */}
      <ScrollHandler />
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/choose" element={<Choose />} />
            <Route path="/samples" element={<SamplePage />} />
            <Route path="/samples/:sampleId" element={<SampleDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
