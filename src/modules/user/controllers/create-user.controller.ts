import { Request, Response } from "express";
import { createUserService } from "../services";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await createUserService(req.body);
    return res.status(200).json({
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating user",
    });
  }
};
