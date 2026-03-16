import bcrypt from 'bcryptjs';
import mongoose, { Document, FilterQuery, HookNextFunction, Model, Types } from 'mongoose';
import validator from 'validator';
import { Role, roles } from '../config/roles';
import { paginate, PaginateModel, PaginateOptions, QueryResult, toJSON } from './plugins';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface IUserDocument extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends PaginateModel<IUserDocument> {
  isEmailTaken(email: string, excludeUserId?: Types.ObjectId | string): Promise<boolean>;
  paginate(filter: FilterQuery<IUserDocument>, options: PaginateOptions): Promise<QueryResult<IUserDocument>>;
}

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>(
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

userSchema.static('isEmailTaken', async function isEmailTaken(
  this: IUserModel,
  email: string,
  excludeUserId?: Types.ObjectId | string
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return Boolean(user);
});

userSchema.method('isPasswordMatch', async function isPasswordMatch(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
});

userSchema.pre<IUserDocument>('save', async function save(next: HookNextFunction): Promise<void> {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
