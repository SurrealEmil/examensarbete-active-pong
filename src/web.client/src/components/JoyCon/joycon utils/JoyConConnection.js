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

    for (const device of devices) {
      await device.open();
      connectedJoyCons.set(device.productId, device);
      // console.log(`Connected to ${device.productName} (ID: ${device.productId})`);
      // Additional setup like event listeners can be added here if needed
    }
  } catch (error) {
    // console.error('Failed to connect Joy-Con:', error);
    throw error;
  }
};
