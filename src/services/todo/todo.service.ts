import TodoModel, { TodoDocument } from "@/models/todo/todo.model";
import { ITodo } from "@/types/models/todo.types";

export const createTodo = async (taskData: ITodo): Promise<TodoDocument> => {
  const task = new TodoModel(taskData);
  return task.save();
};

export const updateTodo = async (id: string, payload: Partial<ITodo>) => {
  return TodoModel.findByIdAndUpdate(id, payload, { new: true });
};

export const getAllTodo = async (): Promise<TodoDocument[]> => {
  return TodoModel.find();
};
export const deleteTodo = async (id: string) => {
  return await TodoModel.findByIdAndDelete(id);
};

export const getTodoById = async (id: string): Promise<TodoDocument | null> => {
  return TodoModel.findById(id);
};
