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
/**
 * Validates that a string is a properly base64-encoded X25519 public key (32 bytes).
 * Called during user registration to reject malformed key submissions.
 */
export declare function isValidPublicKey(publicKey: string): boolean;
/**
 * Generates a new X25519 key pair.
 * Used by the server ONLY for system message encryption.
 * Clients should generate their own key pairs locally and never share secret keys.
 */
export declare function generateKeyPair(): {
    publicKey: string;
    secretKey: string;
};
/**
 * Encrypt a system-generated message for a specific recipient.
 * Used for automated system notifications (e.g., "User X joined the group").
 */
export declare function encryptSystemMessage(plaintext: string, recipientPublicKeyB64: string): {
    encryptedContent: string;
    nonce: string;
};
/** Generate a random nonce for encryption use */
export declare function generateNonce(): string;
