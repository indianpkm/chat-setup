/**
 * Conversations Controller
 */
import type { Request, Response, NextFunction } from 'express';
export declare function listConversations(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createDM(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createGroup(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getConversation(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare function updateGroup(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare function addParticipants(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare function removeParticipant(req: Request<{
    id: string;
    userId: string;
}>, res: Response, next: NextFunction): Promise<void>;
export declare function leaveConversation(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
