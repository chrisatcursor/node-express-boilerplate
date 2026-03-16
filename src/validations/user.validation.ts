import Joi from 'joi';
import { roles, Role } from '../config/roles';
import { objectId, password } from './custom.validation';

export interface CreateUserBody {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface GetUsersQuery {
  name?: string;
  role?: Role;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface UserParams {
  userId: string;
}

export interface UpdateUserBody {
  email?: string;
  password?: string;
  name?: string;
}

export const createUser = {
  body: Joi.object<CreateUserBody>().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string()
      .required()
      .valid(...roles),
  }),
};

export const getUsers = {
  query: Joi.object<GetUsersQuery>().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getUser = {
  params: Joi.object<UserParams>().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateUser = {
  params: Joi.object<UserParams>().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object<UpdateUserBody>()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object<UserParams>().keys({
    userId: Joi.string().custom(objectId),
  }),
};
