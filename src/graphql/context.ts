import { GraphQLError } from 'graphql';
import { Request } from 'express';
import UserService from '../services/user.js';

interface ContextParams {
  req: Request;
}
export interface Context {
  user?: {
    id: string;
    email: string;
    iat: number
  };
}
export async function createContext({ req }: ContextParams) {
  const token = req.headers.authentication || '';
   if (!token) return {};
  try{
    const user = await UserService.decodeJWTtoken(token as string);
    return { user };
  } catch(error){
     throw new GraphQLError('Invalid or expired token', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}