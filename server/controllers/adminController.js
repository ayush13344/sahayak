import Partner from "../modal/Partner.js";
import User from "../modal/User.js";
import Notification from "../modal/Notification.js";

/**
 * GET all partner applications
 */
export const getAllApplications = async (req, res) => {
  try {
    const { status, serviceType } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.workType = serviceType; // assuming workType is serviceType

    const applications = await Partner.find(filter)
      .populate("user", "name email") // populate user info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/**
 * GET single application
 */
export const getSingleApplication = async (req, res) => {
  try {
    const application = await Partner.findById(req.params.id).populate("user", "name email");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error("GET SINGLE APPLICATION ERROR:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

/**
 * Approve or Reject application
 */
export const verifyApplication = async (req, res) => {
   console.log("REQ.BODY:", req.body);
    console.log("REQ.PARAMS.ID:", req.params.id);
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 1️⃣ Find the application
    const application = await Partner.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (!application.user) return res.status(400).json({ message: "Application missing user" });

    // 2️⃣ Update application status
    application.status = status;
    application.verifiedBy = req.userId;
    application.rejectionReason = status === "rejected" ? rejectionReason || "Not specified" : "";
    await application.save();

    // 3️⃣ Update user role
    const user = await User.findById(application.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (status === "approved") {
      user.role = "service_provider";
      user.isPartnerVerified = true;
    } else {
      user.role = "user";
      user.isPartnerVerified = false;
    }
    await user.save();

    // 4️⃣ Create notification
    await Notification.create({
      user: application.user,
      message:
        status === "approved"
          ? "🎉 Your service provider application has been approved!"
          : `❌ Your application was rejected: ${rejectionReason || "Not specified"}`,
    });

    res.status(200).json({
      success: true,
      message: `Application ${status}`,
      application,
    });
  } catch (error) {
    console.error("VERIFY APPLICATION ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

/**
 * Dashboard statistics
 */
export const adminDashboardStats = async (req, res) => {
  try {
    const total = await Partner.countDocuments();
    const pending = await Partner.countDocuments({ status: "pending" });
    const approved = await Partner.countDocuments({ status: "approved" });
    const rejected = await Partner.countDocuments({ status: "rejected" });

    res.status(200).json({
      success: true,
      stats: { total, pending, approved, rejected },
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
