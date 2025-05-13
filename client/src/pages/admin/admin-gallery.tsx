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
  Film,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { GalleryItem } from "@shared/schema";

// Esquema do formulário para itens da galeria
const galleryItemFormSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  src: z.string().min(5, "Forneça uma URL válida para a imagem"),
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
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
      thumbnail: "",
      type: "image",
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
      setThumbnailFile(null);
      setMediaPreview(null);
      setThumbnailPreview(null);
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
      
      // Não atualizar o formulário com uma URL temporária
      // O valor real será definido após o upload
      // form.setValue("src", objectUrl); // Remove esta linha para evitar URLs blob
    }
  };
  
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Criar uma URL temporária para visualização somente
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      
      // Não atualizar o formulário com URL temporária
      // O valor real será definido após o upload
      // form.setValue("thumbnail", objectUrl); // Remove esta linha para evitar URLs blob
    }
  };
  
  // Funções auxiliares
  const handleCreate = () => {
    // Limpar qualquer preview e arquivos anteriores
    setMediaFile(null);
    setThumbnailFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setMediaPreview(null);
    setThumbnailPreview(null);
    
    setIsCreating(true);
    form.reset({
      title: "",
      description: "",
      src: "",
      thumbnail: "",
      type: "image",
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
      thumbnail: item.thumbnail || "",
      type: item.type as "image" | "video",
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
    // Processar upload dos arquivos antes de enviar o form
    let formData = new FormData();
    
    // Upload do arquivo principal (imagem ou vídeo)
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
        // Atualiza o URL da imagem/vídeo com o URL retornado pelo servidor
        data.src = uploadResult.data.url;
      } catch (error: any) {
        toast({
          title: "Erro no upload",
          description: error.message || "Não foi possível fazer upload do arquivo",
          variant: "destructive"
        });
        return; // Interrompe o envio do formulário
      }
    }
    
    // Upload da miniatura (para vídeos)
    if (thumbnailFile) {
      formData = new FormData(); // Reset form data
      formData.append("file", thumbnailFile);
      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || "Falha ao fazer upload da miniatura");
        }
        
        const uploadResult = await uploadResponse.json();
        // Atualiza o URL da miniatura com o URL retornado pelo servidor
        data.thumbnail = uploadResult.data.url;
      } catch (error: any) {
        toast({
          title: "Erro no upload da miniatura",
          description: error.message || "Não foi possível fazer upload da miniatura",
          variant: "destructive"
        });
        return; // Interrompe o envio do formulário
      }
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
              Gerencie os itens da galeria do restaurante
            </p>
          </div>
          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>
        
        {isGalleryLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Itens da Galeria</CardTitle>
              <CardDescription>
                Gerenciar imagens e vídeos que aparecem na galeria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Ordem</TableHead>
                    <TableHead className="w-[60px]">Tipo</TableHead>
                    <TableHead>Miniatura</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {galleryItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Nenhum item encontrado na galeria
                      </TableCell>
                    </TableRow>
                  ) : (
                    galleryItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.order}</TableCell>
                        <TableCell>
                          {item.type === "image" ? (
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Film className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                            {item.type === "image" ? (
                              <img
                                src={item.src}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <img
                                src={item.thumbnail || "https://placehold.co/100x80?text=Video"}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            )}
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
                              className={item.active ? "text-green-600" : "text-red-600"}
                            >
                              {item.active ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
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
        )}
        
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
                  : "Preencha os detalhes para adicionar um novo item à galeria"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input placeholder="Título do item" {...field} />
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
                                placeholder="Descrição (opcional)"
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
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="image">Imagem</SelectItem>
                                <SelectItem value="video">Vídeo</SelectItem>
                              </SelectContent>
                            </Select>
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
                              Ordem de exibição na galeria (menor valor aparece primeiro)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="src"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {form.watch("type") === "image" ? "Imagem" : "Vídeo"}
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <div className="flex space-x-2">
                                  <Input 
                                    placeholder={form.watch("type") === "image" 
                                      ? "URL da imagem" 
                                      : "URL do vídeo"}
                                    value={value || ''}
                                    onChange={onChange}
                                    {...field} 
                                  />
                                  <span className="text-gray-400">ou</span>
                                </div>
                                
                                <div 
                                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => mediaInputRef.current?.click()}
                                >
                                  <input 
                                    type="file"
                                    accept={form.watch("type") === "image" ? "image/*" : "video/*"}
                                    ref={mediaInputRef}
                                    className="hidden"
                                    onChange={handleMediaFileChange}
                                  />
                                  
                                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">
                                    Clique para fazer upload de {form.watch("type") === "image" ? "uma imagem" : "um vídeo"}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {form.watch("type") === "image" 
                                      ? "PNG, JPG ou GIF até 5MB" 
                                      : "MP4, WEBM ou MOV até 20MB"}
                                  </p>
                                </div>
                                
                                {value && (
                                  <div className="mt-2">
                                    {form.watch("type") === "image" ? (
                                      <img 
                                        src={value} 
                                        alt="Preview" 
                                        className="max-h-40 rounded-md mx-auto" 
                                      />
                                    ) : (
                                      <video 
                                        src={value} 
                                        controls 
                                        className="max-h-40 w-full rounded-md" 
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              {form.watch("type") === "image" 
                                ? "Selecione uma imagem do seu dispositivo ou insira uma URL"
                                : "Selecione um vídeo do seu dispositivo ou insira uma URL"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("type") === "video" && (
                        <FormField
                          control={form.control}
                          name="thumbnail"
                          render={({ field: { value, onChange, onBlur, name, ref } }) => (
                            <FormItem>
                              <FormLabel>Miniatura do Vídeo (Thumbnail)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex space-x-2">
                                    <Input 
                                      placeholder="URL da imagem de miniatura"
                                      value={value || ''}
                                      onChange={onChange}
                                      onBlur={onBlur}
                                      name={name}
                                      ref={ref}
                                    />
                                    <span className="text-gray-400">ou</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-primary transition-colors">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const fileURL = URL.createObjectURL(e.target.files[0]);
                                          onChange(fileURL);
                                          
                                          // Salvar o arquivo para referência
                                          setUploadedThumbnail(e.target.files[0]);
                                        }
                                      }}
                                      className="cursor-pointer"
                                    />
                                  </div>
                                  
                                  {value && (
                                    <div className="mt-2">
                                      <img 
                                        src={value} 
                                        alt="Preview da miniatura" 
                                        className="max-h-40 rounded-md mx-auto" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormDescription>
                                Imagem que será exibida antes do vídeo ser reproduzido
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Ativo</FormLabel>
                              <FormDescription>
                                Mostrar este item na galeria pública?
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
                      
                      {/* Pré-visualização */}
                      {form.watch("src") && (
                        <div className="mt-4 border rounded-md p-3">
                          <h4 className="text-sm font-medium mb-2">Pré-visualização</h4>
                          {form.watch("type") === "image" ? (
                            <div className="relative h-[200px] w-full overflow-hidden rounded-md border bg-muted">
                              <img
                                src={form.watch("src")}
                                alt="Preview"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Erro+na+imagem";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="text-center p-4 text-muted-foreground">
                              <Film className="h-12 w-12 mx-auto mb-2" />
                              <p>Vídeo será reproduzido na galeria</p>
                              {form.watch("thumbnail") && (
                                <div className="mt-2 relative h-[120px] overflow-hidden rounded-md border bg-muted">
                                  <img
                                    src={form.watch("thumbnail")}
                                    alt="Thumbnail Preview"
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Erro+no+thumbnail";
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
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
                      disabled={createGalleryItemMutation.isPending || updateGalleryItemMutation.isPending}
                    >
                      {(createGalleryItemMutation.isPending || updateGalleryItemMutation.isPending) ? (
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
        
        {/* Dialog de confirmação para excluir */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o item "{itemToDelete?.title}"?
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
                disabled={deleteGalleryItemMutation.isPending}
              >
                {deleteGalleryItemMutation.isPending ? (
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