import { User } from "../models/User";
import Category from "../models/Category";

const seedUser = async () => {
  try {
    const categories = await Category.findAll();

    if (categories.length === 0) {
      console.log("seed categories");
      return;
    }
   
    const categoryMap: { [key: string]: Category } = categories.reduce((acc, category) => {
      acc[category.name] = category;
      return acc;
    }, {} as { [key: string]: Category });

    const user = await User.create({
      google_id: "google-id-example",
      email: "user@example.com",
      name: "John Doe",
      profile_picture: "https://example.com/profile.jpg",
      location: "New Orleans",
      is_vendor: false,
      categories: [categoryMap["Food & Drink"]],
    });

    console.log("user seeded");
  } catch (error) {
    console.error("err seeding user", error);
  }
};

seedUser();