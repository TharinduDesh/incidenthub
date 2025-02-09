import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const ReportIncidentPage = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    email: user?.email || "",
    customerName: "",
    address: "",
    contactNumber: "",
    incidentTitle: "",
    description: "",
    category: "",
    date: "",
  });

  const [error, setError] = useState(""); // Error state to handle input validation messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      if (value === "" || (/^[0-9\b]+$/.test(value) && value.length <= 10)) {
        setFormData({ ...formData, [name]: value });
        if (value.length !== 10) {
          setError("Contact number must be 10 digits.");
        } else {
          setError(""); // Clear error when 10 digits are entered
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if all fields are filled
    if (
      !formData.customerName ||
      !formData.address ||
      !formData.contactNumber ||
      !formData.incidentTitle ||
      !formData.description ||
      !formData.category ||
      !formData.date ||
      formData.contactNumber.length !== 10
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/report-incident", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const json = await response.json();
      console.log("Response from server: ", json);
      if (response.ok) {
        alert("Incident reported successfully!");
        setFormData({
          email: user?.email || "", // Reset email in case the user changes
          customerName: "",
          address: "",
          contactNumber: "",
          incidentTitle: "",
          description: "",
          category: "",
          date: "",
        });
        handleClear(); // Clear the form if submission is successful
      } else {
        alert("Failed to report incident: " + json.error);
      }
    } catch (error) {
      console.error("Failed to report incident", error);
      alert("Failed to report incident due to an error");
    }
  };

  const handleClear = () => {
    setFormData({
      customerName: "",
      address: "",
      contactNumber: "",
      incidentTitle: "",
      description: "",
      category: "",
      date: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl w-full mx-auto my-10 p-8 bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700"
    >
      <h2 className="text-3xl font-bold text-center text-green-300 mb-6">
        Report Incident
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Display error if there is one */}
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-green-400 mb-2">
            Your Details
          </h3>
          <div className="space-y-4">
            {renderInput(
              "customerName",
              "Customer Name",
              formData.customerName,
              handleChange
            )}
            {renderInput("address", "Address", formData.address, handleChange)}
            {renderInput(
              "contactNumber",
              "Contact Number",
              formData.contactNumber,
              handleChange,
              "tel"
            )}
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-xl font-semibold text-green-400 mb-2">
            Incident Details
          </h3>
          <div className="space-y-4">
            {renderInput(
              "incidentTitle",
              "Incident Title",
              formData.incidentTitle,
              handleChange
            )}
            {renderTextarea(
              "description",
              "Description",
              formData.description,
              handleChange
            )}
            {renderSelect(
              "category",
              "Category",
              formData.category,
              handleChange,
              ["Technical Issue", "Safety Incident", "Other"]
            )}
            {renderInput("date", "Date", formData.date, handleChange, "date")}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Clear
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Submit
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const renderInput = (name, label, value, onChange, type = "text") => {
  let inputProps = {};

  if (type === "tel") {
    // Only accept numbers, limit to 10 digits
    inputProps.maxLength = 10;
    inputProps.pattern = "[0-9]{10}";
    inputProps.title = "10-digit phone number";
  } else if (type === "date") {
    // Disallow future dates
    inputProps.max = new Date().toISOString().split("T")[0];
  }

  return (
    <label className="block">
      <span className="text-gray-300">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
        {...inputProps} // Spread additional props based on the input type
      />
    </label>
  );
};

const renderTextarea = (name, label, value, onChange) => (
  <label className="block">
    <span className="text-gray-300">{label}</span>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
      rows="3"
    ></textarea>
  </label>
);

const renderSelect = (name, label, value, onChange, options) => (
  <label className="block">
    <span className="text-gray-300">{label}</span>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
    >
      <option value="" className="text-gray-300">
        Select Category
      </option>
      {options.map((option) => (
        <option key={option} value={option} className="bg-gray-700 text-white">
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default ReportIncidentPage;
