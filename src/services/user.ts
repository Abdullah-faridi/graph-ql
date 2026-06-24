import jwt from "jsonwebtoken"
import "dotenv/config";
import { prismaClient } from "../lib/db.js"
import {createHmac, randomBytes} from 'node:crypto'
const JwtSecret = String(process.env.JWT_SECRET);
export interface CreateUserPayload{
    firstName : string
    lastName?: string
    email     : string
    password  : string
}
export interface GetUserTokenPayload{
    email : string;
    password: string;
}
class UserService {
    private static generateHash(salt:string ,password:string ){
        const hashedPassword = createHmac('sha256' , salt).update(password).digest('hex');
        return hashedPassword;
    }
    public static createUser(payload: CreateUserPayload){
        const {firstName,lastName = '',email,password} = payload
        const salt = randomBytes(32).toString("hex");
        const hashedPassword = UserService.generateHash(salt , password);
        return prismaClient.user.create({
            data: {
                lastName,
                firstName,
                email,
                salt,
                password:hashedPassword,
            }
        })
    }
    private static getUserByEmail(email : string){
        return prismaClient.user.findUnique({where: {email}});
    }
    public static getUserById(id: string) {
        return prismaClient.user.findUnique({ where: { id } });
    }
    public static async getUserToken(payload: GetUserTokenPayload){
        const {email , password} = payload;
        const user = await UserService.getUserByEmail(email);
        if(!user) throw new Error('user not found');

        const userSalt = user.salt;
        const userHashPassword = UserService.generateHash(userSalt , password);
        if(userHashPassword !== user.password)
            throw new Error('Incorrect password');

        const token = jwt.sign({id:user.id,email:user.email } , JwtSecret )
        return token;
    }
    public static async decodeJWTtoken(token: string){
        return jwt.verify(token, JwtSecret) as { id: string; email: string; iat: number };
    }
}
export default UserService