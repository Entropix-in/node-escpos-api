import { PrinterCore, Template } from '../core';

export default class Hello implements Template {
  async print(printer: PrinterCore) {
    printer.text('Hello World!');
  }
}
