import mongoose, { Document, Model, Schema } from "mongoose";

export interface IItemAttributes {
  strength: number;
  intellect: number;
  vitality: number;
  focus: number;
  discipline: number;
}

export interface IItem extends Document {
  name: string;
  description: string;
  price: number;
  type: string;
  attributeBonus: IItemAttributes;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: 0,
    },
    type: {
      type: String,
      required: [true, "Item type is required"],
      enum: ["Relic", "Armor", "Tome", "Artifact", "Accessory"],
      default: "Relic",
    },
    attributeBonus: {
      strength: { type: Number, default: 0, min: 0 },
      intellect: { type: Number, default: 0, min: 0 },
      vitality: { type: Number, default: 0, min: 0 },
      focus: { type: Number, default: 0, min: 0 },
      discipline: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);

export default Item;
