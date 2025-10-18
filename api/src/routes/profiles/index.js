import { Hono } from "hono";
import view from "./view.js";
import create from "./create.js";
import update from "./update.js";

const router = new Hono();

router.route("/", view);
router.route("/", create);
router.route("/", update);

export default router;
