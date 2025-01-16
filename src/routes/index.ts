import { Hono } from "hono";
import {
  deletePost,
  editPost,
  getPostById,
  getPosts,
  updatePost,
  createPost,
} from "../controllers/PostController";
import { verifyToken } from "../middlewares/authentification";
import { login, registerUser } from "../controllers/AuthController";
const router = new Hono();

router.post("/register", (c) => registerUser(c));
router.post("/login", (c) => login(c));
router.get("/posts", verifyToken, (c) => getPosts(c));
router.post("/posts", verifyToken, (c) => createPost(c));
router.get("/posts/:id", verifyToken, (c) => getPostById(c));
router.patch("/posts/:id", verifyToken, (c) => updatePost(c));
router.put("/posts/:id", verifyToken, (c) => editPost(c));
router.delete("/posts/:id", verifyToken, (c) => deletePost(c));

export const Routes = router;
