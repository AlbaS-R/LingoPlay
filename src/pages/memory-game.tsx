import { useRouter } from "next/router";
import { MemoryGame } from "../components/MemoryGame";

const MemoryGamePage = () => {
  const router = useRouter();
  const { gameId, tileIndex } = router.query;

  if (!gameId || typeof gameId !== "string") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <MemoryGame gameId={gameId} tileIndex={Number(tileIndex) || 0} />
    </div>
  );
};

export default MemoryGamePage;
