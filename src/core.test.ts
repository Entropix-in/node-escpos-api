import { describe, it, expect, vi, beforeEach } from 'vitest';
import Printer, { Device, PrinterCore } from './core';

// Mock dependencies
const mockDevice: Device = {
  open: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve()),
} as unknown as Device;

const mockPrinterCore: PrinterCore = {
  cut: vi.fn(() => mockPrinterCore),
  close: vi.fn(() => Promise.resolve()),
} as unknown as PrinterCore;

vi.mock('@node-escpos/core', () => ({
  Printer: vi.fn(() => mockPrinterCore),
}));

describe('Printer Class', () => {
  let printer: Printer;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default config', () => {
    printer = new Printer(mockDevice);
    expect(printer).toBeDefined();
  });
});
