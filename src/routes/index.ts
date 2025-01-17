import { Hono } from "hono";
import {
  forgotPassword,
  login,
  passwordReset,
  registerUser,
} from "../controllers/AuthController";
import {
  createPost,
  deletePost,
  editPost,
  getPostById,
  getPosts,
  updatePost,
} from "../controllers/PostController";
import { verifyToken } from "../middlewares/authentification";
const router = new Hono();

router.post("/register", (c) => registerUser(c));
router.post("/login", (c) => login(c));
router.post("/forgot-password", (c) => forgotPassword(c));
router.post("/reset-password", (c) => passwordReset(c));
router.get("/posts", verifyToken, (c) => getPosts(c));
router.post("/posts", verifyToken, (c) => createPost(c));
router.get("/posts/:id", verifyToken, (c) => getPostById(c));
router.patch("/posts/:id", verifyToken, (c) => updatePost(c));
router.put("/posts/:id", verifyToken, (c) => editPost(c));
router.delete("/posts/:id", verifyToken, (c) => deletePost(c));

export const Routes = router;
