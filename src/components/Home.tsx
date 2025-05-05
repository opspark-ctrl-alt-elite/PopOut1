import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Container } from "@mui/material";
import EventsFeed from "./EventsFeed";
import TopVendorSpotlight from "./TopVendorSpotlight";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  is_vendor: boolean;
};

type Vendors = {
  id: string;
  businessName: string;
  email: string;
  profilePicture?: string;
  description: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}[];

type Captcha = {
  beatCaptcha: boolean;
  wantsToBeVendor: boolean;
};

type SpotlightVendor = {
  id: string;
  businessName: string;
  description: string;
  averageRating: number;
};

type Props = {
  user: User | null;
  vendors: Vendors | null;
  captcha: Captcha;
  setCaptcha: Function;
  notifications?: any[];
  unreadCount?: number;
  setUnreadCount?: Function;
  setNotifications?: Function;
};

const Home: React.FC<Props> = ({ user, vendors, captcha, setCaptcha }) => {
  const [spotlight, setSpotlight] = useState<SpotlightVendor[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/vendors/spotlight/top5", {
          withCredentials: true,
        });
        const data = Array.isArray(res.data) ? res.data : [];

        const withRatings = await Promise.all(
          data.map(async (vendor: any) => {
            try {
              const ratingRes = await axios.get(
                `/vendors/${vendor.id}/average-rating`
              );
              return {
                ...vendor,
                averageRating: parseFloat(ratingRes.data.averageRating) || 0,
              };
            } catch {
              return { ...vendor, averageRating: 0 };
            }
          })
        );
        setSpotlight(withRatings);
      } catch (err) {
        console.error("Error fetching spotlight:", err);
      }
    })();
  }, []);

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <EventsFeed user={user} />
        <TopVendorSpotlight vendors={spotlight} />
      </Container>
      {/* Footer removed here — now global in App.tsx */}
    </Box>
  );
};

export default Home;
