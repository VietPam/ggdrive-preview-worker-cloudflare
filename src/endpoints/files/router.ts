import { Hono } from "hono";
import { fromHono } from "chanfana";
import { FileProxy } from "./fileProxy";

export const filesRouter = fromHono(new Hono());

filesRouter.get("/:id", FileProxy);