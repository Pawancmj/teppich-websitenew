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
  getDocs,
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
    console.error('Failed to save deleted item:', error);
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

// 🔥 FIXED MERGE: Preserve LOCAL titles/names, only override images + timestamps
const mergeItemData = (baseItem, firestoreItem) => {
  if (!baseItem) return null;

  const localCore = {
    id: baseItem.id,
    name: baseItem.name || baseItem.title,
    title: baseItem.title || baseItem.name,
    category: baseItem.category,
    description: baseItem.description,
    ...baseItem
  };

  if (!firestoreItem) {
    return {
      ...localCore,
      images: normalizeImages(baseItem.images)
    };
  }

  const baseImages = normalizeImages(baseItem.images || []);
  const fireImages = normalizeImages(firestoreItem.images || []);

  const imagesByUrl = new Map();
  baseImages.forEach(img => {
    if (img?.url) imagesByUrl.set(img.url, { ...img });
  });
  fireImages.forEach(img => {
    if (img?.url) {
      const existing = imagesByUrl.get(img.url);
      imagesByUrl.set(img.url, { 
        ...img,
        relatedImages: Array.from(new Set([
          ...(existing?.relatedImages || []),
          ...(img.relatedImages || [])
        ]))
      });
    }
  });

  return {
    ...localCore,
    images: Array.from(imagesByUrl.values()),
    createdAt: firestoreItem.createdAt || baseItem.createdAt,
    updatedAt: firestoreItem.updatedAt || new Date()
  };
};

