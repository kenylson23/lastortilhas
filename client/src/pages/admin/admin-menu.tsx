import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Save,
  X,
  Image,
  Star,
  Upload,
  Utensils
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { 
  insertMenuItemSchema, 
  type MenuItem, 
  type MenuCategory 
} from "@shared/schema";
import AdminLayout from "./admin-layout";

// Esquema de formulário para item do menu
const menuItemFormSchema = insertMenuItemSchema.extend({
  price: z.coerce.number().min(0).step(0.01),
  category_id: z.coerce.number(),
  spicy_level: z.coerce.number().min(0).max(5).default(0),
  order: z.coerce.number().default(0),
});

export default function AdminMenu() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const [__, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consultas para buscar dados
  const { 
    data: menuItemsData, 
    isLoading: isMenuItemsLoading 
  } = useQuery<{status: string, data: MenuItem[]}>({
    queryKey: ["/api/admin/menu/items"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading 
  } = useQuery<{status: string, data: MenuCategory[]}>({
    queryKey: ["/api/admin/menu/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const menuItems = menuItemsData?.data || [];
  const categories = categoriesData?.data || [];
  
  // Filtrar itens por categoria se necessário
  const filteredItems = activeTab === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category_id === parseInt(activeTab));
  
  // Formulário para criar/editar item
  const form = useForm<z.infer<typeof menuItemFormSchema>>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      category_id: categories[0]?.id || 0,
      spicy_level: 0,
      featured: false,
      vegetarian: false,
      available: true,
      order: 0
    }
  });
  
  // Mutations para itens
  const createItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof menuItemFormSchema>) => {
      const response = await apiRequest("POST", "/api/admin/menu/items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu/items"] });
      setIsCreating(false);
      form.reset();
      toast({
        title: "Item criado com sucesso",
        description: "O item foi adicionado ao menu."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar item",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<z.infer<typeof menuItemFormSchema>> }) => {
      const response = await apiRequest("PUT", `/api/admin/menu/items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu/items"] });
      setEditingItem(null);
      form.reset();
      toast({
        title: "Item atualizado com sucesso",
        description: "As alterações foram salvas."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/menu/items/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu/items"] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Item excluído com sucesso",
        description: "O item foi removido do menu."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir item",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Funções auxiliares
  const handleCreate = () => {
    setIsCreating(true);
    form.reset({
      name: "",
      description: "",
      price: 0,
      image: "",
      category_id: categories[0]?.id || 0,
      spicy_level: 0,
      featured: false,
      vegetarian: false,
      available: true,
      order: menuItems.filter(i => i.category_id === categories[0]?.id).length
    });
  };
  
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description || "",
      price: item.price,
      image: item.image || "",
      category_id: item.category_id,
      spicy_level: item.spicy_level || 0,
      featured: Boolean(item.featured),
      vegetarian: Boolean(item.vegetarian),
      available: Boolean(item.available),
      order: item.order || 0
    });
  };
  
  const handleDelete = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };
  
  const handleCancelEdit = () => {
    setEditingItem(null);
    form.reset();
  };
  
  const onSubmit = (data: z.infer<typeof menuItemFormSchema>) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };
  
  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
    }
  };
  
  // Renderizar nível de picante
  const renderSpicyLevel = (level: number | null) => {
    const spicyLevel = level || 0;
    const elements = [];
    for (let i = 0; i < 5; i++) {
      elements.push(
        <span 
          key={i} 
          className={`text-lg ${i < spicyLevel ? 'text-red-500' : 'text-gray-300'}`}
        >
          🌶️
        </span>
      );
    }
    return <div className="flex">{elements}</div>;
  };
  
  // Encontrar nome da categoria
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "N/A";
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu</h1>
            <p className="text-muted-foreground">
              Gerencie os itens do menu do restaurante
            </p>
          </div>
          <Button onClick={handleCreate} disabled={isCreating || categories.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>
        
        {(isMenuItemsLoading || isCategoriesLoading) ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-4 text-amber-500">
                <Utensils className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground mt-2">
                Você precisa criar categorias antes de adicionar itens ao menu.
              </p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => navigate("/admin/categories")}
              >
                Ir para Categorias
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id.toString()}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Picante</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead style={{ width: 100 }}>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                              Nenhum item encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  {item.image ? (
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="h-10 w-10 object-cover rounded-md" 
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                      <Image className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium flex items-center">
                                      {item.name}
                                      {item.featured && (
                                        <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
                                      )}
                                    </div>
                                    {item.vegetarian && (
                                      <Badge variant="outline" className="bg-green-100 text-green-800 mt-1">
                                        Vegetariano
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getCategoryName(item.category_id)}</TableCell>
                              <TableCell>
                                {new Intl.NumberFormat('pt-AO', {
                                  style: 'currency',
                                  currency: 'AOA',
                                }).format(item.price)}
                              </TableCell>
                              <TableCell>{renderSpicyLevel(item.spicy_level)}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    item.available 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {item.available ? "Disponível" : "Indisponível"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(item)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Formulário para criar/editar item */}
            {(isCreating || editingItem) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>
                    {editingItem ? "Editar Item" : "Novo Item"}
                  </CardTitle>
                  <CardDescription>
                    {editingItem
                      ? "Atualize os detalhes do item selecionado"
                      : "Preencha os detalhes para criar um novo item de menu"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome do item" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Descrição do item" 
                                    className="min-h-[120px]"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Preço (AOA)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="category_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Categoria</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    defaultValue={field.value.toString()}
                                    value={field.value.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map(category => (
                                        <SelectItem 
                                          key={category.id} 
                                          value={category.id.toString()}
                                        >
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL da Imagem</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <Input 
                                      placeholder="URL da imagem" 
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Insira a URL de uma imagem para o item
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="spicy_level"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nível de Picante (0-5)</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Input
                                      type="range"
                                      min="0"
                                      max="5"
                                      step="1"
                                      {...field}
                                      className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>Sem picante</span>
                                      <span>Muito picante</span>
                                    </div>
                                    <div className="text-center font-medium">
                                      {renderSpicyLevel(field.value)}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="order"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ordem</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="Ordem de exibição"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Ordem de exibição dentro da categoria
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="pt-4">
                            <h3 className="text-sm font-medium mb-3">Opções adicionais</h3>
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="featured"
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                                    <div>
                                      <FormLabel className="font-normal">Em destaque</FormLabel>
                                      <FormDescription>
                                        Mostrar este item em seções de destaque
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="vegetarian"
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                                    <div>
                                      <FormLabel className="font-normal">Vegetariano</FormLabel>
                                      <FormDescription>
                                        Este item é vegetariano
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="available"
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                                    <div>
                                      <FormLabel className="font-normal">Disponível</FormLabel>
                                      <FormDescription>
                                        Este item está disponível no menu
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={editingItem ? handleCancelEdit : () => setIsCreating(false)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createItemMutation.isPending || updateItemMutation.isPending}
                        >
                          {(createItemMutation.isPending || updateItemMutation.isPending) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          {editingItem ? "Atualizar" : "Criar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </>
        )}
        
        {/* Dialog de confirmação para excluir */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o item "{itemToDelete?.name}"?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteItemMutation.isPending}
              >
                {deleteItemMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}