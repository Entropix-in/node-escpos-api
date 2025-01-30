import { BluetoothAdapter, HelloTemplate, Printer } from '../src';

const device = new BluetoothAdapter('66:32:7E:CE:91:A9');
const printer = new Printer(device);
const template = new HelloTemplate();

printer.print(template);
