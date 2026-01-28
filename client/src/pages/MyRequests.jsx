import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Trash2,
  MapPin,
  FileText,
  Briefcase,
  Phone,
  Star,
  User
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const statusStyles = {
  pending: {
    label: "Pending",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    accent: "border-l-yellow-400",
    icon: <Clock size={14} className="text-yellow-600" />,
  },
  open: {
    label: "Pending",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    accent: "border-l-yellow-400",
    icon: <Clock size={14} className="text-yellow-600" />,
  },
  accepted: {
    label: "Accepted",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    accent: "border-l-emerald-400",
    icon: <CheckCircle size={14} className="text-emerald-600" />,
  },
  assigned: {
    label: "Accepted",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    accent: "border-l-emerald-400",
    icon: <CheckCircle size={14} className="text-emerald-600" />,
  },
  rejected: {
    label: "Rejected",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    accent: "border-l-rose-400",
    icon: <XCircle size={14} className="text-rose-600" />,
  },
};

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const BACKEND_URL = "http://localhost:3000/api/requests";
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data || []);
    } catch {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Request deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const submitRating = async () => {
    if (!rating) return toast.error("Please select a rating");
    try {
      await axios.post(
        `${BACKEND_URL}/rate`,
        {
          requestId: selectedRequest._id,
          stars: rating,
          review,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Thanks for rating 🙌");
      setSelectedRequest(null);
      setRating(0);
      setReview("");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Rating failed");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">My Service Requests</h2>
          <p className="text-slate-500 mt-2">Track your current bookings and rate your service providers.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No requests found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((req) => {
              const isAccepted = req.status === "assigned" || req.status === "accepted";
              const canRate = isAccepted && req.billing?.paymentStatus === "paid";
              const status = statusStyles[req.status] || statusStyles.pending;

              return (
                <div
                  key={req._id}
                  onClick={() => canRate && setSelectedRequest(req)}
                  className={`bg-white border-l-4 ${status.accent} border rounded-2xl p-6 shadow-sm transition-all
                  ${canRate ? "cursor-pointer hover:shadow-md ring-emerald-500/10 hover:ring-4" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <Briefcase size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold capitalize text-slate-800">
                          {req.serviceType?.replace("_", " ") || "Service Request"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={13} />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                            <MapPin size={13} /> Service Location
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full border ${status.badge}`}>
                      {status.icon}
                      {status.label.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-6 bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Issue Reported:</span>
                      {req.problemDescription || "No description provided."}
                    </p>
                  </div>

                  {/* PROVIDER DETAILS - Added strict Optional Chaining to prevent charAt error */}
                  {isAccepted && req.assignedPartner && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                            {/* FIX: Using optional chaining and fallback for the initial */}
                            {req.assignedPartner?.fullName?.[0] || <User size={20} />}
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Assigned Partner</p>
                            <p className="text-sm font-bold text-slate-800">{req.assignedPartner?.fullName || "Professional"}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {req.assignedPartner?.phone || "Contact hidden"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-100 text-center">
                          <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold text-sm">
                            <Star size={14} fill="currentColor" />
                            {req.assignedPartner?.averageRating?.toFixed(1) || "5.0"}
                          </div>
                          <p className="text-[9px] text-yellow-700 font-medium mt-0.5">SCORE</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    {canRate ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Star size={14} className="animate-pulse" /> Click card to rate provider
                      </span>
                    ) : isAccepted ? (
                      <p className="text-[11px] font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        Complete payment to unlock rating
                      </p>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRequest(req._id);
                        }}
                        className="text-rose-500 text-xs font-bold flex items-center gap-1.5 hover:text-rose-700 transition"
                      >
                        <Trash2 size={14} /> CANCEL REQUEST
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RATING MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Service Rating</h3>
              <p className="text-sm text-slate-500 mt-1">
                How was your experience with <span className="font-bold text-slate-700">{selectedRequest.assignedPartner?.fullName || "the professional"}</span>?
              </p>
            </div>

            <div className="flex justify-center gap-2 my-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    size={40}
                    className={`transition-colors duration-200 ${
                      (hoverRating || rating) >= star ? "text-yellow-400" : "text-slate-200"
                    }`}
                    fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about the service..."
              rows={3}
              className="w-full border-slate-200 border-2 rounded-2xl p-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none"
            />

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
              >
                Skip
              </button>
              <button
                onClick={submitRating}
                className="py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;