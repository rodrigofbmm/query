// @deno-types="npm:@types/express@4"
import { Request, Response } from "npm:express@4.18.2";
import mongoose from "npm:mongoose@7.6.3";
import { Pet } from "../type.ts";

const Schema = mongoose.Schema;

const AnimalesSchema = new Schema(
  {
    id:{type: String, required: true },
    name: { type: String, required: true },
    breed: { type: String, required: true },

  },
  { timestamps: true }
);

export type AnimalesModelType = mongoose.Document & Omit<Pet, "id">;
export const Animales = mongoose.model<AnimalesModelType>("Animales", AnimalesSchema);