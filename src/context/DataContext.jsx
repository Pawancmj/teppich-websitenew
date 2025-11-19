import React, { createContext, useContext, useState, useEffect } from "react";
import { gallery as initialGallery } from "../data/gallery";
import { initialCollection } from "../data/collection";
import { sampleData as initialSampleData } from "../data/categories"; // Your sampleData array import

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [gallery, setGallery] = useState([]);
  const [collection, setCollection] = useState([]);
  const [sampleData, setSampleData] = useState([]);
  const [loading, setLoading] = useState(true);  // Loading state

  useEffect(() => {
    // Load gallery
    const storedGallery = localStorage.getItem("gallery");
    if (storedGallery) setGallery(JSON.parse(storedGallery));
    else {
      localStorage.setItem("gallery", JSON.stringify(initialGallery));
      setGallery(initialGallery);
    }

    // Load collection, migrate images if needed
    const storedCollection = localStorage.getItem("collection");
    if (storedCollection) {
      const parsedCollection = JSON.parse(storedCollection);
      // Migrate old image arrays (strings) to objects if necessary
      const migratedCollection = parsedCollection.map((item) => {
        if (item.images && typeof item.images[0] === "string") {
          const newImages = item.images.map((imgUrl) => ({
            url: imgUrl,
            relatedImages: []
          }));
          return { ...item, images: newImages };
        }
        return item;
      });
      setCollection(migratedCollection);
    } else {
      // Apply same migration to initialCollection for consistency
      const migratedInitial = initialCollection.map((item) => {
        if (item.images && typeof item.images[0] === "string") {
          const newImages = item.images.map((imgUrl) => ({
            url: imgUrl,
            relatedImages: []
          }));
          return { ...item, images: newImages };
        }
        return item;
      });
      localStorage.setItem("collection", JSON.stringify(migratedInitial));
      setCollection(migratedInitial);
    }

    // Load sampleData (categories)
    const storedSampleData = localStorage.getItem("sampleData");
    if (storedSampleData) {
      try {
        const parsed = JSON.parse(storedSampleData);
        setSampleData(Array.isArray(parsed) ? parsed : initialSampleData);
      } catch {
        setSampleData(initialSampleData);
      }
    } else {
      setSampleData(initialSampleData);
      localStorage.setItem("sampleData", JSON.stringify(initialSampleData));
    }

    setLoading(false);  // Data loading finished
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (gallery.length) localStorage.setItem("gallery", JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    if (collection.length) localStorage.setItem("collection", JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    if (sampleData.length) localStorage.setItem("sampleData", JSON.stringify(sampleData));
  }, [sampleData]);

  // Gallery CRUD
  const addgallery = (item) => {
    const newItem = { ...item, id: Date.now().toString() };
    setGallery((prev) => [...prev, newItem]);
  };
  const updategallery = (id, updatedFields) => {
    setGallery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };
  const deletegallery = (id) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  };

  // Collection CRUD
  const addcollection = (item) => {
    const newItem = {
      ...item,
      id: item.id || Date.now().toString(),
      images: item.images?.map((img) =>
        typeof img === "string"
          ? { url: img, relatedImages: [] }
          : { url: img.url, relatedImages: img.relatedImages || [] }
      ) || []
    };
    setCollection((prev) => [...prev, newItem]);
  };

  const updatecollection = (id, updatedItem) => {
    // Ensure images structure is consistent
    const formattedItem = {
      ...updatedItem,
      images: updatedItem.images?.map((img) =>
        typeof img === "string"
          ? { url: img, relatedImages: [] }
          : { url: img.url, relatedImages: img.relatedImages || [] }
      ) || []
    };

    setCollection((prev) =>
      prev.map((item) => (item.id === id ? formattedItem : item))
    );
  };

  const deletecollection = (id) => {
    setCollection((prev) => prev.filter((item) => item.id !== id));
  };

  // SampleData (categories) CRUD
  const addsampledata = (item) => {
    const newItem = { ...item, id: item.id || Date.now().toString() };
    setSampleData((prev) => [...prev, newItem]);
  };
  const updatesampledata = (id, updatedItem) => {
    setSampleData((prev) =>
      prev.map((item) => (item.id === id ? updatedItem : item))
    );
  };
  const deletesampledata = (id) => {
    setSampleData((prev) => prev.filter((item) => item.id !== id));
  };

  // Related Images CRUD (new)
  const addRelatedImage = (collectionId, imageUrl, relatedImageUrl) => {
    setCollection((prev) =>
      prev.map((item) => {
        if (item.id === collectionId) {
          const updatedImages = item.images.map((img) => {
            if (img.url === imageUrl) {
              const relatedImages = img.relatedImages || [];
              // Avoid duplicates
              if (!relatedImages.includes(relatedImageUrl)) {
                return { ...img, relatedImages: [...relatedImages, relatedImageUrl] };
              }
            }
            return img;
          });
          return { ...item, images: updatedImages };
        }
        return item;
      })
    );
  };

  const removeRelatedImage = (collectionId, imageUrl, relatedImageUrl) => {
    setCollection((prev) =>
      prev.map((item) => {
        if (item.id === collectionId) {
          const updatedImages = item.images.map((img) => {
            if (img.url === imageUrl) {
              const relatedImages = (img.relatedImages || []).filter((rel) => rel !== relatedImageUrl);
              return { ...img, relatedImages };
            }
            return img;
          });
          return { ...item, images: updatedImages };
        }
        return item;
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        gallery,
        collection,
        sampleData,
        loading,
        addgallery,
        updategallery,
        deletegallery,
        addcollection,
        updatecollection,
        deletecollection,
        addsampledata,
        updatesampledata,
        deletesampledata,
        addRelatedImage,
        removeRelatedImage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
