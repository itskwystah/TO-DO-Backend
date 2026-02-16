// backend/controllers/todosController.ts
import { Request, Response } from "express";
import * as TodoService from "@/services/todos/todos.service";
import { Types } from "mongoose"; // for validating ObjectId

interface TodoPayload {
  title: string;
  description?: string;
}

// Create a new task
export const createTodo = async (req: Request<{}, {}, TodoPayload>, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTask = await TodoService.createTodo({ title, description });
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Error creating task" });
  }
};

// Update an existing task
export const updateTodo = async (
  req: Request<{ id: string }, {}, TodoPayload>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const updatedTodo = await TodoService.updateTodo(id, { title, description });

    if (!updatedTodo) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTodo);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Error updating task" });
  }
};

// Get all tasks
export const getTodo = async (req: Request, res: Response) => {
  try {
    const todo = await TodoService.getAllTodo();
    res.status(200).json(todo);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

export const deleteTodo = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const deletedTodo = await TodoService.deleteTodo(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete todo error:", err);
    res.status(500).json({ message: "Error deleting task" });
  }
};

