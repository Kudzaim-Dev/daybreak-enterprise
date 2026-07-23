import { motion } from "motion/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Unauthenticated, Authenticated } from "convex/react";
import DayBreakLogo from "@/components/DayBreakLogo.tsx";
import Footer from "@/components/Footer.tsx";
import { useNavigate } from "react-router-dom";
import { FileText, Receipt, Users, Package, TrendingUp, Globe, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

const features = [
  { icon: FileText, title: "Quotations", desc: "Create and send professional quotes that convert" },
  { icon: Receipt, title: "Invoices", desc: "Generate invoices and track payments effortlessly" },
  { icon: FileText, title: "Receipts", desc: "Issue receipts instantly after every transaction" },
  { icon: Users, title: "Client Directory", desc: "Manage your full client database in one place" },
  { icon: Package, title: "Product Catalog", desc: "Maintain your products and services with ease" },
  { icon: Globe, title: "Multi-Currency", desc: "Support ZMW, USD, EUR, GBP, ZAR, NGN, and more" },
];

const benefits = [
  "Professional branded documents with your logo",
  "Real-time dashboard and revenue tracking",
  "Unlimited clients and products",
  "Default currency: Zambian Kwacha (ZMW)",
  "All rights reserved — your data stays yours",
];

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <DayBreakLogo size="md" />
          <div className="flex gap-3 items-center">
            <Unauthenticated><SignInButton className="bg-[#F5A623] hover:bg-[#e09210] text-white font-semibold px-5 py-2 rounded-lg text-sm" /></Unauthenticated>
            <Authenticated><Button onClick={() => navigate("/dashboard")} className="bg-[#F5A623] hover:bg-[#e09210] text-white font-semibold">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button></Authenticated>
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A7A] via-[#1e4a9a] to-[#1B3A7A] opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#F5A62340,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <span className="inline-block bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 tracking-wide uppercase">Business Suite</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-balance leading-tight mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Run Your Business <span className="text-[#F5A623]">Professionally</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/75 max-w-3xl mx-auto mb-10 text-balance">
              DayBreak Enterprise gives any business a powerful hub to manage clients, create beautiful documents, and get paid faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Unauthenticated><SignInButton className="bg-[#F5A623] hover:bg-[#e09210] text-white font-bold px-8 py-4 rounded-xl text-lg shadow-2xl" /></Unauthenticated>
              <Authenticated><Button size="lg" onClick={() => navigate("/dashboard")} className="bg-[#F5A623] hover:bg-[#e09210] text-white font-bold px-8 py-4 rounded-xl text-lg">Open Dashboard <ArrowRight className="ml-2 h-5 w-5" /></Button></Authenticated>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20V60Z" fill="var(--background)" />
          </svg>
        </div>
      </section>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">One platform for all your business operations.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-card border rounded-2xl p-6 hover:shadow-lg hover:border-[#F5A623]/40 transition-all group">
                <div className="w-12 h-12 bg-[#1B3A7A]/10 dark:bg-[#F5A623]/10 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-[#1B3A7A] dark:text-[#F5A623]" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-[#1B3A7A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-10" style={{ fontFamily: "Montserrat, sans-serif" }}>Built for <span className="text-[#F5A623]">Every Business</span></h2>
            <ul className="space-y-4 text-left max-w-lg mx-auto mb-10">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-[#F5A623] mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Unauthenticated><SignInButton className="bg-[#F5A623] hover:bg-[#e09210] text-white font-bold px-8 py-4 rounded-xl text-lg" /></Unauthenticated>
            <Authenticated><Button size="lg" onClick={() => navigate("/dashboard")} className="bg-[#F5A623] hover:bg-[#e09210] text-white font-bold">Open Dashboard <ArrowRight className="ml-2 h-5 w-5" /></Button></Authenticated>
          </motion.div>
        </div>
      </section>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
