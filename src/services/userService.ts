import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; 
import { getAuth } from "firebase/auth";

type ProgressUpdate = {
  xp?: number;
  streak?: number;
  top3Finishes?: number;
  achievements?: Record<string, number>;
  followers?: string[];
  following?: string[];
};

//  Obtener datos de un usuario desde Firebase
export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, "usuarios", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("Usuario no encontrado");
  }
};

//  Actualizar datos de un usuario en Firebase
export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, "usuarios", userId);
  await updateDoc(userRef, data);
};
//  Actualizar solo el progreso (XP, streak, logros...)
export const updateUserProgress = async (progress: ProgressUpdate) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const userRef = doc(db, "usuarios", user.uid);

  try {
    await updateDoc(userRef, progress);
    console.log("✅ Progreso actualizado en Firestore:", progress);
  } catch (error) {
    console.error("❌ Error al actualizar progreso:", error);
  }
};