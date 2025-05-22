"use client";
import React, { useEffect, useState } from "react";

type User = {
  id: string;
  name?: string | null;
  email: string;
  isOnline: boolean;
  banned?: boolean;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // Optional: Poll every 5 seconds for real-time updates
    // const interval = setInterval(fetchUsers, 5000);
    // return () => clearInterval(interval);
  }, []);

  const handleBanUser = async (userId: string) => {
    await fetch(`/api/users/${userId}/ban`, { method: "POST" });
    fetchUsers();
  };

  const handleRevokeUser = async (userId: string) => {
    await fetch(`/api/users/${userId}/revoke`, { method: "POST" });
    fetchUsers();
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <button
        onClick={fetchUsers}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh
      </button>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="w-full min-w-full">
          <thead>
            <tr>
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Online Status</th>
              <th className="py-2 text-left">Banned</th>
              <th className="py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.banned ? "bg-red-100" : ""}>
                <td className="py-2">
                  {user.name || (
                    <span className="italic text-gray-400">No name</span>
                  )}
                </td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">
                  {user.isOnline ? (
                    <span className="text-green-600 font-bold">Online</span>
                  ) : (
                    <span className="text-gray-500">Offline</span>
                  )}
                </td>
                <td className="py-2">
                  {user.banned ? (
                    <span className="text-red-600 font-bold">Banned</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </td>
                <td className="py-2 space-x-2">
                  <button
                    onClick={() => handleRevokeUser(user.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    disabled={user.banned}
                  >
                    Revoke
                  </button>
                  <button
                    onClick={() => handleBanUser(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    disabled={user.banned}
                  >
                    Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;