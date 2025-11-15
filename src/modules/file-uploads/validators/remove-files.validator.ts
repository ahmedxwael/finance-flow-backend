import { z } from "zod";

export const removeFilesValidator = z.object({
  files: z.array(
    z.object({
      filename: z.string(),
      fieldname: z.string(),
    })
  ),
});
