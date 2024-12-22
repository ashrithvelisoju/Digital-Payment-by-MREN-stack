const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const e = require("express");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/digitalpayment", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("connected to database");
}).catch((err) => {
    console.log("error in connection", err);
})

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    upi_id : {type: String, required: true},
    balance : {type: Number},
});

const User = mongoose.model("User", userSchema);

const transactionSchema = new mongoose.Schema({
    sender_upi_id : {type: String, required: true},
    receiver_upi_id : {type: String, required: true},
    amount : {type: Number, required: true},
    timestamp : {type: Date, default: Date.now},
});

const Transaction = mongoose.model("Transaction", transactionSchema);

const generateUIP=()=>{
    const randomId = crypto.randomBytes(4).toString("hex");
    return "${randomId}@fastpay";
}

app.post("/api/signup", async (req, res) => {
    try{
        const {name, email, password} = req.body;
        
        let user=await User.findOne({email:email});
        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        const upi_id = generateUIP();
        const balance = 1000;

        user=new User({name, email, password, upi_id, balance});

        await user.save();
        res.status(201).json({message: "User created successfully!",upi_id});

    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }

});