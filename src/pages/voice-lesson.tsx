import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/firebaseConfig";

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

  useEffect(() => {
    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, "ejerciciosVoz"));
      const data: VoiceExercise[] = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data() as VoiceExercise);
      });
      setExercises(data);
    };

    fetchExercises();
  }, []);

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

      const correctAnswer = currentExercise?.respuestaCorrecta.toLowerCase().trim() ?? "";


      const userAnswer = result.toLowerCase().trim();

      if (userAnswer === correctAnswer) {
        setFeedback("✅ Correct!");
      } else {
        setFeedback(`❌ Incorrect. Expected: "${currentExercise?.respuestaCorrecta ?? "unknown"}"`);

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
    setCurrentIndex((prev) => prev + 1);
  };

  const currentExercise = exercises[currentIndex];

  if (exercises.length === 0) return <div className="p-6">Loading exercises...</div>;
  if (!currentExercise) return <div className="p-6">Lesson complete! 🎉</div>;

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-center">Voice Lesson</h1>
      <p className="text-lg font-medium">{currentExercise.pregunta}</p>

      <button
        onClick={startRecognition}
        disabled={listening}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        {listening ? "Listening..." : "Start Speaking"}
      </button>

      {transcript && (
        <div>
          <p className="mt-4 text-gray-600">
            <strong>You said:</strong> {transcript}
          </p>
          <p className={`mt-2 font-bold ${feedback.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
            {feedback}
          </p>
        </div>
      )}

      {feedback && (
        <button
          onClick={nextExercise}
          className="mt-6 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default VoiceLesson;
