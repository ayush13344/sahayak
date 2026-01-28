import express from "express";
import protect from "../middlewares/protect.js";
import ServiceRequest from "../modal/Service.js";
import mongoose from "mongoose";

import {
  createServiceRequest,
  getNearbyRequests,
  acceptServiceRequest,
  completeServiceRequest,
  addBilling,
  addRating,

} from "../controllers/serviceController.js";

const ServiceRouter = express.Router();

/* Customer */
ServiceRouter.post("/", protect, createServiceRequest);

/* Provider */
ServiceRouter.get("/nearby", protect, getNearbyRequests);
ServiceRouter.patch("/accept", protect, acceptServiceRequest);
ServiceRouter.patch("/complete", protect, completeServiceRequest);
ServiceRouter.post("/billing", protect, addBilling);
ServiceRouter.post("/rating", protect, addRating);

// routes/serviceRouter.js
// GET /api/services/pending-billing
ServiceRouter.get("/pending-billing", protect, async (req, res) => {
  try {
    console.log("FETCH BILLING FOR USER:", req.userId);

    // 1️⃣ See all documents for this customer
    const allCustomerRequests = await ServiceRequest.find({
      customerId: new mongoose.Types.ObjectId(req.userId)
    });
    console.log("ALL REQUESTS FOR THIS USER:", allCustomerRequests);

    // 2️⃣ Check all completed requests (ignore billing filter)
    const allBillingRequests = await ServiceRequest.find({
      customerId: new mongoose.Types.ObjectId(req.userId),
      status: "completed"
    });
    console.log("ALL COMPLETED REQUESTS (ignore billing filter):", allBillingRequests);

    // ✅ Your actual query for pending billing
    const requests = await ServiceRequest.find({
      customerId: new mongoose.Types.ObjectId(req.userId),
      status: "completed",
      "billing.paymentStatus": "pending",
    }).sort({ updatedAt: -1 });

    console.log("PENDING BILLING COUNT:", requests.length);
    console.log("PENDING BILLING DATA:", requests);

    res.json({ requests });
  } catch (err) {
    console.error("Pending billing error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default ServiceRouter;
