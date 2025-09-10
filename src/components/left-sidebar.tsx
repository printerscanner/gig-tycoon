import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useGameStore } from "@/stores/gameStore"

export function AppSidebar() {
  const { 
    cash, 
    reputation, 
    workerMorale,
    completedJobs,
    monthlyTarget,
    workers, 
    hireWorker,
    adjustWorkerWage 
  } = useGameStore();

  const formatCurrency = (amount: number) => `$${amount.toFixed(0)}`;

  const getWorkerTraitEmoji = (traits: Array<{ name: string }>) => {
    if (traits.some(t => t.name === 'Hustler')) return '⚡';
    if (traits.some(t => t.name === 'Reliable')) return '✅';
    if (traits.some(t => t.name === 'Lazy')) return '😴';
    if (traits.some(t => t.name === 'Stressed')) return '😰';
    if (traits.some(t => t.name === 'Burnout-prone')) return '🔥';
    return '🧑‍💼';
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>📊 GIG TYCOON METRICS</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>💰 Cash on Hand:</span>
                <span className="font-bold">{formatCurrency(cash)}</span>
              </div>
              <div className="flex justify-between">
                <span>⭐ Reputation:</span>
                <span className={`font-bold ${reputation >= 80 ? 'text-green-600' : reputation >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {reputation.toFixed(0)}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span>😊 Worker Morale:</span>
                <span className={`font-bold ${workerMorale >= 80 ? 'text-green-600' : workerMorale >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {workerMorale.toFixed(0)}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span>📦 Jobs Done:</span>
                <span className="font-bold">{completedJobs}/{monthlyTarget}</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>👥 WORKER ROSTER ({workers.length})</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workers.map((worker) => (
                <SidebarMenuItem key={worker.id}>
                  <div className="w-full p-2 border rounded-lg hover:bg-accent">
                    <div className="p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getWorkerTraitEmoji(worker.traits)}</span>
                        <span className="font-medium">{worker.name}</span>
                        {worker.isWorking && <span className="text-xs bg-green-100 text-green-800 px-1 rounded">WORKING</span>}
                        {!worker.isWorking && <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">AVAILABLE</span>}
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>⚡ Stamina:</span>
                          <span>{worker.stamina}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>😊 Happiness:</span>
                          <span className={worker.happiness >= 70 ? 'text-green-600' : worker.happiness >= 40 ? 'text-yellow-600' : 'text-red-600'}>
                            {worker.happiness}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>� Wage/Job:</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); adjustWorkerWage(worker.id, Math.max(5, worker.wage - 1)); }}
                              className="w-4 h-4 text-xs bg-red-100 hover:bg-red-200 rounded"
                            >-</button>
                            <span>{formatCurrency(worker.wage)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); adjustWorkerWage(worker.id, worker.wage + 1); }}
                              className="w-4 h-4 text-xs bg-green-100 hover:bg-green-200 rounded"
                            >+</button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>📈 Jobs:</span>
                          <span>{worker.jobsCompleted} | {formatCurrency(worker.totalEarned)} earned</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Traits: {worker.traits.map(t => t.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
              
              {workers.length < 2 && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={hireWorker}
                    className="w-full border-dashed border-2 border-green-300 hover:border-green-400 bg-green-50"
                  >
                    <span>+ Hire Starter Worker (FREE)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {workers.length >= 2 && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={hireWorker}
                    className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400"
                    disabled={cash < 200}
                  >
                    <span>+ Hire Worker ({formatCurrency(200)})</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
