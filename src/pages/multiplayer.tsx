import { type NextPage } from "next";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  ActiveBookSvg,
  LockedBookSvg,
  CheckmarkSvg,
  LockedDumbbellSvg,
  FastForwardSvg,
  GoldenBookSvg,
  GoldenDumbbellSvg,
  GoldenTreasureSvg,
  GoldenTrophySvg,
  GuidebookSvg,
  LessonCompletionSvg0,
  LessonCompletionSvg1,
  LessonCompletionSvg2,
  LessonCompletionSvg3,
  LockSvg,
  StarSvg,
  LockedTreasureSvg,
  LockedTrophySvg,
  UpArrowSvg,
  ActiveTreasureSvg,
  ActiveTrophySvg,
  ActiveDumbbellSvg,
  PracticeExerciseSvg,
} from "~/components/Svgs";
import { TopBar } from "~/components/TopBar";
import { BottomBar } from "~/components/BottomBar";
import { RightBar } from "~/components/RightBar";
import { LeftBar } from "~/components/LeftBar";
import { useRouter } from "next/router";
import { LoginScreen, useLoginScreen } from "~/components/LoginScreen";
import { useBoundStore } from "~/hooks/useBoundStore";
import type { Tile, TileType, Unit } from "~/utils/units";
import { units } from "~/utils/units";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { MemoryGame } from "../components/MemoryGame";

type TileStatus = "LOCKED" | "ACTIVE" | "COMPLETE";

const tileStatus = (tile: Tile, lessonsCompleted: number): TileStatus => {
  const lessonsPerTile = 4;
  const tilesCompleted = Math.floor(lessonsCompleted / lessonsPerTile);
  const tiles = units.flatMap((unit) => unit.tiles);
  const tileIndex = tiles.findIndex((t) => t === tile);

  if (tileIndex < tilesCompleted) {
    return "COMPLETE";
  }
  if (tileIndex > tilesCompleted) {
    return "LOCKED";
  }
  return "ACTIVE";
};

const TileIcon = ({
  tileType,
  status,
}: {
  tileType: TileType;
  status: TileStatus;
}): JSX.Element => {
  switch (tileType) {
    case "star":
      return status === "COMPLETE" ? (
        <CheckmarkSvg />
      ) : status === "ACTIVE" ? (
        <StarSvg />
      ) : (
        <LockSvg />
      );
    case "book":
      return status === "COMPLETE" ? (
        <GoldenBookSvg />
      ) : status === "ACTIVE" ? (
        <ActiveBookSvg />
      ) : (
        <LockedBookSvg />
      );
    case "dumbbell":
      return status === "COMPLETE" ? (
        <GoldenDumbbellSvg />
      ) : status === "ACTIVE" ? (
        <ActiveDumbbellSvg />
      ) : (
        <LockedDumbbellSvg />
      );
    case "fast-forward":
      return status === "COMPLETE" ? (
        <CheckmarkSvg />
      ) : status === "ACTIVE" ? (
        <StarSvg />
      ) : (
        <FastForwardSvg />
      );
    case "treasure":
      return status === "COMPLETE" ? (
        <GoldenTreasureSvg />
      ) : status === "ACTIVE" ? (
        <ActiveTreasureSvg />
      ) : (
        <LockedTreasureSvg />
      );
    case "trophy":
      return status === "COMPLETE" ? (
        <GoldenTrophySvg />
      ) : status === "ACTIVE" ? (
        <ActiveTrophySvg />
      ) : (
        <LockedTrophySvg />
      );
    default:
      // fallback to a simple empty span if tileType is not recognized
      return <span />;
  }
};

const tileLeftClassNames = [
  "left-0",
  "left-[-45px]",
  "left-[-70px]",
  "left-[-45px]",
  "left-0",
  "left-[45px]",
  "left-[70px]",
  "left-[45px]",
] as const;

type TileLeftClassName = (typeof tileLeftClassNames)[number];

const getTileLeftClassName = ({
  index,
  unitNumber,
  tilesLength,
}: {
  index: number;
  unitNumber: number;
  tilesLength: number;
}): TileLeftClassName => {
  if (index >= tilesLength - 1) {
    return "left-0";
  }

  const classNames =
    unitNumber % 2 === 1
      ? tileLeftClassNames
      : [...tileLeftClassNames.slice(4), ...tileLeftClassNames.slice(0, 4)];

  return classNames[index % classNames.length] ?? "left-0";
};

const tileTooltipLeftOffsets = [140, 95, 70, 95, 140, 185, 210, 185] as const;

type TileTooltipLeftOffset = (typeof tileTooltipLeftOffsets)[number];

const getTileTooltipLeftOffset = ({
  index,
  unitNumber,
  tilesLength,
}: {
  index: number;
  unitNumber: number;
  tilesLength: number;
}): TileTooltipLeftOffset => {
  if (index >= tilesLength - 1) {
    return tileTooltipLeftOffsets[0];
  }

  const offsets =
    unitNumber % 2 === 1
      ? tileTooltipLeftOffsets
      : [
          ...tileTooltipLeftOffsets.slice(4),
          ...tileTooltipLeftOffsets.slice(0, 4),
        ];

  return offsets[index % offsets.length] ?? tileTooltipLeftOffsets[0];
};

