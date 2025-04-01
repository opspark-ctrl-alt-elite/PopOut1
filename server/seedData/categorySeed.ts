import Category from "../models/Category";
import { v4 as uuidv4 } from "uuid";

const seedCategories = async () => {
  try {
    const categories = [
      { id: 1, name: "Food & Drink" },
      { id: 2, name: "Art" },
      { id: 3, name: "Music" },
      { id: 4, name: "Sports & Fitness" },
      { id: 5, name: "Hobbies" }
    ];

    await Category.bulkCreate(categories);
    console.log("categories seeded");
  } catch (error) {
    console.error("err seeding categories", error);
  }
};

seedCategories();