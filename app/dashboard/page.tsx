"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  Plus, 
  Filter, 
  BarChart3,
  Calendar
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import Modal from "@/components/Modal";
import LeadForm from "@/components/LeadForm";
import LeadDetail from "@/components/LeadDetail";
import Link from "next/link";

const chartData = [
  { name: 'Mon', leads: 40, conv: 24 },
  { name: 'Tue', leads: 30, conv: 13 },
  { name: 'Wed', leads: 20, conv: 98 },
  { name: 'Thu', leads: 27, conv: 39 },
  { name: 'Fri', leads: 18, conv: 48 },
  { name: 'Sat', leads: 23, conv: 38 },
  { name: 'Sun', leads: 34, conv: 43 },
];

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchData(parsedUser);
    }
  }, []);

  const fetchData = async (currentUser: any) => {
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetch(`/api/leads/list?limit=5${currentUser.role === 'SALES' ? '&assignedTo=' + currentUser.id : ''}`),
        fetch(`/api/stats?userId=${currentUser.id}&role=${currentUser.role}`)
      ]);
      
      if (!leadsRes.ok || !statsRes.ok) {
        if (leadsRes.status === 401 || statsRes.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const leadsData = await leadsRes.json();
      const statsData = await statsRes.json();
      
      setLeads(leadsData);
      setStatsData(statsData);

      // Trigger background automation
      fetch("/api/automation/reminders", { method: "POST" });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };


  const stats = [
    { 
      label: user?.role === "SALES" ? "My Leads" : "Total Leads", 
      value: statsData?.summary.totalLeads.toLocaleString() || "0", 
      trend: statsData?.trends.leadsTrend || "+0%", 
      icon: <Users size={20} />, 
      color: "var(--primary)",
      href: "/leads"
    },
    { 
      label: "Conversion Rate", 
      value: `${statsData?.summary.conversionRate || 0}%`, 
      trend: statsData?.trends.conversionTrend || "+0%", 
      icon: <Target size={20} />, 
      color: "var(--success)",
      href: "/dashboard/reports"
    },
    { 
      label: user?.role === "SALES" ? "My Potential" : "Total Potential", 
      value: `$${(statsData?.summary.activePotential || 0).toLocaleString()}`, 
      trend: statsData?.trends.revenueTrend || "0%", 
      icon: <TrendingUp size={20} />, 
      color: "var(--accent)",
      href: "/pipeline"
    },
    { 
      label: user?.role === "SALES" ? "My Tasks" : "Active Agents", 
      value: user?.role === "SALES" ? (statsData?.myTasksCount || 0).toString() : "2", 
      trend: statsData?.trends.tasksTrend || "Stable", 
      icon: <Clock size={20} />, 
      color: "var(--error)",
      href: "/leads"
    },
  ];


  return (
    <div className="container" style={{ padding: '32px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '4px' }}>Sales Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back! Here's what's happening with your leads today.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Filter size={16} /> Filter
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setIsFormOpen(true)}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add New Lead">
        <LeadForm onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details">
        <LeadDetail 
          lead={selectedLead} 
          onUpdate={(updated) => {
            if (user) fetchData(user);
            if (updated) setSelectedLead(updated);
          }}
        />
      </Modal>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        {stats.map((stat, idx) => (
          <Link href={stat.href} key={idx} style={{ textDecoration: 'none', color: 'inherit' }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card"
              style={{ padding: '24px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: `${stat.color}15`, 
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: stat.trend.startsWith('+') ? 'var(--success)' : 'var(--error)' 
                }}>
                  {stat.trend}
                </span>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Charts & Lists */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
        gap: '24px' 
      }}>
        {/* Main Chart */}
        <div className="glass-card" style={{ padding: '32px', minWidth: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px' }}>Lead Acquisition</h3>
            <select style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData?.acquisitionData || []}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ background: '#171717', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="leads" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px' }}>Recent Activity</h3>
            <Link href="/leads" style={{ color: 'var(--primary)', fontSize: '14px' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {leads.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No recent activity.</p>
            ) : leads.map((lead, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedLead(lead)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  padding: '12px',
                  borderRadius: '12px',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }} className="lead-item"
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {lead.name.split(/\s+/).filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{lead.name}</span>
                    <span style={{ fontSize: '12px', color: lead.score > 80 ? 'var(--success)' : 'var(--text-muted)' }}>{lead.score} pts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.source}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: lead.status?.color || 'var(--text-muted)',
                      background: `${lead.status?.color || '#888'}15`,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: `1px solid ${lead.status?.color || '#888'}20`
                    }}>{lead.status?.name || 'New Lead'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .lead-item:hover {
          background: var(--glass);
        }
      `}</style>
    </div>
  );
}
