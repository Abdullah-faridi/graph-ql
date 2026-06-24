import type { CreateUserPayload } from "../../services/user.js";
import UserService from "../../services/user.js";
import { GraphQLError } from 'graphql';
import { Context } from "../context.js";
const queries = {
    getUserToken: async(_: any,payload:{
        email : string,
        password : string
    }) => {
        const token = await UserService.getUserToken({
            email : payload.email,
            password:payload.password,
        })
        return token;
    },
    getCurrentLoggedInUser: async (_: unknown, __: unknown, context: Context) => {
        if (!context.user) {
            throw new GraphQLError('You must be logged in', {
            extensions: { code: 'UNAUTHENTICATED' },
            });
        }

        return UserService.getUserById(context.user.id);
    },
    
}
const mutations = {
    createUser: async(_: any,payload: CreateUserPayload)=>{
        const res = await UserService.createUser(payload);
        return res.id;
    }
}

export const resolvers = {queries , mutations}