import { useState, useEffect } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Users,
  Clock,
  Activity,
  CheckCircle,
  DatabaseIcon,
} from "lucide-react";

// Register the necessary chart components and plugins
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartDataLabels
);

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    categoryCounts: [],
    statusCounts: [],
    dashboardStats: {
      total_customers: 0,
      total_pending: 0,
      total_ongoing: 0,
      total_completed: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("http://localhost:5001/admin/user-dashboard").then((res) =>
        res.json()
      ),
      fetch("http://localhost:5001/admin/dashboard-stats").then((res) =>
        res.json()
      ),
    ])
      .then(([chartData, statsData]) => {
        setDashboardData({
          categoryCounts: chartData.category_counts || [],
          statusCounts: chartData.status_counts || [],
          dashboardStats: statsData,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const chartContainerStyle = {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "30px",
  };

  const chartStyle = {
    width: "100%",
    maxWidth: "400px",
  };

  // Pie chart specific options
  const pieOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#fff",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        titleFont: {
          weight: "bold",
        },
        bodyFont: {
          weight: "bold",
        },
      },
      datalabels: {
        color: "#fff",
        display: true,
        font: {
          weight: "bold",
          size: 18,
        },
        formatter: (value, context) => {
          const sum = context.dataset.data.reduce((acc, val) => acc + val, 0);
          return ((value / sum) * 100).toFixed(2) + "%";
        },
      },
    },
    scales: {},
  };

  // Common options used for Bar and Line charts
  const commonOptions = {
    plugins: {
      legend: pieOptions.plugins.legend,
      tooltip: pieOptions.plugins.tooltip,
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#fff",
          font: {
            weight: "bold",
          },
        },
      },
      x: {
        ticks: {
          color: "#fff",
          font: {
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
    >
      <h1 className="text-3xl font-semibold text-green-400 mb-3 text-center">
        Data Insight Dashboard
      </h1>
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="stat bg-white p-4 shadow rounded hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
          <div>
            <p className="text-lg text-black font-bold">Total Customers</p>
            <p className="text-xl">
              {dashboardData.dashboardStats.total_customers}
            </p>
          </div>
          <Users size={40} color="blue" />
        </div>
        <div className="stat bg-white p-4 shadow rounded hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
          <div>
            <p className="text-lg text-black font-bold">Pending Incidents</p>
            <p className="text-xl">
              {dashboardData.dashboardStats.total_pending}
            </p>
          </div>
          <Clock size={40} color="red" />
        </div>
        <div className="stat bg-white p-4 shadow rounded hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
          <div>
            <p className="text-lg text-black font-bold">Ongoing Incidents </p>
            <p className="text-xl">
              {dashboardData.dashboardStats.total_ongoing}
            </p>
          </div>
          <Activity size={40} color="orange" style={{ marginLeft: "2px" }} />
        </div>
        <div className="stat bg-white p-4 shadow rounded hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
          <div>
            <p className="text-lg text-black font-bold">Completed Incidents</p>
            <p className="text-xl">
              {dashboardData.dashboardStats.total_completed}
            </p>
          </div>
          <CheckCircle size={40} color="green" />
        </div>
        <div className="bg-white p-4 shadow rounded hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
          <div>
            <p className="text-lg text-black font-bold">Total Incidents</p>
            <p className="text-xl">
              {dashboardData.dashboardStats.total_incidents}
            </p>
          </div>
          <DatabaseIcon size={40} color="black" />
        </div>
      </div>
      <div style={chartContainerStyle}>
        {/* Pie chart for category counts */}
        <div style={chartStyle}>
          <Pie
            data={{
              labels: dashboardData.categoryCounts.map((data) => data._id),
              datasets: [
                {
                  label: "Categories",
                  data: dashboardData.categoryCounts.map((data) => data.count),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                  hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                },
              ],
            }}
            options={pieOptions}
          />
        </div>
        {/* Bar chart for status counts */}
        <div style={chartStyle}>
          <Bar
            data={{
              labels: dashboardData.statusCounts.map((data) => data._id),
              datasets: [
                {
                  label: "Status Count",
                  data: dashboardData.statusCounts.map((data) => data.count),
                  backgroundColor: ["#4BC0C0", "#FF9F40", "#FFCD56"],
                  hoverBackgroundColor: ["#4BC0C0", "#FF9F40", "#FFCD56"],
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
        {/* Line chart for trends over time */}
        <div style={chartStyle}>
          <Line
            data={{
              labels: dashboardData.statusCounts.map((data) => data._id),
              datasets: [
                {
                  label: "Status Trends",
                  data: dashboardData.statusCounts.map((data) => data.count),
                  borderColor: "rgb(75, 192, 192)",
                  tension: 0.4,
                  fill: false,
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboard;
