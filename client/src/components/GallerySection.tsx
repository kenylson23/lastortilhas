import { motion } from "framer-motion";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Tacos variados",
  },
  {
    src: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Interior do restaurante",
  },
  {
    src: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Nachos com guacamole",
  },
  {
    src: "https://images.unsplash.com/photo-1603824255842-53e13ffbb072?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Decoração mexicana",
  },
  {
    src: "https://images.unsplash.com/photo-1574782561917-3aeb610a8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Burritos",
  },
  {
    src: "https://images.unsplash.com/photo-1564767655658-4e6b365884b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Cocktails mexicanos",
  },
  {
    src: "https://images.unsplash.com/photo-1579636849056-c3e0638ee00f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Tamales tradicionais",
  },
  {
    src: "https://images.unsplash.com/photo-1617692855027-33b14f061079?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    alt: "Música ao vivo",
  }
];

export default function GallerySection() {
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-lg h-40 md:h-60"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-full object-cover transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
