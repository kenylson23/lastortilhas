/**
 * Script para adicionar dados de exemplo ao sistema
 */
import { db } from "./db";
import { menuCategories, menuItems } from "@shared/schema";

async function seedData() {
  console.log("Adicionando dados de exemplo...");
  
  try {
    // Adicionar categorias de menu
    const categories = await db.insert(menuCategories).values([
      {
        name: "Tacos",
        description: "Nossos famosos tacos mexicanos",
        order: 1,
        active: true
      },
      {
        name: "Burritos",
        description: "Burritos grandes e saborosos",
        order: 2,
        active: true
      },
      {
        name: "Quesadillas",
        description: "Quesadillas crocantes e deliciosas",
        order: 3,
        active: true
      },
      {
        name: "Bebidas",
        description: "Refrescos e bebidas especiais",
        order: 4,
        active: true
      }
    ]).returning();

    console.log("Categorias criadas:", categories.length);

    // Adicionar itens de menu
    const items = await db.insert(menuItems).values([
      // Tacos
      {
        name: "Taco de Carnitas",
        description: "Taco com carne de porco desfiada, cebola e coentro",
        price: 450.00,
        category_id: categories[0].id,
        spicy_level: 2,
        vegetarian: false,
        featured: true,
        order: 1,
        active: true
      },
      {
        name: "Taco de Pollo",
        description: "Taco com frango grelhado, alface e molho especial",
        price: 400.00,
        category_id: categories[0].id,
        spicy_level: 1,
        vegetarian: false,
        featured: false,
        order: 2,
        active: true
      },
      // Burritos
      {
        name: "Burrito Supremo",
        description: "Burrito com carne, feijão, arroz, queijo e molhos",
        price: 850.00,
        category_id: categories[1].id,
        spicy_level: 2,
        vegetarian: false,
        featured: true,
        order: 1,
        active: true
      },
      {
        name: "Burrito Vegetariano",
        description: "Burrito com feijão, arroz, vegetais e queijo",
        price: 750.00,
        category_id: categories[1].id,
        spicy_level: 1,
        vegetarian: true,
        featured: false,
        order: 2,
        active: true
      },
      // Quesadillas
      {
        name: "Quesadilla de Queijo",
        description: "Quesadilla clássica com queijo derretido",
        price: 650.00,
        category_id: categories[2].id,
        spicy_level: 0,
        vegetarian: true,
        featured: false,
        order: 1,
        active: true
      },
      // Bebidas
      {
        name: "Horchata",
        description: "Bebida tradicional mexicana com canela",
        price: 250.00,
        category_id: categories[3].id,
        spicy_level: 0,
        vegetarian: true,
        featured: false,
        order: 1,
        active: true
      },
      {
        name: "Agua de Jamaica",
        description: "Refrescante bebida de hibisco",
        price: 200.00,
        category_id: categories[3].id,
        spicy_level: 0,
        vegetarian: true,
        featured: false,
        order: 2,
        active: true
      }
    ]).returning();

    console.log("Itens de menu criados:", items.length);
    console.log("Dados de exemplo adicionados com sucesso!");
    
  } catch (error) {
    console.error("Erro ao adicionar dados de exemplo:", error);
    throw error;
  }
}

// Auto-execução da função principal
seedData()
  .then(() => {
    console.log("Script de dados de exemplo concluído");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Falha no script de dados de exemplo:", error);
    process.exit(1);
  });