// src/components/JoyCon/JoyConConnection.js

export const connectedJoyCons = new Map();

/**
 * connectJoyCon
 * Prompts the user to select Joy-Con devices and establishes connections.
 */
export const connectJoyCon = async () => {
  if (!navigator.hid) {
    throw new Error('WebHID API is not supported in this browser.');
  }

  try {
    // console.log('Requesting Joy-Con devices from the user...');
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }], // Nintendo's Vendor ID
    });

    if (devices.length === 0) {
      throw new Error('No Joy-Con devices selected.');
    }

 // Open all devices in parallel
    await Promise.all(
      devices.map(async (device) => {
        await device.open();
        connectedJoyCons.set(device.productId, device);
        // Optional: console.log(`Connected to ${device.productName} (ID: ${device.productId})`);
      })
    );
  } catch (error) {
    console.error('Failed to connect Joy-Con:', error);
    throw error;
  }
};
