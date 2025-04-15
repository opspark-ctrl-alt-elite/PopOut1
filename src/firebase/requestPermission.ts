import { messaging } from './firebase';
import { getToken } from 'firebase/messaging';

export const requestNotificationPermission = async (userId: string) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BNHo2sx4OK0fXG7R5n7eAq1pk9VXS_OrvZMZAF2sXa3BfIuiEislDeRZkwIi4m4hAwH-z4I2Ci9sEoMjfx96WEQ',
      });

      if (token) {
        console.log('fcm token', token);

        await fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userId }),
        });
      } else {
        console.warn('no fcm token');
      }
    } else {
      console.warn('permission denied');
    }
  } catch (err) {
    console.error('notif permission err', err);
  }
};

// export const requestNotificationPermission = async () => {
//   try {
//     const permission = await Notification.requestPermission();

//     if (permission === 'granted') {
//       const token = await getToken(messaging, {
//         vapidKey: 'BNHo2sx4OK0fXG7R5n7eAq1pk9VXS_OrvZMZAF2sXa3BfIuiEislDeRZkwIi4m4hAwH-z4I2Ci9sEoMjfx96WEQ',
//       });

//       if (token) {
//         console.log('FCM token', token);
//       } else {
//         console.warn('no token');
//       }
//     } else {
//       console.warn('permission denied');
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };