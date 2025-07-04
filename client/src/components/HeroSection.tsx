import { motion } from "framer-motion";
import { MexicanButton } from "./ui/button-variant";
import { FaChevronDown } from "react-icons/fa";
import { useEffect, useRef } from "react";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7; // Slow down the video for better visual effect
    }
  }, []);

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden"
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="text-center z-10 relative">
        <motion.div 
          className="text-white mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex justify-center mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src="/images/logo.jpg" 
              alt="Las Tortillas Logo" 
              className="w-40 h-40 rounded-full shadow-lg border-2 border-white" 
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
        className="absolute bottom-10 w-full text-center z-10"
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
