import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase/firebase";

const NotificationListener = () => {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("notif received", payload);

      const { title, body } = payload.notification || {};
      if (title && body) {
        new Notification(title, { body });
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default NotificationListener;