import { router } from "src/core";
import { createUserController, getUsersController } from "./controllers";

router.route("/users").get(getUsersController).post(createUserController);
