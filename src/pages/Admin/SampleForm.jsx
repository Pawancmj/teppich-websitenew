import { useState, useEffect } from "react";
import styles from "./SampleForm.module.css";

const SampleForm = ({ onSave, editingSample, setEditingSample }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (editingSample) {
      setTitle(editingSample.title || "");
      setDescription(editingSample.description || "");
      setCategory(editingSample.category || "");
      setImagePreview(editingSample.imageUrl || "");
      setImageFile(null);
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setImageFile(null);
      setImagePreview("");
    }
  }, [editingSample]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) {
      alert("Please upload an image before saving.");
      return;
    }

    const newItem = {
      title: title || "Untitled",
      description: description || "",
      category: category || "",
      imageUrl: imagePreview,
    };

    onSave(newItem);
    setTitle("");
    setDescription("");
    setCategory("");
    setImageFile(null);
    setImagePreview("");
    if (editingSample) setEditingSample(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.sampleForm}>
      <h2>{editingSample ? "Edit Collection Item" : "Add New Collection"}</h2>

      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className={styles.uploadSection}>
        <label>Upload Image (required)</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {imagePreview && (
          <div className={styles.previewBox}>
            <img src={imagePreview} alt="Preview" />
          </div>
        )}
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit">{editingSample ? "Update" : "Add"}</button>
        {editingSample && (
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => setEditingSample(null)}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SampleForm;
