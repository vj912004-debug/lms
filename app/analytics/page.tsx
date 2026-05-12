"use client";

import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { TrendingUp, Users, Target, Activity } from "lucide-react";

const conversionData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const sourceData = [
  { name: 'Facebook', value: 400, color: '#1877F2' },
  { name: 'Google', value: 300, color: '#DB4437' },
  { name: 'Website', value: 300, color: '#6366f1' },
  { name: 'Referral', value: 200, color: '#10b981' },
];

export default function AnalyticsPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Advanced Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Deep dive into your sales performance and lead acquisition.</p>
      </div>

      {/* Analytics Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: "Conversion Rate", value: "24.5%", icon: <Target />, color: "var(--primary)" },
          { label: "Total Revenue", value: "$124,500", icon: <TrendingUp />, color: "var(--success)" },
          { label: "Lead Velocity", value: "+18%", icon: <Activity />, color: "var(--accent)" },
          { label: "Active Agents", value: "12", icon: <Users />, color: "var(--secondary)" },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card"
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '10px', 
              background: `${stat.color}15`, 
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>
        {/* Monthly Conversion Chart */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '32px' }}>Monthly Conversion Trend</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ background: '#171717', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution Pie Chart */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '32px' }}>Lead Source Distribution</h3>
          <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#171717', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 20px', minWidth: '140px' }}>
              {sourceData.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: s.color }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
