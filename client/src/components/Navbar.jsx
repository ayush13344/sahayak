import {
  HeartHandshakeIcon,
  ClipboardList,
  Star,
  LogOut,
  Bell,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../app/features/authSlice.js";
import api from "../config/api";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      )
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/my");
        setNotifications(res.data.notifications || []);
      } catch {
        setNotifications([]);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-full flex justify-center mt-6 sticky top-4 z-50">
      <nav
        className="
          relative flex items-center justify-between
          w-full max-w-5xl
          rounded-[999px]
          border border-black/10
          bg-white/75 backdrop-blur-xl
          px-6 py-3 text-sm
          shadow-[0_10px_30px_rgba(0,0,0,0.12)]
        "
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-semibold">
            S
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
          {user?.role === "service_provider" ? (
            <Link
              to="/pro-requests"
              className="flex items-center gap-2 hover:text-black transition"
            >
              <ClipboardList size={18} />
              Requests
            </Link>
          ) : (
            <Link
              to="/partner"
              className="flex items-center gap-2 hover:text-black transition"
            >
              <HeartHandshakeIcon size={18} />
              Partner with Sahayak
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/register">
                <button className="rounded-full border border-black/20 px-4 py-2 text-gray-700 hover:bg-black/5 transition">
                  Register
                </button>
              </Link>
              <Link to="/login">
                <button className="rounded-full bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition">
                  Login
                </button>
              </Link>
            </>
          ) : (
            <div ref={profileRef} className="relative flex items-center gap-3">
              {/* Profile */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-3 py-1 rounded-full hover:bg-black/5 transition"
              >
                <span className="text-gray-800">
                  Hi, <strong>{user.name}</strong>
                </span>
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                  className="w-8 h-8 rounded-full"
                  alt="profile"
                />
              </button>

              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <Bell
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(!showNotifications);
                  }}
                  className="w-5 h-5 text-gray-700 cursor-pointer hover:text-black transition"
                />

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-96 rounded-3xl bg-white/95 backdrop-blur-2xl border border-black/10 shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden z-50">
                    <div className="px-5 py-4 border-b border-black/10">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className="px-5 py-4 border-b border-black/5 hover:bg-black/5 transition"
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {n.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-14 w-56 bg-white/95 rounded-3xl shadow-xl border border-black/10">
                  <div className="px-4 py-3 border-b border-black/10">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <Link
                    to="/my-requests"
                    className="flex gap-3 px-4 py-2 hover:bg-black/5 transition"
                  >
                    <ClipboardList size={16} /> My Requests
                  </Link>

                  <Link
                    to="/ratings"
                    className="flex gap-3 px-4 py-2 hover:bg-black/5 transition"
                  >
                    <Star size={16} /> Ratings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex gap-3 px-4 py-2 text-red-500 w-full hover:bg-red-50 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
