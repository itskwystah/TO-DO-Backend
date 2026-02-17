import { Document } from "mongoose";

export interface ITodo {
  title: string;
  description?: string;
  completed?: boolean;
}

export type TodoFilterType = Partial<ITodo>;

export type TodoDocumentType = ITodo & Document;