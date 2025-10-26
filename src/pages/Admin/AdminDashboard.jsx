import { useState, useEffect } from "react";
import SampleForm from "./SampleForm";
import styles from "./AdminDashboard.module.css";

// Default gallery images
import g1 from "../../assets/gallery-1.png";
import g2 from "../../assets/gallery-2.png";
import g3 from "../../assets/gallery-3.png";
import g4 from "../../assets/gallery-4.png";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("gallery");

  // Gallery
  const [galleryImages, setGalleryImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  // Collections
  const [collections, setCollections] = useState([]);
  const [editingSample, setEditingSample] = useState(null);

  // ---------------- LOAD FROM LOCALSTORAGE ----------------
  useEffect(() => {
    try {
      const savedGallery = localStorage.getItem("galleryData");
      const savedCollections = localStorage.getItem("collectionsData");

      if (savedGallery) {
        const parsed = JSON.parse(savedGallery);
        if (Array.isArray(parsed)) setGalleryImages(parsed);
      } else {
        setGalleryImages([
          { url: g1 },
          { url: g2 },
          { url: g3 },
          { url: g4 },
        ]);
      }

      if (savedCollections) {
        const parsed = JSON.parse(savedCollections);
        if (Array.isArray(parsed)) setCollections(parsed);
      }
    } catch (error) {
      console.error("Error loading localStorage data:", error);
    }
  }, []);

  // ---------------- SAVE TO LOCALSTORAGE ----------------
  useEffect(() => {
    if (Array.isArray(galleryImages) && galleryImages.length > 0) {
      // Always save simplified objects (no titles to avoid mismatch)
      const simplified = galleryImages.map(img => ({ url: img.url }));
      localStorage.setItem("galleryData", JSON.stringify(simplified));
    }
  }, [galleryImages]);

  useEffect(() => {
    localStorage.setItem("collectionsData", JSON.stringify(collections));
  }, [collections]);

  // ---------------- GALLERY HANDLERS ----------------
  const handleAddGalleryImage = (e) => {
    e.preventDefault();

    if (!newImage && !newUrl) {
      alert("Please upload an image or provide a URL.");
      return;
    }

    const addImage = (url) => {
      const updated = [{ url }, ...galleryImages];
      setGalleryImages(updated);
      setNewUrl("");
      setNewImage(null);
      setNewTitle("");
    };

    if (newImage) {
      const reader = new FileReader();
      reader.onloadend = () => addImage(reader.result);
      reader.readAsDataURL(newImage);
    } else if (newUrl) {
      addImage(newUrl);
    }
  };

  const handleDeleteGallery = (index) => {
    if (window.confirm("Delete this gallery image?")) {
      const updated = galleryImages.filter((_, i) => i !== index);
      setGalleryImages(updated);
    }
  };

  // ---------------- COLLECTION HANDLERS ----------------
  const handleSaveCollection = (item) => {
    if (editingSample !== null) {
      const updated = collections.map((col) =>
        col.imageUrl === editingSample.imageUrl ? item : col
      );
      setCollections(updated);
      setEditingSample(null);
    } else {
      setCollections([item, ...collections]);
    }
  };

  const handleDeleteCollection = (index) => {
    if (window.confirm("Delete this collection item?")) {
      const updated = collections.filter((_, i) => i !== index);
      setCollections(updated);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className={styles.adminDashboard}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        <div className={styles.summary}>
          <p><strong>Gallery:</strong> {galleryImages.length}</p>
          <p><strong>Collections:</strong> {collections.length}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "gallery" ? styles.activeTab : ""}
          onClick={() => setActiveTab("gallery")}
        >
          Gallery
        </button>
        <button
          className={activeTab === "collection" ? styles.activeTab : ""}
          onClick={() => setActiveTab("collection")}
        >
          Collections
        </button>
      </div>

      {/* GALLERY SECTION */}
      {activeTab === "gallery" && (
        <section className={styles.section}>
          <h2>Gallery Management</h2>
          <form onSubmit={handleAddGalleryImage} className={styles.addImageForm}>
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0])}
            />
            <button type="submit">Add Image</button>
          </form>

          <div className={styles.imageGrid}>
            {galleryImages.map((img, index) => (
              <div key={index} className={styles.imageCard}>
                <img src={img.url} alt={`Gallery ${index + 1}`} />
                <div className={styles.cardButtons}>
                  <button onClick={() => handleDeleteGallery(index)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COLLECTION SECTION */}
      {activeTab === "collection" && (
        <section className={styles.section}>
          <h2>Collection Management</h2>
          <SampleForm
            onSave={handleSaveCollection}
            editingSample={editingSample}
            setEditingSample={setEditingSample}
          />
          <div className={styles.imageGrid}>
            {collections.map((item, index) => (
              <div key={index} className={styles.imageCard}>
                <img src={item.imageUrl} alt={item.title || `Collection ${index + 1}`} />
                {item.title && <p>{item.title}</p>}
                {item.category && <p>{item.category}</p>}
                <div className={styles.cardButtons}>
                  <button onClick={() => setEditingSample(item)}>Edit</button>
                  <button onClick={() => handleDeleteCollection(index)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
