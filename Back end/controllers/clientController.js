import Client from "../models/clientModel.js";
import Reservation from "../models/reservationModel.js";

const createClient = async (req, res) => {
  try {
    const { name, email, phone, cnp, reservations } = req.body;

    const validReservations = await Reservation.find({
      _id: { $in: reservations },
    });

    if (validReservations.length !== reservations.length) {
      return res
        .status(400)
        .json({ message: "One or more reservation IDs are invalid." });
    }

    const client = new Client({
      name,
      email,
      phone,
      cnp,
      reservations,
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("reservations");

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate(
      "reservations"
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { name, email, phone, cnp, reservations } = req.body;

    const validReservations = await Reservation.find({
      _id: { $in: reservations },
    });

    if (validReservations.length !== reservations.length) {
      return res
        .status(400)
        .json({ message: "One or more reservation IDs are invalid." });
    }

    const client = await Client.findById(
      req.params.id,
      { name, email, phone, cnp, reservations },
      { new: true, runValidators: true }
    ).populate("reservations");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};
