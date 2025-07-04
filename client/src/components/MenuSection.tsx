import { useState } from "react";
import { motion } from "framer-motion";
import { FaPepperHot, FaStar, FaFire } from "react-icons/fa";
import { MexicanButton } from "./ui/button-variant";
import { Loader2, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { MenuItem, MenuCategory } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

type FilterButton = {
  label: string;
  value: string;
};

export default function MenuSection() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const { user } = useAuth();
  
  // Consulta para buscar categorias do menu
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading
  } = useQuery<{status: string, data: MenuCategory[]}>({
    queryKey: ["/api/menu/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Consulta para buscar itens do menu
  const { 
    data: menuItemsData, 
    isLoading: isMenuItemsLoading, 
    isError 
  } = useQuery<{status: string, data: MenuItem[]}>({
    queryKey: ["/api/menu/items"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Usar apenas dados da API
  const categories = categoriesData?.data || [];
  const menuItems = menuItemsData?.data || [];
  
  // Criar buttons para filtro dinâmico baseado nas categorias
  const filterButtons: FilterButton[] = [
    { label: "Todos", value: "All" },
    ...categories.map(category => ({
      label: category.name,
      value: category.id.toString()
    }))
  ];
  
  const filteredItems = activeFilter === "All" 
    ? menuItems 
    : menuItems.filter((item: MenuItem) => item.category_id.toString() === activeFilter);
    
  const isAdmin = user?.role === "admin";
  
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
        
        {isMenuItemsLoading || isCategoriesLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : isError || !menuItems ? (
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
                      {(item.spicy_level || 0) > 0 ? (
                        Array(item.spicy_level || 0).fill(0).map((_, i) => (
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
          className="text-center mt-12 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <MexicanButton variant="secondary" size="lg">
            Ver Menu Completo
          </MexicanButton>
          
          {isAdmin && (
            <Link to="/admin/menu">
              <motion.button 
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Settings size={16} />
                <span>Gerenciar Menu no Painel Admin</span>
              </motion.button>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
