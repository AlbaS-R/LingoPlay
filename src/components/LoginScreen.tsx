import Link from "next/link";
import { CloseSvg } from "./Svgs";
import type { ComponentProps } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useBoundStore } from "~/hooks/useBoundStore";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "~/firebaseConfig";

export const GoogleLogoSvg = (props: ComponentProps<"svg">) => (
  <svg viewBox="0 0 48 48" {...props}>
    {/* (SVG Paths igual que antes...) */}
  </svg>
);

export type LoginScreenState = "HIDDEN" | "LOGIN" | "SIGNUP";

export const useLoginScreen = () => {
  const router = useRouter();
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const queryState: LoginScreenState = (() => {
    if (loggedIn) return "HIDDEN";
    if ("login" in router.query) return "LOGIN";
    if ("sign-up" in router.query) return "SIGNUP";
    return "HIDDEN";
  })();
  const [loginScreenState, setLoginScreenState] = useState(queryState);
  useEffect(() => setLoginScreenState(queryState), [queryState]);
  return { loginScreenState, setLoginScreenState };
};

export const LoginScreen = ({
  loginScreenState,
  setLoginScreenState,
}: {
  loginScreenState: LoginScreenState;
  setLoginScreenState: React.Dispatch<React.SetStateAction<LoginScreenState>>;
}) => {
  const router = useRouter();
  const setLoggedIn = useBoundStore((x) => x.setLoggedIn);
  const setUsername = useBoundStore((x) => x.setUsername);
  const setName = useBoundStore((x) => x.setName);

  const nameInputRef = useRef<null | HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ageTooltipShown, setAgeTooltipShown] = useState(false);

  useEffect(() => {
    setError(""); // Limpiar errores al cambiar vista
  }, [loginScreenState]);

  const handleAuth = async () => {
    try {
      const userCredential =
        loginScreenState === "SIGNUP"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      const uid = user.uid;
      const userRef = doc(db, "usuarios", uid);
      const docSnap = await getDoc(userRef);

      // Si no existe el documento, lo creamos al registrarse
      if (!docSnap.exists() && loginScreenState === "SIGNUP") {
        const name =
          nameInputRef.current?.value.trim() ||
          "Usuario" + Math.random().toString().slice(2);
        await setDoc(userRef, {
          nombre_usuario: name,
          email: user.email,
          fecha_creacion: new Date(),
          language: {
            name: "Spanish",
            nativeName: "Español",
            viewBox: "0 66 82 66",
            code: "es",
          },
          streak: 0,
        });
        setName(name);
        setUsername(name.replace(/ +/g, "-"));
      } else {
        // Si ya existe, lo leemos
        const data = docSnap.data();
        setName(data?.nombre_usuario ?? "User");
        setUsername(data?.nombre_usuario?.replace(/ +/g, "-") ?? "user");
      }

      setLoggedIn(true);
      void router.push("/profile");
    } catch (err: any) {
      setError("❌ " + (err.message || "Unexpected error"));
    }
  };

  return (
    <article
      className={[
        "fixed inset-0 z-30 flex flex-col bg-[#235390] p-7 transition duration-300",
        loginScreenState === "HIDDEN"
          ? "pointer-events-none opacity-0"
          : "opacity-100",
      ].join(" ")}
      aria-hidden={!loginScreenState}
    >
      <header className="flex flex-row-reverse justify-between sm:flex-row">
        <button
          className="flex text-gray-400"
          onClick={() => setLoginScreenState("HIDDEN")}
        >
          <CloseSvg />
          <span className="sr-only">Close</span>
        </button>
        <button
          className="hidden rounded-2xl border-2 border-b-4 border-gray-200 px-4 py-3 text-sm font-bold uppercase text-blue-400 transition hover:bg-gray-50 hover:brightness-90 sm:block"
          onClick={() =>
            setLoginScreenState((x) => (x === "LOGIN" ? "SIGNUP" : "LOGIN"))
          }
        >
          {loginScreenState === "LOGIN" ? "Sign up" : "Login"}
        </button>
      </header>
      <div className="flex grow items-center justify-center">
        <div className="flex w-full flex-col gap-5 sm:w-96">
          <h2 className="text-center text-2xl font-bold text-white">
            {loginScreenState === "LOGIN" ? "LOG IN" : "CREATE YOUR PROFILE"}
          </h2>
          <div className="flex flex-col gap-2 text-black">
            {loginScreenState === "SIGNUP" && (
              <>
                <div className="relative flex grow">
                  <input
                    className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
                    placeholder="Age (optional)"
                  />
                  <div className="absolute bottom-0 right-0 top-0 flex items-center justify-center pr-4">
                    <div
                      className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400"
                      onMouseEnter={() => setAgeTooltipShown(true)}
                      onMouseLeave={() => setAgeTooltipShown(false)}
                      role="button"
                      tabIndex={0}
                      aria-label="Why do you need an age?"
                    >
                      ?
                      {ageTooltipShown && (
                        <div className="absolute -right-5 top-full z-10 w-72 rounded-2xl border-2 border-gray-200 bg-white p-4 text-center text-xs leading-5 text-gray-800">
                          Providing your age ensures you get the right LingoPlay
                          experience. For more details, please visit our{" "}
                          <Link
                            href="https://www.duolingo.com/privacy"
                            className="text-blue-700"
                          >
                            Privacy Policy
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
                  placeholder="Name"
                  ref={nameInputRef}
                />
              </>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3"
              placeholder="Password"
            />
          </div>
          <button
            className="rounded-2xl border-b-4 border-blue-500 bg-blue-400 py-3 font-bold uppercase text-white transition hover:brightness-110"
            onClick={handleAuth}
          >
            {loginScreenState === "LOGIN" ? "Log in" : "Create account"}
          </button>
          {error && <p className="text-center text-sm text-red-200">{error}</p>}
          <div className="flex items-center gap-2">
            <div className="h-[2px] grow bg-gray-300"></div>
            <span className="font-bold uppercase text-gray-400">or</span>
            <div className="h-[2px] grow bg-gray-300"></div>
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-gray-300 bg-white py-3 font-bold text-gray-700 transition hover:bg-gray-100 hover:brightness-90"
            onClick={handleAuth}
          >
            <GoogleLogoSvg className="h-5 w-5" /> Google
          </button>
          <p className="text-center text-xs leading-5 text-gray-400">
            By signing in to LingoPlay, you agree to our{" "}
            <Link
              className="font-bold"
              href="https://www.duolingo.com/terms?wantsPlainInfo=1"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              className="font-bold"
              href="https://www.duolingo.com/privacy?wantsPlainInfo=1"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </article>
  );
};
