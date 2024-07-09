import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please input reservation name"],
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
  ],
  startDate: {
    type: Date,
    required: [true, "Please input reservation start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please input reservation end date"],
  },
});

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
