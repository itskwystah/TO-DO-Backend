
import TodoModel, { TodoDocument } from "@/models/todos/todos.model";
import { ITodo } from "@/types/todos/todos";

export const createTodo = async (taskData: ITodo): Promise<TodoDocument> => {
  const task = new TodoModel(taskData);
  return task.save();
};

export const updateTodo = async (
  id: string,
  taskData: Partial<ITodo>
): Promise<TodoDocument | null> => {
  return TodoModel.findByIdAndUpdate(id, taskData, { new: true });
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
