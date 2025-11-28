import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase"; // your firebase app initialization

const storage = getStorage(app);
const firestore = getFirestore(app);

export async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function saveImageUrlToFirestore(collectionName, docId, data) {
  const docRef = doc(firestore, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
}

export async function handleUpload(file) {
  const imageUrl = await uploadImage(file, `images/${file.name}`);
  await saveImageUrlToFirestore("gallery", file.name, {
    url: imageUrl,
    createdAt: new Date(),
  });
  return imageUrl;
}
