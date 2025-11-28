import React, { useState } from "react";
import SampleForm from "./SampleForm";
import styles from "./AdminDashboard.module.css";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { sampleData } from "../../data/categories";

// Normalize images helper to keep consistent format
const normalizeImages = (imgs) =>
  (imgs || []).map((img) => {
    if (typeof img === "string") return { url: img, relatedImages: [] };
    return { url: img.url, relatedImages: img.relatedImages || [] };
  });

const AdminDashboard = () => {
  const {
    gallery,
    collection,
    addgallery,
    updatecollection,
    deletegallery,
    addcollection,
    deletecollection,
    addRelatedImage,
    removeRelatedImage,
    loading: dataLoading,
  } = useData();

  const { currentUser, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("gallery");
  const [newImage, setNewImage] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [editingSample, setEditingSample] = useState(null);
  const [addingRelatedTo, setAddingRelatedTo] = useState(null);

  if (authLoading || dataLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.authRequired}>
        <p>Please log in to access the admin dashboard.</p>
      </div>
    );
  }

  const handleSaveCollection = async (item) => {
    try {
      const docRef = doc(db, "collectionImages", item.id);
      const docSnap = await getDoc(docRef);
      const originalTitle = sampleData[item.id]?.title || "";

      const newImages = normalizeImages(item.images);

      if (docSnap.exists()) {
        const existingData = docSnap.data();

        const updatedData = {
          ...existingData,
          ...item,
          title:
            item.title?.trim() && item.title.trim() !== "Untitled"
              ? item.title.trim()
              : existingData.title || originalTitle,
          description: item.description?.trim() || existingData.description,
          category: item.category?.trim() || existingData.category,
          images: newImages,
        };

        await updatecollection(item.id, updatedData);
      } else {
        const newTitle =
          item.title?.trim() && item.title.trim() !== "Untitled"
            ? item.title.trim()
            : originalTitle;

        await addcollection({ ...item, title: newTitle, images: newImages });
      }
    } catch (error) {
      console.error("Failed to save collection:", error);
      alert("Error saving collection. Please try again.");
    }
  };

  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    if (!newImage && !newUrl) {
      alert("Please upload an image or provide a URL.");
      return;
    }
    try {
      if (newImage) {
        await addgallery({ file: newImage });
      } else {
        await addgallery({ url: newUrl });
      }
      setNewUrl("");
      setNewImage(null);
    } catch (error) {
      console.error("Failed to add gallery image:", error);
      alert("Error adding image. Please try again.");
    }
  };

  const handleDeleteGallery = async (id) => {
    if (window.confirm("Delete this gallery image?")) {
      try {
        await deletegallery(id);
      } catch (error) {
        console.error("Failed to delete gallery image:", error);
      }
    }
  };

  const handleDeleteCollection = async (id) => {
    if (window.confirm("Delete this collection item?")) {
      try {
        await deletecollection(id);
      } catch (error) {
        console.error("Failed to delete collection item:", error);
      }
    }
  };

  const handleDeleteImage = async (collectionId, imageIndex) => {
    if (window.confirm("Delete this image?")) {
      const collectionItem = collection.find((c) => c.id === collectionId);
      if (!collectionItem) return;

      const updatedImages = collectionItem.images.filter((_, i) => i !== imageIndex);
      const normalizedImages = normalizeImages(updatedImages);

      const updatedItem = { ...collectionItem, images: normalizedImages };

      try {
        await updatecollection(collectionId, updatedItem);
        if (editingSample?.id === collectionId) {
          setEditingSample(updatedItem);
        }
      } catch (error) {
        console.error("Failed to delete image:", error);
        alert("Failed to delete image. Please try again.");
      }
    }
  };

  const handleAddRelatedImageClick = (collectionId, imageIndex) => {
    setAddingRelatedTo({ collectionId, imageIndex, relatedImageUrl: "" });
  };

  const onRelatedFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && addingRelatedTo) {
      try {
        await addRelatedImage(
          addingRelatedTo.collectionId,
          addingRelatedTo.imageIndex,
          file
        );
        setAddingRelatedTo(null);
      } catch (error) {
        console.error("Failed to add related image:", error);
        alert("Failed to upload related image.");
      }
    }
  };

  const handleAddRelatedImageByUrl = async () => {
    if (addingRelatedTo?.relatedImageUrl) {
      try {
        await addRelatedImage(
          addingRelatedTo.collectionId,
          addingRelatedTo.imageIndex,
          addingRelatedTo.relatedImageUrl
        );
        setAddingRelatedTo(null);
      } catch (error) {
        console.error("Failed to add related image by URL:", error);
        alert("Failed to add related image by URL.");
      }
    } else {
      alert("Please enter a valid image URL.");
    }
  };

  const handleRemoveRelatedImage = async (collectionId, imageIndex, relatedImageUrl) => {
    if (window.confirm("Remove this related image?")) {
      try {
        await removeRelatedImage(collectionId, imageIndex, relatedImageUrl);
      } catch (error) {
        console.error("Failed to remove related image:", error);
      }
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        <div className={styles.summary}>
          <p><strong>Gallery Images:</strong> {gallery.length}</p>
          <p><strong>Collection Images:</strong> {collection.reduce((acc, c) => acc + (c.images ? c.images.length : 0), 0)}</p>
        </div>
      </header>

      <div className={styles.tabs}>
        <button className={activeTab === "gallery" ? styles.activeTab : ""} onClick={() => setActiveTab("gallery")}>Gallery</button>
        <button className={activeTab === "collection" ? styles.activeTab : ""} onClick={() => setActiveTab("collection")}>Collections</button>
      </div>

      {activeTab === "gallery" && (
        <section className={styles.section}>
          <h2>Gallery Management</h2>
          <form onSubmit={handleAddGalleryImage} className={styles.addImageForm}>
            <input type="text" placeholder="Image URL (optional)" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            <input type="file" accept="image/*" onChange={e => setNewImage(e.target.files[0])} />
            <button type="submit">Add Image</button>
          </form>

          <div className={styles.imageGrid}>
            {gallery.length === 0 ? (
              <p>No images in gallery.</p>
            ) : (
              gallery.map(img =>
                <div key={img.id} className={styles.imageCard}>
                  <img src={img.url} alt="Gallery" />
                  <div className={styles.cardButtons}>
                    <button onClick={() => handleDeleteGallery(img.id)}>Delete</button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {activeTab === "collection" && (
        <section className={styles.section}>
          <h2>Collection Management</h2>

          <SampleForm onSave={handleSaveCollection} editingSample={editingSample} setEditingSample={setEditingSample} />

          <div className={styles.imageGrid}>
            {collection.map(item =>
              <div key={item.id} className={styles.imageCard}>
                <div className={styles.collectionImages}>
                  {item.images?.map((img, idx) =>
                    <div key={idx} className={styles.imageCard}>
                      <img src={img.url || img} alt={`${item.title || "Collection"} image ${idx + 1}`} />

                      {(img.relatedImages && img.relatedImages.length > 0) && (
                        <div className={styles.relatedImages}>
                          <p>Related Images:</p>
                          <div className={styles.relatedImagesGrid}>
                            {img.relatedImages.map((relImg, relIdx) =>
                              <div key={relIdx} className={styles.relatedImageCard}>
                                <img src={relImg} alt="Related" />
                                <button onClick={() => handleRemoveRelatedImage(item.id, idx, relImg)}>Remove</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {addingRelatedTo &&
                        addingRelatedTo.collectionId === item.id &&
                        addingRelatedTo.imageIndex === idx ? (
                          <div className={styles.addRelatedSection}>
                            <input type="file" accept="image/*" onChange={onRelatedFileChange} />
                            <input type="text" placeholder="Enter related image URL"
                              value={addingRelatedTo.relatedImageUrl || ""}
                              onChange={e => setAddingRelatedTo({ ...addingRelatedTo, relatedImageUrl: e.target.value })} />
                            <button onClick={handleAddRelatedImageByUrl}>Add Related Image by URL</button>
                            <button onClick={() => setAddingRelatedTo(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setAddingRelatedTo({ collectionId: item.id, imageIndex: idx, relatedImageUrl: "" })} className={styles.addRelatedBtn}>
                            Add Related Image
                          </button>
                        )}

                      <div className={styles.cardButtons}>
                        <button onClick={() => setEditingSample(item)}>Edit</button>
                        <button onClick={() => handleDeleteImage(item.id, idx)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
                {item.title && <p>{item.title}</p>}
                {item.category && <p>{item.category}</p>}
                <div className={styles.cardButtons}>
                  <button onClick={() => setEditingSample(item)}>Edit Collection</button>
                  <button onClick={() => handleDeleteCollection(item.id)}>Delete Collection</button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
