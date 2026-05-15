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
  MessageSquare,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import LeadForm from "@/components/LeadForm";
import LeadDetail from "@/components/LeadDetail";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filterAgent, setFilterAgent] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterSource, setFilterSource] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // If user is sales, lock the filter to their ID
      if (parsedUser.role === "SALES") {
        setFilterAgent(parsedUser.id);
      }
    }
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterAgent) params.append("assignedTo", filterAgent);
      if (filterStage) params.append("statusId", filterStage);
      if (filterSource) params.append("source", filterSource);
      if (search) params.append("query", search);

      const res = await fetch(`/api/leads/list?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) window.location.href = "/login";
        throw new Error("Failed to fetch leads");
      }
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [agentsRes, stagesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/pipeline")
      ]);

      if (!agentsRes.ok || !stagesRes.ok) {
        if (agentsRes.status === 401 || stagesRes.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch filters");
      }

      const [agentsData, stagesData] = await Promise.all([
        agentsRes.json(),
        stagesRes.json()
      ]);
      setAgents(agentsData);
      setStages(stagesData);
    } catch (error) {
      console.error("Failed to fetch filters", error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterAgent, filterStage, filterSource, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Lead deleted successfully");
        fetchLeads();
      } else {
        toast.error("Failed to delete lead");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredLeads = leads; // Filtering now handled by API

  return (
    <div className="container" style={{ padding: '32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800 }}>Lead Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>View and manage all your prospects in one place.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}><Download size={16} /> Export</button>
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setIsFormOpen(true)}><Plus size={16} /> Add New Lead</button>
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
        <LeadDetail 
          lead={selectedLead} 
          onUpdate={(updated) => {
            fetchLeads();
            if (updated) setSelectedLead(updated);
          }}
        />
      </Modal>


      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 300px)' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px' }} />
          <input 
            type="text" 
            placeholder="Search name, email or company..." 
            className="input" 
            style={{ paddingLeft: '40px', height: '44px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', width: 'auto', flexWrap: 'wrap' }}>
          {user?.role !== "SALES" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select 
                value={filterAgent} 
                onChange={(e) => setFilterAgent(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">All Salesmen</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id} style={{ background: '#1e293b' }}>{agent.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <BarChart3 size={14} color="var(--text-muted)" />
            <select 
              value={filterStage} 
              onChange={(e) => setFilterStage(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id} style={{ background: '#1e293b' }}>{stage.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <Search size={14} color="var(--text-muted)" />
            <select 
              value={filterSource} 
              onChange={(e) => setFilterSource(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Sources</option>
              <option value="Manual Entry" style={{ background: '#1e293b' }}>Manual Entry</option>
              <option value="Referral" style={{ background: '#1e293b' }}>Referral</option>
            </select>
          </div>

          {(filterAgent || filterStage || filterSource || search) && (
            <button 
              onClick={() => {
                if (user?.role !== "SALES") {
                  setFilterAgent("");
                }
                setFilterStage("");
                setFilterSource("");
                setSearch("");
              }}
              style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '0 8px' }}
            >
              Clear All
            </button>
          )}
        </div>
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
                      <button 
                        className="icon-btn-table" 
                        style={{ color: '#ef4444' }}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDelete(lead.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
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
