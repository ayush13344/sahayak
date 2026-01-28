import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: { type: String, required: true },
    problemDescription: { type: String, required: true },
    location: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    status: { type: String, enum: ["open", "assigned", "completed"], default: "open" },
    assignedPartner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", default: null },
    expiresAt: { type: Date, required: true, index: true },
    billing: {
      baseCharge: { type: Number, default: 0 },
      workCharge: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      paymentMode: { type: String, enum: ["cash", "upi"] },
      paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
      billedAt: Date,
    },
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date,
    },
  },
  { timestamps: true, collection: "servicerequests" } // <-- add this
);

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema,
  "servicerequests" // explicitly use the collection name in MongoDB
);

export default ServiceRequest;

