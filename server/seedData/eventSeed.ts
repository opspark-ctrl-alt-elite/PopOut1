import Event from "../models/Event"; // Correct import
import Vendor from "../models/Vendor"; // Correct import
import { v4 as uuidv4 } from "uuid";

const seedEvents = async () => {
  try {
    // Fetch vendors first
    const vendors = await Vendor.findAll(); 
    if (vendors.length === 0) {
      console.log("No vendors found. Seed vendors first.");
      return;
    }

    // Event data to seed
    const events = [
      {
        id: uuidv4(),
        vendor_id: vendors[0].id, // Assuming vendor exists, first vendor for simplicity
        title: "Summer Food Festival",
        description: "Enjoy a variety of delicious foods from different cuisines!",
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
      // Add more event objects as needed
    ];

    // Bulk create the events
    await Event.bulkCreate(events);
    console.log("Events seeded successfully.");
  } catch (error) {
    console.error("Error seeding events:", error);
  }
};

// Execute the seeding
seedEvents();
