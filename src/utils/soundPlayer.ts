import { useBoundStore } from "~/hooks/useBoundStore";

export const playClickSound = () => {
  const soundEffects = useBoundStore.getState().soundEffects;

  if (soundEffects) {
    const audio = new Audio("/sounds/click.mp3");
    audio.play().catch((err) => {
      console.error("❌ Error al reproducir sonido:", err);
    });
  }
};
