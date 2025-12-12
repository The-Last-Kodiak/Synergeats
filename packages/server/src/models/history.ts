import { Schema, model } from "mongoose";

export interface HistoryDay {
  day: string;
  completed: number;
  total: number;
  weight?: number;
  date?: string;
}

export interface History {
  userid: string;
  weekly: HistoryDay[];
}

const HistorySchema = new Schema<History>({
  userid: { type: String, required: true, unique: true },
  weekly: [
    {
      day: String,
      completed: Number,
      total: Number,
      weight: Number,
      date: String
    }
  ]
});

export const HistoryModel = model<History>(
  "History",
  HistorySchema,
  "UserHistory"
);
