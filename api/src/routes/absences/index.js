import { Hono } from "hono";
import create from "./create.js";
import list from "./list.js";
import manager from "./manager.js";
import update from "./update.js";

const router = new Hono();

// Register /manager route before /:userId
router.route("/", manager);
router.route("/", create);
router.route("/", list);
router.route("/", update);

export default router;
