"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MdAdd, MdEdit, MdDelete, MdSecurity, MdCheckCircle, MdCancel } from "react-icons/md";
import { toast } from "react-hot-toast";
import { roleService } from "@/services/roleService";
import axios from "axios";

interface Role {
  _id: string;
  name: string;
  permissions: string[];
  description: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard' },
  // User Management
  { id: 'view_users', label: 'View Users' },
  { id: 'create_user', label: 'Create User' },
  { id: 'edit_user', label: 'Edit User' },
  { id: 'delete_user', label: 'Delete User' },
  // Role Management
  { id: 'view_roles', label: 'View Roles' },
  { id: 'create_role', label: 'Create Role' },
  { id: 'edit_role', label: 'Edit Role' },
  { id: 'delete_role', label: 'Delete Role' },
  // Product Management
  { id: 'view_products', label: 'View Products' },
  { id: 'create_product', label: 'Create Product' },
  { id: 'edit_product', label: 'Edit Product' },
  { id: 'delete_product', label: 'Delete Product' },
  { id: 'manage_stock', label: 'Manage Stock' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'view_catalog', label: 'View Catalog' },
  { id: 'manage_catalog', label: 'Manage Catalog' },
  { id: 'view_barcodes', label: 'View Barcodes' },
];

export default function RolesPage() {
  const { user, hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasPermission('view_roles')) {
      fetchRoles();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        permissions: selectedPermissions,
      };

      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };

      if (editingRole) {
        await axios.put(
          `http://localhost:5000/api/roles/${editingRole._id}`,
          payload,
          config
        );
        toast.success("Role updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/roles", payload, config);
        toast.success("Role created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      console.error("Error saving role", error);
      const errorMessage = error.response?.data?.message || "Error saving role";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role? Users with this role may lose access.")) return;
    try {
      await roleService.deleteRole(id);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error: any) {
      console.error("Error deleting role", error);
      const errorMessage = error.response?.data?.message || "Error deleting role";
      toast.error(errorMessage);
    }
  };

  const openEditModal = (roleToEdit: Role) => {
    setEditingRole(roleToEdit);
    setName(roleToEdit.name);
    setDescription(roleToEdit.description || "");
    setSelectedPermissions(roleToEdit.permissions);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setSelectedPermissions([]);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const toggleAllPermissions = () => {
    if (selectedPermissions.length === AVAILABLE_PERMISSIONS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
    }
  };

  if (!hasPermission('view_roles')) {
      return (
        <div className="p-8 flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center p-8">
                <MdSecurity className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">You do not have permission to view roles.</p>
            </Card>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-sm text-gray-500">Create and manage roles and permissions</p>
        </div>
        {hasPermission('create_role') && (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <MdAdd className="w-5 h-5" />
            Create Role
          </Button>
        )}
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{r.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{r.description}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {r.permissions.length} Permissions
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {hasPermission('edit_role') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(r)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          <MdEdit className="w-4 h-4" />
                        </Button>
                      )}
                      {hasPermission('delete_role') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(r._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <MdDelete className="w-4 h-4" />
                        </Button>
                      )}
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
        title={editingRole ? "Edit Role" : "Create Role"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Manager"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of responsibilities"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Permissions</label>
                <button 
                    type="button" 
                    onClick={toggleAllPermissions}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                    {selectedPermissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_PERMISSIONS.map(perm => (
                    <div key={perm.id} className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id={`perm-${perm.id}`}
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor={`perm-${perm.id}`} className="font-medium text-gray-700 cursor-pointer select-none">
                                {perm.label}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
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
                {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
