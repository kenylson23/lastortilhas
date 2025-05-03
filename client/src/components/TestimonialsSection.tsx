import { motion } from "framer-motion";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    text: "A melhor comida mexicana que já experimentei em Angola. Os tacos al pastor são simplesmente extraordinários e o ambiente é incrível. Sinto-me no México quando estou aqui!",
    name: "Manuel Silva",
    title: "Visitante Frequente",
    rating: 5
  },
  {
    id: 2,
    text: "A combinação perfeita de autenticidade mexicana e hospitalidade angolana. As margaritas são as melhores da cidade e o serviço é sempre caloroso. Recomendo fortemente!",
    name: "Carla Mendes",
    title: "Crítica Gastronômica",
    rating: 4.5
  }
];

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="text-accent text-2xl flex">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={i} />
      ))}
      {hasHalfStar && <FaStarHalfAlt />}
    </div>
  );
};

export default function TestimonialsSection() {
  return (
    <section className="py-20 relative" style={{
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1548681528-6a5c45b66b42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover"
    }}>
      <div className="container mx-auto px-4 text-white">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="font-playfair text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            O Que Dizem Nossos Clientes
          </motion.h2>
          <motion.div 
            className="section-decorator mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.id}
              className="bg-white bg-opacity-10 p-8 rounded-lg backdrop-blur-sm max-w-md"
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + (index * 0.2) }}
            >
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + (index * 0.2) }}
              >
                {renderStars(testimonial.rating)}
              </motion.div>
              <motion.p 
                className="italic text-center mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.2) }}
              >
                "{testimonial.text}"
              </motion.p>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.7 + (index * 0.2) }}
              >
                <h4 className="font-bold">{testimonial.name}</h4>
                <p className="text-sm text-gray-300">{testimonial.title}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
