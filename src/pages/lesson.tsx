
import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  getDoc,
  doc,
  collection,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import localforage from "localforage";
import { MemoryGame } from "~/components/MemoryGame";

// Define ExerciseType and interfaces for downloaded exercises
type ExerciseType = "ejerciciosES" | "ejerciciosVoz" | "memoryGames";

interface BaseExercise {
  id: string;
  type: ExerciseType;
  title?: string;
}

interface StandardExercise extends BaseExercise {
  opciones1?: string[];
  opciones2?: string[];
  opciones3?: string[];
  opciones4?: string[];
  opciones5?: string[];
  preguntas: string[];
  respuestas_correctas: string[];
}

interface MemoryGameData extends BaseExercise {
  pairs: Array<{
    id: string;
    image?: string;
    text?: string;
  }>;
}

type DownloadedExercise = StandardExercise | MemoryGameData;

const Lesson: NextPage = () => {
  const router = useRouter();

  const [lessonProblemIndex, setLessonProblemIndex] = useState(0);
  const [lessonProblems, setLessonProblems] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<null | number>(null);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [incorrectAnswerCount, setIncorrectAnswerCount] = useState(0);
  const [correctAnswerShown, setCorrectAnswerShown] = useState(false);
  const [quitMessageShown, setQuitMessageShown] = useState(false);

  const [questionResults, setQuestionResults] = useState<any[]>([]);

  const startTime = useRef(Date.now());
  const endTime = useRef(startTime.current);

  const [isLoading, setIsLoading] = useState(true);
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);
  const [exerciseId, setExerciseId] = useState<string | null>(null);

  const hearts =
    "fast-forward" in router.query &&
    !isNaN(Number(router.query["fast-forward"]))
      ? 3 - incorrectAnswerCount
      : null;

  useEffect(() => {
    localforage.config({
      name: "offlineExercisesDB",
      storeName: "exercises",
      description: "Almacén para ejercicios offline",
    });

    const loadExercise = async () => {
      setIsLoading(true);
      const { type, id } = router.query;

      if (!type || !id) {
        console.error("Missing exercise type or ID in URL.");
        setIsLoading(false);
        router.push("/downloads");
        return;
      }

      const currentExerciseType = type as ExerciseType;
      const currentExerciseId = id as string;

      
      if (currentExerciseType === "ejerciciosVoz") {
        router.push(`/voice-lesson?id=${currentExerciseId}`);
        return; 
      }
      

      setExerciseType(currentExerciseType);
      setExerciseId(currentExerciseId);

      try {
        const offlineData: DownloadedExercise | null = await localforage.getItem(
          `${currentExerciseType}-${currentExerciseId}`,
        );

        let exerciseData: DownloadedExercise | null = null;

        if (offlineData) {
          console.log("Loading exercise from offline storage:", offlineData);
          exerciseData = offlineData;
        } else {
          console.log(
            "Exercise not found offline. Attempting to fetch from Firestore.",
          );

          if (currentExerciseType === "memoryGames") {
            const mainDocRef = doc(db, currentExerciseType, currentExerciseId);
            const mainDocSnap = await getDoc(mainDocRef);

            if (!mainDocSnap.exists()) {
              throw new Error(
                `El juego de memoria "${currentExerciseId}" no existe en Firestore.`,
              );
            }

            const pairsCollectionRef = collection(mainDocRef, "pairs");
            const pairsSnapshot = await getDocs(pairsCollectionRef);
            const pairsData = pairsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
              id: doc.id,
              ...doc.data(),
            }));

            exerciseData = {
              id: currentExerciseId,
              type: currentExerciseType,
              title: mainDocSnap.data()?.title || `Memory Game ${currentExerciseId}`,
              ...mainDocSnap.data(),
              pairs: pairsData,
            } as MemoryGameData;
          } else {
            // For standard exercises (ejerciciosES)
            const exerciseRef = doc(db, currentExerciseType, currentExerciseId);
            const exerciseSnap = await getDoc(exerciseRef);

            if (!exerciseSnap.exists()) {
              throw new Error(
                `El ejercicio "${currentExerciseId}" de "${currentExerciseType}" no existe en Firestore.`,
              );
            }
            exerciseData = {
              id: currentExerciseId,
              type: currentExerciseType,
              title: exerciseSnap.data()?.title || `Exercise ${currentExerciseId}`,
              ...exerciseSnap.data(),
            } as StandardExercise;
          }
        }

        if (exerciseData) {
          
          if (exerciseData.type === "ejerciciosES") {
            const {
              preguntas,
              respuestas_correctas,
              opciones1,
              opciones2,
              opciones3,
              opciones4,
              opciones5,
            } = exerciseData as StandardExercise;

            const opcionesArrays = [
              opciones1,
              opciones2,
              opciones3,
              opciones4,
              opciones5,
            ];

            const loadedProblems = preguntas.map(
              (question: string, index: number) => {
                const answersForQuestion = opcionesArrays[index] ?? [];
                const correctAnswerIndex = answersForQuestion.indexOf(
                  respuestas_correctas[index] ?? ""
                );
                return {
                  type: "SELECT_1_OF_3",
                  question,
                  answers: answersForQuestion.map((opt: string) => ({
                    name: opt,
                  })),
                  correctAnswer: correctAnswerIndex !== -1 ? correctAnswerIndex : 0,
                };
              },
            );
            setLessonProblems(loadedProblems);
            startTime.current = Date.now();
            endTime.current = startTime.current;
          } else if (exerciseData.type === "memoryGames") {
             // For memory games, we still set a dummy problem to indicate that we're loading a special exercise
             setLessonProblems([{ type: exerciseData.type, id: exerciseData.id, title: exerciseData.title }]);
          }
          // No need to handle "ejerciciosVoz" here as it's redirected earlier
        } else {
          console.error("No exercise data found or fetched.");
          router.push("/downloads");
        }
      } catch (error) {
        console.error("Error loading exercise:", error);
        router.push("/downloads");
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
      loadExercise();
    }
  }, [router.isReady, router.query, router]);


  const totalCorrectAnswersNeeded = lessonProblems.length;
  const currentProblem = lessonProblems[lessonProblemIndex];
  const isAnswerCorrect = selectedAnswer === currentProblem?.correctAnswer;

  const onCheckAnswer = () => {
    setCorrectAnswerShown(true);
    if (isAnswerCorrect) setCorrectAnswerCount((x) => x + 1);
    else setIncorrectAnswerCount((x) => x + 1);

    setQuestionResults((prev) => [
      ...prev,
      {
        question: currentProblem.question,
        yourResponse: currentProblem.answers[selectedAnswer ?? 0]?.name,
        correctResponse:
          currentProblem.answers[currentProblem.correctAnswer].name,
      },
    ]);
  };

  const onFinish = () => {
    setSelectedAnswer(null);
    setCorrectAnswerShown(false);
    setLessonProblemIndex((prev) => prev + 1);
    endTime.current = Date.now();
  };

  // Only show loading if we haven't redirected yet or are genuinely loading a standard lesson
  if (isLoading || !router.isReady || !exerciseType || (exerciseType !== "memoryGames" && !currentProblem)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <Stack spacing={3} direction="row" alignItems="center">
          <CircularProgress size="4rem" />
        </Stack>
        <h1 className="text-2xl font-bold">Cargando Lección...</h1>
      </div>
    );
  }

  // Conditional rendering for Memory Game (still a component within lesson.tsx)
  if (exerciseType === "memoryGames" && exerciseId) {
    return <MemoryGame gameId={exerciseId} />;
  }

  // The rest of the rendering is for standard "ejerciciosES"
  // Standard lesson completion check
  if (lessonProblemIndex >= totalCorrectAnswersNeeded && !correctAnswerShown) {
    const formatTime = (timeMs: number): string => {
      const seconds = Math.floor(timeMs / 1000) % 60;
      const minutes = Math.floor(timeMs / 1000 / 60) % 60;
      return [minutes, seconds]
        .map((x) => x.toString().padStart(2, "0"))
        .join(":");
    };

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-3xl font-bold text-yellow-500">¡Lección Completada!</h1>
        <div className="flex gap-4">
          <div className="rounded-xl bg-yellow-400 px-4 py-2 text-center text-white">
            <div>XP Total</div>
            <div className="text-xl">{correctAnswerCount}</div>
          </div>
          <div className="rounded-xl bg-blue-400 px-4 py-2 text-center text-white">
            <div>Tiempo</div>
            <div className="text-xl">
              {formatTime(endTime.current - startTime.current)}
            </div>
          </div>
          <div className="rounded-xl bg-green-400 px-4 py-2 text-center text-white">
            <div>Precisión</div>
            <div className="text-xl">
              {Math.round(
                (correctAnswerCount /
                  (correctAnswerCount + incorrectAnswerCount)) *
                100,
              )}
              %
            </div>
          </div>
        </div>
        <a
          href="/learn"
          className="rounded-2xl border-b-4 border-green-600 bg-green-500 px-4 py-2 text-white hover:brightness-105"
        >
          Continuar
        </a>
      </div>
    );
  }

  // Default rendering for standard "SELECT_1_OF_3" problems
  return (
    <div className="flex min-h-screen flex-col gap-5 px-4 py-5">
      <header className="flex items-center gap-4">
        <button
          className="text-gray-400"
          onClick={() => setQuitMessageShown(true)}
        >
          ✖
        </button>
        <div className="h-4 grow rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{
              width: `${(correctAnswerCount / totalCorrectAnswersNeeded) * 100}%`,
            }}
          ></div>
        </div>
        {hearts !== null &&
          [1, 2, 3].map((heart) => (
            <span key={heart}>{heart <= hearts ? "❤️" : "🖤"}</span>
          ))}
      </header>

      <main className="flex grow flex-col items-center justify-center gap-10">
        <h1 className="text-center text-2xl font-bold">
          {currentProblem.question}
        </h1>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {currentProblem.answers.map((answer: any, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedAnswer(i)}
              className={`rounded-xl border-2 border-b-4 p-4 ${i === selectedAnswer ? "border-blue-300 bg-blue-100 text-blue-400" : "border-gray-200 hover:bg-gray-100"}`}
            >
              {answer.name}
            </button>
          ))}
        </div>
      </main>

      <footer className="flex flex-col gap-2">
        <button
          className="rounded-2xl border-2 border-b-4 border-gray-200 p-3 text-gray-400 hover:border-gray-300 hover:bg-gray-100"
          onClick={() => setCorrectAnswerShown(true)}
        >
          Saltar
        </button>

        {selectedAnswer === null ? (
          <button
            disabled
            className="rounded-2xl bg-gray-200 p-3 text-gray-400"
          >
            Comprobar
          </button>
        ) : (
          <button
            onClick={onCheckAnswer}
            className="rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold text-white"
          >
            Comprobar
          </button>
        )}

        {correctAnswerShown && (
          <div
            className={`rounded-xl p-4 text-center font-bold ${isAnswerCorrect ? "bg-green-100 text-green-800" : "bg-rose-100 text-rose-600"}`}
          >
            {isAnswerCorrect
              ? "¡Buen trabajo!"
              : `Respuesta correcta: ${currentProblem.answers[currentProblem.correctAnswer].name}`}
            <button
              onClick={onFinish}
              className={`mt-3 w-full rounded-2xl border-b-4 p-3 text-white ${isAnswerCorrect ? "border-green-600 bg-green-500" : "border-rose-600 bg-rose-500"}`}
            >
              Continuar
            </button>
          </div>
        )}

        {quitMessageShown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-2xl bg-white p-6 text-center">
              <h2 className="mb-2 text-xl font-bold">
                ¿Estás seguro de que quieres salir?
              </h2>
              <p className="mb-4 text-gray-500">
                Todo el progreso de esta lección se perderá.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setQuitMessageShown(false)}
                  className="rounded-2xl border px-4 py-2 text-gray-400 hover:bg-gray-100"
                >
                  Permanecer
                </button>
                <a
                  href="/learn"
                  className="rounded-2xl border-b-4 border-blue-500 bg-blue-400 px-4 py-2 text-white"
                >
                  Salir
                </a>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default Lesson;