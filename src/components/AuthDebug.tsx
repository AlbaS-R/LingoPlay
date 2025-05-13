import React from "react";
import { useAuth } from "~/context/AuthContext";

const AuthDebug = () => {
  const { user, loading, lessonsCompleted } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Auth Debug Info</h2>
      <p>User: {user ? user.email : "No user logged in"}</p>
      <p>Lessons Completed: {lessonsCompleted}</p>
    </div>
  );
};

export default AuthDebug;
