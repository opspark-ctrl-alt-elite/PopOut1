import sequelize from "../models/index";
import { QueryTypes } from "sequelize";
import { Router } from "express";
import Event from "../models/EventModel";

const router = Router();

// get all events on map
router.get("/api/map/events", async (req, res) => {
  try {
    const events = await Event.findAll({
      attributes: [
        "id",
        "title",
        "latitude",
        "longitude",
        "venue_name",
        "category",
      ],
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "err fetching events" });
  }
});


// get nearby events on map
router.get("/map/events/nearby", async (req, res) => {
  // get lat/lng
  const { lat, lng } = req.query;
  // invalid check
  if (!lat || !lng || Array.isArray(lat) || Array.isArray(lng)) {
    return res.status(400);
  }
  // convert to float
  const latFloat = parseFloat(lat as string);
  const lngFloat = parseFloat(lng as string);
  // filter distance
  const radiusInKm = 10;

  try {
    // sql query (raw sql for now)
    const events = await sequelize.query(
      `
      SELECT *, (
        6371 * acos(
          cos(radians(:lat)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(latitude))
        )
      ) AS distance
      FROM events
      HAVING distance < :radius
      ORDER BY distance;
      `,
      {
        // replacements
        replacements: { lat: latFloat, lng: lngFloat, radius: radiusInKm },
        type: QueryTypes.SELECT,
      }
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "err fetching nearby events" });
  }
});

export default router;
