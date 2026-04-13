import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
// @ts-expect-error: services remain JavaScript in current migration stage
import { authService, userService, tokenService, emailService } from '../services';

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  password: string;
}

interface RequestUser {
  id: string;
  email: string;
}

const register: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginBody;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as RefreshTokenBody;
  await authService.logout(refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as RefreshTokenBody;
  const tokens = await authService.refreshAuth(refreshToken);
  res.send({ ...tokens });
});

const forgotPassword: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as ForgotPasswordBody;
  const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body as ResetPasswordBody;
  await authService.resetPassword(req.query.token as string, password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = req.user as RequestUser;
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await authService.verifyEmail(req.query.token as string);
  res.status(httpStatus.NO_CONTENT).send();
});

export { register, login, logout, refreshTokens, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail };
