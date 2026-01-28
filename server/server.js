import express from 'express';
import cors from 'cors';
import connectDb from './configs/db.js';
import "dotenv/config";
import userRouter from './routes/UserRoutes.js';
import PartnerRouter from './routes/PartnerRoutes.js';
import AdminRouter from './routes/AdminRoutes.js';
import ServiceRouter from './routes/ServiceRoutes.js';
import NotificationRouter from './routes/NotificationRoutes.js';
import RequestRouter from './routes/RequestRoutes.js';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;




//database connection
await connectDb();


app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:5173", // ✅ frontend origin
      credentials: true,              // ✅ allow cookies / auth headers
    })
  );

// Static folder for uploaded files
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", userRouter);
app.use("/api/partners", PartnerRouter);
app.use("/api/admin", AdminRouter); 
app.use("/api/services", ServiceRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/requests", RequestRouter);
    
//home route
app.get('/',(req,res)=>{
    res.send('Resume Builder Server is running');
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});