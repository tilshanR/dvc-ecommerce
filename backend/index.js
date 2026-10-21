const express=require('express')
const cors= require('cors')
const dotenv= require('dotenv')


dotenv.config();
const app= express(); //Initializes your Express application.

//Middleware
app.use(cors());
app.use(express.json());


//Health check endpoints
app.get(`/api/health`, (req,res)=>{
    res.status(200).json({status:'ok', message:'DVC Ecommerce server Running'});

});

const PORT=process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`Server running on the port ${PORT}`);

});