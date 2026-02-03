"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useParams } from "next/navigation";
import { productService } from "@/services/productService";

export default function EditProductPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProduct(id as string);
        // Transform catalog object to ID string for form
        const transformedData = {
          ...data,
          catalog: data.catalog?._id || "",
        };
        setProduct(transformedData);
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && id) {
      fetchProduct();
    }
  }, [user, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
      </div>
    );
  }

  return (
    <main className="mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500">Update product details</p>
      </div>
      <ProductForm initialData={product} isEdit={true} />
    </main>
  );
}
