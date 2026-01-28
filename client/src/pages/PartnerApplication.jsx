import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../config/api.js";
import { professions } from "../components/Professions";

/* ===========================
   Dynamic Work Types
=========================== */
const workTypesByProfession = {
  electrician: [
    "Wiring",
    "Switch & Socket Installation",
    "Appliance Installation",
    "Fault Repair",
    "Emergency Electrical Services",
  ],
  plumber: [
    "Leak Repair",
    "Pipe Installation",
    "Bathroom Fittings",
    "Drain Cleaning",
    "Emergency Plumbing",
  ],
  carpenter: [
    "Furniture Making",
    "Door & Window Installation",
    "Wood Repair",
    "Modular Furniture",
  ],
  "ac-technician": [
    "AC Installation",
    "AC Servicing",
    "Gas Refilling",
    "AC Repair",
    "AMC / Maintenance",
  ],
  painter: [
    "Interior Painting",
    "Exterior Painting",
    "Wall Texture",
    "Waterproofing",
    "Repainting / Touch-up",
  ],
};

const PartnerApplication = () => {
  const navigate = useNavigate();
  const { professionId } = useParams();

  const profession = professions.find((p) => p.id === professionId);
  const workTypes = workTypesByProfession[professionId] || [];

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    experience: "",
    location: "",
    lat: null,
    lng: null,
    workType: "",
  });

  const [idProof, setIdProof] = useState(null);
  const [skillProof, setSkillProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locating, setLocating] = useState(false); // 🔄 spinner state

  /* ===========================
     Use Current Location
  =========================== */
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation not supported");
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          location: "",
        }));
        toast.success("Location detected successfully");
        setLocating(false);
      },
      () => {
        toast.error("Unable to fetch location");
        setLocating(false);
      }
    );
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ===========================
     Submit Form
  =========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idProof || !skillProof) {
      return toast.error("Please upload required documents");
    }

    try {
      setLoading(true);
      const data = new FormData();

      data.append("profession", professionId);
      data.append("fullName", formData.fullName);
      data.append("phone", formData.phone);
      data.append("experience", formData.experience);
      data.append("workType", formData.workType);
      data.append("idProof", idProof);
      data.append("skillProof", skillProof);

      if (formData.lat && formData.lng) {
        data.append("lat", formData.lat);
        data.append("lng", formData.lng);
      } else {
        data.append("location", formData.location);
      }

      await api.post("/partners/apply", data);
      setShowSuccess(true);
    } catch (err) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= Page Wrapper ================= */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-[0_25px_60px_rgba(79,70,229,0.15)]"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl bg-indigo-100 p-2 text-indigo-700 hover:bg-indigo-200 transition"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <span className="text-xs font-medium text-indigo-600">
                Step 2 of 2
              </span>
              <h1 className="text-2xl font-semibold text-slate-900">
                Partner Application
              </h1>
              <p className="text-slate-600">
                Applying as{" "}
                <span className="font-medium text-indigo-600">
                  {profession?.label}
                </span>
              </p>
            </div>
          </div>

          {/* ================= Form ================= */}
          <form
            onSubmit={handleSubmit}
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <Input label="Full Name" name="fullName" onChange={handleChange} />
            <Input label="Phone Number" name="phone" onChange={handleChange} />
            <Input
              label="Years of Experience"
              name="experience"
              type="number"
              onChange={handleChange}
            />

            {/* Location */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Service Location
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                <MapPin className="text-indigo-500" />

                <input
                  type="text"
                  name="location"
                  placeholder="City, Area"
                  disabled={!!(formData.lat && formData.lng)}
                  value={
                    formData.lat && formData.lng
                      ? `${formData.lat.toFixed(5)}, ${formData.lng.toFixed(5)}`
                      : formData.location
                  }
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={locating}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-900 transition"
                >
                  {locating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Locating
                    </>
                  ) : (
                    "Use current"
                  )}
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Automatically detects your current service area
              </p>
            </div>

            <FileInput
              label="Identity Proof"
              helper="Aadhaar / PAN / Passport"
              onChange={(e) => setIdProof(e.target.files[0])}
            />

            <FileInput
              label="Skill Proof"
              helper="Certificate or work images"
              onChange={(e) => setSkillProof(e.target.files[0])}
            />

            {/* Work Type */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Type of Work
              </label>
              <select
                name="workType"
                required
                value={formData.workType}
                onChange={handleChange}
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select work type</option>
                {workTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 transition"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* ================= Success Modal ================= */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="w-[90%] max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>

              <h2 className="text-xl font-semibold">
                Application Submitted
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Our team will review your details and notify you shortly.
              </p>

              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate("/");
                }}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-white hover:bg-indigo-700 transition"
              >
                Go to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ================= Reusable Inputs ================= */
const Input = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium">{label}</label>
    <input
      {...props}
      required
      className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
    />
  </div>
);

const FileInput = ({ label, helper, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium">{label}</label>
    <input
      type="file"
      required
      {...props}
      className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3"
    />
    <p className="mt-1 text-xs text-slate-500">{helper}</p>
  </div>
);

export default PartnerApplication;
