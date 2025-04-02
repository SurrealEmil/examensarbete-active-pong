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
    console.log("Attempting to add device: ", device.productName, device.productId.toString(16));

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

    // Retry logic if needed
    let retries = 3;
    while (retries > 0) {
        await joyCon.enableIMUMode();
        await new Promise((resolve) => setTimeout(resolve, 500)); // wait a bit
        if (joyCon.device.opened) break; // check if the connection was successful
        retries--;
    }

    return joyCon;
};

/**
 * Connects Joy-Con devices. If already authorized, it auto-connects. Otherwise, prompts the user.
 * 
 * \[IMPORTANT\] Must be called from a user gesture (e.g. button click) to avoid SecurityError.
 */
const connectJoyCon = async () => {
    // \[IMPORTANT\] Guard for browsers without WebHID
    if (!("hid" in navigator)) {
        console.warn("WebHID not supported on this browser/device.");
        return;
    }

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

        // If no existing Joy-Con is found, prompt user to select one
        console.log('🕹️ Requesting Joy-Con connection...');
        const selectedDevices = await navigator.hid.requestDevice({
            filters: [{ vendorId: 0x057e }],
            multiple: true, // allow selecting multiple new Joy-Cons at once
        });

        if (selectedDevices.length === 0) {
            console.log('⚠️ No Joy-Con devices selected.');
            return;
        }

        for (const device of selectedDevices) {
            await addDevice(device);
        }
    } catch (error) {
        console.error('❌ Error connecting Joy-Cons:', error);
    }
};

/**
 * Allows the user to connect **new** Joy-Cons (ignores already connected ones).
 * 
 * \[IMPORTANT\] Must be triggered by a user gesture too.
 */
const connectNewJoyCons = async () => {
    // \[IMPORTANT\] Guard for browsers without WebHID
    if (!("hid" in navigator)) {
        console.warn("WebHID not supported on this browser/device.");
        return;
    }

    try {
        console.log('🔄 Searching for new Joy-Cons...');
        const selectedDevices = await navigator.hid.requestDevice({
            filters: [{ vendorId: 0x057e }], // Nintendo Vendor ID
            multiple: true,
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
 * \[IMPORTANT\] Initialize Joy-Cons, but DO NOT call `requestDevice()` automatically.
 */
const initializeDevices = async () => {
    if (!("hid" in navigator)) {
        console.warn("WebHID not supported on this browser/device.");
        return;
    }

    try {
        const existingDevices = await navigator.hid.getDevices();
        console.log("Available HID Devices: ", existingDevices);

        const unpairedDevices = existingDevices.filter(device =>
            device.vendorId === 0x057e && !connectedJoyCons.has(getDeviceID(device))
        );

        // Auto-connect previously authorized Joy-Cons
        for (const device of unpairedDevices) {
            await addDevice(device);
        }

        // \[OPTIONAL\] Removed auto prompt for new Joy-Cons here
        // Because it triggers a SecurityError if not in a click event

    } catch (error) {
        console.error('⚠️ Error initializing Joy-Con devices:', error);
    }
};

/**
 * \[IMPORTANT\] Only attach the `connect`/`disconnect` event listeners if WebHID is supported.
 */
if ("hid" in navigator) {
    // Event listeners for automatic device connection/disconnection
    navigator.hid.addEventListener('connect', async ({ device }) => {
        if (device.vendorId === 0x057e) {
            await addDevice(device);
        }
    });

    navigator.hid.addEventListener('disconnect', async ({ device }) => {
        if (device.vendorId === 0x057e) {
            await removeDevice(device);
        }
    });

    // Automatically initialize Joy-Cons on module load (only for already-authorized devices)
    initializeDevices();
} else {
    console.warn("WebHID not supported on this browser/device.");
}

// Export necessary modules and functions
export {
    connectJoyCon,
    connectNewJoyCons,
    connectedJoyCons,
    JoyConLeft,
    JoyConRight,
    GeneralController,
};
