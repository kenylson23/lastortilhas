import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { 
  Menu, 
  Home, 
  List, 
  Utensils, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const mainNavItems: SidebarItem[] = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/admin"
  },
  {
    icon: List,
    label: "Categorias",
    href: "/admin/categories"
  },
  {
    icon: Utensils,
    label: "Menu",
    href: "/admin/menu"
  },
  {
    icon: Calendar,
    label: "Reservas",
    href: "/admin/reservations"
  },
  {
    icon: Settings,
    label: "Configurações",
    href: "/admin/settings"
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Verificar se o usuário é administrador
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (user.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar o painel administrativo.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [user, navigate, toast]);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  if (user.role !== "admin") {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[250px]"
        )}
      >
        {/* Logo e título */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <img 
              src="/images/logo.jpg" 
              alt="Las Tortillas"
              className="h-8 w-8 rounded-full" 
            />
            {!collapsed && (
              <span className="font-bold text-primary">
                Admin Panel
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        {/* Menu de navegação */}
        <ScrollArea className="flex-1">
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed ? "px-2" : "px-3"
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon size={20} className={collapsed ? "mx-auto" : "mr-2"} />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>
        
        {/* Rodapé / Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50",
              collapsed ? "px-2" : "px-3"
            )}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={20} className={collapsed ? "mx-auto" : "mr-2"} />
            {!collapsed && (
              <span>
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </span>
            )}
          </Button>
        </div>
      </aside>
      
      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 px-8">
          {children}
        </div>
      </main>
    </div>
  );
}