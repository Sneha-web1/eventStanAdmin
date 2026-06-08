"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Code } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/api/adminApi";
import Button from "@/components/admin/Button";
import Input from "@/components/admin/Input";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  subject: "",
  trigger: "",
  body: "",
  status: "Active",
};

// Default email header and footer
const DEFAULT_HEADER = `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 0; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{company_name}}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Your Trusted Partner</p>
  </div>
</div>
`;

const DEFAULT_FOOTER = `
<div style="background: #f8f9fa; padding: 20px 0; text-align: center; border-top: 1px solid #e9ecef;">
  <div style="max-width: 600px; margin: 0 auto;">
    <p style="color: #6c757d; margin: 0 0 10px;">&copy; {{current_year}} {{company_name}}. All rights reserved.</p>
    <p style="color: #6c757d; margin: 0; font-size: 12px;">
      <a href="{{unsubscribe_link}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
      <a href="{{privacy_policy_link}}" style="color: #667eea; text-decoration: none;">Privacy Policy</a>
    </p>
  </div>
</div>
`;

export default function AddEmailTemplatePage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const [previewData, setPreviewData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    company_name: "Acme Inc",
    current_year: new Date().getFullYear().toString(),
    unsubscribe_link: "#",
    privacy_policy_link: "#",
    verify_link: "#",
    reset_link: "#"
  });

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.subject || !form.trigger || !form.body) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      // Combine body with header and footer if enabled
      const finalBody = showHeaderFooter 
        ? `${header}\n${form.body}\n${footer}`
        : form.body;
      
      await adminApi.emailTemplates.create({ ...form, body: finalBody });
      toast.success("Email template created");
      router.push("/admin/masters/email-templates");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  const getPreviewHtml = () => {
    let html = showHeaderFooter ? `${header}\n${form.body}\n${footer}` : form.body;
    
    // Replace variables with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });
    
    return html;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/masters/email-templates">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Email Template</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a database-backed email template</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4">
              <Input 
                label="Template Name" 
                value={form.name} 
                onChange={event => setForm({ ...form, name: event.target.value })} 
                required 
              />
              <Input 
                label="Subject" 
                value={form.subject} 
                onChange={event => setForm({ ...form, subject: event.target.value })} 
                required 
              />
              <Input 
                label="Trigger" 
                value={form.trigger} 
                onChange={event => setForm({ ...form, trigger: event.target.value })} 
                placeholder="User Registered, Booking Confirmed, etc." 
                required 
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select 
                  value={form.status} 
                  onChange={event => setForm({ ...form, status: event.target.value })} 
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {/* Header/Footer Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showHeaderFooter"
                  checked={showHeaderFooter}
                  onChange={(e) => setShowHeaderFooter(e.target.checked)}
                  className="w-4 h-4 text-orange-400 rounded focus:ring-orange-400"
                />
                <label htmlFor="showHeaderFooter" className="text-sm font-medium text-gray-700">
                  Include Global Header & Footer
                </label>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {previewMode ? <Code size={14} /> : <Eye size={14} />}
                {previewMode ? "Edit Mode" : "Preview Mode"}
              </button>
            </div>

            {showHeaderFooter && !previewMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Header</label>
                  <textarea 
                    value={header} 
                    onChange={event => setHeader(event.target.value)} 
                    rows={6} 
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono" 
                    placeholder="Email header HTML"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Footer</label>
                  <textarea 
                    value={footer} 
                    onChange={event => setFooter(event.target.value)} 
                    rows={6} 
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono" 
                    placeholder="Email footer HTML"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Body {showHeaderFooter && "(Content between header & footer)"}
              </label>
              {!previewMode ? (
                <textarea 
                  value={form.body} 
                  onChange={event => setForm({ ...form, body: event.target.value })} 
                  rows={12} 
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono" 
                  placeholder={`<div style="padding: 30px;">
  <h2>Dear {{name}},</h2>
  <p>Welcome to {{company_name}}!</p>
  <p>We're excited to have you with us.</p>
  <a href="{{verify_link}}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
</div>`} 
                  required 
                />
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <iframe
                    srcDoc={getPreviewHtml()}
                    title="Email Preview"
                    className="w-full h-[500px] border-0"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              )}
            </div>

            {!previewMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Variables:</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{name}}'}</span>
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{email}}'}</span>
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{company_name}}'}</span>
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{current_year}}'}</span>
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{unsubscribe_link}}'}</span>
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{privacy_policy_link}}'}</span>
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{verify_link}}'}</span>
                  <span className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-700">{'{{reset_link}}'}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/admin/masters/email-templates">
                <Button type="button" variant="secondary">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <Save size={15} />
                {saving ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
          
          {/* Preview Data Editor */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview Variables</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <input
                  type="text"
                  value={previewData.name}
                  onChange={(e) => setPreviewData({...previewData, name: e.target.value})}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <input
                  type="text"
                  value={previewData.email}
                  onChange={(e) => setPreviewData({...previewData, email: e.target.value})}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Company Name</label>
                <input
                  type="text"
                  value={previewData.company_name}
                  onChange={(e) => setPreviewData({...previewData, company_name: e.target.value})}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 text-sm font-medium text-gray-700">
              Subject: {form.subject || "Email Subject"}
            </div>
            <iframe
              srcDoc={getPreviewHtml()}
              title="Live Email Preview"
              className="w-full h-[600px] border-0"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}