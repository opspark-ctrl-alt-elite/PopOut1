import Event from "../models/Event";
import Vendor from "../models/Vendor";
import { v4 as uuidv4 } from "uuid";

const seedEvents = async () => {
  try {
    // Fetch vendors first
    const vendors = await Vendor.findAll();
    if (vendors.length === 0) {
      console.log("No vendors found. Seed vendors first.");
      return;
    }

    const events = [
      {
        id: uuidv4(),
        vendor_id: vendors[0].id,
        title: "Summer Food Festival",
        description:
          "Enjoy a variety of delicious foods from different cuisines!",
        category: "Food & Drink",
        startDate: new Date("2025-06-15T12:00:00Z"),
        endDate: new Date("2025-06-15T20:00:00Z"),
        venue_name: "Central Park",
        latitude: 40.785091,
        longitude: -73.968285,
        isFree: true,
        isKidFriendly: true,
        isSober: false,
        image_url: "https://example.com/food-festival.jpg",
      },
      {
        id: uuidv4(),
        vendor_id: vendors[0].id,
        title: "Frenchmen Street PopUp",
        description: "Live music, art vendors, & street food.",
        category: "Art",
        startDate: new Date("2025-04-15T17:00:00Z"),
        endDate: new Date("2025-04-15T22:00:00Z"),
        venue_name: "Frenchmen Street",
        latitude: 29.96403,
        longitude: -90.05783,
        isFree: true,
        isKidFriendly: false,
        isSober: false,
        image_url: "https://example.com/frenchmen.jpg",
      },
    ];

    await Event.bulkCreate(events);
    console.log("Events seeded successfully.");
  } catch (error) {
    console.error("Error seeding events:", error);
  }
};

seedEvents();
