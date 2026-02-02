"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import BarcodeModal from "@/components/BarcodeModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { MdAdd, MdEdit, MdDelete, MdQrCode, MdSearch, MdFilterList, MdShoppingBag } from "react-icons/md";
import { toast } from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: { _id: string; name: string };
  stockQuantity: number;
  unitPrice: number;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const { user, hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Barcode
  const [selectedProductSku, setSelectedProductSku] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const params: any = {};
      if (keyword) params.keyword = keyword;
      if (selectedCategory) params.category = selectedCategory;

      const { data } = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    if (user && hasPermission('view_products')) {
      fetchCategories();
      fetchProducts();
    } else {
        setIsLoading(false);
    }
  }, [user, keyword, selectedCategory]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product", error);
      const errorMessage = error.response?.data?.message || "Error deleting product";
      toast.error(errorMessage);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 5) return 'danger';
    if (quantity <= 20) return 'warning';
    return 'success';
  };

  if (!hasPermission('view_products')) {
      return (
        <div className="p-8 flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center p-8">
                <MdShoppingBag className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">You do not have permission to view products.</p>
            </Card>
        </div>
      );
  }

  return (
    <>
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Product Management</h2>
            <p className="text-gray-500 mt-1">Manage your inventory items</p>
          </div>
          {hasPermission('create_product') && (
            <Link href="/dashboard/products/add">
                <Button className="flex items-center gap-2">
                <MdAdd className="w-5 h-5" />
                Add Product
                </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              placeholder="Search by name or SKU..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative min-w-[200px]">
            <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 h-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <Card noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No products found matching your filters.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ${product.unitPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStockStatus(product.stockQuantity)}>
                          {product.stockQuantity} in stock
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {hasPermission('view_barcodes') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                setSelectedProductSku(product.sku);
                                setSelectedProductName(product.name);
                                }}
                                title="View Barcode"
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <MdQrCode className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('edit_product') && (
                            <Link href={`/dashboard/products/edit/${product._id}`}>
                                <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                >
                                <MdEdit className="w-4 h-4" />
                                </Button>
                            </Link>
                          )}
                          {hasPermission('delete_product') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                                <MdDelete className="w-4 h-4" />
                            </Button>
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
      </main>

      {/* Barcode Modal */}
      {selectedProductSku && (
        <BarcodeModal
          sku={selectedProductSku}
          productName={selectedProductName || undefined}
          onClose={() => {
            selectedProductSku && setSelectedProductSku(null);
            selectedProductName && setSelectedProductName(null);
          }}
          isOpen={!!selectedProductSku}
        />
      )}
    </>
  );
}
