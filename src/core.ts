import { Adapter } from '@node-escpos/adapter';
import { Printer as _Printer } from '@node-escpos/core';

export default class Printer {
  private printer: PrinterCore | undefined;
  private device: Device;
  private config: PrinterConfig;

  constructor(device: Device, config: PrinterConfig = {}) {
    this.device = device;
    this.config = {
      encoding: config.encoding || 'UTF-8',
      width: config.width || 42,
    };
  }

  private async initializePrinter() {
    const err = await new Promise((resolve) => {
      this.device.open(resolve);
    });

    if (!err) {
      this.printer = new _Printer(this.device, {
        encoding: this.config.encoding,
        width: this.config.width,
      });
    } else {
      console.error(err);
    }
  }

  async print(template: Template): Promise<void> {
    try {
      await this.initializePrinter();
      if (!this.printer) {
        throw new Error('Printer not initialized');
      }

      await template.print(this.printer);
      await this.printer.cut().close();
    } catch (err) {
      if (this.printer) {
        await this.printer.close();
      }
      throw err;
    }
  }
}

export interface Template {
  print(printer: PrinterCore): Promise<void>;
}

export interface PrinterCore extends _Printer<[]> {}

export interface PrinterConfig {
  encoding?: 'UTF-8';
  width?: 42 | 32;
}

export interface Device extends Adapter<[]> {}
