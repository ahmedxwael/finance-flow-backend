import { formatZodErrors } from "../shared/utils";
import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest = (schema: ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      ...req.body,
      ...req.params,
      ...req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        errors: formatZodErrors(result.error),
      });
    }

    next();
  };
};
