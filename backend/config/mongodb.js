const mongoose = require("mongoose");

const connectDB = async() =>{
    const DB_NAME = 'collaborative-ide-db'
    const DB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.4no01.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    
    try{
        const connectionInstance = await mongoose.connect(DB_URI)
        console.log(`\nMONGO DB CONNECTED !!`);

    }catch(err){
        console.log(`MONGODB CONNECTION ERROR: ${err}`);
        process.exit(1);
    }
}

module.exports = connectDB;