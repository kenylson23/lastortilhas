import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

// Define tipos de mídia
type MediaType = "image" | "video";

// Interface para itens da galeria
interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  src: string;
  type: MediaType;
  thumbnail?: string;
  order: number;
  active: boolean;
  created_at?: string;
}

// Dados de fallback caso a API falhe
const fallbackGalleryMedia: GalleryItem[] = [
  {
    id: 1,
    title: "Tacos variados",
    src: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    type: "image",
    order: 0,
    active: true
  },
  {
    id: 2,
    title: "Vídeo do restaurante Las Tortillas",
    src: "/videos/restaurante.mp4",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    order: 1,
    active: true
  }
];

export default function GallerySection() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Consulta para buscar itens da galeria
  const { 
    data: galleryData, 
    isLoading, 
    isError 
  } = useQuery<{status: string, data: GalleryItem[]}>({
    queryKey: ["/api/gallery"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Usar dados da API ou fallback se não houver dados
  const galleryItems = galleryData?.data?.length ? galleryData.data : fallbackGalleryMedia;

  // Função para abrir o diálogo com o vídeo
  const openVideoDialog = (videoSrc: string) => {
    setSelectedVideo(videoSrc);
    setDialogOpen(true);
  };

  return (
    <>
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-lg h-40 md:h-60 group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
              >
                {item.type === "image" ? (
                  // Renderiza imagem
                  <img 
                    src={item.src} 
                    alt={item.alt} 
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                ) : (
                  // Renderiza vídeo com thumbnail e botão play
                  <>
                    <img
                      src={item.thumbnail}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      onClick={() => openVideoDialog(item.src)}
                    >
                      <div className="bg-primary rounded-full p-3 text-white">
                        <FaPlay />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dialog para exibir o vídeo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black overflow-hidden">
          <div className="relative">
            <button 
              onClick={() => setDialogOpen(false)}
              className="absolute top-2 right-2 z-50 bg-primary text-white rounded-full p-2"
            >
              <FaTimes />
            </button>
            {selectedVideo && (
              <video 
                src={selectedVideo} 
                controls 
                autoPlay 
                className="w-full h-auto"
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
