import { useState, useEffect } from "react";
import styles from "./SampleForm.module.css";

const SampleForm = ({ onSave, editingSample, setEditingSample }) => {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (editingSample) {
      setId(editingSample.id || "");
      setTitle(editingSample.title || "");
      setDescription(editingSample.description || "");
      setCategory(editingSample.category || "");
      setImagePreviews(editingSample.images || []);
      setImageFiles([]);
    } else {
      setId("");
      setTitle("");
      setDescription("");
      setCategory("");
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [editingSample]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!id.trim()) {
      alert("Please provide a collection ID.");
      return;
    }
    if (imagePreviews.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    const newItem = {
      id,
      title: title || "Untitled",
      description: description || "",
      category: category || "",
      images: imagePreviews,
    };
    onSave(newItem);
    setId("");
    setTitle("");
    setDescription("");
    setCategory("");
    setImageFiles([]);
    setImagePreviews([]);
    if (editingSample) setEditingSample(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.sampleForm}>
      <h2>{editingSample ? "Edit Collection Item" : "Add New Collection"}</h2>
      <fieldset className={styles.sectionGroup}>
        <legend>Collection Details</legend>
        <div>
          <label htmlFor="collectionId">Collection ID (required):</label>
          <input
            id="collectionId"
            type="text"
            placeholder="Collection ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="title">Title (optional):</label>
          <input
            id="title"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category">Category (optional):</label>
          <input
            id="category"
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description">Description (optional):</label>
          <textarea
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </fieldset>
      <fieldset className={styles.sectionGroup}>
        <legend>
          Upload Images <span style={{ fontSize: 13 }}>( .png images only)</span>
        </legend>
        <div className={styles.uploadSection}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            aria-label="Upload images"
          />
        </div>
        {imagePreviews.length > 0 && (
          <div
            className={styles.previewBox}
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}
          >
            {imagePreviews.map((src, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.5)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                  }}
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </fieldset>
      <div className={styles.buttonGroup}>
        <button type="submit">{editingSample ? "Update" : "Add"}</button>
        {editingSample && (
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => setEditingSample(null)}
            style={{ marginLeft: "1rem" }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SampleForm;
