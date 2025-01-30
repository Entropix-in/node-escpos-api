import { Image, Printer } from '@node-escpos/core';
import USB from '@node-escpos/usb-adapter';
import { resolve } from 'path';

interface PrintItem {
  name: string;
  qty: number;
  total: number;
}

class ThermalPrinter {
  private printer: Printer<[]> | undefined;
  private items: PrintItem[];
  private logo: Image | undefined;
  private titleText: string;
  private subtitleText: string;
  private orderNumberText: string;
  private dateText: string;
  private totalAmountText: number;
  private width: number;

  constructor() {
    this.items = [];
    this.titleText = '';
    this.subtitleText = '';
    this.orderNumberText = '';
    this.dateText = '';
    this.totalAmountText = 0;
    this.width = 42;
  }

  private openDevice(): Promise<void> {
    // Check USB devices
    return new Promise<Printer<[]> | null>((resolve) => {
      const device = new USB();
      device.open((err: Error | null) => {
        if (err) {
          resolve(null);
        } else {
          const printer = new Printer(device, {
            encoding: 'UTF-8',
            width: this.width,
          });
          resolve(printer);
        }
      });
    })
      .then((result) => {
        return new Promise<Printer<[]> | null>((resolve, _reject) => {
          if (result) {
            resolve(result);
          } else {
            resolve(null);
            // const address = "DC:0D:30:64:3D:05";
            // const device = new Bluetooth(address, {});

            // setTimeout(() => {
            //   console.log(device.list());
            //   resolve(null);
            // }, 5000);
          }
        });
      })

      .then((printer) => {
        if (printer) {
          this.printer = printer;
        } else {
          throw new Error('Not printer found.');
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  private async loadLogo(): Promise<void> {
    try {
      const logoPath = resolve('../assets/logo.png');
      this.logo = await Image.load(logoPath);
    } catch (err) {
      console.error('Error loading logo:', err);
    }
  }

  title(title: string): this {
    this.titleText = title;
    return this;
  }

  subtitle(subtitle: string): this {
    this.subtitleText = subtitle;
    return this;
  }

  orderNumber(orderNumber: string): this {
    this.orderNumberText = orderNumber;
    return this;
  }

  date(dateText: string): this {
    this.dateText = dateText;
    return this;
  }

  addItem(item: PrintItem): this {
    this.items.push(item);
    return this;
  }

  total(amount: number): this {
    this.totalAmountText = amount;
    return this;
  }

  async print(): Promise<void> {
    try {
      await this.openDevice();
      await this.loadLogo();

      if (!this.printer) {
        throw new Error('Printer not initialized');
      }

      // Start printing
      this.printer.align('CT').font('B');

      if (this.logo) {
        await this.printer.image(this.logo, 'D24'); // Print logo
      }

      this.printer.style('B').size(2, 2).text(this.titleText);

      if (this.subtitleText) {
        this.printer.style('B').size(1, 1).text(this.subtitleText);
      }

      this.printer.drawLine('.');

      // Order Details
      this.printer
        .align('LT')
        .style('NORMAL')
        .text(`Order: ${this.orderNumberText}`)
        .text(`Date: ${this.dateText}`)
        .drawLine('.');

      // Table Header
      this.printer
        .align('LT')
        .style('B')
        .tableCustom([
          { text: 'Item', align: 'LEFT', width: 27 / 42 },
          { text: 'Qty.', align: 'CENTER', width: 5 / 42 },
          { text: 'Subtotal', align: 'RIGHT', width: 10 / 42 },
        ]);

      // Table Rows
      this.items.forEach((item) => {
        this.printer!.align('LT')
          .style('NORMAL')
          .tableCustom([
            { text: item.name, align: 'LEFT', width: 27 / 42 },
            { text: item.qty.toString(), align: 'CENTER', width: 5 / 42 },
            { text: `Rs.${item.total}`, align: 'RIGHT', width: 10 / 42 },
          ]);
      });

      this.printer.drawLine('.');

      // Total Section
      this.printer.align('RT').style('B').text(`Total: Rs.${this.totalAmountText}`).newLine();

      // Footer Section
      this.printer.align('CT').text('Thank you for dining with us!').text('Visit us again!').newLine();

      // Cut and Close
      await this.printer.cut().close();
    } catch (err) {
      if (this.printer) {
        await this.printer.close();
      }

      throw err;
    }
  }
}

export default ThermalPrinter;
