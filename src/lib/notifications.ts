import { goto } from '$app/navigation';


function urlBase64ToUint8Array(base64String) {
	// Add padding if necessary
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
	  // Convert URL-safe chars to standard Base64
	  .replace(/-/g, '+')
	  .replace(/_/g, '/');
  
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
  
	for (let i = 0; i < rawData.length; ++i) {
	  outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
  }

  
export async function requestNotificationPermission() {
  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }
  // Check the current permission status
  if (Notification.permission === 'granted') {
    return true;
  }
  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}


export function sendNotification(
    title: string,
    options?: NotificationOptions & { iconSize?: number; url?: string }
) {
    // Only send if permission is granted
    if (Notification.permission === 'granted') {
        // Extract custom properties and remaining NotificationOptions
        const { iconSize, url, ...notificationOptions } = options || {};

        const notification = new Notification(title, {
            icon: "/pwa-192x192.png",
            ...notificationOptions // Spread only valid NotificationOptions
        });

        // Navigate when the notification is clicked
        if (url) {
            notification.onclick = () => {
                window.focus(); // Ensure the window is focused
                goto(url); // Client-side navigation
            };
        }
    }
}


export async function unsubscribe() {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			if (subscription) {
				const res = await fetch('/api/deletePushSubscription', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					},
				});
				await subscription.unsubscribe();
			}
		}
	}

async function sendSubscriptionToServer(subscription) {
		try {
			const response = await fetch('/api/addPushSubscription', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ subscription })
			});

			const output = await response?.json()
			return output;
			
		} catch (error) {
			console.error('Error saving subscription on server:', error);
			unsubscribe();
		}
	}

	export async function subscribeUser() {
		if (!('serviceWorker' in navigator)) return { success: false };
	  
		try {
		  // Immediately register and use the returned registration instead of waiting for `.ready`
		  const registration = await navigator.serviceWorker.register('/service-worker.js');
	  
		  // Convert the VAPID key string to Uint8Array:
		  const vapidKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY);
	  
		  const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: vapidKey
		  });
	  
		  const output = await sendSubscriptionToServer(subscription);
		  return output;
		} catch (err) {
		  console.error('Error subscribing:', err);
		  return { success: false };
		}
	  }
	  

export async function checkSubscriptionStatus() {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;

			const subscription = await registration.pushManager.getSubscription();
			//console.log('check Subscription:', subscription);
			const exists = subscription !== null;
      //this can be optional
			if (exists) {
				// just to make sure the subscription is saved on the server
				//sendSubscriptionToServer(subscription);
			}
			return exists;
		}
		return false;
	}
