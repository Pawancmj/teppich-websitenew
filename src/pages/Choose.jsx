import React, { useState } from "react";
import "./Choose.css";

// ✅ Correct paths (Choose.jsx is in src/pages/, so only ../)
import g1 from "../assets/gallery-1.png";
import g2 from "../assets/gallery-2.png";
import g3 from "../assets/gallery-3.png";
import g4 from "../assets/gallery-4.png";
import g5 from "../assets/gallery-5.png";
import g6 from "../assets/gallery-6.png";
import g7 from "../assets/gallery-7.png";
import g8 from "../assets/gallery-8.png";
import g9 from "../assets/gallery-9.png";
import g10 from "../assets/gallery-10.png";
import g11 from "../assets/gallery-11.png";
import g12 from "../assets/gallery-12.png";

import work1 from "../assets/work1.jpg";
import work2 from "../assets/work2.jpg";
import work3 from "../assets/work3.jpg";
import work4 from "../assets/work4_new.jpg";
import work5 from "../assets/work5.jpg";
import work6 from "../assets/work6.jpg";

const Choose = () => {
  const allImages = [
    g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, // gallery
    work1, work2, work3, work4, work5, work6 // extra
  ];

  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <div className="gallery-container">
      {/* ✨ Updated slogan section */}
      <div className="slogan">
        <h2>
          “Where Craft Meets Comfort, and Tradition Meets Design.”
        </h2>
        <p>
          Step into a world where every weave carries history, every color speaks tradition, and every carpet is a canvas of timeless artistry.
        </p>
      </div>

      {/* 🖼️ Gallery Grid */}
      <div className="gallery-grid">
        {allImages.map((src, index) => (
          <div 
            className="gallery-item" 
            key={index} 
            onClick={() => setSelectedImg(src)}
          >
            <img src={src} alt={`Gallery ${index + 1}`} />
          </div>
        ))}
      </div>

      {/* 🔍 Modal for full-size image */}
      {selectedImg && (
        <div className="modal" onClick={() => setSelectedImg(null)}>
          <span className="close">&times;</span>
          <img className="modal-content" src={selectedImg} alt="Large view" />
        </div>
      )}
    </div>
  );
};

export default Choose;
