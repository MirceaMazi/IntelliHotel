import Room from "../models/roomModel.js";
import Reservation from "../models/reservationModel.js";

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    if (rooms.length >= 1) {
      res.status(200).json(rooms);
    } else {
      res.status(404).json({ message: "There are no rooms" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRoom = async (req, res) => {
  const { name, type, details, state } = req.body;

  try {
    const room = new Room({
      name,
      type,
      details,
      state,
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoom = async (req, res) => {
  const { name, type, details, state } = req.body;

  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      room.name = name || room.name;
      room.type = type || room.type;
      room.details = details || room.details;
      room.state = state || room.state;

      const updatedRoom = await room.save();
      res.status(200).json(updatedRoom);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      const reservations = await Reservation.find({ rooms: req.params.id });
      if (reservations.length > 0) {
        return res.status(400).json({
          message: "Room cannot be deleted as it is part of a reservation.",
        });
      }

      await Room.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Room removed" });
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAllRooms, getRoomById, updateRoom, deleteRoom, createRoom };
