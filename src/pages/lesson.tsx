import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "~/context/AuthContext";
import { useBoundStore } from "~/hooks/useBoundStore";

const Lesson: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const unitNumber = Number(router.query.unit) || 1;
  const tileIndex = Number(router.query.tileIndex) || 0;

  const unitProgress = useBoundStore((x) => x.unitProgress[unitNumber] || 0);
  const setUnitProgress = useBoundStore((x) => x.setUnitProgress);

  const [lessonProblemIndex, setLessonProblemIndex] = useState(0);
  const [lessonProblems, setLessonProblems] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<null | number>(null);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [incorrectAnswerCount, setIncorrectAnswerCount] = useState(0);
  const [correctAnswerShown, setCorrectAnswerShown] = useState(false);
  const [quitMessageShown, setQuitMessageShown] = useState(false);

  const startTime = useRef(Date.now());
  const endTime = useRef(startTime.current + 1000 * 60 * 3 + 1000 * 33);

  const hearts =
    "fast-forward" in router.query &&
    !isNaN(Number(router.query["fast-forward"]))
      ? 3 - incorrectAnswerCount
      : null;

  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  // Obtenemos el progreso actual del usuario
  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);

  // Nuevo estado para saber si los datos están cargando
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);

  useEffect(() => {
    const fetchData = async () => {


      if (loading) return; // Espera a que el estado de autenticación esté listo

      if (loading) return;

      if (!user) return;

      try {
        const exerciseId = `ej${tileIndex + 1}`;
        const docRef = doc(db, "ejerciciosES", exerciseId);
        const docSnap = await getDoc(docRef);

      const collectionName = unitNumber === 3 ? "ejerciciosVoz" : "ejerciciosES";
      const docRef = doc(db, collectionName, "ej1");
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const {
          preguntas,
          respuestas_correctas,
          opciones1,
          opciones2,
          opciones3,
          opciones4,
          opciones5,
        } = data;
        const opcionesArrays = [
          opciones1,
          opciones2,
          opciones3,
          opciones4,
          opciones5,
        ];


        if (docSnap.exists()) {
          const data = docSnap.data();
          const {
            preguntas,
            respuestas_correctas,
            opciones1,
            opciones2,
            opciones3,
            opciones4,
            opciones5,
          } = data;
          const opcionesArrays = [
            opciones1,
            opciones2,
            opciones3,
            opciones4,
            opciones5,
          ];

          const loadedProblems = preguntas.map(
            (question: string, index: number) => {
              return {
                type: "SELECT_1_OF_3",
                question,
                answers: opcionesArrays[index].map((opt: string) => ({
                  name: opt,
                })),
                correctAnswer: opcionesArrays[index].indexOf(
                  respuestas_correctas[index],
                ),
              };
            },
          );
          setLessonProblems(loadedProblems);
        }
      } catch (error) {}
      setIsLoadingProblems(false); // Marcar como cargado (éxito o error)
    };
    setIsLoadingProblems(true); // Marcar como cargando antes de iniciar
    fetchData();


  }, [user, loading]);

  }, [user, loading, tileIndex]);

  // Mostrar loader mientras se cargan los problemas
  if (isLoadingProblems) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <Stack spacing={3} direction="row" alignItems="center">
          <CircularProgress size="4rem" />
        </Stack>
        <h1 className="text-2xl font-bold">Loading ...</h1>
      </div>
    );
  }


  }, [unitNumber]);


  const totalCorrectAnswersNeeded = lessonProblems.length;
  const currentProblem = lessonProblems[lessonProblemIndex];
  const isAnswerCorrect = selectedAnswer === currentProblem?.correctAnswer;

  const onCheckAnswer = () => {
    setCorrectAnswerShown(true);
    setButtonsDisabled(true);
    if (isAnswerCorrect) setCorrectAnswerCount((x) => x + 1);
    else setIncorrectAnswerCount((x) => x + 1);
  };

  const saveProgressToFirebase = async (updatedProgress: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        [`lessonsCompleted_unit${unitNumber}`]: updatedProgress,
      });
    } catch (error) {
      console.error("Error saving progress to Firebase:", error);
    }
  };

  const onFinish = async () => {
    setSelectedAnswer(null);
    setCorrectAnswerShown(false);
    setButtonsDisabled(false);

    if (lessonProblemIndex < lessonProblems.length - 1) {
      setLessonProblemIndex((prev) => prev + 1);
    } else {
      if (unitProgress === tileIndex) {
        const updatedProgress = unitProgress + 1;
        await saveProgressToFirebase(updatedProgress);
        setUnitProgress(unitNumber, updatedProgress);
      }
    }
  };

  if (lessonProblemIndex >= lessonProblems.length) {
    const formatTime = (timeMs: number): string => {
      const seconds = Math.floor(timeMs / 1000) % 60;
      const minutes = Math.floor(timeMs / 1000 / 60) % 60;
      return [minutes, seconds]
        .map((x) => x.toString().padStart(2, "0"))
        .join(":");
    };

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-3xl font-bold text-yellow-500">Lesson Complete!</h1>
        <div className="flex gap-4">
          <div className="rounded-xl bg-yellow-400 px-4 py-2 text-center text-white">
            <div>Total XP</div>
            <div className="text-xl">{correctAnswerCount}</div>
          </div>
          <div className="rounded-xl bg-blue-400 px-4 py-2 text-center text-white">
            <div>Time</div>
            <div className="text-xl">
              {formatTime(endTime.current - startTime.current)}
            </div>
          </div>
          <div className="rounded-xl bg-green-400 px-4 py-2 text-center text-white">
            <div>Accuracy</div>
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
          Continue
        </a>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <Stack spacing={3} direction="row" alignItems="center">
          <CircularProgress size="4rem" />
        </Stack>
        <h1 className="text-2xl font-bold">Loading ...</h1>
      </div>
    );
  }

  if (correctAnswerCount >= totalCorrectAnswersNeeded && !correctAnswerShown) {
    const formatTime = (timeMs: number): string => {
      const seconds = Math.floor(timeMs / 1000) % 60;
      const minutes = Math.floor(timeMs / 1000 / 60) % 60;
      return [minutes, seconds]
        .map((x) => x.toString().padStart(2, "0"))
        .join(":");
    };

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-3xl font-bold text-yellow-500">Lesson Complete!</h1>
        <div className="flex gap-4">
          <div className="rounded-xl bg-yellow-400 px-4 py-2 text-center text-white">
            <div>Total XP</div>
            <div className="text-xl">{correctAnswerCount}</div>
          </div>
          <div className="rounded-xl bg-blue-400 px-4 py-2 text-center text-white">
            <div>Time</div>
            <div className="text-xl">
              {formatTime(endTime.current - startTime.current)}
            </div>
          </div>
          <div className="rounded-xl bg-green-400 px-4 py-2 text-center text-white">
            <div>Accuracy</div>
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
          Continue
        </a>
      </div>
    );
  }

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
        {!buttonsDisabled && (
          <button
            className="rounded-2xl border-2 border-b-4 border-gray-200 p-3 text-gray-400 hover:border-gray-300 hover:bg-gray-100"
            onClick={() => setCorrectAnswerShown(true)}
          >
            Skip
          </button>
        )}

        {!buttonsDisabled && selectedAnswer === null ? (
          <button
            disabled
            className="rounded-2xl bg-gray-200 p-3 text-gray-400"
          >
            Check
          </button>
        ) : (
          !buttonsDisabled && (
            <button
              onClick={onCheckAnswer}
              className="rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold text-white"
            >
              Check
            </button>
          )
        )}

        {correctAnswerShown && (
          <div
            className={`rounded-xl p-4 text-center font-bold ${
              isAnswerCorrect
                ? "bg-green-100 text-green-800"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {isAnswerCorrect
              ? "Good job!"
              : `Correct answer: ${currentProblem.answers[currentProblem.correctAnswer].name}`}
            <button
              onClick={onFinish}
              className={`mt-3 w-full rounded-2xl border-b-4 p-3 text-white ${
                isAnswerCorrect
                  ? "border-green-600 bg-green-500"
                  : "border-rose-600 bg-rose-500"
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {quitMessageShown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-2xl bg-white p-6 text-center">
              <h2 className="mb-2 text-xl font-bold">
                Are you sure you want to quit?
              </h2>
              <p className="mb-4 text-gray-500">
                All progress for this lesson will be lost.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setQuitMessageShown(false)}
                  className="rounded-2xl border px-4 py-2 text-gray-400 hover:bg-gray-100"
                >
                  Stay
                </button>
                <a
                  href="/learn"
                  className="rounded-2xl border-b-4 border-blue-500 bg-blue-400 px-4 py-2 text-white"
                >
                  Quit
                </a>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );


export default Lesson;
