import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { formatErrors } from "../utils";

export const validateRequest = (schema: ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        errors: formatErrors(result.error),
      });
    }

    next();
  };
};
