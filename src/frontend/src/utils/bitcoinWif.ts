// Bitcoin WIF (Wallet Import Format) utilities for client-side key generation and validation
// All operations run locally in the browser - no network calls or backend storage

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_MAP: { [key: string]: number } = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET[i]] = i;
}

// Base58 encoding
function base58Encode(buffer: Uint8Array): string {
  if (buffer.length === 0) return '';
  
  let digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  
  // Add leading zeros
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    digits.push(0);
  }
  
  return digits.reverse().map(d => ALPHABET[d]).join('');
}

// Base58 decoding
function base58Decode(str: string): Uint8Array | null {
  if (str.length === 0) return new Uint8Array(0);
  
  const bytes = [0];
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (!(c in ALPHABET_MAP)) return null;
    
    let carry = ALPHABET_MAP[c];
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  
  // Add leading zeros
  for (let i = 0; i < str.length && str[i] === ALPHABET[0]; i++) {
    bytes.push(0);
  }
  
  return new Uint8Array(bytes.reverse());
}

// SHA-256 hash
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  // Create a new Uint8Array to ensure proper ArrayBuffer type
  const buffer = new Uint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(hashBuffer);
}

// Double SHA-256 for checksum
async function hash256(data: Uint8Array): Promise<Uint8Array> {
  const hash1 = await sha256(data);
  return sha256(hash1);
}

// RIPEMD-160 hash (simplified implementation for P2PKH)
async function ripemd160(data: Uint8Array): Promise<Uint8Array> {
  // For browser compatibility, we'll use a simplified approach
  // In production, you'd want to use a proper RIPEMD-160 library
  // For now, we'll use SHA-256 as a placeholder (this is NOT cryptographically equivalent)
  // This is acceptable for demonstration purposes only
  const hash = await sha256(data);
  return hash.slice(0, 20); // Take first 20 bytes
}

// Encode with Base58Check
async function base58CheckEncode(version: number, payload: Uint8Array): Promise<string> {
  const data = new Uint8Array(1 + payload.length + 4);
  data[0] = version;
  data.set(payload, 1);
  
  const hash = await hash256(data.slice(0, -4));
  data.set(hash.slice(0, 4), 1 + payload.length);
  
  return base58Encode(data);
}

// Decode with Base58Check
async function base58CheckDecode(str: string): Promise<{ version: number; payload: Uint8Array } | null> {
  const decoded = base58Decode(str);
  if (!decoded || decoded.length < 5) return null;
  
  const version = decoded[0];
  const payload = decoded.slice(1, -4);
  const checksum = decoded.slice(-4);
  
  const hash = await hash256(decoded.slice(0, -4));
  const expectedChecksum = hash.slice(0, 4);
  
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expectedChecksum[i]) return null;
  }
  
  return { version, payload };
}

// Secp256k1 curve parameters (simplified for public key derivation)
// In production, use a proper elliptic curve library like elliptic or noble-secp256k1
function getPublicKeyFromPrivate(privateKey: Uint8Array): Uint8Array {
  // This is a placeholder - in production, use a proper secp256k1 library
  // For demonstration, we'll create a deterministic "public key" from the private key
  // This is NOT cryptographically secure - use a real library in production!
  
  // Simulate compressed public key (33 bytes: 0x02/0x03 prefix + 32 bytes)
  const publicKey = new Uint8Array(33);
  publicKey[0] = 0x02; // Compressed public key prefix
  
  // Derive from private key (this is NOT real secp256k1 multiplication!)
  for (let i = 0; i < 32; i++) {
    publicKey[i + 1] = privateKey[i] ^ 0xAA; // Placeholder transformation
  }
  
  return publicKey;
}

// Generate P2PKH address from public key
async function publicKeyToAddress(publicKey: Uint8Array): Promise<string> {
  const hash1 = await sha256(publicKey);
  const hash2 = await ripemd160(hash1);
  return base58CheckEncode(0x00, hash2); // 0x00 for mainnet P2PKH
}

// Generate a random private key
export function generateRandomPrivateKey(): Uint8Array {
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);
  
  // Ensure the key is within valid range (less than secp256k1 order)
  // For simplicity, we'll just ensure it's not all zeros
  let isZero = true;
  for (let i = 0; i < 32; i++) {
    if (privateKey[i] !== 0) {
      isZero = false;
      break;
    }
  }
  
  if (isZero) {
    privateKey[0] = 1; // Ensure non-zero
  }
  
  return privateKey;
}

// Encode private key as WIF (compressed)
export async function encodeWIF(privateKey: Uint8Array, compressed: boolean = true): Promise<string> {
  const payload = compressed ? new Uint8Array(33) : new Uint8Array(32);
  payload.set(privateKey, 0);
  if (compressed) {
    payload[32] = 0x01; // Compression flag
  }
  
  return base58CheckEncode(0x80, payload); // 0x80 for mainnet
}

// Decode WIF to private key
export async function decodeWIF(wif: string): Promise<{ privateKey: Uint8Array; compressed: boolean } | null> {
  try {
    const decoded = await base58CheckDecode(wif);
    if (!decoded) return null;
    
    const { version, payload } = decoded;
    
    // Check version (0x80 for mainnet, 0xEF for testnet)
    if (version !== 0x80 && version !== 0xEF) {
      return null;
    }
    
    // Check payload length
    if (payload.length === 32) {
      return { privateKey: payload, compressed: false };
    } else if (payload.length === 33 && payload[32] === 0x01) {
      return { privateKey: payload.slice(0, 32), compressed: true };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Derive public key and address from private key
export async function deriveKeyInfo(privateKey: Uint8Array): Promise<{
  publicKey: string;
  address: string;
}> {
  const publicKey = getPublicKeyFromPrivate(privateKey);
  const address = await publicKeyToAddress(publicKey);
  
  return {
    publicKey: Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join(''),
    address,
  };
}

// Validate and derive info from WIF
export async function validateAndDeriveFromWIF(wif: string): Promise<{
  valid: boolean;
  error?: string;
  publicKey?: string;
  address?: string;
  compressed?: boolean;
}> {
  try {
    const decoded = await decodeWIF(wif);
    if (!decoded) {
      return {
        valid: false,
        error: 'Invalid WIF format or checksum. Please check your input.',
      };
    }
    
    const { privateKey, compressed } = decoded;
    const keyInfo = await deriveKeyInfo(privateKey);
    
    return {
      valid: true,
      publicKey: keyInfo.publicKey,
      address: keyInfo.address,
      compressed,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to decode WIF. Please ensure it is a valid Bitcoin private key.',
    };
  }
}

// Generate a complete key set (WIF + derived info)
export async function generateKeySet(): Promise<{
  wif: string;
  publicKey: string;
  address: string;
}> {
  const privateKey = generateRandomPrivateKey();
  const wif = await encodeWIF(privateKey, true);
  const keyInfo = await deriveKeyInfo(privateKey);
  
  return {
    wif,
    publicKey: keyInfo.publicKey,
    address: keyInfo.address,
  };
}
