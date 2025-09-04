import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../stores/authStore";

function UpgradeToDriver() {
  const [carModel, setCarModel] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [licenseNumber, setLicenseNumber] = useState("");
  const navigate = useNavigate()
  const { token } = useAuth();

  const handleUpgrade = async () => {
    try {
      await axios.post(
        "http://localhost:10000/api/driver/upgrade",
        { carModel, carPlate, seatsAvailable, licenseNumber },
        {
             headers: {
             Authorization: `Bearer ${token}`, // 👈 send token here
             }
        }
         
      );
      alert("Successfully upgraded to driver!");
      navigate("/driver-dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to upgrade");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Upgrade to Driver</h2>
      <input
        type="text"
        placeholder="Car Model"
        value={carModel}
        onChange={(e) => setCarModel(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Car Plate"
        value={carPlate}
        onChange={(e) => setCarPlate(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="number"
        placeholder="Seats Available"
        value={seatsAvailable}
        onChange={(e) => setSeatsAvailable(Number(e.target.value))}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="text"
        placeholder="License Number"
        value={licenseNumber}
        onChange={(e) => setLicenseNumber(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <button
        onClick={handleUpgrade}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Upgrade
      </button>
    </div>
  );
}

export default UpgradeToDriver;