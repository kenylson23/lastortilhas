import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  MoveUp,
  MoveDown,
  Save,
  X
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { insertMenuCategorySchema, type MenuCategory } from "@shared/schema";
import AdminLayout from "./admin-layout";

// Esquema de formulário para categoria
const categoryFormSchema = insertMenuCategorySchema.extend({
  order: z.coerce.number().default(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminCategories() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta para buscar categorias
  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading 
  } = useQuery<{status: string, data: MenuCategory[]}>({
    queryKey: ["/api/admin/menu/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const categories = categoriesData?.data || [];
  
  // Formulário para criar/editar categoria
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      order: 0
    }
  });
  
  // Mutations para categorias
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest("POST", "/api/admin/menu/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu/categories"] });
      setIsCreating(false);
      form.reset();
      toast({
        title: "Categoria criada com sucesso",
        description: "A categoria foi adicionada ao menu."
      });
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      
      // Melhorar mensagem de erro para nome duplicado
      if (errorMessage.includes("duplicate key") || errorMessage.includes("menu_categories_name_unique")) {
        errorMessage = "Já existe uma categoria com este nome. Por favor, escolha um nome diferente.";
      }
      
      toast({
        title: "Erro ao criar categoria",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<CategoryFormValues> }) => {
      const response = await apiRequest("PUT", `/api/admin/menu/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu/categories"] });
      setEditingCategory(null);
      form.reset();
      toast({
        title: "Categoria atualizada com sucesso",
        description: "As alterações foram salvas."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/menu/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu/categories"] });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast({
        title: "Categoria excluída com sucesso",
        description: "A categoria foi removida do menu."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Funções para manipular os formulários
  const handleCreate = () => {
    setIsCreating(true);
    form.reset({
      name: "",
      description: "",
      order: categories.length
    });
  };
  
  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      order: category.order
    });
  };
  
  const handleDelete = (category: MenuCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
  };
  
  const onSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };
  
  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };
  
  const handleMoveUp = (category: MenuCategory, index: number) => {
    if (index > 0) {
      const newOrder = categories[index - 1].order;
      updateCategoryMutation.mutate({ 
        id: category.id, 
        data: { order: newOrder } 
      });
    }
  };
  
  const handleMoveDown = (category: MenuCategory, index: number) => {
    if (index < categories.length - 1) {
      const newOrder = categories[index + 1].order;
      updateCategoryMutation.mutate({ 
        id: category.id, 
        data: { order: newOrder } 
      });
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground">
              Gerencie as categorias do menu do restaurante
            </p>
          </div>
          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        
        {isCategoriesLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 50 }}>#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead style={{ width: 150 }}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        Nenhuma categoria encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category, index) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.order}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.description || "-"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleMoveUp(category, index)}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleMoveDown(category, index)}
                              disabled={index === categories.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(category)}
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
        )}
        
        {/* Formulário para criar/editar categoria */}
        {(isCreating || editingCategory) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </CardTitle>
              <CardDescription>
                {editingCategory
                  ? "Atualize os detalhes da categoria selecionada"
                  : "Preencha os detalhes para criar uma nova categoria"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da categoria" {...field} />
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
                            placeholder="Descrição opcional da categoria" 
                            {...field} 
                          />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={editingCategory ? handleCancelEdit : () => setIsCreating(false)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                    >
                      {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {editingCategory ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {/* Dialog de confirmação para excluir */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"?
                Esta ação também removerá todos os itens associados a esta categoria.
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
                disabled={deleteCategoryMutation.isPending}
              >
                {deleteCategoryMutation.isPending ? (
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