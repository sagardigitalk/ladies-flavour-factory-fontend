"use client";

import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/context/AuthContext";

export default function AddProductPage() {
  const { user } = useAuth();

  return (
    <main className=" mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500">Create a new product in your inventory</p>
      </div>
      <ProductForm />
    </main>
  );
}
