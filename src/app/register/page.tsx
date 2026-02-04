'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No API call, just show success message
    setSuccessMessage('Registration successful! Welcome to Ladies Flavour Factory.');
    // Optional: Clear form
    setFormData({
      name: '',
      email: '',
      password: '',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-indigo-700">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4 text-center">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
              <div className="mt-4">
                 <Button 
                  variant="outline" 
                  onClick={() => setSuccessMessage('')}
                  className="w-full"
                >
                  Register Another User
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button type="submit" className="w-full" size="lg">
                Register
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
