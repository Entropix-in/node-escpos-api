import { ConsoleAdapter, HelloTemplate, Printer } from '../src';

const device = new ConsoleAdapter();
const printer = new Printer(device);
const template = new HelloTemplate();

printer.print(template);
