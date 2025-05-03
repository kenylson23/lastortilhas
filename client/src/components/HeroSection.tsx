import { motion } from "framer-motion";
import { MexicanButton } from "./ui/button-variant";
import { FaChevronDown } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1606509036992-4399d5c5afe4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
      }}
    >
      <div className="text-center">
        <motion.div 
          className="text-white mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex justify-center mb-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2313/2313906.png" 
              alt="Mexican hat icon" 
              className="w-20 h-20 opacity-80" 
            />
          </motion.div>
          <motion.h1 
            className="font-playfair text-5xl md:text-7xl font-bold mb-2 text-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Las Tortillas
          </motion.h1>
          <motion.div 
            className="section-decorator"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          <motion.p 
            className="font-montserrat text-xl md:text-2xl mt-4 italic text-shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Autêntico sabor mexicano em Angola
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <MexicanButton 
            variant="accent" 
            size="lg"
            onClick={() => {
              const menuSection = document.querySelector('#menu');
              if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Ver Nosso Menu
          </MexicanButton>
        </motion.div>
      </div>
      
      <motion.div 
        className="absolute bottom-10 w-full text-center"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <a 
          href="#about" 
          className="text-white inline-block"
          onClick={(e) => {
            e.preventDefault();
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <FaChevronDown className="text-2xl" />
        </a>
      </motion.div>
    </section>
  );
}
