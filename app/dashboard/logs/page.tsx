
"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Search, 
  Filter, 
  Clock, 
  User as UserIcon,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { withAuth } from "@/components/withAuth";

function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.targetType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Security Audit Logs</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Track every action and system event for security compliance</p>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input 
              type="text" 
              placeholder="Search logs by action, user or target..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '48px' }}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={18} /> Filter
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>User</th>
              <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Action</th>
              <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Target</th>
              <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading audit logs...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>No logs found</td></tr>
            ) : filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.6)' }}>
                  {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserIcon size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600 }}>{log.user?.name || "System"}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    background: 'rgba(255,255,255,0.05)',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: '4px' }}>{log.targetType}:</span>
                  {log.targetId?.substring(0, 8)}...
                </td>
                <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
                  {log.ipAddress || '0.0.0.0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withAuth(LogsPage, ["ADMIN"]);
