import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import api from "../config/api";

const MainLayout = () => {
  const [pendingBilling, setPendingBilling] = useState([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");

  const pollingRef = useRef(null);

  /* =======================
     Fetch Pending Billing
  ======================= */
  const fetchPendingBilling = async () => {
    try {
      const { data } = await api.get("/services/pending-billing");

      if (data.requests && data.requests.length > 0) {
        setPendingBilling(data.requests);
        setShowBillingModal(true);
      } else {
        setPendingBilling([]);
        setShowBillingModal(false);
      }
    } catch (err) {
      console.error("Failed to fetch pending billing", err);
    }
  };

  /* =======================
     Start Polling
  ======================= */
  useEffect(() => {
    fetchPendingBilling();

    pollingRef.current = setInterval(fetchPendingBilling, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  /* =======================
     Handle Payment
  ======================= */
  const handlePay = async (requestId) => {
    if (!paymentMode) {
      alert("Please select payment mode");
      return;
    }

    try {
      const { data } = await api.post("/services/billing", {
        requestId,
        baseCharge: 100,
        workCharge: 50,
        paymentMode,
      });

      alert("Payment successful 🎉");

      // STOP polling once paid
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      setShowBillingModal(false);
      setPendingBilling([]);
      setPaymentMode("");
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed");
    }
  };

  return (
    <>
      <Navbar />
      <Outlet />

      {/* =======================
          Pending Billing Modal
      ======================= */}
      {showBillingModal && pendingBilling.length > 0 && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Complete Your Payment
            </h2>

            {pendingBilling.map((req) => (
              <div
                key={req._id}
                className="border rounded-xl p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50"
              >
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Service:
                    </span>{" "}
                    {req.serviceType}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-900">
                      Problem:
                    </span>{" "}
                    {req.problemDescription}
                  </p>

                  <p className="text-lg font-bold text-indigo-600">
                    ₹{req.billing?.totalAmount || 0}
                  </p>
                </div>

                {/* Payment Mode */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {/* Pay Button */}
                <button
                  onClick={() => handlePay(req._id)}
                  className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MainLayout;
