import React, { createContext, useContext, useEffect, useState } from "react";
import { db, storage } from "../firebase";
import { useAuth } from "./AuthContext";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { gallery as hardcodedGallery } from "../data/gallery";
import { initialCollection } from "../data/collection";
import { sampleData } from "../data/categories";

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

// Normalize a single image to consistent object
const normalizeImage = (img) => {
  if (!img) return null;
  if (typeof img === "string") return { url: img, relatedImages: [] };
  if (img.file) return img; // file objects handled during upload
  if (img.url) return { url: img.url, relatedImages: img.relatedImages || [] };
  return { url: img, relatedImages: [] };
};

// Normalize array of images
const normalizeImages = (imgs) => (imgs || []).map(normalizeImage).filter(Boolean);

export function DataProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [collections, setCollections] = useState(initialCollection);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && currentUser) {
      const qGallery = query(
        collection(db, "galleryImages"),
        orderBy("createdAt", "desc")
      );
      const unsubGallery = onSnapshot(qGallery, (snapshot) => {
        const galleryData = [];
        snapshot.forEach((docSnap) =>
          galleryData.push({ id: docSnap.id, ...docSnap.data() })
        );
        setGallery(galleryData);
        setLoading(false);
      });

      const qCollection = query(
        collection(db, "collectionImages"),
        orderBy("createdAt", "desc")
      );
      const unsubCollection = onSnapshot(qCollection, (snapshot) => {
        const firestoreData = [];
        snapshot.forEach((docSnap) =>
          firestoreData.push({ id: docSnap.id, ...docSnap.data() })
        );

        const firestoreById = firestoreData.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});

        // FIXED: Process base items first
        const mergedBaseItems = initialCollection.map((baseItem) => {
          const fireItem = firestoreById[baseItem.id];
          if (fireItem) {
            const baseImages = normalizeImages(baseItem.images);
            const fireImages = normalizeImages(fireItem.images);

            const byUrl = new Map();

            // Start with base images
            baseImages.forEach((img) => {
              if (!img?.url) return;
              byUrl.set(img.url, { ...img });
            });

            // Overlay Firestore images, merging relatedImages
            fireImages.forEach((img) => {
              if (!img?.url) return;
              const existing = byUrl.get(img.url);
              const baseRelated = existing?.relatedImages || [];
              const fireRelated = img.relatedImages || [];
              const mergedRelated = Array.from(
                new Set([...baseRelated, ...fireRelated])
              );
              byUrl.set(img.url, {
                ...existing,
                ...img,
                relatedImages: mergedRelated,
              });
            });

            const mergedImages = Array.from(byUrl.values());

            return {
              ...baseItem,
              ...fireItem,
              images: mergedImages,
            };
          }
          // No Firestore doc, base item only
          return {
            ...baseItem,
            images: normalizeImages(baseItem.images),
          };
        });

        // FIXED: Collect Firestore-only new items safely (no mutation)
        const firestoreOnlyItems = firestoreData
          .filter((item) => !initialCollection.find((c) => c.id === item.id))
          .map((item) => ({
            ...item,
            images: normalizeImages(item.images),
          }));

        // FIXED: Combine all uniquely using Map to prevent duplicates
        const combinedCollections = [...mergedBaseItems, ...firestoreOnlyItems];
        const uniqueCollectionsMap = new Map();
        combinedCollections.forEach((c) => uniqueCollectionsMap.set(c.id, c));
        const finalCollections = Array.from(uniqueCollectionsMap.values());

        setCollections(finalCollections);
        setLoading(false);
      });

      return () => {
        unsubGallery();
        unsubCollection();
      };
    }
  }, [authLoading, currentUser]);

  const combinedGallery = [...hardcodedGallery, ...gallery];

  async function uploadImage(file, folder = "images") {
    if (!file) return null;
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  }

  const addgallery = async (item) => {
    if (!currentUser) throw new Error("Not authenticated");
    let url = item.url;
    if (item.file) {
      url = await uploadImage(item.file, "gallery");
    }
    await addDoc(collection(db, "galleryImages"), {
      url,
      createdAt: new Date(),
      ...item.metadata,
    });
  };

  const updategallery = async (id, updatedFields) => {
    if (!currentUser) throw new Error("Not authenticated");
    const docRef = doc(db, "galleryImages", id);
    await updateDoc(docRef, updatedFields);
  };

  const deletegallery = async (id) => {
    if (!currentUser) throw new Error("Not authenticated");
    const docRef = doc(db, "galleryImages", id);
    await deleteDoc(docRef);
  };

  // FIXED: addcollection - Merge with existing images if document exists
  const addcollection = async (item) => {
    if (!currentUser) throw new Error("Not authenticated");

    const docRef = doc(db, "collectionImages", item.id);
    const docSnap = await getDoc(docRef);

    // Process new images (upload files, normalize URLs)
    const newImages = await Promise.all(
      (item.images || []).map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file, "collections");
          return { url, relatedImages: img.relatedImages || [] };
        }
        return normalizeImage(img);
      })
    );

    if (docSnap.exists()) {
      // Merge new images with existing ones
      const existingData = docSnap.data();
      const existingImages = normalizeImages(existingData.images || []);

      // Merge by URL (new images take priority)
      const imagesByUrl = new Map();
      existingImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });
      newImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });

      const mergedImages = Array.from(imagesByUrl.values());

      await updateDoc(docRef, { 
        ...item, 
        images: mergedImages,
        updatedAt: new Date()
      });
    } else {
      // New document - just set the images
      await setDoc(docRef, { 
        ...item, 
        images: newImages, 
        createdAt: new Date() 
      });
    }
  };

  // FIXED: updatecollection - Always merge with existing images
  const updatecollection = async (id, updatedItem) => {
    if (!currentUser) throw new Error("Not authenticated");

    const docRef = doc(db, "collectionImages", id);
    const docSnap = await getDoc(docRef);

    // Process new images from the update
    const newImages = await Promise.all(
      (updatedItem.images || []).map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file, "collections");
          return { url, relatedImages: img.relatedImages || [] };
        }
        return normalizeImage(img);
      })
    );

    if (docSnap.exists()) {
      // Merge new images with all existing images
      const existingData = docSnap.data();
      const existingImages = normalizeImages(existingData.images || []);

      // Merge by URL (new images take priority)
      const imagesByUrl = new Map();
      existingImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });
      newImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });

      const mergedImages = Array.from(imagesByUrl.values());

      await updateDoc(docRef, { 
        ...updatedItem, 
        images: mergedImages,
        updatedAt: new Date()
      });
    } else {
      // New document
      await setDoc(docRef, { 
        ...updatedItem, 
        images: newImages, 
        createdAt: new Date() 
      });
    }
  };

  const deletecollection = async (id) => {
    if (!currentUser) throw new Error("Not authenticated");
    const docRef = doc(db, "collectionImages", id);
    await deleteDoc(docRef);
  };

  // FIXED addRelatedImage: sync hardcoded image into Firestore if missing, then add related image
  const addRelatedImage = async (
    collectionId,
    imageIndex,
    relatedImageFileOrUrl
  ) => {
    if (!currentUser) throw new Error("Not authenticated");

    // Upload related image file if needed
    let relatedImageUrl = relatedImageFileOrUrl;
    if (
      relatedImageFileOrUrl instanceof File ||
      (typeof relatedImageFileOrUrl === "object" &&
        relatedImageFileOrUrl !== null &&
        relatedImageFileOrUrl.name)
    ) {
      relatedImageUrl = await uploadImage(
        relatedImageFileOrUrl,
        "relatedImages"
      );
    }

    // Get Firestore doc and current images array
    const docRef = doc(db, "collectionImages", collectionId);
    const docSnap = await getDoc(docRef);
    let data = docSnap.exists() ? docSnap.data() : null;

    // Get merged images at client-side (including hardcoded)
    const mergedItem = collections.find((c) => c.id === collectionId);
    if (!mergedItem) throw new Error("Collection item not found");

    const mergedImages = normalizeImages(mergedItem.images);
    if (imageIndex >= mergedImages.length) throw new Error("Image index out of bounds");

    const targetImage = mergedImages[imageIndex];
    if (!targetImage?.url) throw new Error("Target image URL not found");

    // Initialize Firestore images
    let firestoreImages = data?.images ? normalizeImages(data.images) : [];

    // Check if target image exists in Firestore images by URL
    let fireImageIndex = firestoreImages.findIndex(
      (img) => img.url === targetImage.url
    );

    // If target image NOT in Firestore, insert it at correct index
    if (fireImageIndex === -1) {
      if (imageIndex > firestoreImages.length) {
        firestoreImages.push({ url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = firestoreImages.length - 1;
      } else {
        firestoreImages.splice(imageIndex, 0, { url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = imageIndex;
      }
    }

    // Now update relatedImages array for the target image
    const updatedImages = firestoreImages.map((img, idx) => {
      if (idx === fireImageIndex) {
        const relatedImages = img.relatedImages || [];
        if (!relatedImages.includes(relatedImageUrl)) {
          return {
            ...img,
            relatedImages: [...relatedImages, relatedImageUrl],
          };
        }
      }
      return img;
    });

    // Write updated images array back to Firestore doc
    if (data) {
      await updateDoc(docRef, { images: updatedImages });
    } else {
      await setDoc(docRef, { images: updatedImages, createdAt: new Date() });
    }
  };

  // FIXED removeRelatedImage: same logic as addRelatedImage to find correct Firestore index
  const removeRelatedImage = async (
    collectionId,
    imageIndex,
    relatedImageUrl
  ) => {
    if (!currentUser) throw new Error("Not authenticated");

    // Get Firestore doc
    const docRef = doc(db, "collectionImages", collectionId);
    const docSnap = await getDoc(docRef);
    let data = docSnap.exists() ? docSnap.data() : null;
    if (!data && !collections.find(c => c.id === collectionId)) {
      throw new Error("Collection item not found");
    }

    // Get merged images at client-side (including hardcoded)
    const mergedItem = collections.find((c) => c.id === collectionId);
    if (!mergedItem) throw new Error("Collection item not found");

    const mergedImages = normalizeImages(mergedItem.images);
    if (imageIndex >= mergedImages.length) throw new Error("Image index out of bounds");

    const targetImage = mergedImages[imageIndex];
    if (!targetImage?.url) throw new Error("Target image URL not found");

    // Initialize Firestore images
    let firestoreImages = data?.images ? normalizeImages(data.images) : [];

    // Find target image in Firestore by URL (same logic as addRelatedImage)
    let fireImageIndex = firestoreImages.findIndex(
      (img) => img.url === targetImage.url
    );

    // If target image NOT in Firestore, sync it first (same as addRelatedImage)
    if (fireImageIndex === -1) {
      if (imageIndex > firestoreImages.length) {
        firestoreImages.push({ url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = firestoreImages.length - 1;
      } else {
        firestoreImages.splice(imageIndex, 0, { url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = imageIndex;
      }
    }

    // Remove the specific related image URL from the target image
    const updatedImages = firestoreImages.map((img, idx) => {
      if (idx === fireImageIndex) {
        const relatedImages = (img.relatedImages || []).filter(
          (rel) => rel !== relatedImageUrl
        );
        return { ...img, relatedImages };
      }
      return img;
    });

    // Write updated images array back to Firestore doc
    if (data) {
      await updateDoc(docRef, { images: updatedImages });
    } else {
      await setDoc(docRef, { images: updatedImages, createdAt: new Date() });
    }
  };

  return (
    <DataContext.Provider
      value={{
        gallery: combinedGallery,
        collection: collections,
        sampleData,
        loading,
        addgallery,
        updategallery,
        deletegallery,
        addcollection,
        updatecollection,
        deletecollection,
        addRelatedImage,
        removeRelatedImage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