const getTileColors = ({
  tileType,
  status,
  defaultColors,
}: {
  tileType: TileType;
  status: TileStatus;
  defaultColors: `border-${string} bg-${string}`;
}): `border-${string} bg-${string}` => {
  switch (status) {
    case "LOCKED":
      if (tileType === "fast-forward") return defaultColors;
      return "border-[#b7b7b7] bg-[#e5e5e5]";
    case "COMPLETE":
      return "border-yellow-500 bg-yellow-400";
    case "ACTIVE":
      return defaultColors;
  }
};

const TileTooltip = ({
  selectedTile,
  index,
  unitNumber,
  tilesLength,
  description,
  status,
  closeTooltip,
}: {
  selectedTile: number | null;
  index: number;
  unitNumber: number;
  tilesLength: number;
  description: string;
  status: TileStatus;
  closeTooltip: () => void;
}) => {
  const tileTooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const containsTileTooltip = (event: MouseEvent) => {
      if (selectedTile !== index) return;
      const clickIsInsideTooltip = tileTooltipRef.current?.contains(
        event.target as Node,
      );
      if (clickIsInsideTooltip) return;
      closeTooltip();
    };

    window.addEventListener("click", containsTileTooltip, true);
    return () => window.removeEventListener("click", containsTileTooltip, true);
  }, [selectedTile, tileTooltipRef, closeTooltip, index]);

  const unit = units.find((unit) => unit.unitNumber === unitNumber);
  const activeBackgroundColor = unit?.backgroundColor ?? "bg-green-500";
  const activeTextColor = unit?.textColor ?? "text-green-500";

  return (
    <div
      className={[
        "relative h-0 w-full",
        index === selectedTile ? "" : "invisible",
      ].join(" ")}
      ref={tileTooltipRef}
    >
      <div
        className={[
          "absolute z-30 flex w-[300px] flex-col gap-4 rounded-xl p-4 font-bold transition-all duration-300",
          status === "ACTIVE"
            ? activeBackgroundColor
            : status === "LOCKED"
              ? "border-2 border-gray-200 bg-gray-100"
              : "bg-yellow-400",
          index === selectedTile ? "top-4 scale-100" : "-top-14 scale-0",
        ].join(" ")}
        style={{ left: "calc(50% - 150px)" }}
      >
        <div
          className={[
            "absolute left-[140px] top-[-8px] h-4 w-4 rotate-45",
            status === "ACTIVE"
              ? activeBackgroundColor
              : status === "LOCKED"
                ? "border-l-2 border-t-2 border-gray-200 bg-gray-100"
                : "bg-yellow-400",
          ].join(" ")}
          style={{
            left: getTileTooltipLeftOffset({ index, unitNumber, tilesLength }),
          }}
        ></div>
        <div
          className={[
            "text-lg",
            status === "ACTIVE"
              ? "text-white"
              : status === "LOCKED"
                ? "text-gray-400"
                : "text-yellow-600",
          ].join(" ")}
        >
          {description}
        </div>
        {status === "ACTIVE" ? (
          <Link
            href="/lesson"
            className={[
              "flex w-full items-center justify-center rounded-xl border-b-4 border-gray-200 bg-white p-3 uppercase",
              activeTextColor,
            ].join(" ")}
          >
            Start +10 XP
          </Link>
        ) : status === "LOCKED" ? (
          <button
            className="w-full rounded-xl bg-gray-200 p-3 uppercase text-gray-400"
            disabled
          >
            Locked
          </button>
        ) : (
          <Link
            href="/lesson"
            className="flex w-full items-center justify-center rounded-xl border-b-4 border-yellow-200 bg-white p-3 uppercase text-yellow-400"
          >
            Practice +5 XP
          </Link>
        )}
      </div>
    </div>
  );
};

