import type { NextPage } from "next";
import Link from "next/link";
import languages from "~/utils/languages";
import { LanguageHeader } from "~/components/LanguageHeader";
import { useBoundStore } from "~/hooks/useBoundStore";
import { Flag } from "~/components/Flag";
import _bgSnow from "../../public/bg-snow.svg";
import type { StaticImageData } from "next/image";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "~/firebaseConfig";

const bgSnow = _bgSnow as StaticImageData;

const Register: NextPage = () => {
  const setLanguage = useBoundStore((x) => x.setLanguage);
  const selectedLanguage = useBoundStore((x) => x.language);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLanguageClick = (language: any) => {
    setLanguage(language);
    setError("");
    setSuccess("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedLanguage) {
      setError("Selecciona un idioma primero ❗");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nombre_usuario: email.split("@")[0],
        fecha_creacion: new Date(),
        language: selectedLanguage,
        streak: 0,
        xp: 0,
        league: "Bronze",
        top3Finishes: 0,
        achievements: {
          wildfire: 1,
          sage: 1,
          scholar: 1,
        },
        followers: [],
        following: [],
      });

      setSuccess("¡Registro exitoso! ✅");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado ❌");
      } else if (err.code === "auth/invalid-email") {
        setError("Correo inválido ❌");
      } else if (err.code === "auth/weak-password") {
        setError("Contraseña muy débil ❌");
      } else {
        setError("Ocurrió un error al registrarse ❌");
      }
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center bg-[#235390] text-white"
      style={{
        backgroundImage: `url(${bgSnow.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <LanguageHeader />
      <div className="container flex grow flex-col items-center justify-center gap-10 px-4 py-12">
        <h1 className="mt-10 text-center text-3xl font-extrabold tracking-tight">
          I want to learn...
        </h1>

        <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {languages.map((language) => (
            <button
              key={language.name}
              onClick={() => handleLanguageClick(language)}
              className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-b-4 px-6 py-6 text-lg font-bold ${
                selectedLanguage?.code === language.code
                  ? "border-yellow-400 bg-white bg-opacity-20"
                  : "border-gray-400 hover:bg-gray-300 hover:bg-opacity-20"
              }`}
            >
              <Flag language={language} />
              <span>{language.name}</span>
            </button>
          ))}
        </section>

        <form
          onSubmit={handleRegister}
          className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white bg-opacity-90 p-6 text-black shadow-md"
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            className="rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Crear Cuenta
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </form>
      </div>
    </main>
  );
};

export default Register;
