import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { AvatarSelector } from "~/components/AvatarSelector";
import { LeftBar } from "~/components/LeftBar";
import { TopBar } from "~/components/TopBar";
import { SettingsRightNav } from "~/components/SettingsRightNav";
import { useBoundStore } from "~/hooks/useBoundStore";
import { auth, db } from "~/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";


const Account: NextPage = () => {
  const store = useBoundStore();
  const [localName, setLocalName] = useState(store.name);
  const [localUsername, setLocalUsername] = useState(store.username);
  const [localLanguage, setLocalLanguage] = useState(store.language?.code || "es");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [fechaCreacion, setFechaCreacion] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    setEmail(user.email || "");

    const userRef = doc(db, "usuarios", user.uid);
    getDoc(userRef).then((docSnap) => {
      const data = docSnap.data();
      if (data?.fecha_creacion?.seconds) {
        const date = new Date(data.fecha_creacion.seconds * 1000);
        setFechaCreacion(date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }));
      }
    });
  }, []); 
    // 🔧 Función que devuelve un objeto language con tipos exactos (evita error TS)
    const getLanguageObject = (code: "es" | "en") => {
      if (code === "es") {
        return {
          code: "es" as const,
          name: "Spanish" as const,
          nativeName: "Español" as const,
          viewBox: "0 66 82 66" as const,
        };
      } else {
        return {
          code: "en" as const,
          name: "English" as const,
          nativeName: "English" as const,
          viewBox: "0 0 82 66" as const,
        };
      }
    };


    const handleSave = async () => {
      const user = auth.currentUser;
      if (!user) {
        setMessage("❌ Usuario no autenticado");
        return;
      }
    
      const selectedLanguage = getLanguageObject(localLanguage);
    
      try {
        const userRef = doc(db, "usuarios", user.uid);
        await updateDoc(userRef, {
          nombre_usuario: localName,
          username: localUsername,
          language: selectedLanguage,
        });
    
        store.setName(localName);
        store.setUsername(localUsername);
        store.setLanguage(selectedLanguage);
    
        setMessage("✅ Cambios guardados correctamente");
      } catch (err) {
        console.error(err);
        setMessage("❌ Error al guardar los cambios");
      }
    };
    

  const isUnchanged =
    store.name === localName &&
    store.username === localUsername &&
    store.language?.code === localLanguage;

  return (
    <div>
      <TopBar />
      <LeftBar selectedTab={undefined} />
      <BottomBar selectedTab={undefined} />

      <div className="mx-auto flex flex-col gap-5 px-4 py-20 sm:py-10 md:pl-28 lg:pl-72">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between lg:max-w-4xl">
          <h1 className="text-lg font-bold text-gray-800 sm:text-2xl">Account</h1>
          <button
            className="rounded-2xl border-b-4 border-green-600 bg-green-500 px-5 py-3 font-bold uppercase text-white transition hover:brightness-110 disabled:border-b-0 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:brightness-100"
            onClick={handleSave}
            disabled={isUnchanged}
          >
            Save changes
          </button>
        </div>

        {message && (
          <div className="text-center text-sm font-medium text-green-600">{message}</div>
        )}

        <div className="flex justify-center gap-12">
          <div className="flex w-full max-w-xl flex-col gap-8">
            {/* Campos editables */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-10 sm:pl-10">
                <div className="font-bold sm:w-1/6">Name</div>
                <input
                  className="grow rounded-2xl border-2 border-gray-200 p-4 py-2"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-10 sm:pl-10">
                <div className="font-bold sm:w-1/6">Username</div>
                <input
                  className="grow rounded-2xl border-2 border-gray-200 p-4 py-2"
                  value={localUsername}
                  onChange={(e) => setLocalUsername(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-10 sm:pl-10">
                <div className="font-bold sm:w-1/6">Language</div>
                <select
                  value={localLanguage}
                  onChange={(e) => setLocalLanguage(e.target.value as "es" | "en")}
                  className="grow rounded-2xl border-2 border-gray-200 p-4 py-2 text-gray-600"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Campos no editables */}
            <div className="mt-8 flex flex-col gap-2 text-sm text-gray-500">
              <div>Email: <span className="font-medium text-gray-800">{email}</span></div>
              <div>Date created:  <span className="font-medium text-gray-800">{fechaCreacion}</span></div>
            </div>
            <AvatarSelector />
            
          </div>

          <SettingsRightNav selectedTab="Account" />
        </div>
      </div>
    </div>
  );
};

export default Account;
