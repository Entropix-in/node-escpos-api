const a1 = '66:32:7E:CE:91:A9';
const a2 = 'DC:0D:30:64:3D:05';

(async () => {
  const { createBluetooth } = require('node-ble');
  const { bluetooth, destroy } = createBluetooth();
  const adapter = await bluetooth.defaultAdapter();

  if (!(await adapter.isDiscovering())) await adapter.startDiscovery();

  const device = await adapter.waitDevice(a1);
  await device.connect();
  const gattServer = await device.gatt();

  console.log(gattServer);
})();
