import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  Image as ImageIcon,
  Link,
  MoveUp,
  MoveDown,
  CheckCircle,
  XCircle,
  Upload
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { GalleryItem } from "@shared/schema";

// Esquema do formulário para itens da galeria
const galleryItemFormSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  src: z.string().optional(), // Permite que o campo seja preenchido pelo upload
  order: z.coerce.number().min(0),
  active: z.boolean().default(true),
});

type GalleryItemFormValues = z.infer<typeof galleryItemFormSchema>;

export default function AdminGallery() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta para buscar itens da galeria
  const { 
    data: galleryData, 
    isLoading: isGalleryLoading 
  } = useQuery<{status: string, data: GalleryItem[]}>({
    queryKey: ["/api/admin/gallery"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const galleryItems = galleryData?.data || [];
  
  // Formulário para criar/editar itens
  const form = useForm<GalleryItemFormValues>({
    resolver: zodResolver(galleryItemFormSchema),
    defaultValues: {
      title: "",
      description: "",
      src: "",
      order: 0,
      active: true
    }
  });
  
  // Mutations
  const createGalleryItemMutation = useMutation({
    mutationFn: async (data: GalleryItemFormValues) => {
      const response = await apiRequest("POST", "/api/admin/gallery", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      setIsCreating(false);
      setMediaFile(null);
      setMediaPreview(null);
      form.reset();
      toast({
        title: "Item criado com sucesso",
        description: "O item foi adicionado à galeria."
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
  
  const updateGalleryItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<GalleryItemFormValues> }) => {
      const response = await apiRequest("PUT", `/api/admin/gallery/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
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
  
  const deleteGalleryItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/gallery/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Item excluído com sucesso",
        description: "O item foi removido da galeria."
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
  
  // Funções para gerenciar uploads
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      // Criar uma URL temporária para visualização somente
      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
    }
  };
  
  // Funções auxiliares
  const handleCreate = () => {
    // Limpar qualquer preview e arquivos anteriores
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    
    setIsCreating(true);
    form.reset({
      title: "",
      description: "",
      src: "",
      order: galleryItems.length,
      active: true
    });
  };
  
  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description || "",
      src: item.src,
      order: item.order || 0,
      active: !!item.active
    });
  };
  
  const handleDelete = (item: GalleryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };
  
  const handleCancelEdit = () => {
    setEditingItem(null);
    form.reset();
  };
  
  const onSubmit = async (data: GalleryItemFormValues) => {
    // Verificar se já existe um src (URL de imagem) ou se temos um arquivo para upload
    if (!data.src && !mediaFile && !editingItem) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, faça upload de uma imagem antes de enviar o formulário",
        variant: "destructive"
      });
      return; // Interrompe o envio do formulário
    }
    
    // Processar upload dos arquivos antes de enviar o form
    let formData = new FormData();
    
    // Upload do arquivo principal (imagem)
    if (mediaFile) {
      formData.append("file", mediaFile);
      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || "Falha ao fazer upload do arquivo");
        }
        
        const uploadResult = await uploadResponse.json();
        // Atualiza o URL da imagem com o URL retornado pelo servidor
        data.src = uploadResult.data.url;
        
        console.log("Upload realizado com sucesso, URL da imagem:", data.src);
      } catch (error: any) {
        toast({
          title: "Erro no upload",
          description: error.message || "Não foi possível fazer upload do arquivo",
          variant: "destructive"
        });
        return; // Interrompe o envio do formulário
      }
    }
    
    // Verificar novamente se temos uma URL após o upload
    if (!data.src) {
      toast({
        title: "URL da imagem não definida",
        description: "Ocorreu um erro ao processar a imagem",
        variant: "destructive"
      });
      return;
    }
    
    // Agora envia o formulário com as URLs atualizadas
    if (editingItem) {
      updateGalleryItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createGalleryItemMutation.mutate(data);
    }
  };
  
  const confirmDelete = () => {
    if (itemToDelete) {
      deleteGalleryItemMutation.mutate(itemToDelete.id);
    }
  };

  const handleMoveUp = (item: GalleryItem, index: number) => {
    if (index > 0) {
      const newOrder = galleryItems[index - 1].order || 0;
      updateGalleryItemMutation.mutate({ 
        id: item.id, 
        data: { order: newOrder } 
      });
    }
  };
  
  const handleMoveDown = (item: GalleryItem, index: number) => {
    if (index < galleryItems.length - 1) {
      const newOrder = galleryItems[index + 1].order || 0;
      updateGalleryItemMutation.mutate({ 
        id: item.id, 
        data: { order: newOrder } 
      });
    }
  };

  const handleToggleActive = (item: GalleryItem) => {
    updateGalleryItemMutation.mutate({ 
      id: item.id, 
      data: { active: !item.active } 
    });
  };
  
  // Renderização
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Galeria</h1>
            <p className="text-muted-foreground">
              Gerencie as imagens da galeria do restaurante
            </p>
          </div>
          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Imagem
          </Button>
        </div>
        
        {isGalleryLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Imagens da Galeria</CardTitle>
              <CardDescription>
                Gerenciar imagens que aparecem na galeria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Ordem</TableHead>
                    <TableHead>Miniatura</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {galleryItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Nenhuma imagem encontrada na galeria
                      </TableCell>
                    </TableRow>
                  ) : (
                    galleryItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.order}</TableCell>
                        <TableCell>
                          <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                            <img
                              src={item.src}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/160x120?text=Erro";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              item.active 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {item.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleMoveUp(item, index)}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleMoveDown(item, index)}
                              disabled={index === galleryItems.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleToggleActive(item)}
                            >
                              {item.active ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
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
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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
        
        {/* Modal para criar/editar item */}
        <Dialog 
          open={isCreating || !!editingItem} 
          onOpenChange={(open) => {
            if (!open) {
              setIsCreating(false);
              setEditingItem(null);
              if (mediaPreview) URL.revokeObjectURL(mediaPreview);
              setMediaPreview(null);
              setMediaFile(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Imagem" : "Nova Imagem"}</DialogTitle>
              <DialogDescription>
                {editingItem 
                  ? "Atualize as informações da imagem da galeria" 
                  : "Adicione uma nova imagem à galeria"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Título */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o título da imagem" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição opcional da imagem"
                          className="resize-none" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Upload da imagem */}
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Imagem</Label>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-gray-300 p-2">
                      <label 
                        htmlFor="image-upload" 
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                      >
                        <input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          ref={mediaInputRef}
                          onChange={handleMediaFileChange}
                          accept="image/*"
                        />
                        {!mediaPreview && !editingItem?.src && (
                          <>
                            <Upload className="h-6 w-6 mb-2 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              Clique para fazer upload de uma imagem
                            </p>
                          </>
                        )}
                        
                        {mediaPreview && (
                          <div className="relative w-full h-full">
                            <img
                              src={mediaPreview}
                              alt="Preview"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Erro+na+imagem";
                              }}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-0 right-0 h-6 w-6"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (mediaPreview) URL.revokeObjectURL(mediaPreview);
                                setMediaPreview(null);
                                setMediaFile(null);
                                if (mediaInputRef.current) mediaInputRef.current.value = "";
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {!mediaPreview && editingItem?.src && (
                          <div className="relative w-full h-full">
                            <img
                              src={editingItem.src}
                              alt={editingItem.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Erro+na+imagem";
                              }}
                            />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  {form.formState.errors.src && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.src.message}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Ordem */}
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Ordem</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="1" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Ativo */}
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Ativo
                          </FormLabel>
                          <FormDescription>
                            Mostrar na galeria
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setEditingItem(null);
                      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
                      setMediaPreview(null);
                      setMediaFile(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createGalleryItemMutation.isPending || updateGalleryItemMutation.isPending}
                  >
                    {(createGalleryItemMutation.isPending || updateGalleryItemMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingItem ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Modal de confirmação de exclusão */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a imagem "{itemToDelete?.title}"?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteGalleryItemMutation.isPending}
              >
                {deleteGalleryItemMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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