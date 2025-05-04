import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info, Save, UserIcon, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [whatsappNumber, setWhatsappNumber] = useState("244949639932");
  const [restaurantAddress, setRestaurantAddress] = useState("Rua Principal, 123, Luanda, Angola");
  const [restaurantEmail, setRestaurantEmail] = useState("info@lastortillas.ao");
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simular uma operação assíncrona
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações do restaurante foram atualizadas com sucesso."
      });
    }, 1000);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do restaurante Las Tortillas
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Restaurante</CardTitle>
              <CardDescription>
                Defina as informações básicas do seu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+244 999 999 999"
                />
                <p className="text-xs text-muted-foreground">
                  Este número será usado para receber as notificações de reservas.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  placeholder="Endereço do restaurante"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={restaurantEmail}
                  onChange={(e) => setRestaurantEmail(e.target.value)}
                  placeholder="contato@restaurante.com"
                />
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Informações
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Detalhes da sua conta de administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{user?.username}</h3>
                  <p className="text-sm text-muted-foreground">Administrador</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="rounded-md bg-blue-50 p-4 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Dica de segurança
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Não compartilhe suas credenciais com ninguém. Se precisar dar acesso a 
                        outras pessoas, considere criar novas contas com as permissões adequadas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}