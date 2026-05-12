"use client";

import { useState, useEffect } from "react";
import { 
  MoreVertical, 
  Search, 
  Filter, 
  Plus, 
  Download,
  Mail,
  Phone,
  BarChart3,
  MessageSquare
} from "lucide-react";
import Modal from "@/components/Modal";
import LeadForm from "@/components/LeadForm";
import LeadDetail from "@/components/LeadDetail";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads/list");
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Lead Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>View and manage all your prospects in one place.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary"><Download size={18} /> Export</button>
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}><Plus size={18} /> Add New Lead</button>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        key="add-lead-modal"
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Add New Lead"
      >
        <LeadForm onSuccess={() => { setIsFormOpen(false); fetchLeads(); }} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal 
        key="lead-detail-modal"
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        title="Lead Details"
      >
        <LeadDetail lead={selectedLead} />
      </Modal>


      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
          <input 
            type="text" 
            placeholder="Search by name, email or company..." 
            className="input" 
            style={{ paddingLeft: '44px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary"><Filter size={18} /> Status</button>
        <button className="btn btn-secondary"><Filter size={18} /> Source</button>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading leads...
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No leads found. Start by capturing some leads!
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s', cursor: 'pointer' }} 
                  className="table-row"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{lead.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.company || lead.email || 'No Details'}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px' }}>{lead.source}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      background: `${lead.status?.color || '#888'}15`,
                      color: lead.status?.color || '#888',
                      border: `1px solid ${lead.status?.color || '#888'}30`
                    }}>
                      {lead.status?.name || 'New Lead'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'var(--glass)', borderRadius: '2px', width: '60px' }}>
                        <div style={{ width: `${lead.score}%`, height: '100%', background: lead.score > 80 ? 'var(--success)' : 'var(--primary)', borderRadius: '2px' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{lead.score}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--glass)', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {lead.agent?.name.split(' ').map((n: string) => n[0]).join('') || '??'}
                      </div>
                      <span style={{ fontSize: '13px' }}>{lead.agent?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="icon-btn-table" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          window.open(`https://wa.me/${lead.phone?.replace(/\D/g, '')}`, '_blank');
                        }}
                        title="WhatsApp"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button 
                        className="icon-btn-table" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          window.location.href = `tel:${lead.phone}`;
                        }}
                        title="Call"
                      >
                        <Phone size={14} />
                      </button>
                      <button 
                        className="icon-btn-table" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          window.location.href = `mailto:${lead.email}`;
                        }}
                        title="Email"
                      >
                        <Mail size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
