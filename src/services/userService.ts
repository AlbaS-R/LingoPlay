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

export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, "usuarios", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      nombre_usuario: data.nombre_usuario,
      username: data.username,
      language: data.language,
      streak: data.streak,
      xp: data.xp,
      league: data.league,
      top3Finishes: data.top3Finishes,
      achievements: data.achievements,
      followers: data.followers,
      following: data.following,
      fecha_creacion: data.fecha_creacion,
      avatarURL: data.avatarURL || null,
      dailyGoal: data.dailyGoal || 30,
    };
  } else {
    throw new Error("Usuario no encontrado");
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, "usuarios", userId);
  await updateDoc(userRef, data);
};

export const updateUserProgress = async (progress: ProgressUpdate) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const userRef = doc(db, "usuarios", user.uid);

  try {
    await updateDoc(userRef, progress);
    console.log("✅ Progreso actualizado en Firestore:", progress);
  } catch (error) {
    console.error(" Error al actualizar progreso:", error);
  }
};

export const updateDailyGoal = async (userId: string, dailyGoal: number) => {
  console.log("📤 updateDailyGoal ejecutado con:", { userId, dailyGoal }); // 👈
  const userRef = doc(db, "usuarios", userId);
  try {
    await updateDoc(userRef, { dailyGoal });
    console.log("✅ Meta diaria guardada en Firestore:", dailyGoal);
  } catch (error) {
    console.error("❌ Error al guardar meta diaria:", error);
  }
};

export const getUserDailyGoal = async (
  userId: string,
): Promise<number | null> => {
  const userRef = doc(db, "usuarios", userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.dailyGoal ?? null;
    }
    return null;
  } catch (error) {
    console.error("❌ Error al obtener dailyGoal:", error);
    return null;
  }
};
