import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import { authService, emailService, tokenService, userService } from '../services';
import {
  ForgotPasswordBody,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
  ResetPasswordBody,
} from '../validations/auth.validation';

interface TokenRequestQuery {
  token?: string;
}

export const register = catchAsync(async (req: Request<Record<string, never>, unknown, RegisterBody>, res: Response) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req: Request<Record<string, never>, unknown, LoginBody>, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);

  res.send({ user, tokens });
});

export const logout = catchAsync(async (req: Request<Record<string, never>, unknown, RefreshTokenBody>, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(
  async (req: Request<Record<string, never>, unknown, RefreshTokenBody>, res: Response) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
  }
);

export const forgotPassword = catchAsync(
  async (req: Request<Record<string, never>, unknown, ForgotPasswordBody>, res: Response) => {
    const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
    await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(httpStatus.NO_CONTENT).send();
  }
);

export const resetPassword = catchAsync(
  async (req: Request<Record<string, never>, unknown, ResetPasswordBody, TokenRequestQuery>, res: Response) => {
    await authService.resetPassword(String(req.query.token), req.body.password);
    res.status(httpStatus.NO_CONTENT).send();
  }
);

export const sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }

  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const verifyEmail = catchAsync(
  async (req: Request<Record<string, never>, unknown, Record<string, never>, TokenRequestQuery>, res: Response) => {
    await authService.verifyEmail(String(req.query.token));
    res.status(httpStatus.NO_CONTENT).send();
  }
);
