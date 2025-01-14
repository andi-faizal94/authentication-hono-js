import { Hono } from "hono";
import {
  getPosts,
  login,
  registerUser,
  verifyToken,
} from "../controllers/PostController";

const router = new Hono();

router.post("/register", (c) => registerUser(c));
router.post("/login", (c) => login(c));
router.get("/posts", verifyToken, (c) => getPosts(c));

export const Routes = router;
