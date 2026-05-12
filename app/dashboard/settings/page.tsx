
"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Save,
  Building,
  Layers,
  Trash2,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { withAuth } from "@/components/withAuth";
import Modal from "@/components/Modal";

function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    companyName: "LeadGrowth CRM",
    timezone: "UTC",
    currency: "USD",
    primaryColor: "#6366f1",
    notificationsEnabled: true,
  });
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, stagesRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/pipeline/stages")
        ]);
        
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (Object.keys(data).length > 0) setSettings(data);
        }
        
        if (stagesRes.ok) {
          const stages = await stagesRes.json();
          setPipelineStages(stages);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading settings...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>System Settings</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Configure your global platform preferences and branding</p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Company Profile */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Building size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Company Profile</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Company Name</label>
              <input 
                type="text" 
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Support Email</label>
              <input 
                type="email" 
                value={settings.supportEmail || ""}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Regional & Localization */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Globe size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Localization</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Timezone</label>
              <select 
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                className="input"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="IST">IST</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Currency</label>
              <select 
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Palette size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Branding</h3>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Primary Theme Color</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={settings.primaryColor}
                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                style={{ width: '50px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{settings.primaryColor}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Layers size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Pipeline Stages</h3>
            </div>
            <button 
              className="btn btn-sm" 
              style={{ background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => { setEditingStage(null); setIsStageModalOpen(true); }}
            >
              <Plus size={16} /> Add Stage
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pipelineStages.map((stage) => (
              <div 
                key={stage.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: stage.color }}></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{stage.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Order: {stage.order}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => { setEditingStage(stage); setIsStageModalOpen(true); }}
                    className="icon-btn-sm"
                  >
                    <Settings size={14} />
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this stage? Leads in this stage might be affected.")) {
                        const res = await fetch(`/api/pipeline/stages?id=${stage.id}`, { method: 'DELETE' });
                        if (res.ok) {
                          setPipelineStages(pipelineStages.filter(s => s.id !== stage.id));
                          toast.success("Stage deleted");
                        }
                      }
                    }}
                    className="icon-btn-sm"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '16px 40px' }}>
            <Save size={20} /> Save Changes
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isStageModalOpen} 
        onClose={() => setIsStageModalOpen(false)} 
        title={editingStage ? "Edit Stage" : "Add Stage"}
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          const data = {
            id: editingStage?.id,
            name: target.name.value,
            color: target.color.value,
            order: target.order.value,
          };
          
          const method = editingStage ? 'PATCH' : 'POST';
          const res = await fetch("/api/pipeline/stages", {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (res.ok) {
            const updatedStage = await res.json();
            if (editingStage) {
              setPipelineStages(pipelineStages.map(s => s.id === updatedStage.id ? updatedStage : s).sort((a, b) => a.order - b.order));
            } else {
              setPipelineStages([...pipelineStages, updatedStage].sort((a, b) => a.order - b.order));
            }
            setIsStageModalOpen(false);
            toast.success(`Stage ${editingStage ? 'updated' : 'added'}`);
          }
        }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Stage Name</label>
            <input name="name" defaultValue={editingStage?.name} required className="input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Color</label>
              <input name="color" type="color" defaultValue={editingStage?.color || "#6366f1"} className="input" style={{ height: '45px', padding: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Order</label>
              <input name="order" type="number" defaultValue={editingStage?.order || pipelineStages.length + 1} required className="input" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
            {editingStage ? "Save Changes" : "Add Stage"}
          </button>
        </form>
      </Modal>

      <style jsx>{`
        .icon-btn-sm {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn-sm:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}


export default withAuth(SettingsPage, ["ADMIN"]);
