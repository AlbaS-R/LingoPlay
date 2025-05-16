import { useEffect, useState, useRef } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "~/context/AuthContext";
import { useBoundStore } from "~/hooks/useBoundStore";

type Pair = { id: number; front: string; back: string };
type Card = { id: number; value: string; matched: boolean; flipped: boolean };

export const MemoryGame = ({
  gameId = "ej1",
  tileIndex = 0,
}: {
  gameId?: string;
  tileIndex?: number;
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const { user } = useAuth();
  const unitNumber = 2;
  const unitProgress = useBoundStore((x) => x.unitProgress[unitNumber] || 0);
  const setUnitProgress = useBoundStore((x) => x.setUnitProgress);

  const currentEj = gameId || `ej${tileIndex + 1}`;
  const currentTileIndex = tileIndex;

  useEffect(() => {
    const fetchPairs = async () => {
      const docRef = doc(db, "memoryGames", currentEj);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const pairs: Pair[] = (data.pairs as string[]).map((str, idx) => {
          const [front = "", back = ""] = str.split("|");
          return { id: idx + 1, front, back };
        });
        const allCards: Card[] = pairs
          .flatMap((pair) => [
            { id: pair.id, value: pair.front, matched: false, flipped: false },
            { id: pair.id, value: pair.back, matched: false, flipped: false },
          ])
          .sort(() => Math.random() - 0.5);
        setCards(allCards);
        setCompleted(false);
        setElapsed(0);
        setShowStats(false);
        setMatchedCount(0);
        setFlippedIndices([]);
        startTimeRef.current = Date.now();
      }
    };
    fetchPairs();
  }, [currentEj]);

  useEffect(() => {
    if (completed) return;
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [completed]);

  useEffect(() => {
    if (cards.length && matchedCount === cards.length / 2) {
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => setShowStats(true), 600);
      if (user && unitProgress === currentTileIndex) {
        const saveProgress = async () => {
          try {
            const userRef = doc(db, "usuarios", user.uid);
            await updateDoc(userRef, {
              [`lessonsCompleted_unit${unitNumber}`]: unitProgress + 1,
            });
            setUnitProgress(unitNumber, unitProgress + 1);
          } catch (e) {}
        };
        saveProgress();
      }
    }
  }, [
    matchedCount,
    cards.length,
    completed,
    user,
    unitProgress,
    setUnitProgress,
    currentTileIndex,
  ]);

  const handleFlip = (idx: number) => {
    if (
      !cards[idx] ||
      cards[idx].flipped ||
      cards[idx].matched ||
      flippedIndices.length === 2
    )
      return;
    const newFlipped = [...flippedIndices, idx];
    const newCards = cards.map((card, i) =>
      i === idx ? { ...card, flipped: true } : card,
    );
    setCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;
      if (
        i1 !== undefined &&
        i2 !== undefined &&
        newCards[i1] &&
        newCards[i2] &&
        newCards[i1].id === newCards[i2].id &&
        i1 !== i2
      ) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === i1 || i === i2 ? { ...card, matched: true } : card,
            ),
          );
          setMatchedCount((c) => c + 1);
          setFlippedIndices([]);
        }, 800);
      } else if (i1 !== undefined && i2 !== undefined) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === i1 || i === i2 ? { ...card, flipped: false } : card,
            ),
          );
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  if (!cards.length) return <div>Loading...</div>;

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleRestart = () => {
    setShowStats(false);
    setCompleted(false);
    setElapsed(0);
    setMatchedCount(0);
    setFlippedIndices([]);
    setCards((prev) =>
      prev
        .map((card) => ({
          ...card,
          matched: false,
          flipped: false,
        }))
        .sort(() => Math.random() - 0.5),
    );
    startTimeRef.current = Date.now();
  };

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          className="text-2xl font-bold text-gray-400 hover:text-gray-600"
          aria-label="Salir"
          onClick={() => (window.location.href = "/learn")}
        >
          ✖
        </button>
      </div>
      <h2 className="mb-4 text-xl font-bold">Memory Game</h2>

      {!showStats && (
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <button
              key={idx}
              className={`flex h-20 w-28 items-center justify-center rounded border text-lg font-bold ${
                card.flipped || card.matched ? "bg-blue-200" : "bg-gray-200"
              }`}
              onClick={() => handleFlip(idx)}
              disabled={card.flipped || card.matched || completed}
            >
              {card.flipped || card.matched ? card.value : "?"}
            </button>
          ))}
        </div>
      )}

      {showStats && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="font-bold text-green-600">¡Completado!</div>
          <div className="text-lg font-bold text-blue-700">
            Tiempo total: {formatTime(elapsed)}
          </div>
          <div className="flex gap-4">
            <button
              className="rounded-2xl border-b-4 border-blue-500 bg-blue-400 px-6 py-3 font-bold text-white hover:brightness-105"
              onClick={handleRestart}
            >
              Repetir nivel
            </button>
            <button
              className="rounded-2xl border-b-4 border-green-600 bg-green-500 px-6 py-3 font-bold text-white hover:brightness-105"
              onClick={() => (window.location.href = "/learn")}
            >
              Volver a ejercicios
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
