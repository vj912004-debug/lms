"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface LeadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialStageId?: string;
}

export default function LeadForm({ onSuccess, onCancel, initialStageId }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Manual Entry",
    notes: "",
    statusId: initialStageId || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to create lead");

      toast.success("Lead created successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="label">Full Name*</label>
          <input 
            type="text" 
            className="input" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label className="label">Email Address</label>
          <input 
            type="email" 
            className="input" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="label">Phone Number</label>
          <input 
            type="tel" 
            className="input" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label className="label">Company Name</label>
          <input 
            type="text" 
            className="input" 
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="label">Lead Source</label>
        <select 
          className="input"
          value={formData.source}
          onChange={(e) => setFormData({...formData, source: e.target.value})}
        >
          <option value="Website">Website</option>
          <option value="Facebook">Facebook</option>
          <option value="Google">Google Ads</option>
          <option value="Referral">Referral</option>
          <option value="Manual">Manual Entry</option>
        </select>
      </div>

      <div className="form-group">
        <label className="label">Internal Notes</label>
        <textarea 
          className="input" 
          rows={3} 
          style={{ resize: 'none' }}
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button 
          type="button" 
          className="btn btn-secondary" 
          style={{ flex: 1 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ flex: 2 }}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Lead"}
        </button>
      </div>

      <style jsx>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
      `}</style>
    </form>
  );
}
