import mongoose, { Schema, Document, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { toJSON, paginate } from './plugins';
import type { QueryResult, PaginateOptions } from './plugins';
import { roles } from '../config/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, unknown>, options: PaginateOptions): Promise<QueryResult>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// TODO(ts-migration): Mongoose statics type does not include custom methods
// eslint-disable-next-line dot-notation
userSchema.statics['isEmailTaken'] = async function (
  email: string,
  excludeUserId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// TODO(ts-migration): Mongoose methods type does not include custom methods
// eslint-disable-next-line dot-notation
userSchema.methods['isPasswordMatch'] = async function (password: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
