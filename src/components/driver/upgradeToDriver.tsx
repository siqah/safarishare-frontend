import { useState } from "react";
import axios from 'axios';


export const UpgradeToDriver = () => {
    const [carModel, setCarModel] = useState("");
    const [carPlate, setCarPlate] = useState("");
    const [seatAvailable, setSeatAvailable] = useState(1);
    const [licenseNumber, setLicenseNumber] = useState("");
    const [role, setRole] = useState("user");
  
    const handleUpgrade = async () => {
        try{
            const response = await axios.post('/api/driver/upgrade', {
                carModel,
                carPlate,
                seatAvailable,
                licenseNumber,
                role
                
            });
            console.log('Upgrade successful:', response.data);
        } catch (error) {
            console.error('Upgrade failed:', error);
        }
    };

    return(
        <form
            onSubmit={(e) => { e.preventDefault(); handleUpgrade(); }}
            className="max-w-md mx-auto mt-8 space-y-5 rounded-lg bg-white/70 backdrop-blur shadow p-6 border border-gray-200"
        >
            <h2 className="text-xl font-semibold text-gray-800 text-center">Upgrade To Driver</h2>

            <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Car Model</label>
            <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
                placeholder="e.g. Toyota Corolla"
            />
            </div>

            <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Car Plate</label>
            <input
                type="text"
                value={carPlate}
                onChange={(e) => setCarPlate(e.target.value)}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
                placeholder="e.g. ABC-1234"
            />
            </div>

            <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Seats Available</label>
            <input
                type="number"
                value={seatAvailable}
                onChange={(e) => setSeatAvailable(Number(e.target.value))}
                min={1}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
            />
            </div>

            <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">License Number</label>
            <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
                placeholder="e.g. DL-9876543"
            />
            <input type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
                placeholder="e.g. driver"
            />

            </div>
            <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 text-white text-sm font-medium py-2.5 shadow hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-[0.98] transition"
            >
            Upgrade to Driver
            </button>
        </form>
    )

}