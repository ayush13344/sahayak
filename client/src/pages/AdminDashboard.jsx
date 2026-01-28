import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Briefcase,
} from "lucide-react";
import api from "../config/api";
import toast from "react-hot-toast";

/* ===============================
   STATUS BADGE
================================ */
const StatusBadge = ({ status }) => {
  const config = {
    approved: {
      icon: <CheckCircle size={14} />,
      className: "bg-green-100 text-green-700",
    },
    rejected: {
      icon: <XCircle size={14} />,
      className: "bg-red-100 text-red-700",
    },
    pending: {
      icon: <Clock size={14} />,
      className: "bg-yellow-100 text-yellow-700",
    },
  };

  const badge = config[status] || {};

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
    >
      {badge.icon}
      {status?.toUpperCase() || "N/A"}
    </span>
  );
};

/* ===============================
   ADMIN DASHBOARD
================================ */
const AdminDashboard = () => {
  const [partners, setPartners] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/applications");
      setPartners(res.data.applications || []);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const approvePartner = async (id) => {
    try {
      await api.patch(`/admin/applications/${id}`, { status: "approved" });
      toast.success("Partner approved");
      fetchPartners();
    } catch {
      toast.error("Approval failed");
    }
  };

  const rejectPartner = async (id) => {
    const reason = prompt("Reason for rejection") || "Not specified";
    try {
      await api.patch(`/admin/applications/${id}`, {
        status: "rejected",
        rejectionReason: reason,
      });
      toast.success("Partner rejected");
      fetchPartners();
    } catch {
      toast.error("Rejection failed");
    }
  };

  const filteredPartners = partners.filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-600">
          Review and manage partner applications
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              filter === s
                ? "bg-indigo-600 text-white shadow"
                : "bg-white border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-slate-500">
          Loading applications…
        </p>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {!loading && filteredPartners.length === 0 && (
          <p className="col-span-full text-center text-slate-500">
            No applications found
          </p>
        )}

        {!loading &&
          filteredPartners.map((partner) => (
            <div
              key={partner._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {partner.fullName || "N/A"}
                </h2>
                <StatusBadge status={partner.status} />
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {partner.phone || "N/A"}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {partner.location?.lat && partner.location?.lng
                    ? `${partner.location.lat.toFixed(5)}, ${partner.location.lng.toFixed(5)}`
                    : partner.location || "N/A"}
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  {partner.workType || "N/A"} •{" "}
                  {partner.experience || 0} yrs
                </div>
              </div>

              {/* Documents */}
              <div className="mt-4 flex flex-wrap gap-2">
                {partner.idProof && (
                  <a
                    href={`http://localhost:3000/${partner.idProof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                  >
                    ID Proof
                  </a>
                )}
                {partner.skillProof && (
                  <a
                    href={`http://localhost:3000/${partner.skillProof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                  >
                    Skill Proof
                  </a>
                )}
              </div>

              {/* Actions */}
              {partner.status === "pending" && (
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => approvePartner(partner._id)}
                    className="flex-1 rounded-xl bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => rejectPartner(partner._id)}
                    className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
