"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BarChart3, Bell } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "MANAGER", "SALES"] },
    { href: "/pipeline", label: "Pipeline", roles: ["ADMIN", "MANAGER", "SALES"] },
    { href: "/leads", label: "Leads", roles: ["ADMIN", "MANAGER", "SALES"] },
    { href: "/dashboard/users", label: "Users", roles: ["ADMIN", "MANAGER"] },
    { href: "/dashboard/reports", label: "Reports", roles: ["ADMIN", "MANAGER"] },
    { href: "/dashboard/settings", label: "Settings", roles: ["ADMIN"] },
  ].filter(link => !user || link.roles.includes(user.role));


  return (
    <nav style={{ 
      height: '70px',
      borderBottom: '1px solid var(--glass-border)',
      background: 'rgba(10, 10, 10, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ 
          fontSize: '24px', 
          fontWeight: 800, 
          fontFamily: 'Outfit', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          textDecoration: 'none',
          color: 'white'
        }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'var(--primary)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}>
            <BarChart3 size={22} />
          </div>
          <span>Lead<span style={{ color: 'var(--primary)' }}>Growth</span></span>
        </Link>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: showNotifications ? 'white' : 'var(--text-muted)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }} 
            className="hover-glass"
          >
            <Bell size={20} />
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #0a0a0a'
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              width: '300px',
              background: 'rgba(23, 23, 23, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 1000,
              padding: '12px'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                <span style={{ color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { title: 'New Lead', msg: 'A new lead from Facebook Ads', time: '2m ago' },
                  { title: 'Follow-up Due', msg: 'Call John Doe regarding proposal', time: '1h ago' }
                ].map((n, i) => (
                  <div key={i} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{n.title}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              background: 'var(--glass)', 
              border: '1px solid var(--glass-border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '13px', 
              fontWeight: 700,
              color: 'white',
              cursor: 'pointer'
            }}>
              AD
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                color: '#ef4444',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .hover-glass:hover {
          background: var(--glass);
          color: white;
        }
      `}</style>
    </nav>
  );
}
