import express from "express";
import * as TodoController from "@/controllers/todos/todos.controller";


const todosRouter = express.Router();

todosRouter.post("/", TodoController.createTodo);
todosRouter.put("/:id", TodoController.updateTodo);
todosRouter.get("/", TodoController.getTodo);
todosRouter.delete("/:id", TodoController.deleteTodo);

export default todosRouter;
