import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut, CalendarRange } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "#home", label: "Início" },
  { href: "#about", label: "Sobre" },
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Galeria" },
  { href: "#contact", label: "Contacto" }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    // Use window.location for hash navigation within the same page
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth'
        });
      }
    } else {
      setLocation(href);
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-white/80"
    }`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/images/logo.jpg" 
            alt="Las Tortillas Logo" 
            className="h-12 w-12 mr-3 rounded-full border border-white shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-primary font-playfair font-bold text-2xl md:text-3xl">Las Tortillas</span>
            <span className="text-secondary text-xs italic">Sabor Mexicano em Angola</span>
          </div>
        </motion.div>
        
        {/* Desktop Navigation */}
        <motion.nav 
          className="hidden md:flex items-center space-x-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {navLinks.map((link, index) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="font-montserrat text-gray-800 hover:text-secondary transition-colors duration-300"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              {link.label}
            </motion.a>
          ))}

          {/* Botões de Login/Usuário */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-4">
                  <User className="h-4 w-4 mr-2" />
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Usuário administrador</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLocation("/minhas-reservas")}
                >
                  Minhas Reservas
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => setLocation("/admin")}
                  >
                    Painel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="text-red-500 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button 
                size="sm" 
                variant="default"
                onClick={() => setLocation("/auth")}
                className="bg-primary hover:bg-primary/90"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </motion.div>
          )}
        </motion.nav>
        
        {/* Mobile menu button & user menu */}
        <div className="md:hidden flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Usuário administrador</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLocation("/minhas-reservas")}
                >
                  Minhas Reservas
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => setLocation("/admin")}
                  >
                    Painel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="text-red-500 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => setLocation("/auth")}
              className="bg-primary hover:bg-primary/90"
            >
              <User className="h-4 w-4" />
            </Button>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-800 focus:outline-none"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden bg-white shadow-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="font-montserrat text-gray-800 hover:text-secondary transition-colors duration-300 py-2 border-b border-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  {link.label}
                </motion.a>
              ))}
              
              {/* Links de usuário logado ou link de login */}
              {user ? (
                <>
                  {/* Minhas Reservas */}
                  <motion.a
                    href="/minhas-reservas"
                    className="font-montserrat text-gray-800 hover:text-secondary transition-colors duration-300 py-2 border-b border-gray-100 flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                      setLocation("/minhas-reservas");
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * (navLinks.length + 1) }}
                  >
                    <CalendarRange className="h-4 w-4 mr-2" />
                    Minhas Reservas
                  </motion.a>
                  
                  {/* Painel Admin (apenas para administradores) */}
                  {user.role === "admin" && (
                    <motion.a
                      href="/admin"
                      className="font-montserrat text-primary font-semibold hover:text-primary/80 transition-colors duration-300 py-2 border-b border-gray-100 flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(false);
                        setLocation("/admin");
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * (navLinks.length + 2) }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Painel Admin
                    </motion.a>
                  )}
                  
                  {/* Logout */}
                  <motion.button
                    className="text-left font-montserrat text-red-500 hover:text-red-700 transition-colors duration-300 py-2 border-b border-gray-100 flex items-center"
                    onClick={() => {
                      logoutMutation.mutate();
                      setIsOpen(false);
                    }}
                    disabled={logoutMutation.isPending}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * (navLinks.length + 3) }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? "Saindo..." : "Logout"}
                  </motion.button>
                </>
              ) : (
                <motion.a
                  href="/auth"
                  className="font-montserrat text-primary hover:text-primary/80 transition-colors duration-300 py-2 border-b border-gray-100 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    setLocation("/auth");
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * (navLinks.length + 1) }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Login / Cadastro
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
