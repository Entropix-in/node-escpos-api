import { Image } from '@node-escpos/core';
import { PrinterCore, Template } from '../core';

export default class Receipt implements Template {
  private items: PrintItem[];
  private titleText: string;
  private subtitleText: string;
  private orderNumberText: string;
  private dateText: string;
  private totalAmountText: number;
  private logoPath: string;

  constructor() {
    this.items = [];
    this.titleText = '';
    this.subtitleText = '';
    this.orderNumberText = '';
    this.dateText = '';
    this.totalAmountText = 0;
    this.logoPath = '';
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

  logo(path: string) {
    this.logoPath = path;
    return this;
  }

  async print(printer: PrinterCore) {
    printer.align('CT').font('B');

    if (this.logoPath) {
      try {
        // TODO: validate logo url
        const logo = await Image.load(this.logoPath);
        await printer.image(logo, 'D24');
      } catch (err) {
        // TODO: handle error
      }
    }

    printer.style('B').size(2, 2).text(this.titleText);

    if (this.subtitleText) {
      printer.style('B').size(1, 1).text(this.subtitleText);
    }

    printer.drawLine('.');

    printer
      .align('LT')
      .style('NORMAL')
      .text(`Order: ${this.orderNumberText}`)
      .text(`Date: ${this.dateText}`)
      .drawLine('.');

    printer
      .align('LT')
      .style('B')
      .tableCustom([
        { text: 'Item', align: 'LEFT', width: 27 / 42 },
        { text: 'Qty.', align: 'CENTER', width: 5 / 42 },
        { text: 'Subtotal', align: 'RIGHT', width: 10 / 42 },
      ]);

    this.items.forEach((item) => {
      printer!
        .align('LT')
        .style('NORMAL')
        .tableCustom([
          { text: item.name, align: 'LEFT', width: 27 / 42 },
          { text: item.qty.toString(), align: 'CENTER', width: 5 / 42 },
          { text: `Rs.${item.total}`, align: 'RIGHT', width: 10 / 42 },
        ]);
    });

    printer.drawLine('.');

    printer.align('RT').style('B').text(`Total: Rs.${this.totalAmountText}`).newLine();

    printer.align('CT').text('Thank you for dining with us!').text('Visit us again!').newLine();
  }
}

interface PrintItem {
  name: string;
  qty: number;
  total: number;
}
