import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, "usuarios", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("Usuario no encontrado");
  }
};
