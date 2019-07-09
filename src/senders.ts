import { Response } from "express";

export interface RestError {
    code: number;
    message: string;
}

export const sendSuccess = (res: Response) => <T>(a: T) =>
    res.status(200).json(a);

export const sendError = (res: Response) => (err: RestError) =>
    res.status(err.code).json({ error: err.message });
