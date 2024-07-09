import express from "express";
import cors from "cors";
import "dotenv/config";

import userRoute from "./routes/userRoutes.js";
import roomRoute from "./routes/roomRoutes.js";
import reservationRoute from "./routes/reservationRoutes.js";
import clientRoute from "./routes/clientRoutes.js";

import connectDB from "./config/dbConfig.js";

const port = process.env.PORT || 5000;

//DB connection
connectDB();

const app = express();

//middleware
app.use(
  cors({
    origin: ["http://localhost:4200"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());

//routes
app.use("/api/users", userRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/reservations", reservationRoute);
app.use("/api/clients", clientRoute);

app.listen(port, () => console.log(`Server running on port ${port}`));
