import React, { useEffect, useState } from "react";
import {
  MapPin,
  FileText,
  CheckCircle,
  X,
  Navigation,
  CheckCheck,
} from "lucide-react";
import api from "../../config/api.js";

/* =======================
   DISTANCE UTILITY
======================= */
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

export default function ProviderRequest() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerLocation, setProviderLocation] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [paymentSent, setPaymentSent] = useState(false);

  /* =======================
     PROVIDER LOCATION
  ======================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setProviderLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => console.warn("Location permission denied")
    );
  }, []);

  /* =======================
     FETCH REQUESTS
  ======================= */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/services/nearby");
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch (err) {
      console.error("Failed to load requests", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* =======================
     ACCEPT JOB
  ======================= */
  const acceptJob = async () => {
    try {
      await api.patch("/services/accept", {
        requestId: selectedRequest._id,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedRequest._id ? { ...r, status: "assigned" } : r
        )
      );

      setSelectedRequest((prev) => ({ ...prev, status: "assigned" }));
      setPaymentSent(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to accept job");
    }
  };

  /* =======================
     COMPLETE JOB
  ======================= */
  const completeJob = async () => {
    try {
      await api.patch("/services/complete", {
        requestId: selectedRequest._id,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedRequest._id
            ? { ...r, status: "completed" }
            : r
        )
      );

      setSelectedRequest((prev) => ({
        ...prev,
        status: "completed",
      }));

      setPaymentSent(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to complete job");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-blue-100 p-8">
      {/* Header */}
      <h1 className="text-4xl font-bold text-slate-900 mb-2">
        Service Requests
      </h1>
      <p className="text-slate-600 mb-8">
        Nearby jobs available for you
      </p>

      {loading && (
        <p className="text-slate-500">Loading requests...</p>
      )}
      {!loading && requests.length === 0 && (
        <p className="text-slate-500">No requests found</p>
      )}

      {/* =======================
          REQUEST CARDS
      ======================= */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => {
          const distance =
            providerLocation &&
            getDistanceInKm(
              providerLocation.lat,
              providerLocation.lng,
              req.location.lat,
              req.location.lng
            );

          const statusBadge = {
            open: "bg-emerald-100 text-emerald-700",
            assigned: "bg-indigo-100 text-indigo-700",
            completed: "bg-slate-200 text-slate-700",
          };

          return (
            <div
              key={req._id}
              onClick={() => {
                setSelectedRequest(req);
                setPaymentSent(false);
              }}
              className="group cursor-pointer rounded-2xl bg-white/80 backdrop-blur p-6 shadow-md hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  {req.serviceType}
                </h2>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${statusBadge[req.status]}`}
                >
                  {req.status.toUpperCase()}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                {req.problemDescription}
              </p>

              <div className="mt-4 flex items-center justify-between text-sm">
                {distance && (
                  <span className="text-indigo-600 font-medium">
                    {distance} km away
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapLocation(req.location);
                }}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-50 text-indigo-700 py-2.5 font-semibold hover:bg-indigo-100 transition"
              >
                <Navigation size={16} />
                Navigate
              </button>
            </div>
          );
        })}
      </div>

      {/* =======================
          DETAILS MODAL
      ======================= */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X />
            </button>

            <h2 className="text-2xl font-semibold mb-4">
              {selectedRequest.serviceType}
            </h2>

            <div className="space-y-3 text-slate-700">
              <p>{selectedRequest.problemDescription}</p>

              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {selectedRequest.location.lat},{" "}
                {selectedRequest.location.lng}
              </div>

              <div className="flex items-center gap-2">
                <FileText size={16} />
                {new Date(
                  selectedRequest.createdAt
                ).toDateString()}
              </div>
            </div>

            {/* ACTIONS */}
            {selectedRequest.status === "open" && (
              <button
                onClick={acceptJob}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-semibold transition"
              >
                <CheckCircle /> Accept Job
              </button>
            )}

            {selectedRequest.status === "assigned" && (
              <button
                onClick={completeJob}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold transition"
              >
                <CheckCheck /> Complete Job
              </button>
            )}

            {selectedRequest.status === "completed" && (
              <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <p className="font-semibold text-emerald-700">
                  ✅ Job completed successfully
                </p>
                <p className="mt-1 text-sm text-emerald-600">
                  Payment request has been sent
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================
          MAP MODAL
      ======================= */}
      {mapLocation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setMapLocation(null)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow"
            >
              <X size={18} />
            </button>

            <iframe
              title="Map"
              width="100%"
              height="420"
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