const UnitSection = ({ unit }: { unit: Unit }): JSX.Element => {
  const router = useRouter();

  const [selectedTile, setSelectedTile] = useState<null | number>(null);

  useEffect(() => {
    const unselectTile = () => setSelectedTile(null);
    window.addEventListener("scroll", unselectTile);
    return () => window.removeEventListener("scroll", unselectTile);
  }, []);

  const closeTooltip = useCallback(() => setSelectedTile(null), []);

  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);
  const increaseLessonsCompleted = useBoundStore(
    (x) => x.increaseLessonsCompleted,
  );
  const increaseLingots = useBoundStore((x) => x.increaseLingots);

  return (
    <>
      <UnitHeader
        unitName={unit.unitName}
        unitNumber={unit.unitNumber}
        description={unit.description}
        backgroundColor={unit.backgroundColor}
        borderColor={unit.borderColor}
      />
      <div className="relative mb-8 mt-[67px] flex max-w-2xl flex-col items-center gap-4">
        {unit.tiles.map((tile, i): JSX.Element => {
          const status = tileStatus(tile, lessonsCompleted);
          return (
            <Fragment key={i}>
              {(() => {
                switch (tile.type) {
                  case "star":
                  case "book":
                  case "dumbbell":
                  case "trophy":
                  case "fast-forward":
                    if (tile.type === "trophy" && status === "COMPLETE") {
                      return (
                        <div className="relative">
                          <TileIcon tileType={tile.type} status={status} />
                          <div className="absolute left-0 right-0 top-6 flex justify-center text-lg font-bold text-yellow-700">
                            {unit.unitNumber}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        className={[
                          "relative -mb-4 h-[93px] w-[98px]",
                          getTileLeftClassName({
                            index: i,
                            unitNumber: unit.unitNumber,
                            tilesLength: unit.tiles.length,
                          }),
                        ].join(" ")}
                      >
                        {tile.type === "fast-forward" && status === "LOCKED" ? (
                          <HoverLabel
                            text="Jump here?"
                            textColor={unit.textColor}
                          />
                        ) : selectedTile !== i && status === "ACTIVE" ? (
                          <HoverLabel text="Start" textColor={unit.textColor} />
                        ) : null}
                        <LessonCompletionSvg
                          lessonsCompleted={lessonsCompleted}
                          status={status}
                        />
                        <button
                          className={[
                            "absolute m-3 rounded-full border-b-8 p-4",
                            getTileColors({
                              tileType: tile.type,
                              status,
                              defaultColors: `${unit.borderColor} ${unit.backgroundColor}`,
                            }),
                          ].join(" ")}
                          onClick={() => {
                            if (
                              tile.type === "fast-forward" &&
                              status === "LOCKED"
                            ) {
                              void router.push(
                                `/lesson?fast-forward=${unit.unitNumber}`,
                              );
                              return;
                            }
                            setSelectedTile(i);
                          }}
                        >
                          <TileIcon tileType={tile.type} status={status} />
                          <span className="sr-only">Show lesson</span>
                        </button>
                      </div>
                    );
                  case "treasure":
                    return (
                      <div
                        className={[
                          "relative -mb-4",
                          getTileLeftClassName({
                            index: i,
                            unitNumber: unit.unitNumber,
                            tilesLength: unit.tiles.length,
                          }),
                        ].join(" ")}
                        onClick={() => {
                          if (status === "ACTIVE") {
                            increaseLessonsCompleted(4);
                            increaseLingots(1);
                          }
                        }}
                        role="button"
                        tabIndex={status === "ACTIVE" ? 0 : undefined}
                        aria-hidden={status !== "ACTIVE"}
                        aria-label={status === "ACTIVE" ? "Collect reward" : ""}
                      >
                        {status === "ACTIVE" && (
                          <HoverLabel text="Open" textColor="text-yellow-400" />
                        )}
                        <TileIcon tileType={tile.type} status={status} />
                      </div>
                    );
                }
              })()}
              <TileTooltip
                selectedTile={selectedTile}
                index={i}
                unitNumber={unit.unitNumber}
                tilesLength={unit.tiles.length}
                description={
                  (() => {
                    switch (tile.type) {
                      case "book":
                      case "dumbbell":
                      case "star":
                        return tile.description ?? "";
                      case "fast-forward":
                        return status === "LOCKED"
                          ? "Jump here?"
                          : (tile.description ?? "");
                      case "trophy":
                        return `Unit ${unit.unitNumber} review`;
                      case "treasure":
                        return "";
                      default:
                        return "";
                    }
                  })() as string
                }
                status={status}
                closeTooltip={closeTooltip}
              />
            </Fragment>
          );
        })}
      </div>
    </>
  );
};

const getTopBarColors = (
  scrollY: number,
): {
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
} => {
  const defaultColors = {
    backgroundColor: "bg-[#58cc02]",
    borderColor: "border-[#46a302]",
  } as const;

  if (scrollY < 680) {
    return defaultColors;
  } else if (scrollY < 1830) {
    return units[1] ?? defaultColors;
  } else {
    return units[2] ?? defaultColors;
  }
};

const Learn: NextPage = () => {
  const { loginScreenState, setLoginScreenState } = useLoginScreen();

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const updateScrollY = () => setScrollY(globalThis.scrollY ?? scrollY);
    updateScrollY();
    document.addEventListener("scroll", updateScrollY);
    return () => document.removeEventListener("scroll", updateScrollY);
  }, [scrollY]);

  const topBarColors = getTopBarColors(scrollY);

  return (
    <>
      <TopBar
        backgroundColor={topBarColors.backgroundColor}
        borderColor={topBarColors.borderColor}
      />
      <LeftBar selectedTab="Profile" />

      <div className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12">
        <div className="flex max-w-2xl grow flex-col">
          {units.map((unit) => (
            <UnitSection unit={unit} key={unit.unitNumber} />
          ))}
          <div className="sticky bottom-28 left-0 right-0 flex items-end justify-between">
            {scrollY > 100 && (
              <button
                className="absolute right-4 flex h-14 w-14 items-center justify-center self-end rounded-2xl border-2 border-b-4 border-gray-200 bg-white transition hover:bg-gray-50 hover:brightness-90 md:right-0"
                onClick={() => scrollTo(0, 0)}
              >
                <span className="sr-only">Jump to top</span>
                <UpArrowSvg />
              </button>
            )}
          </div>
        </div>
        <RightBar />
      </div>

      <div className="pt-[90px]"></div>

      <BottomBar selectedTab="Profile" />
      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />
    </>
  );
};

