import { Phone, Mail, Globe, MapPin, Calendar, Clock, Star, MessageSquare, UserPlus, Layers, Trash2, Edit3, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface LeadDetailProps {
  lead: any;
  onUpdate?: (data?: any) => void;
}

export default function LeadDetail({ lead, onUpdate }: LeadDetailProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const [activities, setActivities] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "activity" | "docs">("info");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [pendingStageId, setPendingStageId] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
  });

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/leads/${lead.id}/activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities");
    }
  };

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.ok ? res.json() : [])
      .then(data => setUsers(data.filter((u: any) => u.role === 'SALES' || u.role === 'ADMIN')));
    
    fetch("/api/pipeline/stages")
      .then(res => res.ok ? res.json() : [])
      .then(data => setStages(data));
    
    fetchActivities();
    
    setEditData({
      name: lead?.name || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
      company: lead?.company || "",
    });
  }, [lead.id, lead]);

  const logComm = async (type: string) => {
    try {
      await fetch(`/api/leads/${lead.id}/log-comm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      fetchActivities();
    } catch (error) {
      console.error("Failed to log communication");
    }
  };


  const handleReassign = async (agentId: string) => {
    if (!agentId) return;
    setIsAssigning(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: agentId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Lead reassigned successfully");
        if (onUpdate) onUpdate(data);
      } else {
        toast.error("Failed to reassign lead");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStageUpdate = async (stageId: string, fDate?: string) => {
    if (!stageId) return;
    
    // If selecting follow-up stage, ask for date
    const stage = stages.find(s => s.id === stageId);
    if (stage?.name.toLowerCase().includes("follow") && !fDate) {
      setPendingStageId(stageId);
      setShowFollowUpModal(true);
      return;
    }

    setIsUpdatingStage(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          statusId: stageId,
          followUpDate: fDate || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Lead stage updated");
        if (onUpdate) onUpdate(data);
        setShowFollowUpModal(false);
        setPendingStageId(null);
        setFollowUpDate("");
      } else {
        toast.error("Failed to update stage");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });

      if (response.ok) {
        setNote("");
        fetchActivities();
        toast.success("Note added");
      } else {
        toast.error("Failed to add note");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Lead updated successfully");
        setIsEditing(false);
        if (onUpdate) onUpdate(data);
      } else {
        toast.error("Failed to update lead");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Lead deleted successfully");
        if (onUpdate) onUpdate();
      } else {
        toast.error("Failed to delete lead");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (!lead) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Follow-up Date Modal */}
      {showFollowUpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(10px)'
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '32px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Schedule Follow-up</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Please select a date and time for the follow-up reminder.
            </p>
            <input 
              type="datetime-local" 
              className="input" 
              style={{ marginBottom: '24px' }}
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => {
                  setShowFollowUpModal(false);
                  setPendingStageId(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={() => handleStageUpdate(pendingStageId!, followUpDate)}
                disabled={!followUpDate || isUpdatingStage}
              >
                {isUpdatingStage ? "Saving..." : "Set Follow-up"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Profile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, minWidth: 0 }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--primary)', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 800
          }}>
            {lead.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                <input 
                  className="input"
                  style={{ 
                    fontSize: '24px', 
                    fontWeight: 800, 
                    background: 'rgba(255,255,255,0.08)', 
                    border: '1px solid var(--primary)', 
                    padding: '8px 16px',
                    flex: 1,
                    minWidth: 0
                  }}
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button 
                    onClick={handleSave}
                    className="icon-btn" 
                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '40px', height: '40px' }}
                    title="Save Changes"
                    disabled={isSaving}
                  >
                    {isSaving ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : <Check size={20} />}
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="icon-btn" 
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '40px', height: '40px' }}
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</h2>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: 700,
                background: `${lead.status?.color || '#888'}15`,
                color: lead.status?.color || '#888',
                border: `1px solid ${lead.status?.color || '#888'}30`
              }}>
                {lead.status?.name || 'New Lead'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
                <Star size={14} fill="currentColor" />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{lead.score} pts</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginTop: '8px' }}>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="icon-btn" 
              style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
              title="Edit Lead"
            >
              <Edit3 size={20} />
            </button>
          )}
          {!isEditing && (
            <button 
              onClick={() => {
                logComm("WHATSAPP");
                window.open(`https://wa.me/${lead.phone?.replace(/\D/g, '')}`, '_blank');
              }}
              className="icon-btn" 
              style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}
              title="WhatsApp"
            >
              <MessageSquare size={20} />
            </button>
          )}
          {!isEditing && (
            <button 
              onClick={() => {
                logComm("CALL");
                window.location.href = `tel:${lead.phone}`;
              }}
              className="icon-btn" 
              style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
              title="Call"
            >
              <Phone size={20} />
            </button>
          )}
          {!isEditing && (
            <button 
              onClick={() => {
                logComm("EMAIL");
                window.location.href = `mailto:${lead.email}`;
              }}
              className="icon-btn" 
              style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
              title="Email"
            >
              <Mail size={20} />
            </button>
          )}
          {!isEditing && (
            <button 
              onClick={handleDelete}
              className="icon-btn" 
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              title="Delete Lead"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab("info")}
          className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
        >
          General Info
        </button>
        <button 
          onClick={() => setActiveTab("activity")}
          className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
        >
          Activity & Notes
        </button>
        <button 
          onClick={() => setActiveTab("docs")}
          className={`tab-btn ${activeTab === "docs" ? "active" : ""}`}
        >
          Documents
        </button>
      </div>

      {activeTab === "info" && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="info-box">
              <div className="info-label"><Mail size={14} /> Email</div>
              {isEditing ? (
                <input 
                  className="input"
                  style={{ height: '40px', padding: '0 12px', background: 'rgba(255,255,255,0.05)', marginTop: '4px' }}
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              ) : (
                <div className="info-value">{lead.email || 'N/A'}</div>
              )}
            </div>
            <div className="info-box">
              <div className="info-label"><Phone size={14} /> Phone</div>
              {isEditing ? (
                <input 
                  className="input"
                  style={{ height: '40px', padding: '0 12px', background: 'rgba(255,255,255,0.05)', marginTop: '4px' }}
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                />
              ) : (
                <div className="info-value">{lead.phone || 'N/A'}</div>
              )}
            </div>
            <div className="info-box">
              <div className="info-label"><Globe size={14} /> Company</div>
              {isEditing ? (
                <input 
                  className="input"
                  style={{ height: '40px', padding: '0 12px', background: 'rgba(255,255,255,0.05)', marginTop: '4px' }}
                  value={editData.company}
                  onChange={(e) => setEditData({...editData, company: e.target.value})}
                />
              ) : (
                <div className="info-value">{lead.company || 'N/A'}</div>
              )}
            </div>
            <div className="info-box">
              <div className="info-label"><Calendar size={14} /> Created</div>
              <div className="info-value">{new Date(lead.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Assignment Control */}
            <div className="info-box" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
              <div className="info-label"><UserPlus size={14} /> Lead Assignment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>
                    Assigned to: <strong>{lead.agent?.name || 'Unassigned'}</strong>
                  </p>
                  <select 
                    className="input" 
                    style={{ width: '100%', height: '40px' }}
                    value={lead.assignedTo || ""}
                    onChange={(e) => handleReassign(e.target.value)}
                    disabled={isAssigning || users.length === 0}
                  >
                    <option value="" disabled>{users.length === 0 ? "Loading agents..." : "Select an agent..."}</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stage Control */}
            <div className="info-box" style={{ background: 'rgba(236, 72, 153, 0.05)', borderColor: 'rgba(236, 72, 153, 0.2)' }}>
              <div className="info-label"><Layers size={14} /> Pipeline Stage</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>
                    Current Stage: <strong>{lead.status?.name || 'New Lead'}</strong>
                  </p>
                  <select 
                    className="input" 
                    style={{ width: '100%', height: '40px' }}
                    value={lead.statusId || ""}
                    onChange={(e) => handleStageUpdate(e.target.value)}
                    disabled={isUpdatingStage || stages.length === 0}
                  >
                    <option value="" disabled>{stages.length === 0 ? "Loading stages..." : "Change stage..."}</option>
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Notes & Activity */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <textarea 
                className="input" 
                placeholder="Type a new update or note here..."
                rows={3}
                style={{ resize: 'none', marginBottom: '12px' }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '8px 24px', fontSize: '13px' }}
                  onClick={handleAddNote}
                  disabled={isAddingNote || !note.trim()}
                >
                  {isAddingNote ? "Adding..." : "Add Note"}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', padding: '10px' }}>No activity recorded yet.</div>
              ) : activities.map((act: any) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-dot" style={{ 
                    background: act.action === "NOTE_ADDED" ? "var(--secondary)" :
                                act.action.includes("CREATE") ? "var(--primary)" : 
                                act.action.includes("UPDATE") ? "var(--accent)" :
                                act.action.includes("COMM") ? "var(--success)" : "rgba(255,255,255,0.4)"
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>
                        {act.action === "NOTE_ADDED" ? "Manual Update" : act.action.replace(/_/g, ' ')}
                      </p>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {act.details}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>— {act.user?.name || "System"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "docs" && (
        <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Document management module coming soon.</p>
        </div>
      )}


      <style jsx>{`
        .icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          display: flex;
          alignItems: center;
          justifyContent: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.2);
        }
        .tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }
        .tab-btn.active {
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
        }
        .info-box {
          background: var(--glass);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
        }
        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 600;
        }
        .activity-item {
          display: flex;
          gap: 16px;
          position: relative;
          padding-left: 8px;
        }
        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary);
          margin-top: 6px;
          z-index: 1;
        }
        .activity-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 11px;
          top: 14px;
          bottom: -16px;
          width: 1px;
          background: var(--glass-border);
        }
      `}</style>
    </div>
  );
}
