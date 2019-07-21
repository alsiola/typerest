import { Response } from "express";
export interface RestError {
    code: number;
    message: string;
}
export declare const sendSuccess: (res: Response) => <T>(a: T) => import("express-serve-static-core").Response;
export declare const sendError: (res: Response) => (err: RestError) => import("express-serve-static-core").Response;
