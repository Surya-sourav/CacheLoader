import {type RedisClientType} from 'redis';

// export interface CacheStore {
//     get(key : string) : Promise<String | null>;
//     set(key : string , value : string , opts : {EX : number}) : Promise<undefined>;
// }

export interface CacheLoaderPayload <V> {
    key : string,
    loader : (key : string) => Promise<V>,
    ttl? : number
}

export class CacheLoader<V>
{   
    constructor (private redis : RedisClientType)
    {}

    async get(payload : CacheLoaderPayload<V>)
    {
       // Try to Retrieve from Cache : 
        const cached =  await this.redis.get(payload.key);
            if(cached) 
                {
                    return JSON.parse(cached) as V;
                }
                
                console.log(`Cache MISS ,Fetching from DB...`)
                // Try to retrieve from DB :
                const value = await payload.loader(payload.key);   

                    if(value) 
                    try {
                    {   // Update redis with the new fetched data from db
                        await this.redis.set(payload.key , JSON.stringify(value), {EX : payload.ttl ?? 60});
                    }
                 
                } catch
                {
                    console.log(`Failed Loading Data`)
                }
                return value ?? null;
        }
    }
