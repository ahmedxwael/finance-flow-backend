import { ZodError } from "zod";

export const formatErrors = (errors: ZodError<Record<string, unknown>>) => {
  const parsedErrors = errors.issues;

  return parsedErrors.map((error) => {
    return {
      field: error.path.join("."),
      message: error.message,
    };
  });
};
