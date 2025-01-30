import { BluetoothAdapter, Printer, ReceiptTemplate } from '../src';

const device = new BluetoothAdapter('66:32:7E:CE:91:A9');
const printer = new Printer(device);
const receipt = new ReceiptTemplate();

receipt
  .title('FoodFlow')
  .subtitle('Smart restaurant solutions')
  .orderNumber('#789')
  .date('2025-01-27 02:00 PM')
  .addItem({
    name: 'Burger',
    qty: 2,
    total: 10.0,
  })
  .addItem({
    name: 'Loaded Cheese Nachos',
    qty: 1,
    total: 12.0,
  })
  .addItem({
    name: 'Pizza',
    qty: 3,
    total: 30.0,
  })
  .addItem({
    name: 'Pizza',
    qty: 3,
    total: 30.0,
  })
  .addItem({
    name: 'Mediterranean Veggie Sandwich',
    qty: 1,
    total: 10.0,
  })
  .addItem({
    name: 'Wings',
    qty: 5,
    total: 25.0,
  })
  .addItem({
    name: 'French Fries',
    qty: 3,
    total: 9.0,
  })
  .addItem({
    name: 'Caramel Frappe',
    qty: 1,
    total: 7.0,
  })
  .addItem({
    name: 'Chocolate Cake',
    qty: 2,
    total: 10.0,
  })
  .addItem({
    name: 'Pepperoni Mushroom Pizza',
    qty: 2,
    total: 24.0,
  })
  .addItem({
    name: 'Buffalo Ranch Chicken Wrap',
    qty: 1,
    total: 12.0,
  })
  .total(149.0);

printer.print(receipt);
