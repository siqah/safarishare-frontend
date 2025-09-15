import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

function UpgradeToDriver() {
  const [carModel, setCarModel] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState<number>(1);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post("/api/driver/upgrade", {
        carModel,
        carPlate,
        seatsAvailable,
        licenseNumber,
      });
      alert("Successfully upgraded to driver!");
      navigate("/driver-dashboard");
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to upgrade";
      alert(msg);
    } finally {
      setSubmitting(false);
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
        min={1}
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
        disabled={submitting}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Upgrading..." : "Upgrade"}
      </button>
    </div>
  );
}

export default UpgradeToDriver;