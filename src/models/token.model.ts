import mongoose, { Schema, Document } from 'mongoose';
import { toJSON } from './plugins';
import { tokenTypes } from '../config/tokens';

export interface IToken extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  type: string;
  expires: Date;
  blacklisted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

tokenSchema.plugin(toJSON);

const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;