export function DataProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletedItems, setDeletedItems] = useState(loadDeletedItems());
  const deletedItemsRef = useRef(deletedItems);
  const isInitializedRef = useRef(false);
  
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

  // 🔥 INITIALIZE with filtering orphan Firestore docs
  useEffect(() => {
    const initializeData = async () => {
      if (isInitializedRef.current || !currentUser) return;
      
      console.log("🔥 INITIALIZING DATA...");
      isInitializedRef.current = true;
      
      try {
        const collectionSnapshot = await getDocs(query(
          collection(db, "collectionImages")
        ));
        
        const firestoreDataMap = new Map();
        collectionSnapshot.forEach((docSnap) => {
          if (initialCollection.some(item => item.id === docSnap.id)) {
            firestoreDataMap.set(docSnap.id, docSnap.data());
          }
        });

        console.log(`🔥 Firestore: ${firestoreDataMap.size} matching docs`);

        const mergedCollections = initialCollection
          .filter(item => !deletedItemsRef.current.has(item.id))
          .map(baseItem => mergeItemData(baseItem, firestoreDataMap.get(baseItem.id)))
          .filter(Boolean);

        console.log(`✅ Initialized: ${mergedCollections.length} collections`);
        setCollections(mergedCollections);
        
      } catch (error) {
        console.error("💥 Init failed:", error);
        const filteredLocal = initialCollection.filter(item => 
          !deletedItemsRef.current.has(item.id)
        );
        setCollections(filteredLocal.map(item => mergeItemData(item, null)));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentUser]);

  // 🔥 LISTENER with same filtering to exclude orphans
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
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
      const firestoreDataMap = new Map();
      snapshot.forEach((docSnap) => {
        if (initialCollection.some(item => item.id === docSnap.id)) {
          firestoreDataMap.set(docSnap.id, docSnap.data());
        }
      });

      const mergedCollections = initialCollection
        .filter(item => !deletedItemsRef.current.has(item.id))
        .map(baseItem => mergeItemData(baseItem, firestoreDataMap.get(baseItem.id)))
        .filter(Boolean);

      setCollections(mergedCollections);
    });

    return () => {
      unsubGallery();
      unsubCollection();
    };
  }, []);

  useEffect(() => {
    deletedItemsRef.current = deletedItems;
  }, [deletedItems]);

  useEffect(() => {
    const loaded = loadDeletedItems();
    setDeletedItems(loaded);
  }, []);

  const combinedGallery = [...hardcodedGallery, ...gallery];

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

    setDeletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      saveDeletedItems(newSet);
      return newSet;
    });

    const docRef = doc(db, "collectionImages", id);
    const updateData = {
      images: normalizeImages(updatedItem.images),
      updatedAt: new Date()
    };

    try {
      await updateDoc(docRef, cleanFirestoreData(updateData));
    } catch (error) {
      await setDoc(docRef, cleanFirestoreData({
        images: normalizeImages(updatedItem.images),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }
  }, [currentUser]);

  const addcollection = useCallback(async (item) => {
    if (!currentUser) throw new Error("Not authenticated");

    setDeletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      saveDeletedItems(newSet);
      return newSet;
    });

    const docRef = doc(db, "collectionImages", item.id);
    const docData = {
      images: normalizeImages(item.images),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await updateDoc(docRef, cleanFirestoreData(docData));
    } catch {
      await setDoc(docRef, cleanFirestoreData(docData));
    }
  }, [currentUser]);

  const deletecollection = useCallback(async (collectionId) => {
    if (!currentUser) throw new Error("Please login first!");

    try {
      setDeletedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(collectionId);
        saveDeletedItems(newSet);
        return newSet;
      });

      const docRef = doc(db, "collectionImages", collectionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await deleteDoc(docRef);
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
      return newSet;
    });
  }, []);

  // 🔥 Safe related image addition, uses initialCollection stable IDs only
  const addRelatedImage = useCallback(async (collectionId, imageIndex, relatedImageFileOrUrl) => {
    if (!currentUser) throw new Error("Not authenticated");
    
    if (deletedItemsRef.current.has(collectionId)) {
      throw new Error("Cannot modify deleted collection");
    }

    let relatedImageUrl = relatedImageFileOrUrl;
    if (relatedImageFileOrUrl instanceof File || 
        (typeof relatedImageFileOrUrl === "object" && relatedImageFileOrUrl?.name)) {
      relatedImageUrl = await uploadImage(relatedImageFileOrUrl, "relatedImages");
    }

    const docRef = doc(db, "collectionImages", collectionId);
    const docSnap = await getDoc(docRef);

    const baseItem = initialCollection.find(c => c.id === collectionId);
    if (!baseItem) throw new Error("Collection item not found");

    const baseImages = normalizeImages(baseItem.images);
    if (imageIndex >= baseImages.length) throw new Error("Image index out of bounds");

    const targetImage = baseImages[imageIndex];
    if (!targetImage?.url) throw new Error("Target image URL not found");

    let firestoreImages = docSnap.exists() ? normalizeImages(docSnap.data()?.images || []) : [];
    let fireImageIndex = firestoreImages.findIndex(img => img.url === targetImage.url);

    if (fireImageIndex === -1) {
      firestoreImages.splice(imageIndex, 0, { 
        url: targetImage.url, 
        relatedImages: targetImage.relatedImages || [] 
      });
      fireImageIndex = imageIndex;
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

    if (docSnap.exists()) {
      await updateDoc(docRef, { 
        images: updatedImages, 
        updatedAt: new Date(),
      });
    } else {
      await setDoc(docRef, { 
        images: updatedImages, 
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [currentUser, uploadImage]);

  // 🔥 Safe related image removal, stable refs only
  const removeRelatedImage = useCallback(async (collectionId, imageIndex, relatedImageUrl) => {
    if (!currentUser) throw new Error("Not authenticated");
    if (deletedItemsRef.current.has(collectionId)) {
      throw new Error("Cannot modify deleted collection");
    }

    const docRef = doc(db, "collectionImages", collectionId);
    const docSnap = await getDoc(docRef);

    const baseItem = initialCollection.find(c => c.id === collectionId);
    if (!baseItem) throw new Error("Collection item not found");

    const baseImages = normalizeImages(baseItem.images);
    if (imageIndex >= baseImages.length) throw new Error("Image index out of bounds");

    const targetImage = baseImages[imageIndex];
    if (!targetImage?.url) throw new Error("Target image URL not found");

    let firestoreImages = docSnap.exists() ? normalizeImages(docSnap.data()?.images || []) : [];
    let fireImageIndex = firestoreImages.findIndex(img => img.url === targetImage.url);

    if (fireImageIndex === -1) {
      firestoreImages.splice(imageIndex, 0, { 
        url: targetImage.url, 
        relatedImages: targetImage.relatedImages || [] 
      });
      fireImageIndex = imageIndex;
    }

    const updatedImages = firestoreImages.map((img, idx) => {
      if (idx === fireImageIndex) {
        const relatedImages = (img.relatedImages || []).filter(rel => rel !== relatedImageUrl);
        return { ...img, relatedImages };
      }
      return img;
    });

    if (docSnap.exists()) {
      await updateDoc(docRef, { 
        images: updatedImages, 
        updatedAt: new Date(),
      });
    } else {
      await setDoc(docRef, { 
        images: updatedImages, 
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [currentUser]);

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
        uploadImage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