const LessonCompletionSvg = ({
  lessonsCompleted,
  status,
  style = {},
}: {
  lessonsCompleted: number;
  status: TileStatus;
  style?: React.HTMLAttributes<SVGElement>["style"];
}) => {
  if (status !== "ACTIVE") {
    return null;
  }
  switch (lessonsCompleted % 4) {
    case 0:
      return <LessonCompletionSvg0 style={style} />;
    case 1:
      return <LessonCompletionSvg1 style={style} />;
    case 2:
      return <LessonCompletionSvg2 style={style} />;
    case 3:
      return <LessonCompletionSvg3 style={style} />;
    default:
      return null;
  }
};

const HoverLabel = ({
  text,
  textColor,
}: {
  text: string;
  textColor: `text-${string}`;
}) => {
  const hoverElement = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(72);

  useEffect(() => {
    setWidth(hoverElement.current?.clientWidth ?? width);
  }, [hoverElement.current?.clientWidth, width]);

  return (
    <div
      className={`absolute z-10 w-max animate-bounce rounded-lg border-2 border-gray-200 bg-white px-3 py-2 font-bold uppercase ${textColor}`}
      style={{
        top: "-25%",
        left: `calc(50% - ${width / 2}px)`,
      }}
      ref={hoverElement}
    >
      {text}
      <div
        className="absolute h-3 w-3 rotate-45 border-b-2 border-r-2 border-gray-200 bg-white"
        style={{ left: "calc(50% - 8px)", bottom: "-8px" }}
      ></div>
    </div>
  );
};

const UnitHeader = ({
  unitName,
  unitNumber,
  description,
  backgroundColor,
  borderColor,
}: {
  unitName: String;
  unitNumber: number;
  description: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
}) => {
  const language = useBoundStore((x) => x.language);
  return (
    <article
      className={["max-w-2xl text-white sm:rounded-xl", backgroundColor].join(
        " ",
      )}
    >
      <header className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{unitName}</h2>
          <p className="text-lg">{description}</p>
        </div>
        <Link
          href={`https://duolingo.com/guidebook/${language.code}/${unitNumber}`}
          className={[
            "flex items-center gap-3 rounded-2xl border-2 border-b-4 p-3 transition hover:text-gray-100",
            borderColor,
          ].join(" ")}
        >
          <GuidebookSvg />
          <span className="sr-only font-bold uppercase lg:not-sr-only">
            Guidebook
          </span>
        </Link>
      </header>
    </article>
  );
};

type Problem = {
  question: string;
  answers: { name: string }[];
  correctAnswer: number;
};

type PlayerStats = {
  correct: number;
  time: number;
  memoryPairs: number;
  memoryTime: number;
};

const NUM_ROUNDS_LESSON = 5;
const NUM_ROUNDS_MEMORY = 1;
const NUM_PLAYERS = 2;

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

