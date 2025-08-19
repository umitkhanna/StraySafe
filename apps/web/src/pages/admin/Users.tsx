import { useState, FC } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import UserTable from "@/components/UserTable";

const Dashboard: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
          isOpen ? "ml-60" : "ml-16"
        }`}
      >
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <UserTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
