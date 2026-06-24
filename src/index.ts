import "dotenv/config";
import express, { type Request } from "express"
import createApolloGraphqlServer from "./graphql/index.js";
import { expressMiddleware } from '@as-integrations/express5';
import { createContext } from "./graphql/context.js";1
import cors from 'cors';
async function init(){
        const app = express()
        const PORT = Number(process.env.PORT) || 8000; 

        app.use(express.json());
        app.get('/' , (req , res) => {
            res.json({message : "server is running"});
        })
        app.use(cors({
        origin: ['http://localhost:8000', 'https://studio.apollographql.com'],
        credentials: true,
        }));
        const gqlServer = await createApolloGraphqlServer();
        app.use('/graphql' ,express.json() ,expressMiddleware(gqlServer , {context : createContext}))
        app.listen(PORT , ()=>console.log(`Server started t PORT:${PORT}`));

}
init();