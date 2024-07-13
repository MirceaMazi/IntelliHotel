import mongoose from "mongoose";

const roomStates = {
  Free: "Cameră liberă",
  Occupied: "Cameră ocupată",
  NeedsCleaning: "Necesită igienizare",
  IsBeingCleaned: "În curs de igienizare",
  ClientRequest: "Cerere client",
};

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please input room name"],
    unique: true,
  },
  type: {
    type: String,
    required: [true, "Please input room type"],
  },
  details: {
    type: String,
  },
  state: {
    type: String,
    enum: Object.values(roomStates), // Ensures the value must be one of the enum values
    required: [true, "Please input room state"],
  },
  currentReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
