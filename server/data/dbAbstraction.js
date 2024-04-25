export const getOne = async(col, query)=>{
    const collection = await col();
    const data = await collection.findOne(query);
    return data;
}

export const findOneAndUpdate = async(col, where, query)=>{
    const collection = await col();
    const data = await collection.findOneAndUpdate(where,query, {returnDocument: 'after'});
    return data;
}
