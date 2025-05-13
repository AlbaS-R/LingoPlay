import { useRouter } from "next/router";
import { MemoryGame } from "../components/MemoryGame";

const MemoryGamePage = () => {
  const router = useRouter();
  const { gameId } = router.query;

  if (!gameId || typeof gameId !== "string") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <MemoryGame gameId={gameId} />
    </div>
  );
};

export default MemoryGamePage;
