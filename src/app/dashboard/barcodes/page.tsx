"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MdPrint, MdQrCode, MdCheckBox, MdCheckBoxOutlineBlank, MdSearch } from "react-icons/md";
import { Input } from "@/components/ui/Input";

interface Product {
  _id: string;
  name: string;
  sku: string;
  unitPrice: number;
}

export default function BarcodesPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const printRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.sku.toLowerCase().includes(lowerQuery)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p._id));
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => toast.success("Print dialog opened"),
  });

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MdQrCode className="text-indigo-600" />
            Barcode Management
          </h1>
          <p className="text-gray-500 mt-1">Generate and print barcodes for your products.</p>
        </div>
        <Button
          onClick={() => handlePrint && handlePrint()}
          disabled={selectedProducts.length === 0}
          className="flex items-center gap-2"
        >
          <MdPrint className="w-5 h-5" />
          Print Selected ({selectedProducts.length})
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection List */}
        <Card className="flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Select Products</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                {selectedProducts.length === products.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="p-8 text-center text-gray-500">No products found</p>
            ) : (
              <ul className="space-y-1">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product._id);
                  return (
                    <li
                      key={product._id}
                      className={`p-3 rounded-lg flex items-center cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50 border-indigo-100" : "hover:bg-gray-50 border border-transparent"
                      }`}
                      onClick={() => handleSelectProduct(product._id)}
                    >
                      <div className={`mr-3 ${isSelected ? "text-indigo-600" : "text-gray-400"}`}>
                        {isSelected ? (
                          <MdCheckBox className="w-6 h-6" />
                        ) : (
                          <MdCheckBoxOutlineBlank className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isSelected ? "text-indigo-900" : "text-gray-900"}`}>
                          {product.name}
                        </p>
                        <p className={`text-xs ${isSelected ? "text-indigo-700" : "text-gray-500"}`}>
                          SKU: {product.sku}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        {/* Preview & Print Area */}
        <Card className="flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Print Preview</h3>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
            {selectedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <MdQrCode className="w-16 h-16 mb-4 opacity-20" />
                <p>Select products to see barcode preview</p>
              </div>
            ) : (
              <div className="bg-white shadow-sm border rounded-lg p-8 min-h-full">
                <div ref={printRef} className="grid grid-cols-2 gap-8 print:grid-cols-3 print:gap-4">
                  {products
                    .filter((p) => selectedProducts.includes(p._id))
                    .map((product) => (
                      <div key={product._id} className="flex flex-col items-center border border-dashed border-gray-200 p-4 rounded-lg break-inside-avoid page-break-inside-avoid">
                        <p className="text-xs font-bold mb-2 truncate w-full text-center">{product.name}</p>
                        <Barcode value={product.sku} width={1.5} height={50} fontSize={12} displayValue={true} />
                        <p className="text-xs mt-2 font-semibold text-gray-900">${product.unitPrice}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
