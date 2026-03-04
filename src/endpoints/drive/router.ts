import { Hono } from "hono";
import { fromHono } from "chanfana";
import { DriveFolderList } from "./folderList";

export const driveRouter = fromHono(new Hono());

driveRouter.post("/folder", DriveFolderList);