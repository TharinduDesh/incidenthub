// Import the Menu icon and the logo image
import { Menu } from "lucide-react";
import logoImage from "../img/sltlogo.png";

const TopNavbar = ({ toggleSidebar }) => {
  return (
    <div className="bg-gray-800 text-white w-full p-4 flex justify-between items-center fixed top-0 left-0 z-50">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar}>
          <Menu className="text-white" size={24} />
        </button>
        <img src={logoImage} alt="Company Logo" className="h-12" />
      </div>
      <h1 className="text-xl font-semibold mb-5">SLT IncidentHub</h1>
      {/* Add more elements to the navbar if needed */}
    </div>
  );
};

export default TopNavbar;
