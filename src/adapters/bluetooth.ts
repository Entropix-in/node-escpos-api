import { Adapter } from '@node-escpos/adapter';
import NodeBle, { createBluetooth } from 'node-ble';

// const smallPrinter = '66:32:7E:CE:91:A9';
// const largePrinter = 'DC:0D:30:64:3D:05';

export default class Bluetooth extends Adapter<[timeout?: number]> {
  private device: NodeBle.Device | null;
  private adapter: NodeBle.Adapter | null;
  private address: string;
  private bluetooth: NodeBle.Bluetooth | null;
  private destroy: (() => void) | null;

  constructor(address: string) {
    super();
    this.destroy = null;
    this.bluetooth = null;
    this.device = null;
    this.adapter = null;
    this.address = address;
  }

  private async getAdapter() {
    const { bluetooth, destroy } = createBluetooth();
    this.bluetooth = bluetooth;
    this.destroy = destroy;
    this.adapter = await this.bluetooth.defaultAdapter();
  }

  private async startDiscovery() {
    if (this.adapter && !(await this.adapter.isDiscovering())) {
      await this.adapter.startDiscovery();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async connect() {
    if (this.adapter == null) {
      await this.getAdapter().then(() => this.startDiscovery());
    }

    if (!this.adapter) {
      throw new Error('No adapter found');
    }

    this.device = await this.adapter.waitDevice(this.address);

    if (!this.device.isPaired()) {
      throw new Error('Device is not paired.');
    }

    if (!(await this.device.isConnected())) {
      await this.device.connect();
    }
  }

  open(callback?: (error: Error | null) => void): this {
    this.connect()
      .then(() => {
        callback?.(null);
      })
      .catch((error) => {
        callback?.(error);
      });
    return this;
  }

  write(data: string | Buffer, callback?: ((error: Error | null) => void) | undefined) {
    if (this.device == null) {
      throw new Error('Device not connected.');
    }
    const message = typeof data === 'string' ? Buffer.from(new TextEncoder().encode(data).buffer) : data;
    this.device
      .gatt()
      .then(async (gattServer) => {
        const serviceIds = await gattServer.services();
        for (const serviceId of serviceIds) {
          try {
            const service = await gattServer.getPrimaryService(serviceId);
            const characteristicIds = await service.characteristics();
            // TODO: maybe we should check if the characteristic is writeable
            const characteristic = await service.getCharacteristic(characteristicIds[0]);
            const flags = await characteristic.getFlags();
            if (flags.includes('write')) {
              await characteristic.writeValue(message);
              return;
            }
          } catch (error) {
            continue;
          }
        }
        throw new Error('No primary service found');
      })
      .then(() => {
        callback?.(null);
      })
      .catch((error) => {
        callback?.(error);
      });

    return this;
  }

  close(callback?: ((error: Error | null) => void) | undefined, _timeout?: number | undefined): this {
    if (this.device) {
      this.destroy?.();
      this.destroy = null;
      callback?.(null);

      // this.device.isConnected().then((connected: any) => {
      //   if (connected) {
      //     this.device!.disconnect()
      //       .then(() => {
      //         callback?.(null);
      //       })
      //       .catch((error) => {
      //         callback?.(error);
      //       });
      //   } else {
      //     callback?.(null);
      //   }
      // });
    }
    return this;
  }

  read(callback?: ((data: Buffer) => void) | undefined): void {
    if (this.device == null) {
      throw new Error('Device not connected.');
    }

    this.device
      .gatt()
      .then(async (gattServer) => {
        const serviceIds = await gattServer.services();
        for (const serviceId of serviceIds) {
          try {
            const service = await gattServer.getPrimaryService(serviceId);
            const characteristicIds = await service.characteristics();
            const characteristic = await service.getCharacteristic(characteristicIds[0]);
            const flags = await characteristic.getFlags();
            if (flags.includes('write')) {
              const buffer = await characteristic.readValue();
              return buffer;
            }
          } catch (error) {
            continue;
          }
        }
        throw new Error('No primary service found');
      })
      .then((buffer) => {
        callback?.(buffer);
      })
      .catch((error) => {
        callback?.(error);
      });
  }
}
