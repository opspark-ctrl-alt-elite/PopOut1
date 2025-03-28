import { v4 as uuidv4 } from "uuid";
import Vendor from "../models/Vendor";
import User from "../models/User";

const vendorData = [
  {
    businessName: 'Café Delight',
    email: 'contact@cafedelight.com',
    description: 'A cozy café offering freshly brewed coffee and pastries.',
    profilePicture: 'https://example.com/cafe-delight.jpg',
    website: 'https://cafedelight.com',
    instagram: '@cafedelight',
    facebook: 'cafedelight',
    userId: null as string | null,
  },
  {
    businessName: 'Gourmet Grill',
    email: 'contact@gourmetgrill.com',
    description: 'The finest grilled steaks and seafood in town.',
    profilePicture: 'https://example.com/gourmet-grill.jpg',
    website: 'https://gourmetgrill.com',
    instagram: '@gourmetgrill',
    facebook: 'gourmetgrill',
    userId: null as string | null,
  },
  {
    businessName: 'Artisan Craftworks',
    email: 'info@artisancraftworks.com',
    description: 'Handcrafted pottery and home decor.',
    profilePicture: 'https://example.com/artisan-craftworks.jpg',
    website: 'https://artisancraftworks.com',
    instagram: '@artisancraftworks',
    facebook: 'artisancraftworks',
    userId: null as string | null,
  }
];


const seedVendors = async () => {
  try {
    const users = await User.findAll();

    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      return;
    }

    vendorData.forEach((vendor, index) => {
      vendor.userId = users[index]?.id || users[0]?.id;
    });

    await Vendor.bulkCreate(vendorData);
    console.log('Vendors seeded successfully.');
  } catch (error) {
    console.error('Error seeding vendors:', error);
  }
};

seedVendors();

