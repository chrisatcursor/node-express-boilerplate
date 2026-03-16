import mongoose, { Document, Types } from 'mongoose';
import { tokenTypes } from '../config/tokens';
import { toJSON } from './plugins';

export type TokenDocumentType =
  | typeof tokenTypes.REFRESH
  | typeof tokenTypes.RESET_PASSWORD
  | typeof tokenTypes.VERIFY_EMAIL;

export interface IToken {
  token: string;
  user: Types.ObjectId;
  type: TokenDocumentType;
  expires: Date;
  blacklisted: boolean;
}

export interface ITokenDocument extends IToken, Document {}

const tokenSchema = new mongoose.Schema<ITokenDocument>(
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

const Token = mongoose.model<ITokenDocument>('Token', tokenSchema);

export default Token;
