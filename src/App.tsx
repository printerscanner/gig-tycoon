import Layout from "@/layouts/Layout";
import CityGrid from "@/components/CityGrid";
import { useGameStore } from "@/stores/gameStore";
import { useGameLoop } from "@/hooks/useGameLoop";

import { Toaster, toast } from "sonner";
import { useEffect } from "react";
import HelpPopover from "@/components/HelpPopover";

function App() {
  useGameLoop();

  const { workers, jobs, handleTileClick } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info("🎉 Welcome to Gig Tycoon: Bootstrap Phase!", {
        description:
          "You developed an app prototype with €10,000 bootstrap funding. Prove your concept to unlock investor funding! Start small and grow smart.",
        duration: 6000,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <CityGrid workers={workers} jobs={jobs} onTileClick={handleTileClick} />
      <HelpPopover />
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </Layout>
  );
}

export default App;
