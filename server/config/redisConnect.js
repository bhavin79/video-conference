import { createClient } from 'redis';

const client = createClient();
client.on('error', err =>  console.log('Redis Client Error', err));


const connectRedis = async()=>{
        await client.connect();
}


export const getRedisClient = async()=>{
        if(client.isReady && client.isReady){
            return client;
        }
        else{
            await connectRedis();
            return client;
        }

}