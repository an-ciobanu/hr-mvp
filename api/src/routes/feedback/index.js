import { Hono } from "hono";
import list from "./list.js";
import create from "./create.js";

const router = new Hono();

router.route("/", list);
router.route("/", create);

export default router;
