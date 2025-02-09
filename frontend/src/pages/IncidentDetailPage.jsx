import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Info,
  User as UserIcon,
  Settings,
  Bookmark,
  Users2Icon,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore(); // User details including userType

  useEffect(() => {
    const fetchIncident = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/incidents/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch incident details");
        }
        const data = await response.json();
        setIncident(data);
        setNewStatus(data.status); // Set initial status from fetched data
        setNewTeam(data.team || "No team assigned"); // Set initial team from fetched data
      } catch (error) {
        console.error("Failed to fetch incident details:", error);
        alert(
          "Failed to fetch incident details due to an error: " + error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleTeamChange = (e) => {
    setNewTeam(e.target.value);
  };

  const saveChanges = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/incidents/${id}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            team: newTeam,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update incident details");
      }
      alert("Incident updated successfully");
      navigate("/admin/manage-incident"); // Navigate to management page or refresh
    } catch (error) {
      console.error("Error updating incident:", error);
      alert("Failed to update incident due to: " + error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!incident) {
    return <p>No incident found.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
    >
      <div className="p-6 max-w-2xl w-full bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-2">{incident.incidentTitle}</h1>
        <p className="mb-4">
          <Info size={18} className="inline mr-2" />
          {incident.description}
        </p>
        <p className="text-lg">
          <Bookmark size={18} className="inline mr-2" />
          Incident ID: {incident._id.slice(-5)}{" "}
        </p>
        <p className="text-lg">
          <Calendar size={18} className="inline mr-2" />
          Reported on: {incident.date}
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Mail size={18} className="inline mr-2" />
          <span>
            Status:{" "}
            <strong
              style={{
                color:
                  newStatus === "Completed"
                    ? "green"
                    : newStatus === "Pending"
                    ? "red"
                    : "orange",
              }}
            >
              {newStatus}
            </strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Users2Icon size={18} className="inline mr-2" />
          <span>
            Assign Team: <strong>{newTeam}</strong>
          </span>
        </div>

        {/* Admin-only controls for status and team change */}
        {user && user.userType === "Admin" && (
          <div className="flex items-center space-x-6 mt-4">
            <Settings size={25} className="inline mr-2" />
            <select
              value={newStatus}
              onChange={handleStatusChange}
              className="mr-2"
            >
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={newTeam} onChange={handleTeamChange}>
              <option value="No team assigned">No team assigned</option>
              <option value="Team 01">Team 01</option>
              <option value="Team 02">Team 02</option>
              <option value="Team 03">Team 03</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveChanges}
              className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Save Changes
            </motion.button>
          </div>
        )}
        <div className="pt-4">
          <h2 className="text-xl font-bold mb-3">Your Details</h2>
          <p>
            <UserIcon size={18} className="inline mr-2" />
            Name: {incident.customerName}
          </p>
          <p>
            <MapPin size={18} className="inline mr-2" />
            Address: {incident.address}
          </p>
          <p>
            <Phone size={18} className="inline mr-2" />
            Contact Number: {incident.contactNumber}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default IncidentDetailPage;
