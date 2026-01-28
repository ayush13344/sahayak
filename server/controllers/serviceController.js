import ServiceRequest from "../modal/Service.js";
import Partner from "../modal/Partner.js";
import Notification from "../modal/Notification.js";


/* =======================
   Distance Helper
======================= */
const getDistanceInKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +distance.toFixed(2); // round to 2 decimals
};

/* =======================
   CREATE SERVICE REQUEST (Customer)
======================= */
export const createServiceRequest = async (req, res) => {
  try {
    let { serviceType, problemDescription, location } = req.body;
    serviceType = serviceType?.trim().toLowerCase();

    if (!serviceType || !problemDescription || !location?.lat || !location?.lng) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const service = await ServiceRequest.create({
      customerId: req.userId,
      serviceType,
      problemDescription,
      location,
      status: "open",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Find nearby partners matching profession
    const partners = await Partner.find({
      isAvailable: true,
      status: "approved",
      profession: { $regex: `^${serviceType}$`, $options: "i" }, // case-insensitive
      location: { $exists: true },
    });

    const nearbyPartners = partners.filter((p) => {
      if (!p.location?.lat || !p.location?.lng) return false;
      const distance = getDistanceInKm(
        p.location.lat,
        p.location.lng,
        location.lat,
        location.lng
      );
      return distance <= 5; // 5 km radius
    });

    // Send notifications
    await Notification.insertMany(
      nearbyPartners.map((p) => ({
        user: p.user,
        message: `New ${serviceType} service request near your location`,
        type: "service_request",
        relatedId: service._id,
        status: "unread",
      }))
    );

    res.status(201).json({
      message: "Service request broadcasted successfully",
      service,
      notifiedPartners: nearbyPartners.length,
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   GET NEARBY REQUESTS (Provider)
======================= */
export const getNearbyRequests = async (req, res) => {
  try {
    console.log("🔥 getNearbyRequests HIT");

    const partner = await Partner.findOne({ user: req.userId });
    if (!partner || partner.status !== "approved" || !partner.location?.lat || !partner.location?.lng) {
      return res.status(400).json({ message: "Partner not approved or location missing" });
    }
    const allRequests = await ServiceRequest.find({});
console.log("All requests in DB:", allRequests.map(r => ({ serviceType: r.serviceType, status: r.status, expiresAt: r.expiresAt })));


    const profession = partner.profession?.trim().toLowerCase();

    // Fetch all open requests that match partner's profession (case-insensitive)
    const now = new Date();

const requests = await ServiceRequest.find({
  status: "open",
  serviceType: { $regex: profession, $options: "i" },

  $or: [
    { expiresAt: { $exists: false } }, // 👈 missing expiry
    { expiresAt: null },               // 👈 null expiry
    { expiresAt: { $gt: now } }        // 👈 valid expiry
  ]
}).sort({ createdAt: -1 });


    console.log("Total requests fetched (matching profession):", requests.length);

    const RADIUS_STEPS = [2, 5, 10, 25]; // km
    let nearbyRequests = [];
    let usedRadius = null;

    for (const radius of RADIUS_STEPS) {
      nearbyRequests = requests.filter(r => {
        if (!r.location?.lat || !r.location?.lng) return false;
        const distance = getDistanceInKm(
          partner.location.lat,
          partner.location.lng,
          r.location.lat,
          r.location.lng
        );
        return distance <= radius;
      });

      if (nearbyRequests.length > 0) {
        usedRadius = radius;
        break;
      }
    }

    console.log("Nearby requests found:", nearbyRequests.length, "Radius used:", usedRadius);

    res.json({
      radiusUsedInKm: usedRadius,
      count: nearbyRequests.length,
      requests: nearbyRequests,
    });
  } catch (err) {
    console.error("GET NEARBY REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   ACCEPT REQUEST (Provider)
======================= */
export const acceptServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const partner = await Partner.findOne({ user: req.userId });
    if (!partner) return res.status(400).json({ message: "Partner not available" });

    const request = await ServiceRequest.findById(requestId);
    if (!request || request.status !== "open") {
      return res.status(400).json({ message: "Request not available" });
    }

    if (new Date() > request.expiresAt) {
      return res.status(400).json({ message: "Request expired" });
    }

    // Case-insensitive check for profession
    if (request.serviceType.trim().toLowerCase() !== partner.profession.trim().toLowerCase()) {
      return res.status(403).json({ message: "Request not allowed for your profession" });
    }

    const distance = getDistanceInKm(
      partner.location.lat,
      partner.location.lng,
      request.location.lat,
      request.location.lng
    );
    if (distance > 5) return res.status(403).json({ message: "Request too far" });

    // Assign request
    const assigned = await ServiceRequest.findOneAndUpdate(
      { _id: requestId, status: "open" },
      { status: "assigned", assignedPartner: partner._id },
      { new: true }
    ).populate("assignedPartner", "fullName phone profession workType"); // ✅ populate provider details

    if (!assigned) return res.status(400).json({ message: "Request already taken" });

    // Close notifications related to this request
    await Notification.updateMany({ relatedId: requestId }, { status: "closed" });

    // Notify customer
    await Notification.create({
      user: assigned.customerId,
      type: "status_update",
      message: "Your service request has been accepted",
    });

    // Return request with partner details
    res.json({ message: "Service assigned successfully", request: assigned });
  } catch (error) {
    console.error("ACCEPT REQUEST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =======================
   COMPLETE SERVICE (Provider)
======================= */
export const completeServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const partner = await Partner.findOne({ user: req.userId });
    if (!partner) {
      return res.status(403).json({ message: "Partner not authorized" });
    }

    const request = await ServiceRequest.findOne({
      _id: requestId,
      assignedPartner: partner._id,
      status: "assigned",
    });

    if (!request) {
      return res.status(400).json({ message: "Request not found" });
    }

    request.status = "completed";

   if (!request.billing) {
  request.billing = {};
}
request.billing.paymentStatus = "pending";

    await request.save();

    res.json({ message: "Service completed. Billing pending." });
  } catch (err) {
    console.error("COMPLETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =======================
   ADD BILLING (Customer)
======================= */
export const addBilling = async (req, res) => {
  try {
    const { requestId, baseCharge, workCharge, paymentMode } = req.body;

    const request = await ServiceRequest.findOne({
      _id: requestId,
      customerId: req.userId,
      status: "completed",
    });

    if (!request) {
      return res.status(400).json({ message: "Invalid request for billing" });
    }

    if (request.billing?.paymentStatus === "paid") {
      return res.status(400).json({ message: "Billing already completed" });
    }

    const platformFee = Math.round((baseCharge + workCharge) * 0.1); // 10%
    const totalAmount = baseCharge + workCharge + platformFee;

    request.billing = {
      baseCharge,
      workCharge,
      platformFee,
      totalAmount,
      paymentMode,
      paymentStatus: "paid",
      billedAt: new Date(),
    };

    await request.save();

    // Notify partner
    await Notification.create({
      user: request.assignedPartner,
      type: "billing",
      message: `Payment of ₹${totalAmount} completed`,
    });

    res.json({ message: "Payment successful", billing: request.billing });
  } catch (err) {
    console.error("BILLING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   ADD RATING (Customer)
======================= */
export const addRating = async (req, res) => {
  try {
    const { requestId, stars, review } = req.body;

    const request = await ServiceRequest.findOne({
      _id: requestId,
      customerId: req.userId,
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.billing?.paymentStatus !== "paid") {
      return res.status(403).json({ message: "Complete payment before rating" });
    }

    request.rating = {
      stars,
      review,
      ratedAt: new Date(),
    };

    await request.save();

    res.json({ message: "Thanks for rating" });
  } catch (err) {
    console.error("RATING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
