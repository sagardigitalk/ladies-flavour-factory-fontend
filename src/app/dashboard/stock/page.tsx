"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { MdAdd, MdInventory, MdSearch, MdChevronLeft, MdChevronRight, MdClear } from "react-icons/md";
import { toast } from "react-hot-toast";
import { stockService } from "@/services/stockService";
import { productService } from "@/services/productService";
import { Select } from "@/components/ui/Select";

interface StockTransaction {
  _id: string;
  product: { 
    name: string; 
    sku: string;
    catalog?: { name: string };
  };
  user: { name: string };
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reason: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
}

export default function StockPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'IN' | 'OUT'>('IN');

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form State
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("IN");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await stockService.getTransactions({
        page,
        limit: 10,
        search: debouncedSearch,
        type: activeTab,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setTransactions(data.transactions || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error("Error fetching transactions", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, page, debouncedSearch, activeTab, startDate, endDate]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await stockService.createTransaction({
        productId,
        type,
        quantity,
        reason,
      });
      toast.success("Stock transaction added successfully");

      setIsModalOpen(false);
      resetForm();
      fetchTransactions();
    } catch (error: any) {
      console.error("Error adding stock entry", error);
      const errorMessage = error.response?.data?.message || "Error adding stock entry";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductId("");
    setType("IN");
    setQuantity(0);
    setReason("");
  };

  const handleClear = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'success';
      case 'OUT': return 'danger';
      case 'ADJUSTMENT': return 'warning';
      default: return 'default';
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MdInventory className="text-indigo-600" />
            Stock Management
          </h1>
          <p className="text-gray-500 mt-1">Track inventory movements and adjustments.</p>
        </div>
        {/* <Button onClick={() => setIsModalOpen(true)}>
          <MdAdd className="w-5 h-5 mr-2" />
          New Stock Entry
        </Button> */}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search stock transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500 whitespace-nowrap">From:</span>
            <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full md:w-auto"
            />
        </div>
        <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500 whitespace-nowrap">To:</span>
            <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full md:w-auto"
            />
        </div>
        
        {(searchQuery || startDate || endDate) && (
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <MdClear className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => { setActiveTab('IN'); setPage(1); }}
            className={`${
              activeTab === 'IN'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            In Stock
          </button>
          <button
            onClick={() => { setActiveTab('OUT'); setPage(1); }}
            className={`${
              activeTab === 'OUT'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Out Stock
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catalog</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
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
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.product?.catalog?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.product?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.product?.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getTypeColor(tx.type)}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.user?.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
                {totalItems > 0 && (
                  <span className="ml-1">({totalItems} results)</span>
                )}
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-l-md rounded-r-none px-2 py-2"
                >
                  <span className="sr-only">Previous</span>
                  <MdChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-r-md rounded-l-none px-2 py-2"
                >
                  <span className="sr-only">Next</span>
                  <MdChevronRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Stock Entry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Select
              label="Product"
              value={productId}
              onChange={(val) => setProductId(String(val))}
              options={[
                { value: "", label: "Select Product" },
                ...products.map((p) => ({ value: p._id, label: `${p.name} (${p.sku})` }))
              ]}
              placeholder="Select Product"
            />
          </div>
          
          <div>
            <Select
              label="Transaction Type"
              value={type}
              onChange={(val) => setType(String(val))}
              options={[
                { value: "IN", label: "Stock IN (Add)" },
                { value: "OUT", label: "Stock OUT (Remove)" },
                { value: "ADJUSTMENT", label: "Adjustment (Correction)" },
              ]}
              placeholder="Select Transaction Type"
            />
          </div>

          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            min={1}
            placeholder="Enter quantity"
          />

          <Textarea
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for this transaction (optional)"
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
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
              Save Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
