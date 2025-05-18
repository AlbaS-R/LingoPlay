import { NextPage } from "next";
import Link from "next/link";
import {
  Button,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ClickAwayListener,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import localforage from "localforage";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRouter } from "next/router";
import { TopBar } from "~/components/TopBar";
import { BottomBar } from "~/components/BottomBar";
import { RightBar } from "~/components/RightBar";
import { LeftBar } from "~/components/LeftBar";


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

interface MemoryGame extends BaseExercise {
  pairs: Array<{
    id: string;
    image?: string;
    text?: string;
  }>;
}

type DownloadedExercise = StandardExercise | MemoryGame;

const UnitHeader = ({
  unitName,
  unitNumber,
  description,
  backgroundColor,
  borderColor,
  children,
}: {
  unitName: string;
  unitNumber: number;
  description: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
  children?: ReactNode;
}) => {
  return (
    <article
      className={[
        "max-w-4xl w-full text-white sm:rounded-xl mb-8",
        backgroundColor,
        borderColor,
      ].join(" ")}
    >
      <header className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{unitName}</h2>
          <p className="text-sm">{description}</p>
        </div>
      </header>
      {children && <div className="p-4">{children}</div>}
    </article>
  );
};

const Downloads: NextPage = () => {
  const router = useRouter();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const [downloadedExercises, setDownloadedExercises] = useState<DownloadedExercise[]>([]);

  const loadDownloadedExercises = useCallback(async () => {
    const exercises: DownloadedExercise[] = [];
    try {
      await localforage.iterate((value, key, iterationNumber) => {
        if (key.startsWith("ejerciciosES-") || key.startsWith("ejerciciosVoz-") || key.startsWith("memoryGames-")) {
          exercises.push(value as DownloadedExercise);
        }
      });
      setDownloadedExercises(exercises);
    } catch (err) {
      console.error("Error al cargar ejercicios offline:", err);
      setSnackbarMessage("Error al cargar ejercicios descargados.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    localforage.config({
      name: "offlineExercisesDB",
      storeName: "exercises",
      description: "Almacén para ejercicios offline",
    });
    loadDownloadedExercises();
  }, [loadDownloadedExercises]);

  const MenuListComposition = ({
    label,
    unitId,
    exerciseType,
  }: {
    label: string;
    unitId: number;
    exerciseType: ExerciseType;
  }) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => setOpen((prevOpen) => !prevOpen);
    const handleClose = (event: Event | React.SyntheticEvent) => {
      if (
        anchorRef.current &&
        anchorRef.current.contains(event.target as HTMLElement)
      )
        return;
      setOpen(false);
    };

    function handleListKeyDown(event: React.KeyboardEvent) {
      if (event.key === "Tab" || event.key === "Escape") setOpen(false);
    }

    const prevOpen = useRef(open);
    useEffect(() => {
      if (prevOpen.current && !open) anchorRef.current?.focus();
      prevOpen.current = open;
    }, [open]);

    const downloadAndSaveExercise = async (exerciseNumber: number) => {
      setOpen(false);

      try {
        let exerciseDataToSave: DownloadedExercise;
        const docId = `ej${exerciseNumber}`;

        if (exerciseType === "memoryGames") {
          const mainDocRef = doc(db, exerciseType, docId);
          const mainDocSnap = await getDoc(mainDocRef);

          if (!mainDocSnap.exists()) {
            throw new Error(
              `El juego de memoria "${docId}" no existe en Firestore.`,
            );
          }

          const pairsCollectionRef = collection(mainDocRef, "pairs");
          const pairsSnapshot = await getDocs(pairsCollectionRef);
          const pairsData = pairsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          exerciseDataToSave = {
            id: docId,
            type: exerciseType,
            title: mainDocSnap.data()?.title || `Memory Game ${exerciseNumber}`,
            ...mainDocSnap.data(),
            pairs: pairsData,
          } as MemoryGame;
        } else {
          const exerciseRef = doc(db, exerciseType, docId);
          const exerciseSnap = await getDoc(exerciseRef);

          if (!exerciseSnap.exists()) {
            throw new Error(
              `El ejercicio "${docId}" de "${exerciseType}" no existe en Firestore.`,
            );
          }

          exerciseDataToSave = {
            id: docId,
            type: exerciseType,
            title: exerciseSnap.data()?.title || `Exercise ${exerciseNumber}`,
            ...exerciseSnap.data(),
          } as StandardExercise;

        }

        await localforage.setItem(
          `${exerciseType}-${docId}`,
          exerciseDataToSave,
        );

        setSnackbarMessage(
          `Ejercicio "${docId}" de "${exerciseType}" descargado.`,
        );
        setSnackbarSeverity("success");
        loadDownloadedExercises();
      } catch (error: any) {
        console.error("Error al descargar o guardar el ejercicio:", error);
        setSnackbarMessage(`Error al descargar el ejercicio: ${error.message}`);
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    };

    return (
      <div>
        <Button
          ref={anchorRef}
          onClick={handleToggle}
          className="bg-blue-600 text-white font-bold hover:bg-blue-700"
          disableElevation
          variant="contained"
        >
          {label}
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom"
          transition
          disablePortal
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: "center top" }}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    onKeyDown={handleListKeyDown}
                    className="grid grid-cols-2 gap-2"
                  >
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <MenuItem
                        key={idx}
                        onClick={() => downloadAndSaveExercise(idx)}
                      >
                        Exercici {idx}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    );
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleStartExercise = (exercise: DownloadedExercise) => {
    router.push(`/LessonOfline?type=${exercise.type}&id=${exercise.id}`);
  };

  const handleDeleteDownloadedExercise = async (exercise: DownloadedExercise) => {

    try {
      await localforage.removeItem(`${exercise.type}-${exercise.id}`);
      setSnackbarMessage(`Ejercicio "${exercise.id}" de "${exercise.type}" eliminado.`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      loadDownloadedExercises();
    } catch (error: any) {
      console.error("Error al eliminar ejercicio:", error);
      setSnackbarMessage(`Error al eliminar el ejercicio: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
        <LeftBar />

        <main className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12 flex-1">
          <div className="flex max-w-4xl w-full flex-col">
            <h1 className="text-2xl font-bold mb-2">Downloads Page</h1>
            <p className="mb-4">
              Here you will be able to download your favorite exercises and play offline!!
            </p>

            <div className="flex flex-col space-y-6">
              <UnitHeader
                unitName="Memory games"
                unitNumber={1}
                description="Learn while exercising the brain!"
                backgroundColor="bg-blue-200"
                borderColor="border-blue-300"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition
                    label="Descarrega"
                    unitId={1}
                    exerciseType="memoryGames"
                  />
                </div>

                <div className="mt-4 px-6 text-black">
                  <h3 className="text-lg font-semibold text-white mb-2">Ejercicios Descargados:</h3>
                  {downloadedExercises
                    .filter(
                      (ex) => ex.type === "memoryGames"
                    )
                    .map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between bg-white p-3 rounded-md mb-2 shadow">
                        <span className="font-medium text-gray-800">{ex.title || `Ejercicio ${ex.id}`}</span>
                        <div>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStartExercise(ex)}
                            className="ml-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Iniciar
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDeleteDownloadedExercise(ex)}
                            className="ml-2 text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  {downloadedExercises.filter((ex) => ex.type === "memoryGames").length === 0 && (
                    <p className="text-white text-sm">No hay ejercicios de memoria descargados.</p>
                  )}
                </div>
              </UnitHeader>

              <UnitHeader
                unitName="Basic exercises"
                unitNumber={2}
                description="Learn basic words."
                backgroundColor="bg-blue-300"
                borderColor="border-blue-400"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition
                    label="Descarrega"
                    unitId={2}
                    exerciseType="ejerciciosES"
                  />
                </div>
                <div className="mt-4 px-6 text-black">
                  <h3 className="text-lg font-semibold text-white mb-2">Ejercicios Descargados:</h3>
                  {downloadedExercises
                    .filter(
                      (ex) => ex.type === "ejerciciosES"
                    )
                    .map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between bg-white p-3 rounded-md mb-2 shadow">
                        <span className="font-medium text-gray-800">{ex.title || `Ejercicio ${ex.id}`}</span>
                        <div>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStartExercise(ex)}
                            className="ml-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Iniciar
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDeleteDownloadedExercise(ex)}
                            className="ml-2 text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  {downloadedExercises.filter((ex) => ex.type === "ejerciciosES").length === 0 && (
                    <p className="text-white text-sm">No hay ejercicios de lógica descargados.</p>
                  )}
                </div>
              </UnitHeader>

              <UnitHeader
                unitName="Voice recognition"
                unitNumber={3}
                description="Practice your pronunciation with voice exercises!"
                backgroundColor="bg-blue-400"
                borderColor="border-blue-600"
              >

                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition
                    label="Descarrega"
                    unitId={3}
                    exerciseType="ejerciciosVoz"
                  />

                </div>
                <div className="mt-4 px-6 text-black">
                  <h3 className="lg font-semibold text-white mb-2">Ejercicios Descargados:</h3>
                  {downloadedExercises
                    .filter(
                      (ex) => ex.type === "ejerciciosVoz"
                    )
                    .map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between bg-white p-3 rounded-md mb-2 shadow">
                        <span className="font-medium text-gray-800">{ex.title || `Ejercicio ${ex.id}`}</span>
                        <div>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStartExercise(ex)}
                            className="ml-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Iniciar
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDeleteDownloadedExercise(ex)}
                            className="ml-2 text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  {downloadedExercises.filter((ex) => ex.type === "ejerciciosVoz").length === 0 && (
                    <p className="text-white text-sm">No hay dictados auditivos descargados.</p>
                  )}
                </div>
              </UnitHeader>
            </div>
          </div>
        </main>

        <RightBar />
        <BottomBar />
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};



export default Downloads;