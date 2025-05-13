import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

// Interface para itens da galeria
interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  src: string;
  order: number;
  active: boolean;
  created_at?: string;
}

export default function GallerySection() {
  const { user } = useAuth();
  
  // Consulta para buscar itens da galeria
  const { 
    data: galleryData, 
    isLoading
  } = useQuery<{status: string, data: GalleryItem[]}>({
    queryKey: ["/api/gallery"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Usar apenas dados da API
  const galleryItems = galleryData?.data || [];
  
  const isAdmin = user?.role === "admin";

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Nossa Galeria
          </motion.h2>
          <motion.div 
            className="section-decorator mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.p 
            className="text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Explore a atmosfera vibrante e os pratos coloridos do Las Tortillas
          </motion.p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Carregando galeria...</span>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma imagem na galeria disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item: GalleryItem, index: number) => (
              <motion.div
                key={item.id}
                className="relative overflow-hidden rounded-lg h-40 md:h-60 group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={item.src} 
                  alt={item.title || "Imagem da galeria"} 
                  className="w-full h-full object-cover transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Erro+na+imagem";
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {isAdmin && (
          <div className="flex justify-center mt-8">
            <Link to="/admin/gallery">
              <motion.button 
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Settings size={16} />
                <span>Gerenciar Galeria</span>
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}