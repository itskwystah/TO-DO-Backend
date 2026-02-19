import mongoose, { Schema, Document } from "mongoose";
import { ITodo } from "@/types/models/todo.types";

export interface TodoDocument extends ITodo, Document {}

const TodoSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const TodoModel = mongoose.model<TodoDocument>("Todo", TodoSchema);

export default TodoModel;
