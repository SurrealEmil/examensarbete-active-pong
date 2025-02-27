// src/components/JoyCon/index.js

import { JoyConLeft, JoyConRight, GeneralController } from './joycon utils/joycon';

const connectedJoyCons = new Map();
const devices = [];

/**
 * Retrieves a unique ID for each device.
 * @param {HIDDevice} device 
 * @returns {number}
 */
const getDeviceID = (device) => {
  const n = devices.indexOf(device);
  if (n >= 0) {
    return n;
  }
  devices.push(device);
  return devices.length - 1;
};

/**
 * Adds a device to the connectedJoyCons map.
 * @param {HIDDevice} device 
 */
const addDevice = async (device) => {
  const id = getDeviceID(device);
  console.log(`✅ Joy-Con Connected: ${device.productName} (ID: ${device.productId.toString(16)})`);
  console.log("Attempting to add devices: ", device.productName, device.productId.toString(16))

  connectedJoyCons.set(id, await connectDevice(device));

  // Dispatch custom event for UI updates
  document.dispatchEvent(new CustomEvent('joyconconnected', { detail: { device } }));
};

/**
 * Removes a device from the connectedJoyCons map.
 * @param {HIDDevice} device 
 */
const removeDevice = async (device) => {
  const id = getDeviceID(device);
  console.log(`❌ Joy-Con Disconnected: ${device.productName} (ID: ${device.productId.toString(16)})`);

  connectedJoyCons.delete(id);

  // Dispatch custom event for UI updates
  document.dispatchEvent(new CustomEvent('joycondisconnected', { detail: { device } }));
};

// Event listeners for automatic device connection/disconnection
navigator.hid.addEventListener('connect', async ({ device }) => {
  if (device.vendorId === 0x057e) await addDevice(device);
});

navigator.hid.addEventListener('disconnect', async ({ device }) => {
  if (device.vendorId === 0x057e) await removeDevice(device);
});

/**
 * Initializes existing Joy-Cons on page load.
 */
const initializeDevices = async () => {
  try {
    const existingDevices = await navigator.hid.getDevices();
    console.log("Available HD Devices: ", existingDevices)

    // Filter only Joy-Cons that are not already connected
    const unpairedDevices = existingDevices.filter(device => 
      device.vendorId === 0x057e && !connectedJoyCons.has(getDeviceID(device))
    );

    for (const device of unpairedDevices) {
      await addDevice(device);
    }

    // If no unpaired Joy-Cons were found, ask the user to connect new ones
    if (unpairedDevices.length === 0) {
      console.log('🔍 No previously paired Joy-Cons found. Prompting user for new ones...');
      await connectNewJoyCons();  // Ensure this function exists
    }
  } catch (error) {
    console.error('⚠️ Error initializing Joy-Con devices:', error);
  }
};

// Automatically initialize Joy-Cons when the module is loaded
initializeDevices();

/**
 * Connects Joy-Con devices. If already authorized, it auto-connects. Otherwise, prompts the user.
 */
const connectJoyCon = async () => {
  try {
    // Check if Joy-Cons are already authorized
    const existingDevices = await navigator.hid.getDevices();
    const joyCons = existingDevices.filter(device => device.vendorId === 0x057e);

    if (joyCons.length > 0) {
      console.log('🔄 Auto-connecting previously authorized Joy-Cons...');
      for (const device of joyCons) {
        await addDevice(device);
      }
      return;
    }

    // If no existing Joy-Con is found, prompt the user to select one
    console.log('🕹️ Requesting Joy-Con connection...');
    const selectedDevices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }],
      multiple: true, // Allow selecting multiple new Joy-Cons at once
    });
    console.log("Selected devices: ", selectedDevices)

    if (selectedDevices.length === 0) {
      console.log('⚠️ No Joy-Con devices selected.');
      return;
    }

    for (const device of selectedDevices) {
      await addDevice(device);
    }
  } catch (error) {
    console.error('❌ Error connecting Joy-Con:', error);
  }
};

/**
 * Allows the user to connect **new** Joy-Cons (ignores already connected ones).
 */
const connectNewJoyCons = async () => {
  try {
    console.log('🔄 Searching for new Joy-Cons...');

    // Request new Joy-Cons
    const selectedDevices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }], // Nintendo Vendor ID
      multiple: true, // Allow multiple selection
    });

    if (selectedDevices.length === 0) {
      console.log('⚠️ No new Joy-Con devices selected.');
      return;
    }

    for (const device of selectedDevices) {
      if (!connectedJoyCons.has(getDeviceID(device))) {
        await addDevice(device);
      }
    }
  } catch (error) {
    console.error('❌ Error connecting new Joy-Cons:', error);
  }
};

/**
 * Connects and initializes a Joy-Con device.
 * @param {HIDDevice} device 
 * @returns {GeneralController|JoyConLeft|JoyConRight}
 */
const connectDevice = async (device) => {
  let joyCon = null;

  if (device.productId === 0x2006) {
    joyCon = new JoyConLeft(device);
  } else if (device.productId === 0x2007) {
    joyCon = new JoyConRight(device);
  }

  if (!joyCon) {
    console.warn(`⚠️ Unrecognized Joy-Con type for device ${device.productName} (ID: ${device.productId.toString(16)})`);
    joyCon = new GeneralController(device);
  }

  await joyCon.open();
  await joyCon.enableUSBHIDJoystickReport();
  await joyCon.enableStandardFullMode();
  await joyCon.enableIMUMode();
  /* await new Promise(resolve => setTimeout(resolve, 500)); */

  return joyCon;
};



// Export necessary modules and functions
export {
  connectJoyCon,
  connectNewJoyCons,  // Allow manually connecting new Joy-Cons
  connectedJoyCons,
  JoyConLeft,
  JoyConRight,
  GeneralController,
};


