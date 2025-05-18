import { useEffect, useState } from "react";
import { collection, getDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "~/firebaseConfig";
import { useRouter } from "next/router";
import { useBoundStore } from "~/hooks/useBoundStore";

// Tipado del ejercicio
type VoiceExercise = {
  pregunta: string;
  alternativas: string[];
  respuestaCorrecta: string;
};

const VoiceLesson = () => {
  const [exercises, setExercises] = useState<VoiceExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [shouldSaveResult, setShouldSaveResult] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [showUnlockedMessage, setShowUnlockedMessage] = useState(false);

  const router = useRouter();
  const gameId = router.query.gameId as string;

  const unitProgress = useBoundStore((x) => x.unitProgress[3] || 0);
  const setUnitProgress = useBoundStore((x) => x.setUnitProgress);
  const increaseLessonsCompleted = useBoundStore((x) => x.increaseLessonsCompleted);

  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^\w\sÀ-ſ]/g, "").trim();

  useEffect(() => {
    const fetchExercises = async () => {
      if (!gameId) return;
      try {
        const docRef = doc(db, "ejerciciosVoz", gameId);
        const snapshot = await getDoc(docRef);
        const data = snapshot.data();
        if (!data) return;
        const preguntas = data?.preguntas;
        const respuestas = data?.respuestaCorrecta;

        if (Array.isArray(preguntas) && Array.isArray(respuestas)) {
          const ejercicios: VoiceExercise[] = [];
          for (let i = 0; i < preguntas.length; i++) {
            ejercicios.push({
              pregunta: preguntas[i],
              respuestaCorrecta: respuestas[i],
              alternativas: data[`opciones${i + 1}`] || [],
            });
          }
          setExercises(ejercicios);
        }
      } catch (error) {
        console.error("Error al cargar ejercicios:", error);
      }
    };

    fetchExercises();
  }, [gameId]);

  const current = exercises[currentIndex];

  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API no soportada en este navegador.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const result = event.results?.[0]?.[0]?.transcript || "";
      setTranscript(result);
      if (!current) return;
      const correctAnswer = normalize(current.respuestaCorrecta);
      const userAnswer = normalize(result);
      if (userAnswer === correctAnswer) {
        setCorrectCount((prev) => prev + 1);
        setFeedback("✅ Good job!");
        setWasCorrect(true);
      } else {
        setFeedback(`❌ Correct answer: ${current.respuestaCorrecta}`);
        setWasCorrect(false);
      }
      setListening(false);
    };
    recognition.onerror = () => {
      setFeedback("❌ Error recognizing voice.");
      setListening(false);
    };
    recognition.start();
  };

  const nextExercise = () => {
    setTranscript("");
    setFeedback("");
    setWasCorrect(false);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= exercises.length) setShouldSaveResult(true);
      return next;
    });
  };

  useEffect(() => {
    const guardarResultado = async () => {
      if (!shouldSaveResult || !gameId) return;

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const total = exercises.length;
      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
      const seconds = (elapsed % 60).toString().padStart(2, "0");

      const userRef = doc(db, "usuarios", uid);

      try {
        const userSnap = await getDoc(userRef);
        let progresoAnterior = 0;
        if (userSnap.exists()) {
          progresoAnterior = userSnap.data().lessonsCompleted_unit3 || 0;
        }

        const nuevoProgreso = Math.max(progresoAnterior, Number(gameId.replace("ej", "")));

        await setDoc(userRef, {
          [`lessonsCompleted_unit3`]: nuevoProgreso,
          leccionVoz: {
            fecha: new Date().toISOString(),
            totalXP: total,
            aciertos: correctCount,
            tiempo: `${minutes}:${seconds}`,
            precision: accuracy,
          },
        }, { merge: true });

        setUnitProgress(3, nuevoProgreso);
        increaseLessonsCompleted(3);
        setShowUnlockedMessage(true);
        console.log("✅ Resultado guardado. Progreso:", nuevoProgreso);
      } catch (error) {
        console.error("❌ Error al guardar resultado:", error);
      }
    };

    guardarResultado();
  }, [shouldSaveResult]);

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 bg-white relative">
        <div className="w-full flex items-center justify-between mb-6 px-2">
          <button
            onClick={() => router.push("/learn")}
            className="text-purple-600 hover:text-purple-800 text-2xl"
          >❌</button>
        </div>
        <p className="text-lg text-gray-700">Loading exercises...</p>
      </div>
    );
  }

  if (!current) {
    const total = exercises.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const seconds = (elapsed % 60).toString().padStart(2, "0");

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 bg-white px-4">
        <h1 className="text-3xl font-bold text-yellow-500">Lesson Complete!</h1>

        {showUnlockedMessage && (
          <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl shadow text-lg font-semibold">
            ✅ ¡Nuevo ejercicio desbloqueado!
          </div>
        )}

        <div className="flex gap-6">
          <div className="bg-yellow-400 text-white px-4 py-2 rounded-lg shadow">
            <p className="text-sm">Total XP</p>
            <p className="text-xl font-bold">{total}</p>
          </div>
          <div className="bg-blue-400 text-white px-4 py-2 rounded-lg shadow">
            <p className="text-sm">Time</p>
            <p className="text-xl font-bold">{minutes}:{seconds}</p>
          </div>
          <div className="bg-green-400 text-white px-4 py-2 rounded-lg shadow">
            <p className="text-sm">Accuracy</p>
            <p className="text-xl font-bold">{accuracy}%</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/learn")}
          className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-lg shadow"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 relative bg-white">
      <div className="w-full flex items-center justify-between mb-6 px-2">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="text-purple-600 hover:text-purple-800 text-2xl"
        >❌</button>
        <div className="flex-1 ml-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(correctCount / exercises.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <h1 className="text-xl font-bold text-center mb-2">🗣️ Voice Lesson</h1>
      <p className="text-lg text-center font-medium mb-4">{current.pregunta}</p>

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-lg w-full">
        {current.alternativas.map((op, idx) => (
          <button
            key={idx}
            className="text-base bg-white border border-gray-300 rounded-xl py-3 px-4 shadow hover:bg-blue-50 transition"
            disabled
          >
            {op}
          </button>
        ))}
      </div>

      <button
        onClick={startRecognition}
        disabled={listening}
        className={`w-48 py-2 mb-4 rounded text-white text-lg shadow transition ${
          listening ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {listening ? "Listening..." : "Start Speaking"}
      </button>

      {transcript && (
        <div className="text-center mt-2">
          <p className="text-gray-700">
            <strong>You said:</strong> "{transcript}"
          </p>
        </div>
      )}

      {feedback && (
        <div
          className={`w-full mt-6 px-4 py-4 rounded-xl font-bold text-center ${
            feedback.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-rose-100 text-rose-600"
          }`}
        >
          <p className="text-lg mb-3">
            {feedback.startsWith("✅") ? "Good job!" : feedback.replace("❌ ", "")}
          </p>
          <div className="w-full">
            <button
              onClick={nextExercise}
              className={`w-full rounded-2xl border-b-4 p-4 text-white text-lg font-bold transition shadow ${
                feedback.startsWith("✅")
                  ? "bg-green-500 border-green-600 hover:brightness-105"
                  : "bg-red-500 border-red-600 hover:brightness-105"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-2">Are you sure you want to quit?</h2>
            <p className="text-gray-600 mb-4">All progress for this lesson will be lost.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
              >Stay</button>
              <button
                onClick={() => router.push("/learn")}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >Quit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceLesson;
