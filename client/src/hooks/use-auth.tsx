import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { z } from "zod";
import { insertUserSchema, User } from "@shared/schema";
import { getQueryFn, apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Definir tipos para os dados de login/cadastro
type LoginData = Pick<z.infer<typeof insertUserSchema>, "username" | "password">;
type RegisterData = z.infer<typeof insertUserSchema>;

// Tipo para os dados da API
type ApiResponse = {
  status: string;
  data: Omit<User, "password"> | null;
  message?: string;
};

// Tipo para o contexto de autenticação
type AuthContextType = {
  user: Omit<User, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<ApiResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<ApiResponse, Error, void>;
  registerMutation: UseMutationResult<ApiResponse, Error, RegisterData>;
};

// Criar contexto de autenticação
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consulta para obter o usuário atual
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<ApiResponse | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Extrair o usuário dos dados de resposta
  const user = userData?.status === "success" ? userData.data : null;

  // Mutação para login
  const loginMutation = useMutation<ApiResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      return data as ApiResponse;
    },
    onSuccess: (response) => {
      if (response.status === "success") {
        queryClient.setQueryData(["/api/user"], response);
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!",
        });
      } else {
        throw new Error(response.message || "Erro ao fazer login");
      }
    },
    onError: (error: Error) => {
      console.error("Erro no login:", error);
      toast({
        title: "Falha no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para cadastro
  const registerMutation = useMutation<ApiResponse, Error, RegisterData>({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const data = await res.json();
      return data as ApiResponse;
    },
    onSuccess: (response) => {
      if (response.status === "success") {
        queryClient.setQueryData(["/api/user"], response);
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Bem-vindo ao Las Tortillas!",
        });
      } else {
        throw new Error(response.message || "Erro ao realizar cadastro");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para logout
  const logoutMutation = useMutation<ApiResponse, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      const data = await res.json();
      return data as ApiResponse;
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], { status: "success", data: null });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}