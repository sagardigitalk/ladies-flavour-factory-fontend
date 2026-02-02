"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MdAdd, MdEdit, MdDelete, MdPerson, MdEmail, MdSearch, MdSecurity } from "react-icons/md";
import { toast } from "react-hot-toast";

interface Role {
    _id: string;
    name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export default function UsersPage() {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${user?.token}` };
      
      const [usersRes, rolesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users", { headers }),
        axios.get("http://localhost:5000/api/roles", { headers })
      ]);

      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasPermission('manage_users')) {
      fetchData();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(lowerQuery) ||
            u.email.toLowerCase().includes(lowerQuery) ||
            u.role?.name?.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        name,
        email,
        role: roleId,
      };

      if (password) {
        payload.password = password;
      }

      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };

      if (editingUser) {
        await axios.put(
          `http://localhost:5000/api/users/${editingUser._id}`,
          payload,
          config
        );
        toast.success("User updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/users", payload, config);
        toast.success("User created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      // Only refetch users, no need to refetch roles usually
      const { data } = await axios.get("http://localhost:5000/api/users", config);
      setUsers(data);
    } catch (error: any) {
      console.error("Error saving user", error);
      const errorMessage = error.response?.data?.message || "Error saving user";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      toast.success("User deleted successfully");
      const { data } = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setUsers(data);
    } catch (error: any) {
      console.error("Error deleting user", error);
      const errorMessage = error.response?.data?.message || "Error deleting user";
      toast.error(errorMessage);
    }
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setName(userToEdit.name);
    setEmail(userToEdit.email);
    setRoleId(userToEdit.role?._id || "");
    setPassword(""); // Don't show password
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId(roles.length > 0 ? roles[0]._id : "");
  };

  if (!hasPermission('manage_users')) {
      return (
        <div className="p-8 flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center p-8">
                <MdPerson className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">You do not have permission to manage users.</p>
            </Card>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Manage system users and assign roles</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Add User
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <MdPerson className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                            <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
                            {u.email}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={u.role?.name === 'Admin' ? 'danger' : 'success'}>
                            {u.role?.name || 'No Role'}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(u)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        <MdEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <MdDelete className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Add User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editingUser ? "Leave blank to keep current" : "Password"}
              required={!editingUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
              required
            >
              <option value="" disabled>Select a role</option>
              {roles.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                isLoading={isSubmitting}
            >
                {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
