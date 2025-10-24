import { ZodError, ZodObject } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validateReqBody = (schema: ZodObject<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: 'Invalid request body', errors: error.issues });
            }
            next(error);
        }
    };
};

export const validateReqQuery = (schema: ZodObject<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: 'Invalid request query', errors: error.issues });
            }
            next(error);
        }
    };
};

export const validateReqParams = (schema: ZodObject<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = await schema.parseAsync(req.params) as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: 'Invalid request params', errors: error.issues });
            }
            next(error);
        }
    };
};
