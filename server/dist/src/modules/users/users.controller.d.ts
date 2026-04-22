/**
 * Users Controller
 */
import type { Request, Response, NextFunction } from 'express';
export declare function search(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getUser(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare function getPublicKey(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare const updateMe: ((req: Request, _res: Response, next: NextFunction) => void)[];
