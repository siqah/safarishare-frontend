import { useEffect } from "react";
import useAuth  from "../stores/authStore";

export default function Profile() {
  const { user, fetchProfile, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div>
      <h2>Profile</h2>
      {user ? (
        <>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>No user data</p>
      )}
    </div>
  );
}
