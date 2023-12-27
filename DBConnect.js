const mongoose = require('mongoose');

const DBConnect = ()=> {
    const mongoURI = process.env.DBLINK;
    mongoose.connect(mongoURI).then(()=> {
        console.log("Conected to Database successfully")
    }).catch((err) => console.log(err))
}
 module.exports =  DBConnect
