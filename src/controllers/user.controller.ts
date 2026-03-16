import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import pick from '../utils/pick';
import { userService } from '../services';
import { CreateUserBody, GetUsersQuery, UpdateUserBody, UserParams } from '../validations/user.validation';

export const createUser = catchAsync(async (req: Request<Record<string, never>, unknown, CreateUserBody>, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

export const getUsers = catchAsync(
  async (req: Request<Record<string, never>, unknown, unknown, GetUsersQuery>, res: Response) => {
    const filter = pick(req.query, ['name', 'role'] as const);
    const options = pick(req.query, ['sortBy', 'limit', 'page'] as const);
    const result = await userService.queryUsers(filter, options);

    res.send(result);
  }
);

export const getUser = catchAsync<UserParams>(async (req: Request<UserParams>, res: Response) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.send(user);
});

export const updateUser = catchAsync<UserParams, unknown, UpdateUserBody>(
  async (req: Request<UserParams, unknown, UpdateUserBody>, res: Response) => {
    const user = await userService.updateUserById(req.params.userId, req.body);
    res.send(user);
  }
);

export const deleteUser = catchAsync<UserParams>(async (req: Request<UserParams>, res: Response) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});
