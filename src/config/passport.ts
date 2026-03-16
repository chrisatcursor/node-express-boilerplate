import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from 'passport-jwt';
import config from './config';
import { tokenTypes, TokenType } from './tokens';
import { User } from '../models';

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  type: TokenType;
}

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload: JwtPayload, done: VerifiedCallback): Promise<void> => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      done(null, false);
      return;
    }

    done(null, user);
  } catch (error) {
    done(error as Error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
