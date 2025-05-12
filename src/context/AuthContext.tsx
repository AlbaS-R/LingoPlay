import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "~/firebaseConfig"; // Importamos `db` desde la configuración de Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Importamos las funciones necesarias de Firestore

type AuthContextType = {
  user: User | null;
  loading: boolean;
  lessonsCompleted: number; // Agregamos `lessonsCompleted` al contexto
  setLessonsCompleted: (value: number) => void; // Agregamos la función para actualizar `lessonsCompleted`
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonsCompleted, setLessonsCompleted] = useState(0); // Estado local para `lessonsCompleted`

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("Fetched user data from Firebase:", data);
          setLessonsCompleted(data.lessonsCompleted || 0); // Actualizamos el estado local
        }
      }
    };
    fetchUserData();
  }, [user]);

  const saveProgressToFirebase = async (lessonsCompleted: number) => {
    if (!user) return;
    try {
      console.log("Saving lessonsCompleted to Firebase:", lessonsCompleted);
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, { lessonsCompleted });
    } catch (error) {
      console.error("Error saving progress to Firebase:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, lessonsCompleted, setLessonsCompleted }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
