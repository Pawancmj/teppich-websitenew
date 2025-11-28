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

        const merged = initialCollection.map((baseItem) => {
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

        // Append Firestore collections not in initialCollection
        firestoreData.forEach((item) => {
          if (!initialCollection.find((c) => c.id === item.id)) {
            merged.push({
              ...item,
              images: normalizeImages(item.images),
            });
          }
        });

        setCollections(merged);
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

  const addcollection = async (item) => {
    if (!currentUser) throw new Error("Not authenticated");

    const images = await Promise.all(
      (item.images || []).map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file, "collections");
          return { url, relatedImages: img.relatedImages || [] };
        }
        return normalizeImage(img);
      })
    );

    const docRef = doc(db, "collectionImages", item.id);
    await setDoc(
      docRef,
      { ...item, images, createdAt: new Date() },
      { merge: true }
    );
  };

  const updatecollection = async (id, updatedItem) => {
    if (!currentUser) throw new Error("Not authenticated");

    const docRef = doc(db, "collectionImages", id);
    const docSnap = await getDoc(docRef);

    const images = await Promise.all(
      (updatedItem.images || []).map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file, "collections");
          return { url, relatedImages: img.relatedImages || [] };
        }
        return normalizeImage(img);
      })
    );

    if (docSnap.exists()) {
      await updateDoc(docRef, { ...updatedItem, images });
    } else {
      await setDoc(docRef, { ...updatedItem, images, createdAt: new Date() });
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
