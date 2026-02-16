import { Request, Response } from "express";
import * as TodoService from "@/services/todos/todos.service";
import { Types } from "mongoose";

interface TodoPayload {
  title: string;
  description?: string;
}

// Create a new todo
export const createTodo = async (
  req: Request<{}, {}, TodoPayload>,
  res: Response
) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTask = await TodoService.createTodo({ title, description });

    return res.status(201).json({
      message: "Todo created successfully",
      data: newTask,
    });
  } catch (error) {
    console.error("Create todo error:", error);
    return res.status(500).json({ message: "Error creating task" });
  }
};

// Update an existing todo
export const updateTodo = async (
  req: Request<{ id: string }, {}, TodoPayload>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const updatedTodo = await TodoService.updateTodo(id, {
      title,
      description,
    });

    if (!updatedTodo) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Todo updated successfully",
      data: updatedTodo,
    });
  } catch (error) {
    console.error("Update todo error:", error);
    return res.status(500).json({ message: "Error updating task" });
  }
};

/**
 * Get all todos
 */
export const getTodo = async (_req: Request, res: Response) => {
  try {
    const todos = await TodoService.getAllTodo();

    return res.status(200).json({
      message: "Todos fetched successfully",
      data: todos,
    });
  } catch (error) {
    console.error("Get todos error:", error);
    return res.status(500).json({ message: "Error fetching tasks" });
  }
};

/**
 * Get a todo by ID
 */
export const getTodoById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Fetch todo from service
    const todo = await TodoService.getTodoById(id);

    // Check if todo exists
    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return successful response
    return res.status(200).json({
      message: "Todo fetched successfully",
      data: todo,
    });

  } catch (error) {
    console.error("Get todo error:", error);
    return res.status(500).json({ message: "Error fetching task" });
  }
};

/**
 * Delete a todo
 */
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

    return res.status(200).json({
      message: "Todo deleted successfully",
      data: deletedTodo,
    });
  } catch (error) {
    console.error("Delete todo error:", error);
    return res.status(500).json({ message: "Error deleting task" });
  }
};
