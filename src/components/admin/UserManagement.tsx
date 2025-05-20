"use client";
import React, { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  isOnline: boolean;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch users from your API or database
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleBanUser = async (userId: string) => {
    // Call your API to ban the user
    await fetch(`/api/users/${userId}/ban`, { method: "POST" });
    setUsers(users.filter(user => user.id !== userId));
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">User ID</th>
            <th className="py-2">Email</th>
            <th className="py-2">Online Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="py-2">{user.id}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">{user.isOnline ? "Online" : "Offline"}</td>
              <td className="py-2">
                <button
                  onClick={() => handleBanUser(user.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Ban User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;