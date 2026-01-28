import React, { useState, useEffect } from "react";
import { Mic, MicOff, Send, MapPin, Sparkles, Wrench } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import api from "../config/api.js";
import toast from "react-hot-toast";

const serviceImages = {
  plumber:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000",
  electrician:
    "https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1000",
  ac:
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000",
  painter:
    "https://images.unsplash.com/photo-1598300053652-6b0a9c35d5c2?q=80&w=1000",
};

const Broadcast = () => {
  const { serviceType: paramService } = useParams();
  const { state } = useLocation();

  const serviceType = (state?.serviceType || paramService)?.toLowerCase();

  const [description, setDescription] = useState("");
  const [listening, setListening] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!serviceType) toast.error("Service type missing");
  }, [serviceType]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "en-IN";
      recog.onresult = (e) => {
        setDescription((prev) => prev + " " + e.results[0][0].transcript);
        setListening(false);
      };
      recog.onend = () => setListening(false);
      setRecognition(recog);
    }
  }, []);

  const startListening = () => {
    if (!recognition) return toast.error("Speech not supported");
    setListening(true);
    recognition.start();
  };

  const fetchLocation = () => {
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => {
        toast.error("Location access denied");
        setLoadingLocation(false);
      }
    );
  };

  const handleBroadcast = () => {
    if (!description.trim()) return toast.error("Describe the problem");
    if (!location) return toast.error("Share your location");
    setShowConfirm(true);
  };

  const confirmBroadcast = async () => {
    try {
      setSubmitting(true);

      await api.post("/services", {
        serviceType,
        problemDescription: description,
        location,
      });

      toast.success("📢 Request broadcasted");
      setShowConfirm(false);

      setWaiting(true);

      setTimeout(() => {
        toast.success("✅ A service provider accepted your request!");
        setWaiting(false);
      }, 6000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Broadcast failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ================= HERO ================= */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={
            serviceImages[serviceType] ||
            "https://images.unsplash.com/photo-1521791136064-7986c2920216"
          }
          alt={serviceType}
          className="w-full h-full object-cover scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-indigo-900/40 flex items-center justify-center">
          <div className="text-white text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
              <Sparkles size={16} />
              <span className="text-sm">Quick Service Request</span>
            </div>

            <h1 className="text-4xl font-bold capitalize mt-3">
              {serviceType} Service
            </h1>

            <p className="text-sm text-white/80 max-w-md">
              Describe your issue and we’ll instantly notify nearby verified professionals
            </p>
          </div>
        </div>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 flex justify-center px-4 py-12 -mt-28">
        <div className="bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] rounded-3xl p-8 w-full max-w-xl border border-indigo-100">

          {/* Service Badge */}
          <div className="flex items-center gap-2 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 px-4 py-2 rounded-full w-fit border">
            <Wrench size={16} />
            <span className="font-semibold capitalize">{serviceType}</span>
          </div>

          {/* Description */}
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe your ${serviceType} problem...`}
              className="w-full min-h-[150px] rounded-2xl p-5 pr-16 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
            />

            <button
              onClick={listening ? () => recognition.stop() : startListening}
              className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${
                listening
                  ? "bg-red-500 animate-pulse"
                  : "bg-indigo-600 hover:scale-110"
              } text-white`}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* Location Card */}
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <MapPin size={18} className="text-indigo-600" />
              Your Location
            </div>

            {location ? (
              <p className="text-sm text-slate-700 mt-1">
                📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-1">
                Location not shared
              </p>
            )}

            <button
              onClick={fetchLocation}
              disabled={loadingLocation}
              className="mt-4 w-full rounded-xl border border-indigo-600 text-indigo-600 py-2.5 font-semibold hover:bg-indigo-50 transition"
            >
              {loadingLocation ? "Fetching location..." : "Use Current Location"}
            </button>
          </div>

          {/* Broadcast Button */}
          <button
            onClick={handleBroadcast}
            className="mt-7 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg hover:opacity-95 transition"
          >
            <Send size={18} />
            Broadcast Request
          </button>
        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl border">
            <h3 className="text-xl font-semibold mb-2">
              Confirm Broadcast
            </h3>

            <p className="text-sm text-slate-600 mb-5">
              This request will be sent to nearby{" "}
              <b className="capitalize">{serviceType}</b> professionals.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full border py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBroadcast}
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold"
              >
                {submitting ? "Broadcasting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= WAITING OVERLAY ================= */}
      {waiting && (
        <div className="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-lg font-semibold mb-1">
              Finding a {serviceType}...
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while nearby professionals respond
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Broadcast;
