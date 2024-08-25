import 'server-only';
const CRYPTKey = async () => {
  return crypto.subtle.importKey(
    'raw',
    hex2buf(process.env.CRYPT_SECRET!!),
    { name: 'AES-CTR', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

function buf2hex(buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return Array.from(new Uint8Array(buffer))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

function hex2buf(hex: string) {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
}

export async function encryptKey(key: string) {
  let token = null,
    counter = null;
  counter = crypto.getRandomValues(new Uint8Array(16));
  const importLingqKey = await CRYPTKey();
  const encodeKey = new TextEncoder().encode(key);
  token = await crypto.subtle.encrypt(
    {
      name: 'AES-CTR',
      counter: counter,
      length: 128,
    },
    importLingqKey,
    encodeKey
  );
  token = buf2hex(token);
  counter = buf2hex(counter);
  return { token, counter };
}

export async function decryptKey(encodeKey: string, counter: string) {
  const decodeToken = hex2buf(encodeKey);
  const importCryptKey = await CRYPTKey();
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      counter: hex2buf(counter),
      length: 128,
    },
    importCryptKey,
    decodeToken
  );
  return new TextDecoder().decode(decrypted).toString();
}
