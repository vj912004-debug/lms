"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Zap, 
  Target, 
  BarChart3, 
  Shield, 
  Users, 
  MousePointer2,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const features = [
    { icon: <Zap />, title: "Lead Capture", desc: "Automate lead ingestion from Facebook, Google, and your website." },
    { icon: <Target />, title: "Smart Pipeline", desc: "Manage your sales funnel with a high-fidelity Kanban interface." },
    { icon: <BarChart3 />, title: "Deep Analytics", desc: "Track conversion rates and ROI with precision dashboards." },
    { icon: <Users />, title: "Team Sync", desc: "Auto-assign leads to your top-performing sales agents." },
    { icon: <Shield />, title: "Secure Data", desc: "Enterprise-grade security for your lead database." },
    { icon: <MousePointer2 />, title: "Automation", desc: "Trigger follow-ups and notifications with custom workflows." },
  ];

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {/* Hero Section */}
      <section style={{ 
        padding: 'clamp(60px, 15vw, 120px) 0 60px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ 
            background: 'var(--glass)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            border: '1px solid var(--glass-border)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--primary)',
            marginBottom: '32px'
          }}
        >
          New: AI-Powered Lead Scoring is here!
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ 
            fontSize: 'clamp(32px, 10vw, 72px)', 
            fontWeight: 800, 
            lineHeight: 1.1,
            marginBottom: '24px',
            background: 'linear-gradient(to bottom, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '1000px'
          }}
        >
          Close More Deals with <br />
          <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>Intelligent</span> Lead Flow
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            color: 'var(--text-muted)', 
            maxWidth: '640px',
            marginBottom: '40px',
            lineHeight: 1.6
          }}
        >
          LeadGrowth is the high-performance CRM built for teams who demand 
          speed, clarity, and results. Capture leads instantly and never miss a follow-up.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', gap: '16px', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', minWidth: '200px' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link href="/pipeline" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '16px', minWidth: '200px' }}>
            View Demo
          </Link>
        </motion.div>
      </section>

      {/* Visual Preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="glass-card"
        style={{ 
          height: '500px', 
          width: '100%', 
          maxWidth: '1000px', 
          margin: '0 auto 120px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--glass-border)',
          position: 'relative'
        }}
      >
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <BarChart3 size={80} color="var(--primary)" opacity={0.2} />
          <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>Dashboard Preview Loading...</p>
        </div>
        {/* Glow effect */}
        <div style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 70%)',
          pointerEvents: 'none'
        }}></div>
      </motion.div>

      {/* Features Grid */}
      <section style={{ padding: '60px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, marginBottom: '16px' }}>Everything you need to grow</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Powerful features designed to optimize your entire sales cycle.</p>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', 
          gap: '20px' 
        }}>
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card"
              style={{ padding: '32px' }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(99, 102, 241, 0.1)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                marginBottom: '20px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: 700 }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '14px' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof / Trusted By */}
      <section style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: 700, marginBottom: '32px' }}>Trusted by innovative teams worldwide</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', opacity: 0.5, flexWrap: 'wrap' }}>
          {['TECHCORP', 'LOGIX', 'FINPLUS', 'INNOVATE', 'CLOUDSCALE'].map((logo) => (
            <span key={logo} style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px' }}>{logo}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
