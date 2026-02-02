"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCategory } from "react-icons/md";
import { toast } from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  code: string;
  description: string;
}

export default function CategoriesPage() {
  const { user, hasPermission } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasPermission('view_categories')) {
      fetchCategories();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.code.toLowerCase().includes(lowerQuery)
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        code,
        description,
      };

      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };

      if (editingCategory) {
        await axios.put(
          `http://localhost:5000/api/categories/${editingCategory._id}`,
          payload,
          config
        );
        toast.success("Category updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/categories", payload, config);
        toast.success("Category created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category", error);
      const errorMessage = error.response?.data?.message || "Error saving category";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category", error);
      const errorMessage = error.response?.data?.message || "Error deleting category";
      toast.error(errorMessage);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setCode(category.code);
    setDescription(category.description || "");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setCode("");
    setDescription("");
  };

  if (!hasPermission('view_categories')) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center p-8">
              <MdCategory className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You do not have permission to view categories.</p>
          </Card>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Category Master</h2>
          <p className="text-gray-500 mt-1">Manage your product categories</p>
        </div>
        {hasPermission('manage_categories') && (
            <Button
            onClick={() => {
                resetForm();
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
            >
            <MdAdd className="w-5 h-5" />
            Add Category
            </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search categories..."
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No categories found. Try adding one!
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-1">{category.description || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {hasPermission('manage_categories') && (
                            <>
                                <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(category)}
                                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                >
                                <MdEdit className="w-4 h-4" />
                                </Button>
                                <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category._id)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                >
                                <MdDelete className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beverages"
            required
          />
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. BEV-001"
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description..."
            rows={3}
          />
          <div className="flex justify-end pt-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
