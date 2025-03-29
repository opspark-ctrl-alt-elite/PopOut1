import Event from "../models/EventModel"; // Correct import
import Vendor from "../models/Vendor"; // Correct import
import { v4 as uuidv4 } from "uuid";

const seedEvents = async () => {
  try {
    // fetch vendors
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

      {
        id: uuidv4(),
        vendor_id: vendors[0].id,
        title: "NOLA Vibe Yoga",
        description: "The original social, pop-up yoga studio in New Orleans!",
        category: "Sports & Fitness",
        startDate: new Date("2025-05-08T08:00:00Z"),
        endDate: new Date("2025-05-08T09:30:00Z"),
        venue_name: "Hotel Peter & Paul",
        latitude: 29.966907845551024,
        longitude: -90.0551813502706,
        isFree: true,
        isKidFriendly: true,
        isSober: true,
        image_url: "https://example.com/yoga.jpg",
      },

      {
        id: uuidv4(),
        vendor_id: vendors[0].id,
        title: "Jam NOLA",
        description: "Enjoy 17 exhibits celebrating the iconic art, music, food and theatrics of New Orleans.",
        category: "Music",
        startDate: new Date("2025-05-14T19:00:00Z"),
        endDate: new Date("2025-05-14T23:00:00Z"),
        venue_name: "JAMNOLA",
        latitude: 29.96426016552257,
        longitude: -90.0490237588402,
        isFree: false,
        isKidFriendly: true,
        isSober: false,
        image_url: "https://example.com/jamnola.jpg",
      },

      {
        id: uuidv4(),
        vendor_id: vendors[0].id,
        title: "King Katsu",
        description: "Japanese inspired pop up.",
        category: "Food & Drink",
        startDate: new Date("2025-05-10T11:00:00Z"),
        endDate: new Date("2025-05-10T17:00:00Z"),
        venue_name: "Bar Redux",
        latitude: 29.96186569999901,
        longitude: -90.03218525705931,
        isFree: false,
        isKidFriendly: false,
        isSober: false,
        image_url: "https://example.com/kingkatsu.jpg",
      },



    ];

    await Event.bulkCreate(events);
    console.log("Events seeded successfully.");
  } catch (error) {
    console.error("Error seeding events:", error);
  }
};

seedEvents();
