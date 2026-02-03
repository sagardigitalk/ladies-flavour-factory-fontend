"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MdPictureAsPdf, MdGridOn, MdInventory, MdWarning, MdAttachMoney } from "react-icons/md";
import { reportService, ReportStats } from "@/services/reportService";

interface Product {
  _id: string;
  name: string;
  sku: string;
  catalog: { name: string };
  stockQuantity: number;
  unitPrice: number;
  costPrice: number;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await reportService.getInventoryReport();
        setProducts(data.products);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching report data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReportData();
    }
  }, [user]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map((p) => ({
        Name: p.name,
        SKU: p.sku,
        Catalog: p.catalog?.name || "-",
        "Stock Quantity": p.stockQuantity,
        "Unit Price": p.unitPrice,
        "Cost Price": p.costPrice,
        "Total Value": p.stockQuantity * p.costPrice,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report");
    XLSX.writeFile(workbook, "StockReport.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Stock Report", 14, 22);

    const tableData = products.map((p) => [
      p.name,
      p.sku,
      p.catalog?.name || "-",
      p.stockQuantity,
      p.unitPrice,
      (p.stockQuantity * p.costPrice).toFixed(2),
    ]);

    autoTable(doc, {
      head: [["Name", "SKU", "Category", "Stock", "Price", "Total Value"]],
      body: tableData,
      startY: 30,
    });

    doc.save("StockReport.pdf");
  };

  // Calculations
  const totalStockValue = stats?.totalStockValue || 0;
  const lowStockCount = stats?.lowStockCount || 0;
  const totalItems = stats?.totalItems || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
            <p className="text-sm text-gray-500">Overview of stock value and status</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white flex items-center gap-2"
          >
            <MdGridOn className="w-5 h-5" />
            Export Excel
          </Button>
          <Button
            onClick={exportToPDF}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white flex items-center gap-2"
          >
            <MdPictureAsPdf className="w-5 h-5" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                    <MdAttachMoney className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
                    <p className="text-2xl font-bold text-gray-900">${totalStockValue.toFixed(2)}</p>
                </div>
            </div>
        </Card>

        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <MdWarning className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                    <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                </div>
            </div>
        </Card>

        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <MdInventory className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Items in Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
            </div>
        </Card>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Stock Summary</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading data...</td>
                </tr>
                ) : products.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No data found</td>
                </tr>
                ) : (
                products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.catalog?.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.stockQuantity < 10 ? (
                            <Badge variant="warning">{p.stockQuantity}</Badge>
                        ) : (
                            p.stockQuantity
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(p.stockQuantity * p.costPrice).toFixed(2)}</td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
}
