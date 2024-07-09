import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please input client name"],
  },
  email: {
    type: String,
    required: [true, "Please input client email"],
  },
  phone: {
    type: String,
    required: [true, "Please input client phone"],
  },
  cnp: {
    type: String,
    required: [true, "Please input client CNP"],
  },
  reservations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
  ],
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
