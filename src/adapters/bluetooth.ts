import { Adapter } from '@node-escpos/adapter';
import { BluetoothSerialPort } from 'bluetooth-serial-port';

export default class Bluetooth extends Adapter<[timeout?: number]> {
  private serial: BluetoothSerialPort;
  private address: string;
  private isConnected: boolean;

  constructor(address: string) {
    super();
    this.serial = new BluetoothSerialPort();
    this.address = address;
    this.isConnected = false;
  }

  async connect() {
    return new Promise<void>((resolve, reject) => {
      this.serial.findSerialPortChannel(
        this.address,
        (channel: number) => {
          this.serial.connect(
            this.address,
            channel,
            () => {
              console.log('Connected to Bluetooth printer:', this.address);
              this.isConnected = true;
              resolve();
            },
            reject,
          );
        },
        () => reject(new Error('Printer not found')),
      );
    });
  }

  open(callback?: (error: Error | null) => void): this {
    console.log('Trying to open...');
    this.connect()
      .then(() => {
        console.log('Connected...');
        callback?.(null);
      })
      .catch((error) => {
        console.log('Failed to connect...');
        callback?.(error);
      });

    return this;
  }

  write(data: string | Buffer, callback?: (error: Error | null) => void): this {
    console.log('Trying to write...');

    if (!this.isConnected) {
      throw new Error('Device not connected.');
    }

    const message = Buffer.isBuffer(data) ? data : Buffer.from(data);

    this.serial.write(message, (err) => {
      if (err) {
        console.log('Failed to write...');
        callback?.(err);
      } else {
        console.log('Write complete...');
        callback?.(null);
      }
    });

    return this;
  }

  close(callback?: (error: Error | null) => void): this {
    console.log('Trying to close...');
    if (this.isConnected) {
      console.log('Disconnected from printer.');
      this.serial.close();
      this.isConnected = false;
      callback?.(null);
    }
    return this;
  }

  read(callback?: (data: Buffer) => void): void {
    console.log('Trying to read...');

    if (!this.isConnected) {
      throw new Error('Device not connected.');
    }

    this.serial.on('data', (buffer: Buffer) => {
      console.log('Read data:', buffer);
      callback?.(buffer);
    });
  }
}
