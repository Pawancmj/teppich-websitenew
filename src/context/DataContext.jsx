import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
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

const normalizeImage = (img) => {
  if (!img) return null;
  if (typeof img === "string") return { url: img, relatedImages: [] };
  if (img.file) return img;
  if (img.url) return { url: img.url, relatedImages: img.relatedImages || [] };
  return { url: img, relatedImages: [] };
};

const normalizeImages = (imgs) => (imgs || []).map(normalizeImage).filter(Boolean);

const loadDeletedItems = () => {
  try {
    const localDeleted = localStorage.getItem('deletedCollections');
    return new Set(localDeleted ? JSON.parse(localDeleted) : []);
  } catch {
    return new Set();
  }
};

const saveDeletedItems = (deletedSet) => {
  try {
    localStorage.setItem('deletedCollections', JSON.stringify(Array.from(deletedSet)));
  } catch (error) {
    console.error('Failed to save deleted items:', error);
  }
};

const cleanFirestoreData = (data) => {
  const clean = { ...data };
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined || clean[key] === null) {
      delete clean[key];
    }
  });
  return clean;
};

export function DataProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletedItems, setDeletedItems] = useState(loadDeletedItems());
  const deletedItemsRef = useRef(deletedItems);
  
  // 🔥 SINGLE RUNNING LISTENERS - EMPTY DEPENDENCY ARRAY
  useEffect(() => {
    console.log("🔥 SETUP SINGLE LISTENERS");
    
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

      // 🔥 APPLY DELETED FILTER HERE (ref.current = reactive)
      const allowedIds = new Set(
        initialCollection
          .map(item => item.id)
          .filter(id => !deletedItemsRef.current.has(id))
      );
      const validFirestoreData = firestoreData.filter(item => allowedIds.has(item.id));

      const mergedCollections = initialCollection
        .filter(baseItem => !deletedItemsRef.current.has(baseItem.id))
        .map((baseItem) => {
          const fireItem = validFirestoreData.find(item => item.id === baseItem.id);
          
          if (fireItem) {
            const baseImages = normalizeImages(baseItem.images);
            const fireImages = normalizeImages(fireItem.images);
            
            const byUrl = new Map();
            baseImages.forEach((img) => {
              if (img?.url) byUrl.set(img.url, { ...img });
            });
            fireImages.forEach((img) => {
              if (img?.url) {
                const existing = byUrl.get(img.url);
                const mergedRelated = Array.from(
                  new Set([
                    ...(existing?.relatedImages || []),
                    ...(img.relatedImages || [])
                  ])
                );
                byUrl.set(img.url, { 
                  ...img, 
                  relatedImages: mergedRelated 
                });
              }
            });
            
            return {
              ...baseItem,
              ...fireItem,
              images: Array.from(byUrl.values()),
            };
          }
          
          return {
            ...baseItem,
            images: normalizeImages(baseItem.images),
          };
        });

      console.log(`✅ Showing ${mergedCollections.length}/${initialCollection.length} collections (deleted: ${deletedItemsRef.current.size})`);
      setCollections(mergedCollections);
      if (loading) setLoading(false);
    });

    // 🔥 SINGLE CLEANUP - Runs only on unmount
    return () => {
      console.log("🔥 CLEANUP LISTENERS");
      unsubGallery();
      unsubCollection();
    };
  }, []); // 🔥 EMPTY = SINGLE LISTENER FOREVER!

  // 🔥 SYNC REF WITH STATE (doesn't trigger re-render)
  useEffect(() => {
    deletedItemsRef.current = deletedItems;
  }, [deletedItems]);

  // 🔥 LOAD DELETED ITEMS ON STARTUP
  useEffect(() => {
    const loaded = loadDeletedItems();
    setDeletedItems(loaded);
  }, []);

  const combinedGallery = [...hardcodedGallery, ...gallery];

  const uploadImage = useCallback(async (file, folder = "images") => {
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
  }, []);

  const addgallery = useCallback(async (item) => {
    if (!currentUser) throw new Error("Not authenticated");
    let url = item.url;
    if (item.file) {
      url = await uploadImage(item.file, "gallery");
    }
    await addDoc(collection(db, "galleryImages"), {
      url,
      createdAt: new Date(),
      ...cleanFirestoreData(item.metadata || {}),
    });
  }, [currentUser, uploadImage]);

  const deletegallery = useCallback(async (id) => {
    if (!currentUser) throw new Error("Not authenticated");
    const docRef = doc(db, "galleryImages", id);
    await deleteDoc(docRef);
    console.log("✅ Gallery deleted:", id);
  }, [currentUser]);

  const updatecollection = useCallback(async (id, updatedItem) => {
    if (!currentUser) throw new Error("Not authenticated");

    console.log("🔄 updatecollection:", { id, imageCount: updatedItem.images?.length });

    const cleanItem = cleanFirestoreData(updatedItem);

    // 🔥 RESTORE IF DELETED
    setDeletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      saveDeletedItems(newSet);
      return newSet;
    });

    const docRef = doc(db, "collectionImages", id);

    if (!cleanItem.images?.some(img => img.file)) {
      console.log("📤 DIRECT UPDATE (no files)");
      const updateData = {
        ...cleanItem,
        images: normalizeImages(cleanItem.images),
        updatedAt: new Date()
      };
      await updateDoc(docRef, cleanFirestoreData(updateData));
      console.log("✅ SIMPLE UPDATE SUCCESS");
      return;
    }

    console.log("📤 FILE UPLOAD UPDATE");
    const docSnap = await getDoc(docRef);
    const newImages = await Promise.all(
      (cleanItem.images || []).map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file, "collections");
          return { url, relatedImages: img.relatedImages || [] };
        }
        return normalizeImage(img);
      })
    );

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const existingImages = normalizeImages(existingData.images || []);

      const imagesByUrl = new Map();
      existingImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });
      newImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });

      const mergedImages = Array.from(imagesByUrl.values());
      const updateData = {
        ...cleanItem,
        images: mergedImages,
        updatedAt: new Date()
      };
      await updateDoc(docRef, cleanFirestoreData(updateData));
    } else {
      await setDoc(docRef, cleanFirestoreData({
        ...cleanItem,
        images: newImages,
        createdAt: new Date()
      }));
    }
  }, [currentUser, uploadImage]);

  const addcollection = useCallback(async (item) => {
    if (!currentUser) throw new Error("Not authenticated");

    setDeletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      saveDeletedItems(newSet);
      return newSet;
    });

    const docRef = doc(db, "collectionImages", item.id);
    const docSnap = await getDoc(docRef);

    const newImages = await Promise.all(
      (item.images || []).map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file, "collections");
          return { url, relatedImages: img.relatedImages || [] };
        }
        return normalizeImage(img);
      })
    );

    const cleanItem = cleanFirestoreData(item);
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const existingImages = normalizeImages(existingData.images || []);

      const imagesByUrl = new Map();
      existingImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });
      newImages.forEach((img) => {
        if (img?.url) imagesByUrl.set(img.url, img);
      });

      const mergedImages = Array.from(imagesByUrl.values());
      await updateDoc(docRef, cleanFirestoreData({
        ...cleanItem,
        images: mergedImages,
        updatedAt: new Date()
      }));
    } else {
      await setDoc(docRef, cleanFirestoreData({
        ...cleanItem,
        images: newImages,
        createdAt: new Date()
      }));
    }
  }, [currentUser, uploadImage]);

  const deletecollection = useCallback(async (collectionId) => {
    console.log("🚀 deletecollection:", { collectionId });

    if (!currentUser) throw new Error("Please login first!");

    try {
      setDeletedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(collectionId);
        saveDeletedItems(newSet);
        console.log("✅ STATE DELETED:", Array.from(newSet));
        return newSet;
      });

      const docRef = doc(db, "collectionImages", collectionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await deleteDoc(docRef);
        console.log("✅ FIRESTORE DELETED:", collectionId);
      }

      return { success: true, id: collectionId };
      
    } catch (error) {
      console.error("💥 deletecollection FAILED:", error);
      setDeletedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        saveDeletedItems(newSet);
        return newSet;
      });
      throw new Error(error.message || "Delete failed!");
    }
  }, [currentUser]);

  const restorecollection = useCallback(async (collectionId) => {
    setDeletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(collectionId);
      saveDeletedItems(newSet);
      console.log("🔄 RESTORED:", collectionId);
      return newSet;
    });
  }, []);

  const addRelatedImage = useCallback(async (collectionId, imageIndex, relatedImageFileOrUrl) => {
    if (!currentUser) throw new Error("Not authenticated");
    if (deletedItemsRef.current.has(collectionId)) {
      throw new Error("Cannot modify deleted collection");
    }

    let relatedImageUrl = relatedImageFileOrUrl;
    if (
      relatedImageFileOrUrl instanceof File ||
      (typeof relatedImageFileOrUrl === "object" &&
        relatedImageFileOrUrl !== null &&
        relatedImageFileOrUrl.name)
    ) {
      relatedImageUrl = await uploadImage(relatedImageFileOrUrl, "relatedImages");
    }

    const docRef = doc(db, "collectionImages", collectionId);
    const docSnap = await getDoc(docRef);
    let data = docSnap.exists() ? docSnap.data() : null;

    const mergedItem = collections.find((c) => c.id === collectionId);
    if (!mergedItem) throw new Error("Collection item not found");

    const mergedImages = normalizeImages(mergedItem.images);
    if (imageIndex >= mergedImages.length) throw new Error("Image index out of bounds");

    const targetImage = mergedImages[imageIndex];
    if (!targetImage?.url) throw new Error("Target image URL not found");

    let firestoreImages = data?.images ? normalizeImages(data.images) : [];

    let fireImageIndex = firestoreImages.findIndex((img) => img.url === targetImage.url);

    if (fireImageIndex === -1) {
      if (imageIndex > firestoreImages.length) {
        firestoreImages.push({ url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = firestoreImages.length - 1;
      } else {
        firestoreImages.splice(imageIndex, 0, { url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = imageIndex;
      }
    }

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

    if (data) {
      await updateDoc(docRef, { images: updatedImages });
    } else {
      await setDoc(docRef, { images: updatedImages, createdAt: new Date() });
    }
  }, [currentUser, uploadImage, collections]);

  const removeRelatedImage = useCallback(async (collectionId, imageIndex, relatedImageUrl) => {
    if (!currentUser) throw new Error("Not authenticated");
    if (deletedItemsRef.current.has(collectionId)) {
      throw new Error("Cannot modify deleted collection");
    }

    const docRef = doc(db, "collectionImages", collectionId);
    const docSnap = await getDoc(docRef);
    let data = docSnap.exists() ? docSnap.data() : null;

    const mergedItem = collections.find((c) => c.id === collectionId);
    if (!mergedItem) throw new Error("Collection item not found");

    const mergedImages = normalizeImages(mergedItem.images);
    if (imageIndex >= mergedImages.length) throw new Error("Image index out of bounds");

    const targetImage = mergedImages[imageIndex];
    if (!targetImage?.url) throw new Error("Target image URL not found");

    let firestoreImages = data?.images ? normalizeImages(data.images) : [];

    let fireImageIndex = firestoreImages.findIndex((img) => img.url === targetImage.url);

    if (fireImageIndex === -1) {
      if (imageIndex > firestoreImages.length) {
        firestoreImages.push({ url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = firestoreImages.length - 1;
      } else {
        firestoreImages.splice(imageIndex, 0, { url: targetImage.url, relatedImages: targetImage.relatedImages || [] });
        fireImageIndex = imageIndex;
      }
    }

    const updatedImages = firestoreImages.map((img, idx) => {
      if (idx === fireImageIndex) {
        const relatedImages = (img.relatedImages || []).filter((rel) => rel !== relatedImageUrl);
        return { ...img, relatedImages };
      }
      return img;
    });

    if (data) {
      await updateDoc(docRef, { images: updatedImages });
    } else {
      await setDoc(docRef, { images: updatedImages, createdAt: new Date() });
    }
  }, [currentUser, collections]);

  return (
    <DataContext.Provider
      value={{
        gallery: combinedGallery,
        collection: collections,
        sampleData,
        loading,
        addgallery,
        deletegallery,
        addcollection,
        updatecollection,
        deletecollection,
        restorecollection,
        addRelatedImage,
        removeRelatedImage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
