import Rating from "../models/ratingModel.js";

const createRating = async (req, res) => {
  try {
    const { numOfStars, details, client } = req.body;

    const rating = new Rating({ numOfStars, details, client });

    await rating.save();
    res.status(201).json(rating);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().populate("client");

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRatingById = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id).populate("client");

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }
    res.status(200).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createRating, getRatingById, getAllRatings };
