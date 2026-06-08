'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import toast from 'react-hot-toast';

export default function AddVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    primaryEmail: '',
    telephone: '',
    primaryMobile: '',
    password: '',
    specialization: '',
    whereIsYourBusiness: '',
    visaType: '',
    address: '',
    planDetail: '',
    planExpiry: '',
    agreementFile: null as File | null,
    bankName: '',
    accountFullName: '',
    ibanNo: '',
    accountNumber: '',
    swift: '',
    branchAddress: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Vendor created successfully!');
      router.push('/admin/vendors');
    } catch (error) {
      toast.error('Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = () => {
    setIsActive(!isActive);
    toast.success(`Vendor will be ${!isActive ? 'Active' : 'Inactive'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add Vendor</h1>
          </div>
          
          {/* Status Toggle - Active/Inactive */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isActive ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Tell Us about yourself */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Tell Us about yourself
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name *" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} required />
                <Input label="Last Name *" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} required />
                <Input label="User Name *" value={form.userName} onChange={(e) => setForm({...form, userName: e.target.value})} required />
                <Input label="Primary Email *" type="email" value={form.primaryEmail} onChange={(e) => setForm({...form, primaryEmail: e.target.value})} required />
                <Input label="Telephone" value={form.telephone} onChange={(e) => setForm({...form, telephone: e.target.value})} />
                <Input label="Primary Mobile (Don't add 0 or +971) *" value={form.primaryMobile} onChange={(e) => setForm({...form, primaryMobile: e.target.value})} required />
                
                {/* Password with hide/show */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 9 characters, at least one uppercase letter, one lowercase letter, one number and one special character.</p>
                </div>
                
                <Input label="Specialization *" value={form.specialization} onChange={(e) => setForm({...form, specialization: e.target.value})} required />
                <Input label="Where is your Business *" value={form.whereIsYourBusiness} onChange={(e) => setForm({...form, whereIsYourBusiness: e.target.value})} required />
                <Input label="Visa Type" value={form.visaType} onChange={(e) => setForm({...form, visaType: e.target.value})} />
                
                {/* Address Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Professional Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Detail of Plan" value={form.planDetail} onChange={(e) => setForm({...form, planDetail: e.target.value})} />
                <Input label="Plan Expiry" type="date" value={form.planExpiry} onChange={(e) => setForm({...form, planExpiry: e.target.value})} />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agreement File Upload</label>
                  <input 
                    type="file" 
                    onChange={(e) => setForm({...form, agreementFile: e.target.files?.[0] || null})} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Bank Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Payment Bank Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Bank Name" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})} />
                <Input label="Account Full Name" value={form.accountFullName} onChange={(e) => setForm({...form, accountFullName: e.target.value})} />
                <Input label="IBAN No." value={form.ibanNo} onChange={(e) => setForm({...form, ibanNo: e.target.value})} />
                <Input label="Account Number" value={form.accountNumber} onChange={(e) => setForm({...form, accountNumber: e.target.value})} />
                <Input label="Swift" value={form.swift} onChange={(e) => setForm({...form, swift: e.target.value})} />
                
                {/* Branch Address Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Address</label>
                  <textarea
                    value={form.branchAddress}
                    onChange={(e) => setForm({...form, branchAddress: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Save'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}