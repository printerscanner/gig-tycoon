import Layout from "@/layouts/Layout";
import { CityMap } from "@/components/CityMap";
import { useGameStore } from "@/stores/gameStore";
import { useGameLoop } from "@/hooks/useGameLoop";

import { Toaster, toast } from "sonner";
import { useEffect } from "react";
import HelpPopover from "@/components/HelpPopover";

function App() {
  useGameLoop();

  const { handleTileClick } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info("🎉 Welcome to Gig Tycoon: Bootstrap Phase!", {
        description:
          "Welcome to Kreuzberg & Neukölln! You developed an app prototype with €10,000 bootstrap funding. Deliver food across South Berlin's vibrant neighborhoods!",
        duration: 6000,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <CityMap onTileClick={handleTileClick} />
      <HelpPopover />
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </Layout>
  );
}

export default App;
