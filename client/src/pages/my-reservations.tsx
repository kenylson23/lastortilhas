import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, CalendarIcon, Clock, Users, MessageSquare, Check, Clock3, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import { Reservation } from "@shared/schema";

// Função para determinar a cor do status
const getStatusColorClass = (status: string | null) => {
  if (!status) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  
  switch (status) {
    case "confirmada":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelada":
      return "bg-red-100 text-red-800 border-red-200";
    default: // pendente
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};

// Função para obter o ícone do status
const StatusIcon = ({ status }: { status: string | null }) => {
  if (!status) return <Clock3 size={16} className="text-yellow-600" />;
  
  switch (status) {
    case "confirmada":
      return <Check size={16} className="text-green-600" />;
    case "cancelada":
      return <X size={16} className="text-red-600" />;
    default: // pendente
      return <Clock3 size={16} className="text-yellow-600" />;
  }
};

export default function MyReservations() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Consulta para buscar as reservas do usuário
  const { data, isLoading, error } = useQuery<{status: string, data: Reservation[]}>({
    queryKey: ["/api/my-reservations"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const reservations = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Minhas Reservas</h1>
            <p className="mt-2 text-gray-600">
              Acompanhe o status de suas reservas no Las Tortillas
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar ao site</span>
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="mt-8">
          {isLoading ? (
            // Estado de carregamento
            <div className="flex justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            // Estado de erro
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center text-red-800">
                  <p>Ocorreu um erro ao carregar suas reservas.</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="mt-4"
                  >
                    Voltar à página inicial
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : reservations.length === 0 ? (
            // Estado vazio
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhuma reserva encontrada</h3>
                  <p className="mt-2 text-gray-500">
                    Você ainda não fez nenhuma reserva no Las Tortillas.
                  </p>
                  <Button
                    onClick={() => navigate("/#contact")}
                    className="mt-4 bg-primary hover:bg-primary/90"
                  >
                    Fazer uma reserva
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Lista de reservas
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reservations.map((reservation) => (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl mb-1">
                            Reserva #{reservation.id}
                          </CardTitle>
                          <CardDescription>
                            {reservation.name}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getStatusColorClass(reservation.status)}
                        >
                          <StatusIcon status={reservation.status} />
                          <span className="ml-1">{reservation.status || "pendente"}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{reservation.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{reservation.time}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{reservation.guests} pessoas</span>
                        </div>
                        {reservation.message && reservation.message !== null && (
                          <div className="flex items-start">
                            <MessageSquare className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                            <span className="text-sm">{reservation.message}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 text-sm text-gray-500">
                      <p>
                        {reservation.status === "pendente" ? (
                          "Aguardando confirmação do restaurante"
                        ) : reservation.status === "confirmada" ? (
                          "Reserva confirmada. Esperamos por você!"
                        ) : (
                          "Esta reserva foi cancelada"
                        )}
                      </p>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}