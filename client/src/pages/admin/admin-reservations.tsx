import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Loader2,
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  Check,
  X,
  Ban,
  Pencil,
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { type Reservation } from "@shared/schema";
import AdminLayout from "./admin-layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminReservations() {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta para buscar reservas
  const { 
    data: reservationsData, 
    isLoading: isReservationsLoading,
    isError
  } = useQuery<{status: string, data: Reservation[]}>({
    queryKey: ["/api/admin/reservations"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const reservations = reservationsData?.data || [];
  
  // Mutation para atualizar status da reserva
  const updateReservationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/reservations/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reservations"] });
      setDialogOpen(false);
      setSelectedReservation(null);
      toast({
        title: "Status da reserva atualizado",
        description: "A reserva foi atualizada com sucesso."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar reserva",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Função para renderizar badge de status
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case "confirmada":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Confirmada
          </Badge>
        );
      case "cancelada":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendente
          </Badge>
        );
    }
  };
  
  // Função para abrir diálogo de reserva
  const openReservationDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDialogOpen(true);
  };
  
  // Função para confirmar reserva
  const confirmReservation = () => {
    if (selectedReservation) {
      updateReservationStatusMutation.mutate({ 
        id: selectedReservation.id, 
        status: "confirmada" 
      });
    }
  };
  
  // Função para cancelar reserva
  const cancelReservation = () => {
    if (selectedReservation) {
      updateReservationStatusMutation.mutate({ 
        id: selectedReservation.id, 
        status: "cancelada" 
      });
    }
  };
  
  // Função para definir como pendente
  const setPendingReservation = () => {
    if (selectedReservation) {
      updateReservationStatusMutation.mutate({ 
        id: selectedReservation.id, 
        status: "pendente" 
      });
    }
  };
  
  // Formatar data para exibição local
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString('pt-BR', options);
  };
  
  if (isError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-red-500 mb-4">
            <X className="h-16 w-16" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar reservas</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Não foi possível carregar as reservas. Verifique sua conexão ou tente novamente mais tarde.
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/reservations"] })}>
            Tentar Novamente
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gerencie as reservas do restaurante
          </p>
        </div>
        
        {isReservationsLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Todas as Reservas</CardTitle>
              <CardDescription>
                Total de {reservations.length} reservas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Pessoas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Nenhuma reserva encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div className="font-medium">{reservation.name}</div>
                          <div className="text-sm text-muted-foreground">{reservation.phone}</div>
                        </TableCell>
                        <TableCell>{reservation.date}</TableCell>
                        <TableCell>{reservation.time}</TableCell>
                        <TableCell>{reservation.guests}</TableCell>
                        <TableCell>{renderStatusBadge(reservation.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReservationDialog(reservation)}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* Diálogo de detalhes da reserva */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedReservation && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalhes da Reserva</DialogTitle>
                  <DialogDescription>
                    Informações da reserva e opções de gerenciamento
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Cliente:</span>
                      <span className="ml-2">{selectedReservation.name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Telefone:</span>
                      <span className="ml-2">{selectedReservation.phone}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Data:</span>
                      <span className="ml-2">{selectedReservation.date}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Hora:</span>
                      <span className="ml-2">{selectedReservation.time}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Pessoas:</span>
                      <span className="ml-2">{selectedReservation.guests}</span>
                    </div>
                    
                    {selectedReservation.message && (
                      <div className="mt-4">
                        <div className="flex items-start">
                          <MessageSquare className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                          <div>
                            <span className="font-medium">Mensagem:</span>
                            <p className="mt-1 text-sm text-gray-600">
                              {selectedReservation.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Status atual: {renderStatusBadge(selectedReservation.status)}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedReservation.status === "confirmada" ? "default" : "outline"}
                        size="sm"
                        onClick={confirmReservation}
                        disabled={updateReservationStatusMutation.isPending}
                        className="flex items-center"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                      
                      <Button
                        variant={selectedReservation.status === "pendente" ? "default" : "outline"}
                        size="sm"
                        onClick={setPendingReservation}
                        disabled={updateReservationStatusMutation.isPending}
                        className="flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Pendente
                      </Button>
                      
                      <Button
                        variant={selectedReservation.status === "cancelada" ? "default" : "outline"}
                        size="sm"
                        onClick={cancelReservation}
                        disabled={updateReservationStatusMutation.isPending}
                        className="flex items-center"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}