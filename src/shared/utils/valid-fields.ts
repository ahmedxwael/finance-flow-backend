import { GenericObject } from "src/types";

export const validFields = <T extends GenericObject>(
  data: T,
  fields: (keyof T)[]
) => {
  const errors: { field: keyof T; message: string }[] = [];

  fields.forEach((field) => {
    if (!data[field]) {
      errors.push({ field, message: `${String(field)} is required` });
    }
  });

  return errors;
};
