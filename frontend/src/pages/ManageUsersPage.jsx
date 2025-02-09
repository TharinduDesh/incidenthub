import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    userType: "User",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/admin/users");
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const url = currentUser
      ? `http://localhost:5001/admin/users/${currentUser._id}`
      : "http://localhost:5001/admin/users";
    const method = currentUser ? "put" : "post";
    const payload = {
      email: formData.email,
      name: formData.name,
      userType: formData.userType,
    };

    if (formData.password) {
      // Only send password if it's set
      payload.password = formData.password;
    }

    try {
      await axios({
        method: method,
        url: url,
        data: payload,
      });
      setShowModal(false);
      fetchUsers();
      setFormData({ email: "", password: "", name: "", userType: "User" }); // Reset form
      setCurrentUser(null); // Reset current user
    } catch (error) {
      console.error(
        "Error submitting user:",
        error.response ? error.response.data : error
      );
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5001/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error(
          "Error deleting user:",
          error.response ? error.response.data : error
        );
        alert(
          "Failed to delete user: " +
            (error.response ? error.response.data.error : error.message)
        );
      }
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      userType: user.userType,
      password: "", // Clear password field when editing
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setCurrentUser(null);
    setFormData({ email: "", password: "", name: "", userType: "User" });
    setShowModal(true);
  };

  if (loading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
          Manage Users
        </h1>
        <button
          onClick={handleAddNew}
          className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New User
        </button>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="w-full bg-gray-800 text-white">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">User Type</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.userType || "N/A"}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-5 rounded-lg max-w-sm mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold mb-2">
                  {currentUser ? "Edit User" : "Add New User"}
                </h2>

                <div>
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">User Type</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={(e) =>
                      setFormData({ ...formData, userType: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    required={!currentUser}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {currentUser ? "Update User" : "Create User"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ManageUsersPage;
