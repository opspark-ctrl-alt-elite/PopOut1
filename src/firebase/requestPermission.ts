import { messaging } from './firebase';
import { getToken } from 'firebase/messaging';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BNHo2sx4OK0fXG7R5n7eAq1pk9VXS_OrvZMZAF2sXa3BfIuiEislDeRZkwIi4m4hAwH-z4I2Ci9sEoMjfx96WEQ',
      });

      if (token) {
        console.log('FCM token', token);
      } else {
        console.warn('no token');
      }
    } else {
      console.warn('permission denied');
    }
  } catch (err) {
    console.error(err);
  }
};
