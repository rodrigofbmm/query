// @deno-types="npm:@types/express@4"
import { Request, Response, request } from "npm:express@4.18.2";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";
import mongoose from "npm:mongoose@7.6.3";
import { Pet } from "./type.ts";
import { Animales } from "./db/Animales.ts";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

const gqlSchema=`#graphql
type Pet{
    id:ID!
    name:String!
    breed: String!
}

type Query{
pets:[Pet!]!
pet(id:ID!): Pet!
}
type Mutation{
addPet(name: String!,breed:String!):Pet!
deletePet(id:ID!):Pet!
updatePet(id:ID!,name: String!,breed:String!):Pet!
}
`;




let pets: Pet[]=[];
const Query={
    pets: async ():Promise<Pet[]>=>{
        const mascs= await Animales.find().exec();
        const pets:Pet[] = mascs.map((pet)=>({
            id: pet._id.toString(),
            name: pet.name,
            breed: pet.breed

        }))
        return pets;
    },
    pet:async (_:unknown,args:{id:string}): Promise<Pet> =>{
        const {id}= args;
       const mascota=  await Animales.findById(id)

       if(!mascota){
        throw new GraphQLError(`No existe esta mascota ${args.id}`, {
            extensions: { code: "NOT_FOUND" },
          })
       }
       const masc:Pet={
        id: mascota._id.toString(),
        name: mascota.name,
        breed: mascota.breed
       }
       return masc;
    },

}
const Mutation={
    addPet: async (
        _:unknown,args:{name:string;breed:string},
    ):Promise<Pet> =>{
        const {name,breed}=args;
        const a = new Animales({ name,breed });
        await a.save();
        const ani:Pet={
            id: a._id.toString(),
            name: args.name,
            breed: args.breed
        }
        return ani;
    },
    deletePet: async(
        _:unknown,args:{id:string},
    ) =>{
        const _id = args.id;
        const pet= await Animales.findByIdAndRemove(_id);

        if(!pet){
            throw new GraphQLError(`No existe esta mascota${args.id}`, {
                extensions: { code: "EXISTS" },
        })


        }else return "eliminado";

    },
    updatePet: (
        _:unknown,args:{id:string;name:string;breed:string},
    ):Pet =>{
        const {id,name,breed}=args;
        let pet= pets.find((p)=>p.id===id);

        if(!pet){
            throw new GraphQLError(`No existe esta mascota${args.id}`, {
                extensions: { code: "EXISTS" },
              })


        }else{
            pet.name=name;
            pet.breed=breed;
            return pet;
        }

    },
 };


const env = await load();

const MONGO_URL=env.MONGO_URL||Deno.env.get("MONGO_URL");// si hay .emv lo leo si no lo lee de las variables de entorno de deno

if (!MONGO_URL) {
  console.log("No mongo URL found");
  Deno.exit(1);
}

await mongoose.connect(MONGO_URL);

const server = new ApolloServer({
    typeDefs: gqlSchema,
    resolvers:{
        Query,
        Mutation,
    },
});

const url= await startStandaloneServer(server, {
    listen:{
        port:3000,
    },
});
