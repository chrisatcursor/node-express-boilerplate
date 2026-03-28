import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import mongoose from 'mongoose';
import config from '../config/config';
import { tokenTypes } from '../config/tokens';
import { Token } from '../models';
import type { IToken } from '../models/token.model';
import type { IUser } from '../models/user.model';
import ApiError from '../utils/ApiError';
import * as userService from './user.service';

type TokenType = (typeof tokenTypes)[keyof typeof tokenTypes];

interface AuthToken {
  token: string;
  expires: Date;
}

interface AuthTokens {
  access: AuthToken;
  refresh: AuthToken;
}

const generateToken = (
  userId: mongoose.Types.ObjectId | string,
  expires: Moment,
  type?: TokenType,
  secret = config.jwt.secret
): string => {
  const payload = {
    sub: userId.toString(),
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const saveToken = async (
  token: string,
  userId: mongoose.Types.ObjectId | string,
  expires: Moment,
  type: TokenType,
  blacklisted = false
): Promise<IToken> => {
  return Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
};

const verifyToken = async (token: string, type: TokenType): Promise<IToken> => {
  const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const generateAuthTokens = async (user: IUser): Promise<AuthTokens> => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

const generateVerifyEmailToken = async (user: IUser): Promise<string> => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

export { generateToken, saveToken, verifyToken, generateAuthTokens, generateResetPasswordToken, generateVerifyEmailToken };
export type { AuthTokens, TokenType };
