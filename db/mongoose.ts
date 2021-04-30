import mongoose from 'mongoose';


export const createMongoConnections = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL!, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            poolSize: 10
        })
        console.log(new Date(), "\DB Connection: SUCCESS")
    } catch (error) {
        console.log(new Date(), "\DB Connection: ERROR")
        console.log(error);
    }
};