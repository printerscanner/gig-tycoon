import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function HelpPopover() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="p-2 border-2 w-10 h-12 rounded-lg shadow-lg font-medium"
          >
            ?
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          className="bg-card text-foreground-card m-3 max-w-sm border shadow-xl"
        >
          <div className="text-sm space-y-3">
            <div className="font-semibold border-b pb-2">
              🎮 How to Play (Automation Mode):
            </div>

            <div className="space-y-1">
              <div>1. Hire workers</div>
              <div>2. Customers call in jobs</div>
              <div>3. Adjust wages to keep workers happy 💰</div>
              <div>4. Watch your business grow! 📈</div>
            </div>

            <div className="text-xs text-gray-600 border-t pt-2 space-y-1">
              <div>
                💡 Your role: Hire staff, set wages, and watch the empire grow!
              </div>
              <div>
                ⚠️ Warning: Underpaid workers = bad reviews = fewer customers
              </div>
              <div>
                🎯 Goal: Balance automation efficiency with worker satisfaction
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t pt-2">
              <div className="font-medium mb-1">🏙️ City Legend:</div>
              <div>
                🍕🍔 Restaurants • 🏠 Homes • 🏢 Offices • 🛒🏪 Stores • 🌳
                Parks
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
