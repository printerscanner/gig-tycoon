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
      toast.info("🎉 Welcome to Gig Tycoon: Pre-Seed round!", {
        description:
          "You developed an app prototype and raised €400,000 from friends and family. You can use this money to hire workers and expand your business.",
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
