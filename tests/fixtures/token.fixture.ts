import moment from 'moment';
import config from '../../src/config/config';
import { tokenTypes } from '../../src/config/tokens';
import tokenService from '../../src/services/token.service';
import { userOne, admin } from './user.fixture';

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const userOneAccessToken: string = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken: string = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

export { userOneAccessToken, adminAccessToken };
