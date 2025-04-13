import sequelize from "../models/index";
import { QueryTypes } from "sequelize";
import { Router } from "express";
import Event from "../models/EventModel";
import Category from "../models/Category";


const router = Router();

router.get("/events", async (req, res) => {
  try {
    const events = await Event.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "latitude",
        "longitude",
        "venue_name",
        "startDate",
        "endDate",
        "isFree",
        "isKidFriendly",
        "isSober",
      ],
      include: [
        {
          model: Category,
          attributes: ["name"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    res.json(events);
  } catch (err) {
    console.error("error crating event", err);
    res.status(500).json({ error: "load fail" });
  }
});


router.get("/events/nearby", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng || Array.isArray(lat) || Array.isArray(lng)) {
    return res.status(400).json({ error: "invalid coordinates" });
  }

  const latFloat = parseFloat(lat as string);
  const lngFloat = parseFloat(lng as string);
  const radiusInKm = 10;

  try {
    const events = await sequelize.query(
      `
      SELECT
        e.id,
        e.title,
        e.latitude,
        e.longitude,
        e.venue_name,
        e.description,
        c.id as category_id,
        c.name as category_name,
        e.startDate,
        (
          6371 * acos(
            cos(radians(:lat)) * cos(radians(e.latitude)) *
            cos(radians(e.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(e.latitude))
          )
        ) AS distance
      FROM events AS e
      LEFT JOIN EventCategories AS ec ON ec.eventId = e.id
      LEFT JOIN categories AS c ON c.id = ec.categoryId
      HAVING distance < :radius
      ORDER BY distance;
      `,
      {
        replacements: { lat: latFloat, lng: lngFloat, radius: radiusInKm },
        type: QueryTypes.SELECT,
      }
    );

    res.json(events);
  } catch (err) {
    console.error("err fetching nearby events", err);
    res.status(500).json({ error: "fail loading events" });
  }
});

// routes/mapRoutes.ts
// router.get("/map/events/nearby", async (req, res) => {
//   const { lat, lng } = req.query;

//   if (!lat || !lng || Array.isArray(lat) || Array.isArray(lng)) {
//     return res.status(400).json({ error: "Invalid coordinates" });
//   }

//   const latFloat = parseFloat(lat as string);
//   const lngFloat = parseFloat(lng as string);
//   const radiusInKm = 10;

//   try {
//     const events = await sequelize.query(
//       `
//       SELECT 
//         e.id,
//         e.title,
//         e.latitude,
//         e.longitude,
//         e.venue_name,
//         e.description,
//         c.id as category_id,
//         c.name as category_name,
//         e.startDate,
//         (
//           6371 * acos(
//             cos(radians(:lat)) * cos(radians(e.latitude)) *
//             cos(radians(e.longitude) - radians(:lng)) +
//             sin(radians(:lat)) * sin(radians(e.latitude))
//           )
//         ) AS distance
//       FROM events AS e
//       LEFT JOIN EventCategories AS ec ON ec.eventId = e.id
//       LEFT JOIN categories AS c ON c.id = ec.categoryId
//       HAVING distance < :radius
//       ORDER BY distance;
//       `,
//       {
//         replacements: { lat: latFloat, lng: lngFloat, radius: radiusInKm },
//         type: QueryTypes.SELECT,
//       }
//     );

//     res.json(events);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "err fetching nearby events" });
//   }
// });

export default router;
