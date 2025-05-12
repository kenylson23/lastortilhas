import { useState } from "react";
import { motion } from "framer-motion";
import { FaPepperHot, FaStar, FaFire } from "react-icons/fa";
import { MexicanButton } from "./ui/button-variant";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { MenuItem } from "@shared/schema";

// Itens de fallback para quando não houverem dados do servidor
const fallbackMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Tacos al Pastor",
    type: "Main",
    description: "Tortillas de milho com carne de porco marinada, abacaxi, coentro e cebola",
    short_description: "Autênticos tacos mexicanos com carne marinada",
    price: 3500,
    spicy_level: 3,
    image: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    featured: true,
    category_id: 1,
    order: 0
  },
  {
    id: 2,
    name: "Guacamole Fresco",
    type: "Starter",
    description: "Abacate fresco amassado com tomate, cebola, coentro, limão e pimenta jalapeño",
    short_description: "Preparado na mesa para garantir frescor",
    price: 2800,
    spicy_level: 2,
    image: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    featured: true,
    category_id: 2,
    order: 0
  }
];

type FilterButton = {
  label: string;
  value: string;
};

const filterButtons: FilterButton[] = [
  { label: "Todos", value: "All" },
  { label: "Entradas", value: "Starter" },
  { label: "Pratos Principais", value: "Main" },
  { label: "Sobremesas", value: "Dessert" },
  { label: "Bebidas", value: "Drink" }
];

export default function MenuSection() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  
  // Consulta para buscar itens do menu
  const { 
    data: menuItemsData, 
    isLoading, 
    isError 
  } = useQuery<{status: string, data: MenuItem[]}>({
    queryKey: ["/api/menu/items"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Usar dados da API ou fallback se não houver dados
  const menuItems = menuItemsData?.data?.length ? menuItemsData.data : fallbackMenuItems;
  
  const filteredItems = activeFilter === "All" 
    ? menuItems 
    : menuItems.filter(item => item.type === activeFilter);
  
  return (
    <section id="menu" className="py-20 bg-gray-50">
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
            Nosso Menu
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
            Explore nossa seleção de pratos mexicanos autênticos, preparados com amor e tradição
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            {filterButtons.map((button, index) => (
              <motion.button 
                key={button.value}
                className={`py-2 px-6 rounded-full transition-all duration-300 ${
                  activeFilter === button.value 
                    ? "bg-primary text-white" 
                    : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"
                }`}
                onClick={() => setActiveFilter(button.value)}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
              >
                {button.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-red-500">Erro ao carregar o menu. Por favor, tente novamente mais tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="menu-item group relative rounded-xl overflow-hidden shadow-lg hover-scale"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-60 object-cover"
                />
                <div className="menu-overlay absolute inset-0 bg-primary bg-opacity-0 group-hover:bg-opacity-80 flex flex-col justify-center items-center p-6">
                  <h4 className="text-white font-playfair text-2xl font-bold mb-2">{item.name}</h4>
                  <p className="text-white text-center">{item.description}</p>
                  <p className="text-white font-bold mt-3">{item.price} Kz</p>
                </div>
                <div className="p-4 bg-white">
                  <h4 className="font-playfair text-xl font-bold text-secondary">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.short_description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-primary">{item.price} Kz</span>
                    <span className="text-accent">
                      {item.spicy_level > 0 ? (
                        Array(item.spicy_level).fill(0).map((_, i) => (
                          <FaFire key={i} className="inline-block ml-1" />
                        ))
                      ) : (
                        <FaStar className="inline-block" />
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <MexicanButton variant="secondary" size="lg">
            Ver Menu Completo
          </MexicanButton>
        </motion.div>
      </div>
    </section>
  );
}
