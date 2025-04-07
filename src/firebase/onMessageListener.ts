import { messaging } from './firebase';
import { onMessage } from 'firebase/messaging';

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
