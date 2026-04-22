/**
 * Auth Controller
 *
 * Thin layer between routes and service — no business logic here.
 * Handles request/response transformation only.
 */
import type { Request, Response, NextFunction } from 'express';
import type { RegisterInput, LoginInput, RefreshTokenInput, LogoutInput } from './auth.schema.js';
export declare function register(req: Request<object, object, RegisterInput>, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: Request<object, object, LoginInput>, res: Response, next: NextFunction): Promise<void>;
export declare function refresh(req: Request<object, object, RefreshTokenInput>, res: Response, next: NextFunction): Promise<void>;
export declare function logout(req: Request<object, object, LogoutInput>, res: Response, next: NextFunction): Promise<void>;
export declare function me(req: Request, res: Response, next: NextFunction): Promise<void>;
