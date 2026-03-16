import bcrypt from 'bcryptjs';
import faker from 'faker';
import mongoose, { Types } from 'mongoose';
import User, { IUser } from '../../src/models/user.model';

export interface UserFixture extends IUser {
  _id: Types.ObjectId;
}

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

export const userOne: UserFixture = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

export const userTwo: UserFixture = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

export const admin: UserFixture = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: false,
};

export const insertUsers = async (users: UserFixture[]): Promise<void> => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};
