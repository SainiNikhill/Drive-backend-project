const mongoose =require("mongoose")


const fileSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: true,
  },
  originalname: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const file = mongoose.model('file',fileSchema)
module.exports=file