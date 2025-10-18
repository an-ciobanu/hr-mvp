// Main router for employees resource
import { Hono } from "hono";
import create from "./create.js";
import list from "./list.js";

const router = new Hono();

router.route("/", create);
router.route("/", list);

export default router;
