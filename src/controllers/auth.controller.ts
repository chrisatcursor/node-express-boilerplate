import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
// @ts-expect-error: services remain JavaScript in current migration stage
import { authService, userService, tokenService, emailService } from '../services';

const register: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await authService.logout(req.body.refreshToken as string);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tokens = await authService.refreshAuth(req.body.refreshToken as string);
  res.send({ ...tokens });
});

const forgotPassword: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const email = req.body.email as string;
  const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await authService.resetPassword(req.query.token as string, req.body.password as string);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = req.user as { id: string; email: string };
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await authService.verifyEmail(req.query.token as string);
  res.status(httpStatus.NO_CONTENT).send();
});

export { register, login, logout, refreshTokens, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail };
