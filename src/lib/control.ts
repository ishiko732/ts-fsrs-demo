import prisma from "./prisma";
import { Control } from "@prisma/client";

export const getControl = async () => {
  const controls = await prisma.control.findUnique({where:{id:1}});
  return controls;
};