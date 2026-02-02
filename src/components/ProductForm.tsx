"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MdCloudUpload, MdAutorenew, MdSave } from "react-icons/md";
import { Card } from "@/components/ui/Card";
import { toast } from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  description: string;
  images: string[];
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
}

interface ProductFormProps {
  initialData?: ProductFormData & { _id?: string };
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    category: "",
    description: "",
    images: [],
    unitPrice: 0,
    costPrice: 0,
    stockQuantity: 0,
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sku: initialData.sku || "",
        category: initialData.category || "",
        description: initialData.description || "",
        images: initialData.images || [],
        unitPrice: initialData.unitPrice || 0,
        costPrice: initialData.costPrice || 0,
        stockQuantity: initialData.stockQuantity || 0,
      });
    }
  }, [initialData]);

  useEffect(() => {
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

    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "unitPrice" || name === "costPrice" || name === "stockQuantity" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateSku = () => {
    const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : "PROD";
    const random = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const data = new FormData();
      data.append('name', formData.name);
      data.append('sku', formData.sku);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('unitPrice', String(formData.unitPrice));
      data.append('costPrice', String(formData.costPrice));
      data.append('stockQuantity', String(formData.stockQuantity));
      
      if (file) {
        data.append('image', file);
      }

      if (isEdit && initialData?._id) {
        await axios.put(
          `http://localhost:5000/api/products/${initialData._id}`,
          data,
          config
        );
        toast.success("Product updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/products", data, config);
        toast.success("Product created successfully!");
      }

      router.push("/dashboard/products");
    } catch (error: any) {
      console.error("Error saving product", error);
      const errorMessage = error.response?.data?.message || "Error saving product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Summer Dress"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="SKU (Stock Keeping Unit)"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    placeholder="e.g. SUM-1234"
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    className="absolute right-2 top-[30px] text-gray-400 hover:text-indigo-600 p-1"
                    title="Auto-generate SKU"
                  >
                    <MdAutorenew className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Product description..."
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Unit Price ($)"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={handleChange}
                required
              />
              <Input
                label="Cost Price ($)"
                name="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={handleChange}
                required
              />
              <Input
                label="Initial Stock"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
              />
            </div>
          </Card>
        </div>

        {/* Right Column - Images & Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <MdCloudUpload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>

                {/* Preview Section */}
                {(file || (formData.images && formData.images.length > 0)) && (
                  <div className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 w-full max-w-[200px] mx-auto">
                    <img
                      src={file ? URL.createObjectURL(file) : `http://localhost:5000/${formData.images[0]}`}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="w-full flex justify-center items-center gap-2"
              isLoading={isSubmitting}
            >
              <MdSave className="w-5 h-5" />
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
