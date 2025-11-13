import { db } from "@/core";
import { Request, Response } from "express";

export const getUsersController = async (req: Request, res: Response) => {
  const users = await db.collection("users").find().toArray();

  return res.status(200).json({
    message: "Users fetched successfully",
    records: users,
  });
};
