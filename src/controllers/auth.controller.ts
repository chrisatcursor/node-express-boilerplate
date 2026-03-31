import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync = require('../utils/catchAsync');
import ApiError = require('../utils/ApiError');
import type { IUser } from '../models/user.model';
// @ts-expect-error: services barrel is still JS in this migration phase
import { authService, userService, tokenService, emailService } from '../services';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface TokenBody {
  refreshToken: string;
}

interface EmailBody {
  email: string;
}

interface PasswordBody {
  password: string;
}

interface TokenQuery {
  token: string;
}

interface AuthService {
  loginUserWithEmailAndPassword(email: string, password: string): Promise<unknown>;
  logout(refreshToken: string): Promise<void>;
  refreshAuth(refreshToken: string): Promise<Record<string, unknown>>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
}

interface UserService {
  createUser(userBody: RegisterBody): Promise<unknown>;
}

interface TokenService {
  generateAuthTokens(user: unknown): Promise<Record<string, unknown>>;
  generateResetPasswordToken(email: string): Promise<string>;
  generateVerifyEmailToken(user: IUser): Promise<string>;
}

interface EmailService {
  sendResetPasswordEmail(to: string, token: string): Promise<void>;
  sendVerificationEmail(to: string, token: string): Promise<void>;
}

const typedAuthService = authService as AuthService;
const typedUserService = userService as UserService;
const typedTokenService = tokenService as TokenService;
const typedEmailService = emailService as EmailService;

const register: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const user = await typedUserService.createUser(req.body as RegisterBody);
  const tokens = await typedTokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { email, password } = req.body as LoginBody;
  const user = await typedAuthService.loginUserWithEmailAndPassword(email, password);
  const tokens = await typedTokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { refreshToken } = req.body as TokenBody;
  await typedAuthService.logout(refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { refreshToken } = req.body as TokenBody;
  const tokens = await typedAuthService.refreshAuth(refreshToken);
  res.send({ ...tokens });
});

const forgotPassword: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { email } = req.body as EmailBody;
  const resetPasswordToken = await typedTokenService.generateResetPasswordToken(email);
  await typedEmailService.sendResetPasswordEmail(email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { token } = req.query as unknown as TokenQuery;
  const { password } = req.body as PasswordBody;
  await typedAuthService.resetPassword(token, password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const user = req.user as IUser | undefined;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  const verifyEmailToken = await typedTokenService.generateVerifyEmailToken(user);
  await typedEmailService.sendVerificationEmail(user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { token } = req.query as unknown as TokenQuery;
  await typedAuthService.verifyEmail(token);
  res.status(httpStatus.NO_CONTENT).send();
});

export { register, login, logout, refreshTokens, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail };
