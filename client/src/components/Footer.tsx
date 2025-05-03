import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const footerLinks = [
  { href: "#home", label: "Início" },
  { href: "#about", label: "Sobre" },
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Galeria" },
  { href: "#contact", label: "Contacto" }
];

const socialLinks = [
  { icon: <FaFacebookF />, href: "#", color: "bg-white text-primary hover:bg-accent" },
  { icon: <FaInstagram />, href: "#", color: "bg-white text-primary hover:bg-accent" },
  { icon: <FaTwitter />, href: "#", color: "bg-white text-primary hover:bg-accent" }
];

export default function Footer() {
  const handleClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <footer className="bg-primary text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-6 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-playfair text-2xl font-bold">Las Tortillas</h3>
            <p className="text-white text-opacity-80 mt-2">Autêntico sabor mexicano em Angola</p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {footerLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                className="text-white hover:text-accent transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(link.href);
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
          
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                className={`${link.color} transition-colors duration-300 p-2 rounded-full`}
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                {link.icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          className="border-t border-white border-opacity-20 mt-8 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-white text-opacity-80">&copy; {new Date().getFullYear()} Las Tortillas - Todos os direitos reservados</p>
        </motion.div>
      </div>
    </footer>
  );
}
