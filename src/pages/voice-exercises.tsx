import React, { useState } from "react";
import { TopBar } from "~/components/TopBar";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { auth } from "~/firebaseConfig";
import { updateUserProgress } from "~/services/userService";

const VoiceExercises = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const expectedSentence = "I would like a coffee, please.";

  const handleListen = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = async (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setListening(false);

      const isCorrectNow =
        result.toLowerCase().trim() === expectedSentence.toLowerCase().trim();

      if (isCorrectNow) {
        const user = auth.currentUser;
        if (!user) {
          alert("No has iniciado sesión");
          return;
        }

        try {
          await updateUserProgress({ xp: 10 }); // ✅ Añade 10 XP si es correcto
          console.log("✅ XP actualizado en Firebase");
        } catch (error) {
          console.error("❌ Error al actualizar XP:", error);
        }
      }
    };

    recognition.onerror = () => {
      setTranscript("Error trying to recognize voice.");
      setListening(false);
    };

    recognition.start();
  };

  const isCorrect =
    transcript.toLowerCase().trim() === expectedSentence.toLowerCase().trim();

  return (
    <div>
      <TopBar />
      <LeftBar selectedTab={undefined} />
      <BottomBar selectedTab={undefined} />

      <div className="p-10">
        <h1 className="text-2xl font-bold mb-4">Voice Exercise</h1>
        <p className="mb-4">Say the following sentence out loud:</p>
        <p className="font-semibold text-lg mb-6">"{expectedSentence}"</p>

        <button
          onClick={handleListen}
          className="mb-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          disabled={listening}
        >
          {listening ? "Listening..." : "Start Speaking"}
        </button>

        {transcript && (
          <div className="mt-4">
            <p className="font-medium">You said:</p>
            <p className="italic text-gray-700">"{transcript}"</p>
            <p
              className={`mt-2 font-bold ${
                isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {isCorrect ? "✅ Correct!" : "❌ Try again"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceExercises;
