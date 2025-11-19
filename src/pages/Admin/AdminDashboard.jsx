import React, { useState, useEffect } from "react";
import SampleForm from "./SampleForm";
import styles from "./AdminDashboard.module.css";
import { useData } from "../../context/DataContext";

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
  } = useData();

  const [activeTab, setActiveTab] = useState("gallery");
  const [newImage, setNewImage] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [editingSample, setEditingSample] = useState(null);

  // State to handle related image file upload
  const [addingRelatedTo, setAddingRelatedTo] = useState(null); // { collectionId, imageUrl } or null

  const totalGalleryImages = gallery.length;

  const totalCollectionImages = collection.reduce(
    (acc, item) =>
      acc + (item.images ? item.images.length : item.imageUrl ? 1 : 0),
    0
  );

  useEffect(() => {
    if (editingSample) {
      // You could synchronize form state if needed
    }
  }, [editingSample]);

  const handleAddGalleryImage = (e) => {
    e.preventDefault();
    if (!newImage && !newUrl) {
      alert("Please upload an image or provide a URL.");
      return;
    }
    const addImage = (url) => {
      addgallery({ url });
      setNewUrl("");
      setNewImage(null);
    };
    if (newImage) {
      const reader = new FileReader();
      reader.onloadend = () => addImage(reader.result);
      reader.readAsDataURL(newImage);
    } else {
      addImage(newUrl);
    }
  };

  const handleDeleteGallery = (id) => {
    if (window.confirm("Delete this gallery image?")) {
      deletegallery(id);
    }
  };

  const handleSaveCollection = (item) => {
    const collectionId = item.id;
    if (!collectionId) {
      alert("Please provide a collection ID in the form.");
      return;
    }

    const newImages = Array.isArray(item.images)
      ? item.images
      : item.images
      ? [item.images]
      : [];

    const existingItem = collection.find((col) => col.id === collectionId);

    if (editingSample && existingItem) {
      const updatedImages = [...(existingItem.images || []), ...newImages];
      const updatedItem = {
        ...existingItem,
        ...item,
        id: collectionId,
        images: updatedImages,
      };
      updatecollection(editingSample.id, updatedItem);
      setEditingSample(null);
    } else if (existingItem) {
      const updatedImages = [...(existingItem.images || []), ...newImages];
      const updatedItem = { ...existingItem, images: updatedImages };
      updatecollection(collectionId, updatedItem);
    } else {
      if (newImages.length === 0) {
        alert("Please add at least one image for the new collection item.");
        return;
      }
      const newItem = { ...item, id: collectionId, images: newImages };
      addcollection(newItem);
    }
  };

  const handleDeleteCollection = (id) => {
    if (window.confirm("Delete this collection item?")) {
      deletecollection(id);
    }
  };

  const handleDeleteImage = (collectionId, imageIndex) => {
    if (window.confirm("Delete this image?")) {
      const collectionItem = collection.find((item) => item.id === collectionId);
      if (!collectionItem) return;

      const updatedImages = collectionItem.images.filter((_, i) => i !== imageIndex);
      const updatedItem = { ...collectionItem, images: updatedImages };

      updatecollection(collectionId, updatedItem);

      if (editingSample && editingSample.id === collectionId) {
        setEditingSample(updatedItem);
      }
    }
  };

  // When Add Related Image button clicked, show file input for that image
  const handleAddRelatedImageClick = (collectionId, imageUrl) => {
    setAddingRelatedTo({ collectionId, imageUrl });
  };

  // When related image file selected, convert to base64 and add
  const onRelatedFileChange = (e) => {
    const file = e.target.files[0];
    if (file && addingRelatedTo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addRelatedImage(addingRelatedTo.collectionId, addingRelatedTo.imageUrl, reader.result);
        setAddingRelatedTo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove related image handler
  const handleRemoveRelatedImage = (collectionId, imageUrl, relatedImageUrl) => {
    if (window.confirm("Remove this related image?")) {
      removeRelatedImage(collectionId, imageUrl, relatedImageUrl);
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        <div className={styles.summary}>
          <p>
            <strong>Gallery Images:</strong> {totalGalleryImages}
          </p>
          <p>
            <strong>Collection Images:</strong> {totalCollectionImages}
          </p>
        </div>
      </header>

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
            {gallery.map((img) => (
              <div key={img.id} className={styles.imageCard}>
                <img src={img.url} alt="Gallery" />
                <div className={styles.cardButtons}>
                  <button onClick={() => handleDeleteGallery(img.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "collection" && (
        <section className={styles.section}>
          <h2>Collection Management</h2>

          <SampleForm
            onSave={handleSaveCollection}
            editingSample={editingSample}
            setEditingSample={setEditingSample}
          />

          <div className={styles.imageGrid}>
            {collection.map((item) => (
              <div key={item.id} className={styles.imageCard}>
                <div className={styles.collectionImages}>
                  {item.images?.map((img, idx) => (
                    <div key={idx} className={styles.imageCard}>
                      {/* img might be object with url */}
                      <img
                        src={img.url || img}
                        alt={`${item.title || "Collection"} image ${idx + 1}`}
                      />

                      <div className={styles.relatedImages}>
                        <p>Related Images:</p>
                        {(img.relatedImages || []).map((relImg, relIdx) => (
                          <div key={relIdx} className={styles.relatedImageCard}>
                            <img src={relImg} alt="Related" />
                            <button
                              onClick={() =>
                                handleRemoveRelatedImage(item.id, img.url || img, relImg)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        {addingRelatedTo &&
                         addingRelatedTo.collectionId === item.id &&
                         addingRelatedTo.imageUrl === (img.url || img) ? (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onRelatedFileChange}
                          />
                        ) : (
                          <button
                            onClick={() => handleAddRelatedImageClick(item.id, img.url || img)}
                            className={styles.addRelatedBtn}
                          >
                            Add Related Image
                          </button>
                        )}
                      </div>

                      <div className={styles.cardButtons}>
                        <button onClick={() => setEditingSample(item)}>Edit</button>
                        <button onClick={() => handleDeleteImage(item.id, idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {item.title && <p>{item.title}</p>}
                {item.category && <p>{item.category}</p>}
                <div className={styles.cardButtons}>
                  <button onClick={() => setEditingSample(item)}>Edit Collection</button>
                  <button onClick={() => handleDeleteCollection(item.id)}>
                    Delete Collection
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
