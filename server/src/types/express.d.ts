/**
 * Express Request Augmentation
 *
 * Adds the authenticated `user` payload to every request after
 * the `authenticate` middleware runs.
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
