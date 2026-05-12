"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MoreVertical, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MessageSquare,
  Calendar,
  Star
} from "lucide-react";
import Modal from "@/components/Modal";
import LeadForm from "@/components/LeadForm";
import LeadDetail from "@/components/LeadDetail";

export default function PipelinePage() {
  const [stages, setStages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string | undefined>();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline");
      if (!res.ok) {
        if (res.status === 401) window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setStages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      {/* Pipeline Header */}
      {/* Pipeline Header */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800 }}>Lead Pipeline</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Track your leads across the sales funnel.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Plus size={16} /> New Lead
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setActiveStageId(undefined); }} title="Add New Lead">
        <LeadForm 
          onSuccess={() => { setIsModalOpen(false); setActiveStageId(undefined); fetchPipeline(); }} 
          onCancel={() => { setIsModalOpen(false); setActiveStageId(undefined); }} 
          initialStageId={activeStageId}
        />
      </Modal>

      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        title="Lead Details"
      >
        <LeadDetail 
          lead={selectedLead} 
          onUpdate={() => {
            fetchPipeline();
            // We don't close here so user can keep working
            // but we might need to refresh selectedLead
            const refreshLead = async () => {
              const res = await fetch(`/api/leads/${selectedLead.id}`);
              const data = await res.json();
              setSelectedLead(data);
            };
            refreshLead();
          }} 
        />
      </Modal>

      {/* Kanban Board */}
      <div style={{ flex: 1, overflowX: 'auto', padding: '32px 0' }}>
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          height: '100%', 
          padding: '0 24px',
          width: 'max-content',
          minWidth: '100%'
        }}>
          {loading ? (
            <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading pipeline...</div>
          ) : stages.map((stage) => (
            <div key={stage.id} style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }}></div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{stage.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--glass)', padding: '2px 8px', borderRadius: '10px' }}>
                    {stage.leads.length}
                  </span>
                </div>
              </div>

              <div style={{ 
                flex: 1, 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '16px', 
                border: '1px dashed var(--glass-border)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto'
              }}>
                {stage.leads.map((lead: any) => (
                  <motion.div 
                    key={lead.id}
                    className="glass-card"
                    style={{ padding: '16px', cursor: 'pointer' }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{lead.company || 'Private'}</span>
                      <Star size={14} color={lead.score > 80 ? 'var(--warning)' : 'var(--text-muted)'} fill={lead.score > 80 ? 'var(--warning)' : 'none'} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{lead.name}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{lead.email || 'No email'}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div className="icon-btn-sm"><Phone size={12} /></div>
                        <div className="icon-btn-sm"><Mail size={12} /></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <span style={{ color: lead.score > 80 ? 'var(--success)' : 'inherit' }}>{lead.score} pts</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <button 
                  onClick={() => {
                    setActiveStageId(stage.id);
                    setIsModalOpen(true);
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: 'none', 
                    border: '1px dashed var(--glass-border)', 
                    borderRadius: '12px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={14} /> Add Lead
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .icon-btn-sm {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: var(--glass);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .icon-btn-sm:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}
