"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCategory } from "react-icons/md";
import { toast } from "react-hot-toast";
import { catalogService } from "@/services/catalogService";


interface Catalog {
  _id: string;
  name: string;
  code: string;
}

export default function CatalogPage() {
  const { user, hasPermission } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [filteredCatalogs, setFilteredCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCatalogs = async () => {
    try {
      const data = await catalogService.getCatalogs();
      setCatalogs(data);
      setFilteredCatalogs(data);
    } catch (error) {
      console.error("Error fetching catalogs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasPermission('view_catalog')) {
      fetchCatalogs();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = catalogs.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.code.toLowerCase().includes(lowerQuery)
      );
      setFilteredCatalogs(filtered);
    } else {
      setFilteredCatalogs(catalogs);
    }
  }, [searchQuery, catalogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        code,
      };

      if (editingCatalog) {
        await catalogService.updateCatalog(editingCatalog._id, payload);
        toast.success("Catalog updated successfully");
      } else {
        await catalogService.createCatalog(payload);
        toast.success("Catalog created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchCatalogs();
    } catch (error: any) {
      console.error("Error saving catalog", error);
      const errorMessage = error.response?.data?.message || "Error saving catalog";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this catalog?")) return;
    try {
      await catalogService.deleteCatalog(id);
      toast.success("Catalog deleted successfully");
      fetchCatalogs();
    } catch (error: any) {
      console.error("Error deleting catalog", error);
      const errorMessage = error.response?.data?.message || "Error deleting catalog";
      toast.error(errorMessage);
    }
  };

  const openEditModal = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setName(catalog.name);
    setCode(catalog.code);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCatalog(null);
    setName("");
    setCode("");
  };

  if (!hasPermission('view_catalog')) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center p-8">
              <MdCategory className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You do not have permission to view catalogs.</p>
          </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Catalog Master</h2>
          <p className="text-gray-500 mt-1">Manage your product catalogs</p>
        </div>
        {hasPermission('manage_catalog') && (
            <Button
            onClick={() => {
                resetForm();
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
            >
            <MdAdd className="w-5 h-5" />
            Add Catalog
            </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search catalogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCatalogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No catalogs found
                  </td>
                </tr>
              ) : (
                filteredCatalogs.map((catalog) => (
                  <tr key={catalog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{catalog.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{catalog.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {hasPermission('manage_catalog') && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(catalog)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(catalog._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
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
        title={editingCatalog ? "Edit Catalog" : "Add New Catalog"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Spices"
          />
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="e.g. CAT001"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {editingCatalog ? "Update Catalog" : "Create Catalog"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
