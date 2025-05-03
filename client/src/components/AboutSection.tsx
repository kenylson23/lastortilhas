import { motion } from "framer-motion";
import { FaPepperHot, FaStar, FaUtensils } from "react-icons/fa";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
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
            Nossa História
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
            Descubra a autêntica culinária mexicana no coração de Angola
          </motion.p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-12">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Restaurante Las Tortillas interior" 
              className="rounded-lg shadow-xl hover-scale"
            />
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 mt-8 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <h3 className="font-playfair text-3xl text-secondary mb-6 relative inline-block">
                Paixão por Sabores
              </h3>
              <span className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-2xl">🌵</span>
              <span className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-2xl">🌵</span>
            </div>
            
            <motion.p 
              className="mb-4 text-gray-700"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Fundado em 2018, o <strong>Las Tortillas</strong> nasceu da paixão por compartilhar os autênticos sabores mexicanos com Angola. Nossa missão é criar uma experiência culinária que transporta nossos clientes para as coloridas ruas do México.
            </motion.p>
            
            <motion.p 
              className="mb-4 text-gray-700"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Cada prato é preparado com ingredientes frescos e técnicas tradicionais mexicanas, adaptadas com um toque especial para os paladares angolanos. Nossos chefs são treinados nas melhores técnicas da culinária mexicana.
            </motion.p>
            
            <motion.p 
              className="text-gray-700"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              O ambiente do restaurante é decorado com itens autênticos trazidos diretamente do México, criando uma atmosfera vibrante e acolhedora para todos os nossos clientes.
            </motion.p>
            
            <motion.div 
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <FaPepperHot className="text-secondary mr-2" />
                <span>Ingredientes Autênticos</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <FaStar className="text-accent mr-2" />
                <span>Ambiente Vibrante</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <FaUtensils className="text-primary mr-2" />
                <span>Receitas Tradicionais</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