const Multiplayer: NextPage = () => {
  // --- Nuevo: modo de juego ---
  const [mode, setMode] = useState<"lesson" | "memory">("lesson");
  const [modeSelected, setModeSelected] = useState(false);

  // --- Para modo lecciones ---
  const [problemsP1, setProblemsP1] = useState<Problem[]>([]);
  const [problemsP2, setProblemsP2] = useState<Problem[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>(
    Array(NUM_PLAYERS)
      .fill(0)
      .map(() => ({ correct: 0, time: 0, memoryPairs: 0, memoryTime: 0 })),
  );
  const [gameOver, setGameOver] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // --- Para modo memory game ---
  const [memoryGameId, setMemoryGameId] = useState<string>(""); // Solo un juego
  const [memoryPlayer, setMemoryPlayer] = useState(0);
  const [memoryStats, setMemoryStats] = useState<PlayerStats[]>(
    Array(NUM_PLAYERS)
      .fill(0)
      .map(() => ({ correct: 0, time: 0, memoryPairs: 0, memoryTime: 0 })),
  );
  const [memoryGameOver, setMemoryGameOver] = useState(false);
  const [memoryGameKey, setMemoryGameKey] = useState(0); // Para forzar rerender

  // --- Lecciones: cargar ejercicios distintos para cada jugador ---
  useEffect(() => {
    if (!modeSelected || mode !== "lesson") return;
    const fetchProblems = async () => {
      const indicesP1 = Array(NUM_ROUNDS_LESSON)
        .fill(0)
        .map(() => getRandomInt(5));
      const indicesP2 = Array(NUM_ROUNDS_LESSON)
        .fill(0)
        .map(() => getRandomInt(5));
      const loadedP1: Problem[] = [];
      const loadedP2: Problem[] = [];
      for (let i = 0; i < NUM_ROUNDS_LESSON; i++) {
        // Player 1
        {
          const idx = indicesP1[i];
          if (typeof idx === "undefined") continue;
          const exerciseId = `ej${idx + 1}`;
          const docRef = doc(db, "ejerciciosES", exerciseId);
          const docSnap = await getDoc(docRef);
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
            const qIdx = getRandomInt(preguntas.length);
            loadedP1.push({
              question: preguntas[qIdx],
              answers: (
                [opciones1, opciones2, opciones3, opciones4, opciones5][
                  qIdx
                ] as string[]
              ).map((opt) => ({ name: opt })),
              correctAnswer: (
                [opciones1, opciones2, opciones3, opciones4, opciones5][
                  qIdx
                ] as string[]
              ).indexOf(respuestas_correctas[qIdx]),
            });
          }
        }
        // Player 2
        {
          const idx = indicesP2[i];
          if (typeof idx === "undefined") continue;
          const exerciseId = `ej${idx + 1}`;
          const docRef = doc(db, "ejerciciosES", exerciseId);
          const docSnap = await getDoc(docRef);
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
            const qIdx = getRandomInt(preguntas.length);
            loadedP2.push({
              question: preguntas[qIdx],
              answers: (
                [opciones1, opciones2, opciones3, opciones4, opciones5][
                  qIdx
                ] as string[]
              ).map((opt) => ({ name: opt })),
              correctAnswer: (
                [opciones1, opciones2, opciones3, opciones4, opciones5][
                  qIdx
                ] as string[]
              ).indexOf(respuestas_correctas[qIdx]),
            });
          }
        }
      }
      setProblemsP1(loadedP1);
      setProblemsP2(loadedP2);
    };
    fetchProblems();
  }, [modeSelected, mode]);

  // --- Memory game: elegir un solo juego aleatorio ---
  useEffect(() => {
    if (!modeSelected || mode !== "memory") return;
    const id = `ej${getRandomInt(5) + 1}`;
    setMemoryGameId(id);
    setMemoryPlayer(0);
    setMemoryStats(
      Array(NUM_PLAYERS)
        .fill(0)
        .map(() => ({ correct: 0, time: 0, memoryPairs: 0, memoryTime: 0 })),
    );
    setMemoryGameOver(false);
    setMemoryGameKey((k) => k + 1);
    setWaiting(false);
  }, [modeSelected, mode]);

  // --- Lecciones: control de tiempo por jugador ---
  const roundStartTime = useRef(Date.now());

  useEffect(() => {
    if (!modeSelected || mode !== "lesson") return;
    if (currentRound < NUM_ROUNDS_LESSON) {
      roundStartTime.current = Date.now();
    }
  }, [currentRound, currentPlayer, mode, modeSelected]);

  // --- Lecciones: lógica de respuesta ---
  const currentProblem =
    currentPlayer === 0 ? problemsP1[currentRound] : problemsP2[currentRound];

  const handleAnswer = (idx: number) => {
    setSelectedAnswer(idx);
    setShowResult(true);
    if (!currentProblem) return;
    const isCorrect = idx === currentProblem.correctAnswer;
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);

      setPlayerStats((prev) => {
        const stats = [...prev];
        if (stats[currentPlayer]) {
          if (isCorrect) stats[currentPlayer].correct += 1;
          stats[currentPlayer].time += Date.now() - roundStartTime.current;
        }
        return stats;
      });

      // Espera 1 segundo antes de cambiar de turno
      setWaiting(true);
      setTimeout(() => {
        setWaiting(false);
        if (currentPlayer < NUM_PLAYERS - 1) {
          setCurrentPlayer((p) => p + 1);
        } else {
          if (currentRound < NUM_ROUNDS_LESSON - 1) {
            setCurrentRound((r) => r + 1);
            setCurrentPlayer(0);
          } else {
            setGameOver(true);
          }
        }
      }, 1000);
    }, 1200);
  };

  // --- Memory game: lógica de turnos y puntuación ---
  // --- Componente Multiplayer modificado ---
  // Busca la función handleMemoryGameFinish y reemplázala con esta versión:

  const handleMemoryGameFinish = (
    pairs: number,
    time: number,
    playerPairs: number[],
  ) => {
    setMemoryStats((prev) => {
      const stats = [...prev];
      // Guardamos las estadísticas del jugador actual
      const prevStats = stats[memoryPlayer] || {
        correct: 0,
        time: 0,
        memoryPairs: 0,
        memoryTime: 0,
      };
      stats[memoryPlayer] = {
        correct: prevStats.correct ?? 0,
        time: prevStats.time ?? 0,
        memoryPairs: pairs,
        memoryTime: time,
      };

      // También guardamos las estadísticas del otro jugador
      // basadas en los datos del juego actual
      const otherPlayer = memoryPlayer === 0 ? 1 : 0;
      const otherPlayerPairs = playerPairs ? playerPairs[otherPlayer] || 0 : 0;
      stats[otherPlayer] = {
        correct: stats[otherPlayer]?.correct ?? 0,
        time: stats[otherPlayer]?.time ?? 0,
        memoryPairs: otherPlayerPairs,
        memoryTime: time, // Mismo tiempo para ambos jugadores
      };

      return stats;
    });

    // Terminamos el juego inmediatamente sin pasar al siguiente jugador
    setMemoryGameOver(true);
  };

  // --- Pantalla de selección de modo ---
  if (!modeSelected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-3xl font-bold text-blue-700">Multiplayer Mode</h1>
        <div className="flex gap-8">
          <button
            className="rounded-2xl border-b-4 border-green-600 bg-green-500 px-8 py-4 text-xl font-bold text-white hover:brightness-105"
            onClick={() => {
              setMode("lesson");
              setModeSelected(true);
            }}
          >
            Lesson Mode
          </button>
          <button
            className="rounded-2xl border-b-4 border-blue-600 bg-blue-500 px-8 py-4 text-xl font-bold text-white hover:brightness-105"
            onClick={() => {
              setMode("memory");
              setModeSelected(true);
            }}
          >
            Memory Game Mode
          </button>
        </div>
      </div>
    );
  }

  // --- Modo lecciones ---
  if (mode === "lesson") {
    if (problemsP1.length === 0 || problemsP2.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-xl font-bold">Loading multiplayer game...</div>
        </div>
      );
    }

    if (gameOver) {
      const winner =
        (playerStats[0]?.correct ?? 0) > (playerStats[1]?.correct ?? 0)
          ? 0
          : (playerStats[1]?.correct ?? 0) > (playerStats[0]?.correct ?? 0)
            ? 1
            : (playerStats[0]?.time ?? 0) < (playerStats[1]?.time ?? 0)
              ? 0
              : (playerStats[1]?.time ?? 0) < (playerStats[0]?.time ?? 0)
                ? 1
                : -1;

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
          <h1 className="text-3xl font-bold text-blue-600">Game Over!</h1>
          <div className="flex gap-8">
            {[0, 1].map((p) => (
              <div
                key={p}
                className={`rounded-xl border-2 px-8 py-4 text-center font-bold ${
                  winner === p
                    ? p === 0
                      ? "border-blue-600 bg-blue-100 text-blue-700"
                      : "border-orange-500 bg-orange-100 text-orange-700"
                    : "border-gray-300 bg-gray-100 text-gray-500"
                }`}
              >
                <div className="text-lg">Player {p + 1}</div>
                <div>Correct: {playerStats[p]?.correct}</div>
                <div>
                  Time: {Math.floor((playerStats[p]?.time ?? 0) / 1000)}s
                </div>
                {winner === p && (
                  <div className="mt-2 text-2xl">🏆 Winner!</div>
                )}
              </div>
            ))}
          </div>
          {winner === -1 && (
            <div className="text-xl font-bold text-yellow-600">Empate</div>
          )}
          <button
            className="mt-6 rounded-2xl border-b-4 border-blue-500 bg-blue-400 px-6 py-3 font-bold text-white hover:brightness-105"
            onClick={() => {
              setModeSelected(false);
              setGameOver(false);
              setCurrentRound(0);
              setCurrentPlayer(0);
              setPlayerStats(
                Array(NUM_PLAYERS)
                  .fill(0)
                  .map(() => ({
                    correct: 0,
                    time: 0,
                    memoryPairs: 0,
                    memoryTime: 0,
                  })),
              );
            }}
          >
            Play Again
          </button>
        </div>
      );
    }

    if (!currentProblem) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-xl font-bold">Loading...</div>
        </div>
      );
    }

    return (
      <div>
        {/* TopBar y LeftBar: la casa debe ir a /learn */}
        <TopBar />
        <LeftBar selectedTab="Profile" />
        <BottomBar selectedTab={undefined} />
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="mb-4 text-2xl font-bold text-blue-700">
            Multiplayer Mode - Lesson
          </h1>
          <div className="mb-2 text-lg font-bold">
            Round {currentRound + 1} / {NUM_ROUNDS_LESSON}
          </div>
          <div className="mb-2 text-lg font-bold">
            <span
              className={
                currentPlayer === 0 ? "text-blue-700" : "text-orange-600"
              }
            >
              Player {currentPlayer + 1}
            </span>
            's turn
          </div>
          {waiting ? (
            <div className="mb-6 text-xl text-gray-400">Get ready...</div>
          ) : (
            <>
              <div className="mb-6 text-xl">{currentProblem.question}</div>
              <div className="mb-6 grid grid-cols-2 gap-4">
                {currentProblem.answers.map((answer, idx) => (
                  <button
                    key={idx}
                    className={`rounded-xl border-2 border-b-4 px-6 py-3 text-lg font-bold ${
                      selectedAnswer === idx
                        ? idx === currentProblem.correctAnswer
                          ? "border-green-500 bg-green-100 text-green-700"
                          : "border-red-500 bg-red-100 text-red-700"
                        : "border-gray-200 bg-white hover:bg-gray-100"
                    }`}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleAnswer(idx)}
                  >
                    {answer.name}
                  </button>
                ))}
              </div>
              {showResult && (
                <div
                  className={`mb-4 text-xl font-bold ${
                    selectedAnswer === currentProblem.correctAnswer
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedAnswer === currentProblem.correctAnswer
                    ? "Correct!"
                    : `Incorrect!`}
                </div>
              )}
            </>
          )}
          <div className="mt-8 flex gap-8">
            {[0, 1].map((p) => (
              <div
                key={p}
                className={`rounded-xl border-2 px-6 py-2 text-center font-bold ${
                  p === 0
                    ? "border-blue-500 bg-blue-100 text-blue-700"
                    : "border-orange-500 bg-orange-100 text-orange-700"
                }`}
              >
                <div>Player {p + 1}</div>
                <div>Correct: {playerStats[p]?.correct}</div>
                <div>
                  Time: {Math.floor((playerStats[p]?.time ?? 0) / 1000)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Modo memory game ---
  if (mode === "memory") {
    if (memoryGameOver) {
      const winner =
        (memoryStats[0]?.memoryPairs ?? 0) > (memoryStats[1]?.memoryPairs ?? 0)
          ? 0
          : (memoryStats[1]?.memoryPairs ?? 0) >
              (memoryStats[0]?.memoryPairs ?? 0)
            ? 1
            : (memoryStats[0]?.memoryTime ?? 0) <
                (memoryStats[1]?.memoryTime ?? 0)
              ? 0
              : (memoryStats[1]?.memoryTime ?? 0) <
                  (memoryStats[0]?.memoryTime ?? 0)
                ? 1
                : -1;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
          <h1 className="text-3xl font-bold text-blue-600">Game Over!</h1>
          <div className="flex gap-8">
            {[0, 1].map((p) => (
              <div
                key={p}
                className={`rounded-xl border-2 px-8 py-4 text-center font-bold ${
                  winner === p
                    ? p === 0
                      ? "border-blue-600 bg-blue-100 text-blue-700"
                      : "border-orange-500 bg-orange-100 text-orange-700"
                    : "border-gray-300 bg-gray-100 text-gray-500"
                }`}
              >
                <div className="text-lg">Player {p + 1}</div>
                <div>Pairs: {memoryStats[p]?.memoryPairs}</div>
                <div>
                  Time: {Math.floor((memoryStats[p]?.memoryTime ?? 0) / 1000)}s
                </div>
                {winner === p && (
                  <div className="mt-2 text-2xl">🏆 Winner!</div>
                )}
              </div>
            ))}
          </div>
          {winner === -1 && (
            <div className="text-xl font-bold text-yellow-600">Empate</div>
          )}
          <button
            className="mt-6 rounded-2xl border-b-4 border-blue-500 bg-blue-400 px-6 py-3 font-bold text-white hover:brightness-105"
            onClick={() => {
              setModeSelected(false);
            }}
          >
            Play Again
          </button>
        </div>
      );
    }

    return (
      <div>
        <TopBar />
        <LeftBar selectedTab="Profile" />
        <BottomBar selectedTab={undefined} />
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="mb-4 text-2xl font-bold text-blue-700">
            Multiplayer Mode - Memory Game
          </h1>
          <div className="mb-2 text-lg font-bold">
            {waiting
              ? `Get ready for Player ${memoryPlayer + 1}...`
              : `Player ${memoryPlayer + 1}'s turn`}
          </div>
          {waiting ? (
            <div className="mb-6 text-xl text-gray-400">Get ready...</div>
          ) : (
            <MemoryGameMultiplayer
              key={memoryGameKey}
              gameId={memoryGameId}
              onFinish={(pairs, time, playerPairs) =>
                handleMemoryGameFinish(pairs, time, playerPairs)
              }
            />
          )}
          <div className="mt-8 flex gap-8">
            {[0, 1].map((p) => (
              <div
                key={p}
                className={`rounded-xl border-2 px-6 py-2 text-center font-bold ${
                  p === 0
                    ? "border-blue-500 bg-blue-100 text-blue-700"
                    : "border-orange-500 bg-orange-100 text-orange-700"
                }`}
              >
                <div>Player {p + 1}</div>
                <div>Pairs: {memoryStats[p]?.memoryPairs}</div>
                <div>
                  Time: {Math.floor((memoryStats[p]?.memoryTime ?? 0) / 1000)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- Componente MemoryGame para multiplayer ---
const MemoryGameMultiplayer = ({
  gameId,
  onFinish,
}: {
  gameId: string;
  onFinish: (pairs: number, time: number, playerPairs: number[]) => void;
}) => {
  // Usa la misma lógica que el componente MemoryGame
  const [cards, setCards] = useState<
    {
      id: number;
      value: string;
      matched: boolean;
      flipped: boolean;
      matchedBy?: number;
    }[]
  >([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0); // 0 o 1
  const [playerPairs, setPlayerPairs] = useState([0, 0]);
  const [playerTurns, setPlayerTurns] = useState([0, 0]);
  const [lastAttemptCorrect, setLastAttemptCorrect] = useState<boolean | null>(
    null,
  );
  const [timerStarted, setTimerStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Inicia el temporizador solo cuando el primer movimiento ocurre
  useEffect(() => {
    if (timerStarted && startTime === null) {
      setStartTime(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerStarted]);

  useEffect(() => {
    if (!timerStarted || startTime === null || completed) return;
    // Usa setTimeout recursivo para evitar acumulación de intervalos y asegurar precisión
    let timeout: NodeJS.Timeout;
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      if (!completed) {
        timeout = setTimeout(tick, 1000);
      }
    };
    tick();
    return () => clearTimeout(timeout);
  }, [timerStarted, startTime, completed]);

  useEffect(() => {
    const fetchPairs = async () => {
      const docRef = doc(db, "memoryGames", gameId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // data.pairs: string[] con formato "dog|perro"
        const pairs: { id: number; front: string; back: string }[] = (
          data.pairs as string[]
        ).map((str, idx) => {
          const [front = "", back = ""] = str.split("|");
          return { id: idx + 1, front, back };
        });
        const allCards = pairs
          .flatMap((pair) => [
            {
              id: pair.id,
              value: pair.front,
              matched: false,
              flipped: false,
              matchedBy: undefined,
            },
            {
              id: pair.id,
              value: pair.back,
              matched: false,
              flipped: false,
              matchedBy: undefined,
            },
          ])
          .sort(() => Math.random() - 0.5);
        setCards(allCards);
        setMatchedCount(0);
        setFlippedIndices([]);
        setCompleted(false);
        setCurrentPlayer(0);
        setPlayerPairs([0, 0]);
        setPlayerTurns([0, 0]);
        setLastAttemptCorrect(null);
      }
    };
    if (gameId) {
      fetchPairs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  useEffect(() => {
    if (cards.length && matchedCount === cards.length / 2) {
      setCompleted(true);

      const player1Pairs = playerPairs[0] || 0;
      const player2Pairs = playerPairs[1] || 0;

      setTimeout(() => {
        onFinish(player1Pairs, elapsed, playerPairs);
      }, 800);
    }
  }, [matchedCount, cards.length, completed, elapsed, onFinish, playerPairs]);

  const handleFlip = (idx: number) => {
    if (
      !cards[idx] ||
      cards[idx].flipped ||
      cards[idx].matched ||
      flippedIndices.length === 2 ||
      completed
    )
      return;
    if (!timerStarted) setTimerStarted(true);

    const newFlipped = [...flippedIndices, idx];
    const newCards = cards.map((card, i) =>
      i === idx ? { ...card, flipped: true } : card,
    );
    setCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;
      setTimeout(() => {
        if (
          i1 !== undefined &&
          i2 !== undefined &&
          newCards[i1] &&
          newCards[i2] &&
          newCards[i1].id === newCards[i2].id &&
          i1 !== i2
        ) {
          setCards((prev) =>
            prev.map((card, i) =>
              i === i1 || i === i2
                ? { ...card, matched: true, matchedBy: currentPlayer }
                : card,
            ),
          );
          setMatchedCount((c) => c + 1);
          setPlayerPairs((prev) => {
            const arr = [...prev];
            arr[currentPlayer] = (arr[currentPlayer] ?? 0) + 1;
            return arr;
          });
          setPlayerTurns((prev) => {
            const arr = [...prev];
            arr[currentPlayer] = (arr[currentPlayer] ?? 0) + 1;
            return arr;
          });
          setLastAttemptCorrect(true);
          setFlippedIndices([]);
        } else if (i1 !== undefined && i2 !== undefined) {
          setCards((prev) =>
            prev.map((card, i) =>
              i === i1 || i === i2 ? { ...card, flipped: false } : card,
            ),
          );
          setPlayerTurns((prev) => {
            const arr = [...prev];
            arr[currentPlayer] = (arr[currentPlayer] ?? 0) + 1;
            return arr;
          });
          setLastAttemptCorrect(false);
          setTimeout(() => {
            setCurrentPlayer((p) => (p === 0 ? 1 : 0));
            setFlippedIndices([]);
          }, 400);
        }
      }, 800);
    }
  };

  if (!cards.length)
    return <div className="text-center text-lg">Loading memory game...</div>;

  return (
    <div>
      <div className="mb-4 text-lg font-bold text-blue-700">Memory Game</div>
      <div className="mb-2 text-gray-500">Time: {elapsed}s</div>
      <div className="mb-2 text-lg font-bold">
        <span
          className={currentPlayer === 0 ? "text-blue-700" : "text-orange-600"}
        >
          Player {currentPlayer + 1}
        </span>
        's turn
      </div>
      <div className="mb-4 flex justify-center gap-8">
        {[0, 1].map((p) => (
          <div
            key={p}
            className={`rounded-xl border-2 px-6 py-2 text-center font-bold ${
              p === 0
                ? "border-blue-500 bg-blue-100 text-blue-700"
                : "border-orange-500 bg-orange-100 text-orange-700"
            }`}
          >
            <div>Player {p + 1}</div>
            <div>Pairs: {playerPairs[p]}</div>
            <div>Turns: {playerTurns[p]}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          let bgColor = "bg-gray-200";
          if (card.matched) {
            bgColor = card.matchedBy === 1 ? "bg-orange-200" : "bg-blue-200";
          } else if (card.flipped) {
            bgColor = currentPlayer === 1 ? "bg-orange-200" : "bg-blue-200";
          }
          return (
            <button
              key={idx}
              className={`flex h-20 w-28 items-center justify-center rounded border text-lg font-bold ${bgColor}`}
              onClick={() => handleFlip(idx)}
              disabled={card.flipped || card.matched || completed}
            >
              {card.flipped || card.matched ? card.value : "?"}
            </button>
          );
        })}
      </div>
      {completed && (
        <div className="mt-4 font-bold text-green-600">¡Completado!</div>
      )}
    </div>
  );
};

export default Multiplayer;
