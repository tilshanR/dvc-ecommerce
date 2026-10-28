import mongoose from "mongoose";

const contactSchema= new mongoose.Schema(
    {
        fullName:{
            type: String,
            required:true,
            trim: true,
            maxlength: 100,
        },
        phone:{
            type:String,
            required:true,
            trim:true,
            maxlength:20
        },
        email:{
            type:String,
            required:true,
            trim:true,
            lowercase:true,
            maxlength:254,
        },
        subject:{
            type:String,
            required:true,
            enum:[
                "General Inquiry",
        "Hardware Availability Check",
        "Pickup Order Question",
        "Other",
            ],
        },
        message:{
                        type:String,
            required:true,
            trim:true,
            minlength:10,
            maxlength:2000,
        },
        status:{
            type:String,
            enum:["new","read", "resolved"],
            default:"new",
        },
    },{timestamps:true}
);
export default mongoose.model("ContactMessage",contactSchema);