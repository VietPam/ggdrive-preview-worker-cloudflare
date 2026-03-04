import { Hono } from "hono";
import { fromHono } from "chanfana";
import { DrivePreview } from "./Preview";
import { DriveFolderList } from "./folderList";

export const driveRouter = fromHono(new Hono());
driveRouter.post("/folder", DriveFolderList);
driveRouter.get("/preview/:id", DrivePreview);