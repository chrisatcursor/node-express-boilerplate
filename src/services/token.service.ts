import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { Types } from 'mongoose';
import config from '../config/config';
import { tokenTypes, TokenType } from '../config/tokens';
import { ITokenDocument, Token, TokenDocumentType, IUserDocument } from '../models';
import ApiError from '../utils/ApiError';
import * as userService from './user.service';

export interface TokenPayload extends JwtPayload {
  sub: string;
  type: TokenType;
}

export interface AuthToken {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: AuthToken;
  refresh: AuthToken;
}

const isTokenPayload = (payload: string | JwtPayload): payload is TokenPayload => {
  return typeof payload !== 'string' && typeof payload.sub === 'string' && typeof payload.type === 'string';
};

export const generateToken = (
  userId: Types.ObjectId | string,
  expires: Moment,
  type: TokenType,
  secret = config.jwt.secret
): string => {
  const payload: TokenPayload = {
    sub: userId.toString(),
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };

  return jwt.sign(payload, secret);
};

export const saveToken = async (
  token: string,
  userId: Types.ObjectId | string,
  expires: Moment,
  type: TokenDocumentType,
  blacklisted = false
): Promise<ITokenDocument> => {
  return Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
};

export const verifyToken = async (token: string, type: TokenDocumentType): Promise<ITokenDocument> => {
  const payload = jwt.verify(token, config.jwt.secret);

  if (!isTokenPayload(payload)) {
    throw new Error('Invalid token');
  }

  const tokenDocument = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });

  if (!tokenDocument) {
    throw new Error('Token not found');
  }

  return tokenDocument;
};

export const generateAuthTokens = async (user: IUserDocument): Promise<AuthTokensResponse> => {
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

export const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }

  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);

  return resetPasswordToken;
};

export const generateVerifyEmailToken = async (user: IUserDocument): Promise<string> => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);

  return verifyEmailToken;
};
