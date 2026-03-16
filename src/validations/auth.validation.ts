import Joi from 'joi';
import { password } from './custom.validation';

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface TokenQuery {
  token: string;
}

export interface ResetPasswordBody {
  password: string;
}

export const register = {
  body: Joi.object<RegisterBody>().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

export const login = {
  body: Joi.object<LoginBody>().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const logout = {
  body: Joi.object<RefreshTokenBody>().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const refreshTokens = {
  body: Joi.object<RefreshTokenBody>().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object<ForgotPasswordBody>().keys({
    email: Joi.string().email().required(),
  }),
};

export const resetPassword = {
  query: Joi.object<TokenQuery>().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object<ResetPasswordBody>().keys({
    password: Joi.string().required().custom(password),
  }),
};

export const verifyEmail = {
  query: Joi.object<TokenQuery>().keys({
    token: Joi.string().required(),
  }),
};
