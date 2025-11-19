import React, { useState } from "react";
import "./Choose.css";
import { useData } from "../context/DataContext";



const Choose = () => {
  const { gallery } = useData();
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <div className="gallery-container">
      <div className="slogan">
        <h2>
          “Where Craft Meets Comfort, and Tradition Meets Design.”
        </h2>
        <p>
          Step into a world where every weave carries history, every color speaks tradition, and every carpet is a canvas of timeless artistry.
        </p>
      </div>

      <div className="gallery-grid">
        {gallery.map((item, index) => (
          <div
            className="gallery-item"
            key={item.id || index}
            onClick={() => setSelectedImg(item.url)}
          >
            <img src={item.url} alt={`Gallery ${index + 1}`} />
          </div>
        ))}
      </div>

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
