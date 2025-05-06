import { useState } from "react";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "~/firebaseConfig";

const avatarList = [
  "/Avatar/avatar1.jpg",
  "/Avatar/avatar2.jpg",
  "/Avatar/avatar3.jpg",
  "/Avatar/avatar4.jpg",
  "/Avatar/avatar5.jpg",
  "/Avatar/avatar6.jpg",
  "/Avatar/avatar7.jpg",
  "/Avatar/avatar8.jpg",
  "/Avatar/avatar9.jpg",
  "/Avatar/avatar10.jpg",
  "/Avatar/avatar11.jpg",
  "/Avatar/avatar12.jpg",
  
];

export const AvatarSelector = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !selectedAvatar) return;

    const userRef = doc(db, "usuarios", user.uid);
    await updateDoc(userRef, { avatarURL: selectedAvatar });

    alert("✅ Avatar guardado correctamente");
  };

  return (
    <div className="flex flex-col gap-4 sm:pl-10">
      <div className="font-bold">Avatar</div>

      {/* Selector personalizado */}
      <div className="relative w-60">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-2xl border-2 border-gray-200 p-2 bg-white"
        >
          {selectedAvatar ? (
            <Image
              src={selectedAvatar}
              alt="Selected Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <span className="text-gray-500">Selecciona un avatar</span>
          )}
          <span className="ml-2">▼</span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border bg-white shadow-md p-2 flex flex-wrap gap-2">
            {avatarList.map((url) => (
              <div
                key={url}
                className="cursor-pointer rounded-full border-2 border-transparent hover:border-blue-400"
                onClick={() => {
                  setSelectedAvatar(url);
                  setIsOpen(false);
                }}
              >
                <Image src={url} alt="Avatar" width={40} height={40} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de guardar */}
      <div>
        <button
          onClick={handleSave}
          disabled={!selectedAvatar}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Guardar avatar
        </button>
      </div>
    </div>
  );
};
