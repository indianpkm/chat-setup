/**
 * Cryptography Utilities (Server-Side)
 *
 * The server operates on an "E2E-blind" principle:
 *   - It NEVER encrypts or decrypts user messages.
 *   - All message encryption/decryption happens on the client using tweetnacl.
 *   - The server only validates that public keys are well-formed.
 *
 * Algorithm: X25519 ECDH key exchange + XSalsa20-Poly1305 AEAD (tweetnacl.box)
 *
 * Client-side flow (for reference — not executed here):
 *   1. Recipient fetches sender's publicKey from /api/users/:id/public-key
 *   2. ECDH: sharedSecret = nacl.box.before(recipientPublicKey, senderSecretKey)
 *   3. Encrypt: { ciphertext, nonce } = nacl.box.after(message, nonce, sharedSecret)
 *   4. Send: { encryptedContent: base64(ciphertext), nonce: base64(nonce) }
 *
 * For group messages:
 *   1. A random symmetric groupKey is generated once per group
 *   2. groupKey is encrypted with each member's public key (box) and stored per-member
 *   3. Messages use nacl.secretbox(message, nonce, groupKey)
 */
import nacl from 'tweetnacl';
import nutil from 'tweetnacl-util';
const { decodeBase64, encodeBase64 } = nutil;
/**
 * Validates that a string is a properly base64-encoded X25519 public key (32 bytes).
 * Called during user registration to reject malformed key submissions.
 */
export function isValidPublicKey(publicKey) {
    try {
        const bytes = decodeBase64(publicKey);
        return bytes.length === nacl.box.publicKeyLength; // 32 bytes
    }
    catch {
        return false;
    }
}
/**
 * Generates a new X25519 key pair.
 * Used by the server ONLY for system message encryption.
 * Clients should generate their own key pairs locally and never share secret keys.
 */
export function generateKeyPair() {
    const kp = nacl.box.keyPair();
    return {
        publicKey: encodeBase64(kp.publicKey),
        secretKey: encodeBase64(kp.secretKey),
    };
}
/**
 * Encrypt a system-generated message for a specific recipient.
 * Used for automated system notifications (e.g., "User X joined the group").
 */
export function encryptSystemMessage(plaintext, recipientPublicKeyB64) {
    const recipientPublicKey = decodeBase64(recipientPublicKeyB64);
    const ephemeralKeypair = nacl.box.keyPair();
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageBytes = new TextEncoder().encode(plaintext);
    const encrypted = nacl.box(messageBytes, nonce, recipientPublicKey, ephemeralKeypair.secretKey);
    return {
        encryptedContent: encodeBase64(encrypted),
        nonce: encodeBase64(nonce),
    };
}
/** Generate a random nonce for encryption use */
export function generateNonce() {
    return encodeBase64(nacl.randomBytes(nacl.box.nonceLength));
}
//# sourceMappingURL=crypto.js.map