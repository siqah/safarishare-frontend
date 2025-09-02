import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register, error, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!register) return;
    const res = await register(name, email, password);
    if (res?.success) {
    navigate("/dashboard"); 
  }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-6 rounded-2xl bg-white/90 backdrop-blur p-8 shadow-xl ring-1 ring-gray-200"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="text-sm text-gray-500">Get started in seconds</p>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              placeholder="John"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
