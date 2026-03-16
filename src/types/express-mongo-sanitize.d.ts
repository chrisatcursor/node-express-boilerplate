declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';

  export default function mongoSanitize(): RequestHandler;
}
