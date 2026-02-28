/**
 * Register custom push event handlers with the service worker
 * This script adds push notification handling to the auto-generated service worker
 */

export async function registerPushHandlers() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Send message to SW to set up push handlers
    if (registration.active) {
      registration.active.postMessage({
        type: 'SETUP_PUSH_HANDLERS'
      });
    }

    console.log('Push handlers registration message sent to Service Worker');
  } catch (err) {
    console.error('Failed to register push handlers:', err);
  }
}

/**
 * Push event data structure
 */
export const pushEventStructure = {
  // The service worker will receive push events with this structure
  // event.data.json() returns:
  // {
  //   title: string,
  //   body: string,
  //   taskId?: string,
  //   data?: object
  // }
};
