"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  BarChart3, 
  Bot, 
  BrainCircuit, 
  CheckCircle2, 
  ChevronRight, 
  Euro, 
  FileText, 
  LineChart, 
  Lock, 
  PieChart, 
  ShieldCheck, 
  Sparkles, 
  UploadCloud, 
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* SECTION 1 — NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-[#030712]/70 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FinFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#ai" className="hover:text-white transition-colors">AI Assistant</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
            Login
          </Link>
          <Link href="/sign-up" className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-full px-6 h-10 transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col gap-32">
        
        {/* SECTION 2 — HERO SECTION */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-16 pt-10">
          <motion.div 
            className="flex-1 space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI Financial Co-Pilot for German SMEs</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
              Finance Automation <br/>That Thinks Ahead
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg text-slate-400 max-w-xl leading-relaxed">
              FinFlow uses AI to automate invoices, VAT calculations, cash flow forecasting, and financial insights — so German SMEs spend less time on bookkeeping and more time growing.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/sign-up" className="inline-flex items-center justify-center w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-full px-8 h-12 transition-colors text-lg">
                Sign Up <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="#demo" className="inline-flex items-center justify-center w-full sm:w-auto rounded-full px-8 h-12 border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors text-lg">
                Watch Demo
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-6 pt-8 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> GDPR Compliant</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> DATEV Ready</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> German VAT Support</span>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex-1 relative w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative rounded-2xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-2xl shadow-2xl overflow-hidden aspect-[4/3]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
              
              {/* Dashboard Mockup Content */}
              <div className="p-6 h-full flex flex-col gap-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Total Revenue</p>
                    <p className="text-2xl font-semibold text-white">€124,500.00</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none">+14.2%</Badge>
                </div>
                
                <div className="flex-1 flex gap-4">
                  <div className="flex-1 rounded-xl bg-white/5 border border-white/5 flex items-end p-4 gap-2">
                    {/* Mock Chart */}
                    {[40, 70, 45, 90, 65, 110, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-teal-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                        <div className="w-full bg-teal-400 rounded-t-sm" style={{ height: '4px' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div 
                className="absolute top-12 -left-8 bg-[#1e293b]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl max-w-[220px]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><AlertTriangle className="w-4 h-4" /></div>
                  <div>
                    <p className="text-xs font-medium text-white">Cash Shortfall</p>
                    <p className="text-[10px] text-slate-400">Projected in 47 days based on current burn rate.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-16 -right-6 bg-[#1e293b]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl max-w-[200px]"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400"><Bot className="w-4 h-4" /></div>
                  <div>
                    <p className="text-xs font-medium text-white">VAT Auto-Categorized</p>
                    <p className="text-[10px] text-slate-400">19% standard rate applied.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 3 — PROBLEM SECTION */}
        <section className="py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">German Businesses Are Drowning in Financial Admin</h2>
            <p className="text-slate-400 text-lg">3.4 million German SMEs waste 6–10 hours weekly and pay €150–300/hour for advisors just to make sense of their numbers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-red-950/10 border-red-900/20 p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20 group-hover:bg-red-500/40 transition-colors" />
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                <TrendingDown className="w-5 h-5 text-red-400" /> Without FinFlow
              </h3>
              <ul className="space-y-4">
                {['Manual invoice entry', 'Spreadsheet chaos', 'Expensive Steuerberater', 'Missed VAT deadlines', 'No financial visibility'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-teal-950/10 border-teal-900/20 p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/20 group-hover:bg-teal-500/40 transition-colors" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 blur-[50px] rounded-full" />
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-teal-400" /> With FinFlow
              </h3>
              <ul className="space-y-4">
                {['AI invoice automation', 'Instant VAT calculation', 'Real-time forecasting', 'Anomaly detection', 'AI-powered insights'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* SECTION 4 — HOW IT WORKS */}
        <section className="py-20 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How FinFlow Works</h2>
            <p className="text-slate-400">From messy receipts to perfect financial clarity in seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
            
            {[
              { icon: UploadCloud, title: "Step 1: Upload", desc: "Drag-and-drop PDFs or photos of your invoices." },
              { icon: BrainCircuit, title: "Step 2: AI Processing", desc: "Extracts vendor, amount, VAT, dates, and spots anomalies." },
              { icon: PieChart, title: "Step 3: Clarity", desc: "Forecasts, dashboards, AI insights, and tax readiness." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(45,212,191,0.1)]">
                  <step.icon className="w-10 h-10 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm max-w-[250px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5 — AI INVOICE PROCESSING SHOWCASE */}
        <section className="py-20" id="features">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">Flawless Extraction.<br/>Zero Data Entry.</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Our proprietary finance models extract line items, identify vendors, and calculate exact German VAT split with over 95% accuracy.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Detects duplicates automatically</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Learns your categorization habits</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Verifies IBAN and payment details</li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-2xl blur-xl" />
              <Card className="relative bg-[#0f172a]/90 border-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-white">invoice_amazon_aug.pdf</span>
                  </div>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/10">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    Analyzing...
                  </Badge>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Vendor', value: 'Amazon EU SARL', score: '98%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Date', value: '14.08.2026', score: '99%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Subtotal', value: '€2,093.28', score: '99%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'VAT Rate', value: '19%', score: '82%', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Total', value: '€2,491.00', score: '99%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  ].map((field, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      key={i} 
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
                    >
                      <span className="text-sm text-slate-400">{field.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-white">{field.value}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${field.bg} ${field.color}`}>
                          {field.score}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 6 — AI CFO CHAT */}
        <section className="py-20" id="ai">
          <div className="bg-[#0f172a]/60 border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/5 to-transparent pointer-events-none" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ask Your Finances Anything</h2>
                <p className="text-slate-400 text-lg mb-8">
                  FinFlow’s AI assistant understands your real financial data — not generic templates. Make informed decisions instantly.
                </p>

                <div className="space-y-6">
                  {/* Chat Bubbles */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0" />
                    <div className="bg-slate-800 text-slate-200 text-sm p-4 rounded-2xl rounded-tl-none">
                      Can I afford to hire a new developer at €3,500/month?
                    </div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-teal-950/30 border border-teal-900/50 text-slate-200 text-sm p-4 rounded-2xl rounded-tr-none space-y-3">
                      <p>Based on your current burn rate and recurring revenue, you can sustain this hire for approximately <strong>14 months</strong>.</p>
                      <div className="p-3 bg-[#0a0f1c] rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">Current Runaway</span>
                        <span className="font-mono text-teal-400">18.2 mo</span>
                      </div>
                      <div className="p-3 bg-[#0a0f1c] rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">Runaway (Post-Hire)</span>
                        <span className="font-mono text-amber-400">14.1 mo</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="relative h-[400px] rounded-2xl border border-white/10 bg-[#0a0f1c] p-6 hidden lg:block">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Projected Burn Rate</h4>
                    <p className="text-2xl font-semibold text-white mt-1">€14,250 <span className="text-sm text-slate-500 font-normal">/mo</span></p>
                  </div>
                  <div className="h-48 w-full border-b border-l border-slate-800 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,80 Q25,75 50,40 T100,20" fill="none" stroke="#2dd4bf" strokeWidth="2" />
                      <path d="M0,80 Q25,75 50,40 T100,60" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-400" /> Base Scenario</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> +New Hire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — CASH FLOW FORECASTING */}
        <section className="py-20 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">See Financial Problems Before They Happen</h2>
          <p className="text-slate-400 text-lg mb-12">Stop managing via the rearview mirror. Our predictive engine maps out your financial future.</p>
          
          <div className="relative rounded-2xl border border-white/10 bg-[#0f172a]/50 p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { l: "Operating Cash Flow", v: "€42,100" },
                { l: "Expected Receivables", v: "€18,450" },
                { l: "Upcoming Payables", v: "€9,200" },
                { l: "Net Change (30d)", v: "+€8,120", c: "text-emerald-400" }
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-left">
                  <p className="text-xs text-slate-400 mb-1">{m.l}</p>
                  <p className={`text-lg font-semibold ${m.c || 'text-white'}`}>{m.v}</p>
                </div>
              ))}
            </div>
            {/* Visual Abstract Chart */}
            <div className="h-64 w-full relative flex items-end justify-between px-4 pb-4">
               {[30, 45, 60, 50, 75, 90, 85, 110, 100, 120, 140, 130].map((val, i) => (
                 <div key={i} className="w-8 relative group" style={{ height: `${val}%` }}>
                   <div className="absolute inset-0 bg-teal-500/20 rounded-t-sm group-hover:bg-teal-400/40 transition-colors" />
                   <div className="absolute top-0 w-full h-1 bg-teal-400 rounded-t-sm" />
                 </div>
               ))}
               {/* Trend Line Overlay */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                 <path d="M 0 80 Q 200 40 400 60 T 800 20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5 5" />
               </svg>
            </div>
          </div>
        </section>

        {/* SECTION 8 — GERMAN TAX & COMPLIANCE */}
        <section className="py-20" id="security">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Enterprise-Grade Compliance</h2>
            <p className="text-slate-400">Built securely for German legal and tax requirements.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "GDPR Compliant", desc: "Data processed and hosted entirely within the EU." },
              { icon: Euro, title: "German VAT Support", desc: "Flawless handling of 0%, 7%, and 19% tax rates." },
              { icon: FileText, title: "DATEV Ready", desc: "Export ready formats for your Steuerberater." },
              { icon: Lock, title: "Audit Logs", desc: "Immutable record of all financial operations." }
            ].map((feature, i) => (
              <Card key={i} className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors cursor-default">
                <feature.icon className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 9 — TESTIMONIALS */}
        <section className="py-20">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 p-8 backdrop-blur-xl">
              <div className="flex gap-1 text-teal-400 mb-6">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-slate-200 mb-8 leading-relaxed">
                "FinFlow reduced our bookkeeping workload by 70%. The AI categorization is scary accurate, and my Steuerberater loves the clean DATEV exports."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700" />
                <div>
                  <p className="text-white font-medium">Lukas M.</p>
                  <p className="text-sm text-slate-400">Founder, E-commerce GmbH</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 p-8 backdrop-blur-xl">
              <div className="flex gap-1 text-teal-400 mb-6">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-slate-200 mb-8 leading-relaxed">
                "Finally, accounting software that actually feels intelligent. The cash flow forecasting saved us from a major liquidity crunch last quarter."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700" />
                <div>
                  <p className="text-white font-medium">Sarah K.</p>
                  <p className="text-sm text-slate-400">Managing Director, Tech Agency</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center pt-16 border-t border-white/5 mt-16">
            <div>
              <p className="text-4xl font-bold text-white mb-2">95%</p>
              <p className="text-sm text-slate-400">Extraction Accuracy</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">4x</p>
              <p className="text-sm text-slate-400">Faster Processing</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">80%</p>
              <p className="text-sm text-slate-400">Less Manual Work</p>
            </div>
          </div>
        </section>

        {/* SECTION 10 — FINAL CTA */}
        <section className="py-24 relative overflow-hidden rounded-3xl bg-[#0f172a] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/10" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Stop Managing Spreadsheets.<br/>Start Running Your Business.</h2>
            <p className="text-slate-400 text-lg mb-10">Join thousands of modern German SMEs using FinFlow to automate their finances.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-200 font-semibold rounded-full px-8 h-14 text-lg transition-colors">
                Sign Up
              </Link>
              <Link href="#demo" className="inline-flex items-center justify-center w-full sm:w-auto rounded-full px-8 h-14 text-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-colors">
                Book Demo
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#030712] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-teal-400" fill="currentColor" />
              <span className="text-xl font-bold tracking-tight text-white">FinFlow</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              The AI-native financial co-pilot built specifically for German SMEs and freelancers.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">LinkedIn</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal & Security</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">GDPR Info</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 FinFlow GmbH. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Made in Berlin</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StarIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
