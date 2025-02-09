import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ViewIncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
  });

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      if (!user?.email) {
        alert("Please log in to view incidents.");
        return; // Prevent fetch if no user email is available
      }

      const queryParams = new URLSearchParams({
        ...filters,
        email: user.email, // Include user email in query params for regular users
      }).toString();
      const url = `http://localhost:5001/incidents?${queryParams}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setIncidents(data);
        } else {
          alert("Failed to fetch incidents");
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
        alert("Error fetching incidents");
      }
    };

    fetchIncidents();
  }, [filters, user?.email]); // Depend on user.email to re-fetch when it changes

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleIncidentClick = (id) => {
    navigate(`/incident/${id}`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { color: "red" };
      case "Ongoing":
        return { color: "orange" };
      case "Completed":
        return { color: "green" };
      default:
        return { color: "gray" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
    >
      <div className="container mx-auto p-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
            Incidents Reported
          </h1>
          <div className="flex space-x-4">
            <div className="flex bg-white rounded overflow-hidden border">
              <Search className="m-2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search..."
                value={filters.search}
                onChange={handleFilterChange}
                className="p-2 outline-none"
              />
            </div>
            <div className="flex items-center space-x-1 bg-white rounded overflow-hidden border p-2">
              <Filter className="text-gray-400" />
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="outline-none"
              >
                <option value="">All Categories</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Safety Incident">Safety Incident</option>
                <option value="Other">Other</option>
              </select>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incidents.map((incident) => (
            <motion.div
              key={incident._id}
              onClick={() => handleIncidentClick(incident._id)}
              className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <h2 className="text-lg font-semibold">
                {incident.incidentTitle}
              </h2>
              <p>{incident.description}</p>
              <p className="text-sm text-gray-600">
                Incident ID: {incident.short_id}{" "}
                {/* Display the short_id from the database */}
              </p>
              <p className="text-sm text-gray-600">
                Category: {incident.category}
              </p>
              <p className="text-sm" style={getStatusStyle(incident.status)}>
                Status: {incident.status}
              </p>
              <p className="text-sm text-gray-600">
                Reported on: {incident.date}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ViewIncidentsPage;
