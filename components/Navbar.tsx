"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BarChart3, Bell, Menu, X, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    }
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
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
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
            
            <div className="desktop-only" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="desktop-only" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
                  {user?.name?.split(' ').map((n:any) => n[0]).join('') || 'AD'}
                </div>
                <button 
                  onClick={handleLogout}
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
                  className="logout-btn"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-only hover-glass"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        <style jsx>{`
          .hover-glass:hover {
            background: var(--glass);
            color: white;
          }
          .logout-btn:hover {
            background: rgba(220, 38, 38, 0.2) !important;
          }
          
          .desktop-only {
            display: flex;
            align-items: center;
          }
          .mobile-only {
            display: none;
          }

          @media (max-width: 1024px) {
            .desktop-only {
              display: none !important;
            }
            .mobile-only {
              display: flex !important;
            }
          }
        `}</style>
      </nav>

      {/* Mobile Drawer - Moved outside nav to avoid stacking context issues with backdrop-filter */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 9998
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '300px',
                background: '#0a0a0a',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 9999,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit', color: 'white' }}>Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: 'none', 
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: pathname === link.href ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: pathname === link.href ? 'var(--primary)' : 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 600,
                      fontSize: '16px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: pathname === link.href ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
                    }}
                  >
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: pathname === link.href ? 'var(--primary)' : 'transparent' 
                    }} />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '0 8px' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'white',
                    fontSize: '16px',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}>
                    {user?.name?.split(' ').map((n:any) => n[0]).join('') || 'AD'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>{user?.name || 'Administrator'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role || 'Admin'}</div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#ef4444',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'}
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
