import React, { useState } from "react";
import SampleForm from "./SampleForm";
import styles from "./AdminDashboard.module.css";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { sampleData } from "../../data/categories";

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
    restorecollection,
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
  const [deletingId, setDeletingId] = useState(null);

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
      const newImages = normalizeImages(item.images);
      const cleanItem = {
        id: item.id,
        title: item.title?.trim() || sampleData[item.id]?.title || "",
        description: item.description?.trim() || "",
        category: item.category?.trim() || "",
        images: newImages,
      };

      if (sampleData[item.id]) {
        await addcollection(cleanItem);
      } else {
        await updatecollection(item.id, cleanItem);
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
    if (window.confirm(`Delete collection "${sampleData[id]?.title || id}"?`)) {
      console.log("🗑️ DELETE COLLECTION:", id);
      
      setDeletingId(id);
      
      try {
        const result = await deletecollection(id);
        console.log("✅ COLLECTION DELETED:", result);
        alert("✅ Collection deleted successfully!");
      } catch (error) {
        console.error("💥 COLLECTION DELETE FAILED:", error);
        alert(`❌ Delete failed: ${error.message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteImage = async (collectionId, imageIndex) => {
    if (window.confirm("Delete this image?")) {
      try {
        console.log("🖼️ DELETING IMAGE:", { collectionId, imageIndex });
        
        const collectionItem = collection.find((c) => c.id === collectionId);
        if (!collectionItem) {
          throw new Error("Collection not found");
        }

        const updatedImages = collectionItem.images.filter((_, i) => i !== imageIndex);

        const updatedItem = {
          id: collectionId,
          title: collectionItem.title || "",
          images: updatedImages,
          ...(collectionItem.description && { description: collectionItem.description }),
          ...(collectionItem.category && { category: collectionItem.category }),
        };

        console.log("📤 CLEAN UPDATE DATA:", {
          id: collectionId,
          imageCount: updatedImages.length
        });

        await updatecollection(collectionId, updatedItem);
        console.log("✅ IMAGE DELETED SUCCESSFULLY");
        
        if (editingSample?.id === collectionId) {
          setEditingSample(updatedItem);
        }
        
      } catch (error) {
        console.error("💥 IMAGE DELETE FAILED:", error);
        alert(`Failed to delete image: ${error.message}`);
      }
    }
  };

  // 🔥 RELATED IMAGES HANDLERS
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
        <button className={activeTab === "gallery" ? styles.activeTab : ""} onClick={() => setActiveTab("gallery")}>
          Gallery
        </button>
        <button className={activeTab === "collection" ? styles.activeTab : ""} onClick={() => setActiveTab("collection")}>
          Collections
        </button>
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
              gallery.map((img, index) => (
                <div key={img.id || `gallery-${index}`} className={styles.imageCard}>
                  <img src={img.url} alt="Gallery" />
                  <div className={styles.cardButtons}>
                    <button onClick={() => handleDeleteGallery(img.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "collection" && (
        <section className={styles.section}>
          <h2>Collection Management</h2>
          <SampleForm onSave={handleSaveCollection} editingSample={editingSample} setEditingSample={setEditingSample} />

          <div className={styles.imageGrid}>
            {collection.map((item) => (
              <div key={item.id} className={styles.imageCard}>
                <div className={styles.collectionImages}>
                  {item.images?.map((img, idx) => (
                    <div key={`${item.id}-img-${idx}`} className={styles.imageCard}>
                      <img src={img.url || img} alt={`${item.title || "Collection"} image ${idx + 1}`} />

                      {/* 🔥 RELATED IMAGES DISPLAY */}
                      {(img.relatedImages && img.relatedImages.length > 0) && (
                        <div className={styles.relatedImages}>
                          <p>Related Images:</p>
                          <div className={styles.relatedImagesGrid}>
                            {img.relatedImages.map((relImg, relIdx) => (
                              <div key={`${item.id}-related-${relIdx}`} className={styles.relatedImageCard}>
                                <img src={relImg} alt="Related" />
                                <button onClick={() => handleRemoveRelatedImage(item.id, idx, relImg)}>
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 🔥 ADD RELATED IMAGES UI */}
                      {addingRelatedTo &&
                        addingRelatedTo.collectionId === item.id &&
                        addingRelatedTo.imageIndex === idx ? (
                          <div className={styles.addRelatedSection}>
                            <input type="file" accept="image/*" onChange={onRelatedFileChange} />
                            <input 
                              type="text" 
                              placeholder="Enter related image URL"
                              value={addingRelatedTo.relatedImageUrl || ""}
                              onChange={e => setAddingRelatedTo({ ...addingRelatedTo, relatedImageUrl: e.target.value })} 
                            />
                            <button onClick={handleAddRelatedImageByUrl}>Add Related by URL</button>
                            <button onClick={() => setAddingRelatedTo(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAddRelatedImageClick(item.id, idx)}
                            className={styles.addRelatedBtn}
                          >
                            Add Related Image
                          </button>
                        )}

                      <div className={styles.cardButtons}>
                        <button onClick={() => setEditingSample(item)}>Edit</button>
                        <button onClick={() => handleDeleteImage(item.id, idx)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                {item.title && <p>{item.title}</p>}
                {item.category && <p>{item.category}</p>}
                <div className={styles.cardButtons}>
                  <button onClick={() => setEditingSample(item)}>Edit Collection</button>
                  <button 
                    onClick={() => handleDeleteCollection(item.id)}
                    disabled={deletingId === item.id}
                    className={deletingId === item.id ? styles.deletingButton : ""}
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete Collection"}
                  </button>
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
