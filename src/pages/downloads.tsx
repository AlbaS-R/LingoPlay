import { NextPage } from "next";
import { TopBar } from "~/components/TopBar";
import { BottomBar } from "~/components/BottomBar";
import { RightBar } from "~/components/RightBar";
import { LeftBar } from "~/components/LeftBar";
import Link from "next/link";
import {
  Button,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ClickAwayListener,
  Snackbar, // Para mostrar notificaciones
  Alert, // Para estilos de notificaciones
} from "@mui/material";
import { useState, useRef, useEffect, ReactNode } from "react";
import localforage from "localforage"; 
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore"; 
import { db } from "../firebaseConfig"; 


type ExerciseType = "ejerciciosES" | "ejerciciosVoz" | "memoryGames";


interface BaseExercise {
  id: string; // ej1, ej2, etc.
  type: ExerciseType;
  
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

// --- Componente Downloads Page ---
const Downloads: NextPage = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  // Configura localforage al montar el componente
  useEffect(() => {
    localforage.config({
      name: "offlineExercisesDB", // Nombre de tu base de datos IndexedDB
      storeName: "exercises", // Nombre del almacén de objetos
      description: "Almacén para ejercicios offline",
    });
  }, []); // Se ejecuta solo una vez al montar

  const MenuListComposition = ({
    label,
    unitId, // Usado para el UI, no directamente para Firestore collection/doc ID
    exerciseType, // Nuevo prop: para especificar la colección de Firestore
  }: {
    label: string;
    unitId: number;
    exerciseType: ExerciseType; // Añade el tipo de ejercicio
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

    // Función para descargar y guardar el ejercicio de Firestore
    const downloadAndSaveExercise = async (exerciseNumber: number) => {
      setOpen(false); // Cierra el menú al seleccionar un ejercicio

      try {
        let exerciseDataToSave: DownloadedExercise; // Para almacenar los datos que guardaremos
        const docId = `ej${exerciseNumber}`; // Los IDs de tus documentos en Firestore son "ej1", "ej2", etc.

        if (exerciseType === "memoryGames") {
          // Lógica específica para la colección 'memorygames' que tiene una subcolección 'pairs'
          const mainDocRef = doc(db, exerciseType, docId);
          const mainDocSnap = await getDoc(mainDocRef);

          if (!mainDocSnap.exists()) {
            throw new Error(
              `El juego de memoria "${docId}" no existe en Firestore.`,
            );
          }

          // Obtener documentos de la subcolección 'pairs'
          const pairsCollectionRef = collection(mainDocRef, "pairs");
          const pairsSnapshot = await getDocs(pairsCollectionRef);
          const pairsData = pairsSnapshot.docs.map((doc) => ({
            id: doc.id, // Incluye el ID del documento de la subcolección si es útil
            ...doc.data(),
          }));

          exerciseDataToSave = {
            id: docId,
            type: exerciseType,
            ...mainDocSnap.data(), // Puedes incluir datos del documento principal si existen
            pairs: pairsData, // ¡Aquí están las parejas!
          } as MemoryGame; // Castea al tipo MemoryGame
        } else {
          // Lógica para colecciones 'ejerciciosES' y 'ejerciciosVoz'
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
            ...exerciseSnap.data(),
          } as StandardExercise; // Castea al tipo StandardExercise
        }

        // 2. Guardar el ejercicio en IndexedDB usando localforage
        // La clave de almacenamiento ahora incluye el tipo de ejercicio para evitar colisiones
        await localforage.setItem(
          `${exerciseType}-${docId}`, // Clave única para el ejercicio
          exerciseDataToSave,
        );

        setSnackbarMessage(
          `Ejercicio "${docId}" de "${exerciseType}" descargado.`,
        );
        setSnackbarSeverity("success");
      } catch (error: any) {
        // Manejo de errores más robusto
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
                    {/* Renderiza los MenuItem para los ejercicios del 1 al 5 */}
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

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
        <LeftBar /> {/* Asegúrate de que LeftBar esté importado correctamente */}

        <main className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12 flex-1">
          <div className="flex max-w-4xl w-full flex-col">
            <h1 className="text-2xl font-bold mb-2">Página de Descargas</h1>
            <p className="mb-4">
              Aquí puedes descargar ejercicios para realizarlos sin conexión.
            </p>
            <Link href="/" className="text-blue-500 underline mb-6 block">
              Volver a inicio
            </Link>

            <div className="flex flex-col space-y-6">
              {/* Jocs de memòria (Memory Games) */}
              <UnitHeader
                unitName="Jocs de memòria"
                unitNumber={1}
                description="Ejercicios para entrenar tu memoria."
                backgroundColor="bg-blue-200"
                borderColor="border-blue-300"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition
                    label="Descarrega"
                    unitId={1}
                    exerciseType="memoryGames" // Especificamos el tipo de colección
                  />
                </div>
              </UnitHeader>

              {/* Jocs de lògica (Ejercicios normales, asumiendo ejerciciosES) */}
              <UnitHeader
                unitName="Jocs de lògica"
                unitNumber={2}
                description="Desafía tu mente con ejercicios de lógica."
                backgroundColor="bg-blue-300"
                borderColor="border-blue-400"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition
                    label="Descarrega"
                    unitId={2}
                    exerciseType="ejerciciosES" // Especificamos el tipo de colección
                  />
                </div>
              </UnitHeader>

              {/* Dictats auditivos (Ejercicios de voz, asumiendo ejerciciosVoz) */}
              <UnitHeader
                unitName="Dictats auditivos"
                unitNumber={3}
                description="Mejora tu comprensión auditiva con dictados."
                backgroundColor="bg-blue-400"
                borderColor="border-blue-600"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition
                    label="Descarrega"
                    unitId={3}
                    exerciseType="ejerciciosVoz" // Especificamos el tipo de colección
                  />
                </div>
              </UnitHeader>

              {/* Puzzles visuals (Ejercicios normales, asumiendo ejerciciosES o si es una nueva colección, cámbiala) */}
              <UnitHeader
                unitName="Puzzles visuals"
                unitNumber={4}
                description="Entrena tu visión con puzzles desafiantes."
                backgroundColor="bg-blue-500"
                borderColor="border-blue-700"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition
                    label="Descarrega"
                    unitId={4}
                    exerciseType="ejerciciosES" // Especificamos el tipo de colección
                  />
                </div>
              </UnitHeader>
            </div>
          </div>
        </main>

        <RightBar /> {/* Asegúrate de que RightBar esté importado correctamente */}
      </div>

      <BottomBar /> {/* Asegúrate de que BottomBar esté importado correctamente */}

      {/* Snackbar para notificaciones de descarga */}
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