import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  numOfStars: {
    type: Number,
    required: [true, "Please input number of stars"],
  },
  details: {
    type: String,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
