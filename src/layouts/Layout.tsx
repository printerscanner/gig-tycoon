import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SidebarTrigger className="self-start" />
          <div className="flex-1 flex items-center justify-center px-4 py-2">
            <div className="w-full max-w-6xl">
              {children}
            </div>
          </div>
        </main>
        <RightSidebar />
      </div>
    </SidebarProvider>
  );
}
