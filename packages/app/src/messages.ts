// packages/app/src/messages.ts
import { Message } from "@calpoly/mustang";
import { Meal } from "server/models";

export type Msg =
  | ["meals/request", {}, Message.Reactions]
  | ["meals/load", { meals: Meal[] }, Message.Reactions]
  | ["meal/request", { id: string }, Message.Reactions]
  | ["meal/load", { meal: Meal }, Message.Reactions]
  | ["meal/save", { id: string; meal: Meal }, Message.Reactions];
