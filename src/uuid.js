function randomBytes() {
  return crypto.getRandomValues(new Uint8Array(16))
}

export default function uuid() {
  const rnds = randomBytes();

  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  return toString(rnds);
}

const BYTE_TO_HEX = [];
for (let i = 0; i < 256; ++i) {
  BYTE_TO_HEX[i] = (i + 0x100).toString(16).substr(1);
}

function toString(buf) {
  let i = 0;
  const bth = BYTE_TO_HEX;
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}
