import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MexicanButton } from "@/components/ui/button-variant";
import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const reservationSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(9, "Telefone deve ter pelo menos 9 dígitos"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  guests: z.string().min(1, "Selecione o número de pessoas"),
  message: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      phone: "",
      date: "",
      time: "",
      guests: "",
      message: "",
    },
  });
  
  // WhatsApp link
  const whatsappLink = "https://wa.link/svsf4j";
  
  const mutation = useMutation({
    mutationFn: (data: ReservationFormData) => {
      return apiRequest("POST", "/api/reservations", data);
    },
    onSuccess: (_, variables) => {
      // Redirect to WhatsApp with reservation details
      const message = encodeURIComponent(
        `🌮 *Nova Reserva - Las Tortillas* 🌮\n\n` +
        `*Nome:* ${variables.name}\n` +
        `*Telefone:* ${variables.phone}\n` +
        `*Data:* ${variables.date}\n` +
        `*Hora:* ${variables.time}\n` +
        `*Pessoas:* ${variables.guests}\n` +
        `*Mensagem:* ${variables.message || 'Nenhuma'}\n\n` +
        `Obrigado pela sua reserva! Entraremos em contato para confirmar.`
      );
      
      // Open WhatsApp in a new tab
      window.open(`${whatsappLink}?text=${message}`, '_blank');
      
      toast({
        title: "Reserva enviada com sucesso!",
        description: "Você será redirecionado para WhatsApp para confirmar sua reserva.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar a reserva",
        description: error.message || "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReservationFormData) => {
    mutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
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
            Contacto
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
            Visite-nos ou faça a sua reserva
          </motion.p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="font-playfair text-2xl font-bold text-secondary mb-6">Informações de Contacto</h3>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-primary text-white p-3 rounded-full mr-4">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Endereço</h4>
                    <p className="text-gray-600">Avenida Murtala Mohamed, 234<br />Luanda, Angola</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-accent text-accent-foreground p-3 rounded-full mr-4">
                    <FaClock />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Horário de Funcionamento</h4>
                    <p className="text-gray-600">Segunda a Quinta: 12h - 23h<br />Sexta e Sábado: 12h - 00h<br />Domingo: 12h - 22h</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-secondary text-white p-3 rounded-full mr-4">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Telefone</h4>
                    <p className="text-gray-600">+244 923 456 789</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-primary text-white p-3 rounded-full mr-4">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Email</h4>
                    <p className="text-gray-600">reservas@lastortillas.co.ao</p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <h4 className="font-bold text-gray-800 mb-3">Siga-nos</h4>
                <div className="flex space-x-4">
                  <motion.a 
                    href="#" 
                    className="bg-secondary hover:bg-accent text-white hover:text-accent-foreground transition-colors duration-300 p-3 rounded-full"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <FaFacebookF />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="bg-primary hover:bg-accent text-white hover:text-accent-foreground transition-colors duration-300 p-3 rounded-full"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <FaInstagram />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="bg-accent hover:bg-secondary text-accent-foreground hover:text-white transition-colors duration-300 p-3 rounded-full"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <FaTwitter />
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="font-playfair text-2xl font-bold text-secondary mb-6">Faça a Sua Reserva</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="+244 9XX XXX XXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Pessoas</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o número de pessoas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 pessoa</SelectItem>
                            <SelectItem value="2">2 pessoas</SelectItem>
                            <SelectItem value="3">3 pessoas</SelectItem>
                            <SelectItem value="4">4 pessoas</SelectItem>
                            <SelectItem value="5">5 pessoas</SelectItem>
                            <SelectItem value="6">6 pessoas</SelectItem>
                            <SelectItem value="more">Mais de 6 pessoas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem ou Pedidos Especiais</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Compartilhe qualquer pedido especial que possa ter" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <MexicanButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Enviando..." : "Reservar Mesa"}
                    </MexicanButton>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
