import React, { useState, useMemo } from "react";
import useAuth from "../../stores/authStore";
import api from "../../lib/api";

interface Ride {
  _id: string;
  startLocation: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  status: string;
}

interface Props {
  onCreated?: (ride: Ride) => void;
}

interface FormState {
  startLocation: string;
  destination: string;
  departureTime: string;
  availableSeats: string;
  price: string;
}

const inputBase =
  "block w-full rounded-md border border-blue-200 dark:border-blue-500/50 bg-white dark:bg-slate-900/60 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed";

const labelBase =
  "block text-xs font-semibold tracking-wide uppercase text-blue-700 dark:text-blue-300 mb-1";

const CreateRideForm: React.FC<Props> = ({ onCreated }) => {
  const { token, user } = useAuth();
  const [form, setForm] = useState<FormState>({
    startLocation: "",
    destination: "",
    departureTime: "",
    availableSeats: "",
    price: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.startLocation.trim()) errs.push("Start location required");
    if (!form.destination.trim()) errs.push("Destination required");

    if (!form.departureTime) {
      errs.push("Departure time required");
    } else {
      const dt = new Date(form.departureTime);
      if (isNaN(dt.getTime())) errs.push("Invalid departure time");
      else if (dt.getTime() < Date.now() + 5 * 60 * 1000)
        errs.push("Departure must be at least 5 minutes ahead");
    }

    const seats = Number(form.availableSeats);
    if (!form.availableSeats) errs.push("Available seats required");
    else if (!Number.isInteger(seats) || seats < 1)
      errs.push("Seats must be a positive integer");

    const price = Number(form.price);
    if (!form.price) errs.push("Price required");
    else if (isNaN(price) || price <= 0) errs.push("Price must be > 0");

    return errs;
  };

  const disabled = useMemo(() => {
    return submitting || validate().length > 0;
  }, [submitting, form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");
    const v = validate();
    setErrors(v);
    if (v.length) return;

    if (!token) {
      setServerError("Not authenticated");
      return;
    }
    if (user?.role !== "driver") {
      setServerError("Only drivers can create rides");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        startLocation: form.startLocation.trim(),
        destination: form.destination.trim(),
        departureTime: new Date(form.departureTime).toISOString(),
        availableSeats: Number(form.availableSeats),
        price: Number(form.price)
      };

      const res = await api.post("api/ride/createRide", payload);
      const ride: Ride = res.data.ride;

      if (onCreated) onCreated(ride);
      setSuccessMsg("Ride created successfully");

      setForm({
        startLocation: "",
        destination: "",
        departureTime: "",
        availableSeats: "",
        price: ""
      });
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Failed to create ride");
    } finally {
      setSubmitting(false);
    }
  };

  if (user && user.role !== "driver") {
    return (
      <p className="p-3 text-sm rounded-md bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300">
        Upgrade to driver to create rides.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-600/60 bg-white dark:bg-slate-800/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-800/60"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Create Ride
          </h3>
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            Driver Panel
          </span>
        </div>

        {successMsg && (
          <div className="flex items-start gap-2 rounded-md border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 px-3 py-2 text-xs text-green-700 dark:text-green-300">
            <span className="mt-0.5">✅</span>
            <span>{successMsg}</span>
          </div>
        )}
        {serverError && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            <span className="mt-0.5">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}
        {!!errors.length && (
          <ul className="text-[11px] space-y-1 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded-md px-3 py-2 text-red-600 dark:text-red-300">
            {errors.map((e) => (
              <li key={e} className="flex gap-2">
                <span className="select-none">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className={labelBase}>Start Location</label>
            <input
              name="startLocation"
              value={form.startLocation}
              onChange={onChange}
              className={inputBase}
              placeholder="e.g. Downtown Station"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className={labelBase}>Destination</label>
            <input
              name="destination"
              value={form.destination}
              onChange={onChange}
              className={inputBase}
              placeholder="e.g. Airport"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelBase}>Departure Time</label>
          <input
            type="datetime-local"
            name="departureTime"
            value={form.departureTime}
            onChange={onChange}
            className={inputBase}
            required
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelBase}>Available Seats</label>
            <input
              type="number"
              name="availableSeats"
              min={1}
              value={form.availableSeats}
              onChange={onChange}
              className={inputBase}
              placeholder="e.g. 3"
              required
            />
          </div>
          <div>
            <label className={labelBase}>Price (USD)</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-blue-400">
                $
              </span>
              <input
                type="number"
                name="price"
                min={1}
                step="0.01"
                value={form.price}
                onChange={onChange}
                className={`${inputBase} pl-6`}
                placeholder="e.g. 15.00"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled}
            className="relative inline-flex w-full items-center justify-center rounded-md bg-blue-600 hover:bg-blue-600/90 active:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 shadow-sm shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:ring-offset-slate-800"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              Creating...
            </span>
          ) : (
            "Create Ride"
          )}
        </button>
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
          Ensure all details are accurate before submitting.
        </p>
      </div>
    </form>
  );
};

export default CreateRideForm;
