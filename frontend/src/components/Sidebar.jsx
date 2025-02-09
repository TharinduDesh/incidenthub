import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  User,
  Send,
  Calendar,
  LogOut,
  ArchiveXIcon,
  SettingsIcon,
  ChartLineIcon,
} from "lucide-react";

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } fixed left-0 top-0 w-64 h-full bg-gray-800 text-white transition-transform duration-300 z-40 shadow-lg flex flex-col justify-between`}
    >
      <div>
        <div className="p-5 pt-20">
          {" "}
          <h2 className="text-xl font-semibold mb-5">My IncidentHub</h2>
          <ul>
            <li
              className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer mb-3 transition-colors duration-200 text-lg"
              onClick={() => navigate("/")}
            >
              <User className="mr-3" size={24} /> Profile
            </li>

            {/* Add report incident only visble to user */}
            {user && user.userType === "User" && (
              <li
                className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer mb-3 transition-colors duration-200 text-lg"
                onClick={() => navigate("/report-incident")}
              >
                <Send className="mr-3" size={24} /> Report Incident
              </li>
            )}

            {/* View Incidents - Visible only to users */}
            {user && user.userType === "User" && (
              <li
                className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer mb-3 transition-colors duration-200 text-lg"
                onClick={() => navigate("/view-incidents")}
              >
                <ArchiveXIcon className="mr-3" size={24} /> View Incidents
              </li>
            )}

            {/* Admin only links */}
            {user && user.userType === "Admin" && (
              <>
                <li
                  className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer mb-3 transition-colors duration-200 text-lg"
                  onClick={() => navigate("/admin/user-dashboard")}
                >
                  <ChartLineIcon className="mr-3" size={24} /> Data Insight
                </li>

                <li
                  className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer mb-3 transition-colors duration-200 text-lg"
                  onClick={() => navigate("/admin/manage-incident")}
                >
                  <SettingsIcon className="mr-3" size={24} /> Manage Incidents
                </li>
                <li
                  className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer mb-3 transition-colors duration-200 text-lg"
                  onClick={() => navigate("/admin/manage-users")}
                >
                  <User className="mr-3" size={24} /> Manage Users
                </li>
              </>
            )}

            <li
              className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer mb-3 transition-colors duration-200 text-lg"
              onClick={() => navigate("/calendar")}
            >
              <Calendar className="mr-3" size={24} /> Calendar
            </li>
          </ul>
        </div>
      </div>
      <div>
        <button
          onClick={handleLogout}
          className="w-full p-3 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 rounded-b-lg transition duration-300"
        >
          <div className="flex items-center justify-center">
            <LogOut className="mr-2" size={24} /> Logout
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
