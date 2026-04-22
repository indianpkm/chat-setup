/**
 * Messages Controller
 */
import type { Request, Response, NextFunction } from 'express';
export declare function getMessages(req: Request<{
    conversationId: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare function deleteMessage(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare function editMessage(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
