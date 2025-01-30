import _Console from '@node-escpos/console';

const escposCommands: { [key: string]: string } = {
  '\x1B': '[ESC]',
  '\x1D': '[GS]',
  '\x1B\x64': '[ESC]d', // Print and feed n lines
  '\x1D\x56': '[GS]V', // Cut paper
  '\x0A': '[LF]', // Line Feed
  '\x0D': '[CR]', // Carriage Return
  '\x1B\x40': '[ESC]@', // Initialize printer
  '\x1B\x61': '[ESC]a', // Alignment
  '\x1B\x45': '[ESC]E', // Bold
  '\x1B\x47': '[ESC]G', // Double strike
};

const formatEscPos = (buffer: Buffer): string => {
  let result = '';
  let i = 0;

  while (i < buffer.length) {
    let found = false;

    // Check for multi-byte ESC/POS commands (3 bytes max)
    for (let len = 3; len > 0; len--) {
      const chunk = buffer.slice(i, i + len).toString();

      if (escposCommands[chunk]) {
        // Preserve line breaks for LF (Line Feed) and CR (Carriage Return)
        if (chunk === '\x0A' || chunk === '\x0D') {
          result += '\n';
        }
        found = true;
        i += len;
        break;
      }
    }

    if (!found) {
      const byte = buffer[i];
      if (byte >= 32 && byte <= 126) {
        // Printable ASCII
        result += String.fromCharCode(byte);
      }
      i++;
    }
  }

  // Remove unwanted formatting artifacts like "M4-!"
  return result.replace(/M4-!/g, '').replace(/4-!/g, '').trim();
};

const log = (data: string | Buffer) => {
  if (Buffer.isBuffer(data)) {
    // eslint-disable-next-line no-console
    console.log(formatEscPos(data));
  } else {
    // eslint-disable-next-line no-console
    console.log(data);
  }
};

export default class Console extends _Console {
  constructor(handler: (data: string | Buffer) => void = log) {
    super();
    this.handler = handler;
  }
}
