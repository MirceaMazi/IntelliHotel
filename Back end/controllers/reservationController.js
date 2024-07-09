import Reservation from "../models/reservationModel.js";
import Room from "../models/roomModel.js";

const createReservation = async (req, res) => {
  try {
    const { name, rooms, startDate, endDate } = req.body;

    const validRooms = await Room.find({ _id: { $in: rooms } });

    if (validRooms.length !== rooms.length) {
      return res
        .status(400)
        .json({ message: "One or more room IDs are invalid." });
    }

    const reservation = new Reservation({ name, rooms, startDate, endDate });

    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("rooms");
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate(
      "rooms"
    );
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllReservations,
  getReservationById,
  createReservation,
  deleteReservation,
};
