import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "~/firebaseConfig";

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

  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^À-ſa-z0-9 ]/gi, "").trim();

  useEffect(() => {
    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, "ejerciciosVoz"));
      const data: VoiceExercise[] = [];
      querySnapshot.forEach((doc) => {
        const d = doc.data();
        const preguntas = d.preguntas;
        const respuestas = d.respuestaCorrecta;
        if (Array.isArray(preguntas) && Array.isArray(respuestas)) {
          for (let i = 0; i < preguntas.length; i++) {
            data.push({
              pregunta: preguntas[i],
              respuestaCorrecta: respuestas[i],
              alternativas: d[`opciones${i + 1}`] || []
            });
          }
        }
      });
      setExercises(data);
    };
    fetchExercises();
  }, []);

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
    if (!wasCorrect) return;
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
      if (!shouldSaveResult) return;
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const total = exercises.length;
      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
      const seconds = (elapsed % 60).toString().padStart(2, "0");
      const userRef = doc(db, "usuarios", uid);
      const resultado = {
        leccionVoz: {
          fecha: new Date().toISOString(),
          totalXP: total,
          aciertos: correctCount,
          tiempo: `${minutes}:${seconds}`,
          precision: accuracy
        }
      };
      try {
        await setDoc(userRef, resultado, { merge: true });
        console.log("✅ Resultado guardado.");
      } catch (error) {
        console.error("❌ Error al guardar resultado:", error);
      }
    };
    guardarResultado();
  }, [shouldSaveResult]);

  if (exercises.length === 0) return <div className="p-6">Loading exercises...</div>;
  if (!current) return <div className="p-6">Lesson complete! 🎉</div>;

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
          className={`w-full mt-6 py-4 text-center ${
            feedback.startsWith("✅")
              ? "bg-green-100 border-t-4 border-green-500"
              : "bg-red-100 border-t-4 border-red-500"
          }`}
        >
          <p className="text-lg font-semibold mb-2">
            {feedback.startsWith("✅") ? "Good job!" : feedback.replace("❌ ", "")}
          </p>
          <button
            onClick={nextExercise}
            className={`px-8 py-2 text-white rounded-full text-lg shadow-md transition ${
              feedback.startsWith("✅") ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Continue
          </button>
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
                onClick={() => window.location.href = "/learn"}
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
