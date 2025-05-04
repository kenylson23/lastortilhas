import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CircleUser,
  Utensils,
  Calendar,
  Tag
} from "lucide-react";
import AdminLayout from "./admin-layout";
import { getQueryFn } from "@/lib/queryClient";
import { Reservation, MenuCategory, MenuItem } from "@shared/schema";

type Stats = {
  categoriesCount: number;
  menuItemsCount: number;
  reservationsCount: number;
  pendingReservationsCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    categoriesCount: 0,
    menuItemsCount: 0,
    reservationsCount: 0,
    pendingReservationsCount: 0
  });
  
  // Consultas para buscar dados
  const { data: categoriesData } = useQuery<{status: string, data: MenuCategory[]}>({
    queryKey: ["/api/admin/menu/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: menuItemsData } = useQuery<{status: string, data: MenuItem[]}>({
    queryKey: ["/api/admin/menu/items"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: reservationsData } = useQuery<{status: string, data: Reservation[]}>({
    queryKey: ["/api/admin/reservations"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Atualizar estatísticas quando os dados forem carregados
  useEffect(() => {
    const categories = categoriesData?.data || [];
    const menuItems = menuItemsData?.data || [];
    const reservations = reservationsData?.data || [];
    const pendingReservations = reservations.filter(r => r.status === "pendente");
    
    setStats({
      categoriesCount: categories.length,
      menuItemsCount: menuItems.length,
      reservationsCount: reservations.length,
      pendingReservationsCount: pendingReservations.length
    });
  }, [categoriesData, menuItemsData, reservationsData]);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das operações do restaurante Las Tortillas
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Categorias
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categoriesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Categorias ativas no menu
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Itens de Menu
              </CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.menuItemsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pratos disponíveis no cardápio
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservas Totais
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reservationsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reservas registradas no sistema
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservas Pendentes
              </CardTitle>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                {stats.pendingReservationsCount}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReservationsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reservas aguardando confirmação
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Seção de reservas recentes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reservas Recentes</h2>
          </div>
          
          <div className="rounded-md border">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-muted-foreground">
                    <th className="text-left font-medium p-2">Cliente</th>
                    <th className="text-left font-medium p-2">Data</th>
                    <th className="text-left font-medium p-2">Hora</th>
                    <th className="text-left font-medium p-2">Pessoas</th>
                    <th className="text-left font-medium p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationsData?.data?.slice(0, 5).map((reservation) => (
                    <tr key={reservation.id} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center">
                          <CircleUser className="h-8 w-8 text-muted-foreground mr-2" />
                          <span>{reservation.name}</span>
                        </div>
                      </td>
                      <td className="p-2">{reservation.date}</td>
                      <td className="p-2">{reservation.time}</td>
                      <td className="p-2">{reservation.guests}</td>
                      <td className="p-2">
                        <Badge 
                          variant="outline" 
                          className={
                            reservation.status === "confirmada" 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : reservation.status === "cancelada"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  
                  {(!reservationsData?.data || reservationsData.data.length === 0) && (
                    <tr className="border-t">
                      <td colSpan={5} className="text-center p-4 text-muted-foreground">
                        Nenhuma reserva encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}