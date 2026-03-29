import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Brain, Users, Folder, Activity, Stethoscope, FlaskConical, Scan, Pill, FileText, Star, Zap, ChevronDown, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Landing() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">CareVault</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-indigo-600">Home</a>
          <a href="#services" className="hover:text-indigo-600">Services</a>
          <a href="#how-it-works" className="hover:text-indigo-600">How It Works</a>
          <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 border border-slate-200 rounded-full py-2 px-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 border border-slate-200 rounded-full py-2 px-6 hover:bg-slate-50 transition-colors bg-indigo-600 text-white hover:bg-indigo-700 border-none">
              <span className="text-sm font-medium">Login / Sign Up</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
            AI-Powered Health Management
          </div>
          
          <h2 className="text-5xl md:text-6xl font-mono font-bold leading-tight tracking-tight">
            Your Family's<br/>
            Health Records,<br/>
            <span className="text-indigo-600">Organised &<br/>Secure.</span>
          </h2>
          
          <p className="text-lg text-slate-600 max-w-lg font-mono">
            Store prescriptions, lab reports, and health documents safely in one digital vault. Get AI-powered insights to understand your health better.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
              View Your Records <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 font-mono text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Securely store your medical records</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>AI-powered health insights</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Organise your family's health history</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Access your records anytime, anywhere</span>
            </div>
          </div>
        </div>
        
        <div className="relative mt-8 md:mt-0 w-full h-[400px] md:h-[600px]">
          <div className="aspect-square rounded-full bg-indigo-50 absolute -inset-4 -z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1584515933487-779824d29309" 
            alt="Doctor" 
            referrerPolicy="no-referrer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "16px"
            }}
          />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-white/40 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Lock, title: "Secure Medical Record Storage", desc: "All your health documents are encrypted and stored safely in one place." },
            { icon: Brain, title: "AI-Powered Health Insights", desc: "Upload reports and get plain-language summaries of diagnoses, medicines, and risks." },
            { icon: Users, title: "Family Member Management", desc: "Manage health records for every member of your family in one organised place." },
            { icon: Folder, title: "Access Records Anytime", desc: "Access prescriptions, lab reports, and health documents from any device, anytime." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-mono font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm font-mono leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6 text-center">
        <p className="text-indigo-600 font-mono text-sm font-bold tracking-widest uppercase mb-4">How It Works</p>
        <h2 className="text-4xl font-mono font-bold mb-16">Four Simple Steps to Better Health Management</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Create Account", desc: "Sign up securely and set up your primary profile." },
            { step: "02", title: "Add Family Members", desc: "Create profiles for your dependents and loved ones." },
            { step: "03", title: "Upload Medical Reports", desc: "Snap a photo or upload PDFs of prescriptions and lab results." },
            { step: "04", title: "Analyze Reports with AI", desc: "Get instant, easy-to-understand summaries and health alerts." }
          ].map((item, i) => (
            <div key={i} className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold font-mono mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors z-10 relative">
                {item.step}
              </div>
              {i !== 3 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-indigo-100 -z-0"></div>
              )}
              <h3 className="text-xl font-mono font-bold mb-3">{item.title}</h3>
              <p className="text-slate-600 text-sm font-mono">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <p className="text-indigo-600 font-mono text-sm font-bold tracking-widest uppercase mb-4">Document Categories</p>
        <h2 className="text-4xl font-mono font-bold mb-12">Organise Every Type of Record</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Activity, label: "Cardiology" },
            { icon: Brain, label: "Neurology" },
            { icon: FlaskConical, label: "Pathology" },
            { icon: Scan, label: "Radiology" },
            { icon: Stethoscope, label: "General" },
            { icon: Pill, label: "Pharmacy" }
          ].map((cat, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-indigo-50 transition-colors cursor-pointer border border-slate-100">
              <cat.icon className="w-8 h-8 text-indigo-600" />
              <span className="font-mono font-medium text-sm">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <img 
            src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=2072&auto=format&fit=crop" 
            alt="Doctor with phone" 
            className="rounded-3xl shadow-xl w-full h-[600px] object-cover"
          />
          
          <div>
            <p className="text-indigo-600 font-mono text-sm font-bold tracking-widest uppercase mb-4">Our Services</p>
            <h2 className="text-4xl font-mono font-bold mb-6">World-Class Health Record Management</h2>
            <p className="text-slate-600 font-mono mb-12">
              CareVault brings together secure storage, AI analysis, and smart organisation to keep your family's health data safe and accessible.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: FileText, title: "Prescription Storage", desc: "Store and organise all prescriptions in one secure place, accessible anytime." },
                { icon: FlaskConical, title: "Lab Reports", desc: "Upload lab reports and get AI-powered plain-language summaries instantly." },
                { icon: Scan, title: "Imaging Records", desc: "Keep X-rays, MRIs, and scans organised and ready to share with doctors." },
                { icon: Pill, title: "Medicine Tracking", desc: "AI detects medicines from documents and helps you track them effectively." }
              ].map((service, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                    <service.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-mono font-bold mb-2">{service.title}</h3>
                  <p className="text-slate-600 text-sm font-mono">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 text-center">
        <p className="text-indigo-600 font-mono text-sm font-bold tracking-widest uppercase mb-4">Pricing</p>
        <h2 className="text-4xl font-mono font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-600 font-mono mb-16">Start free, upgrade when you need more</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-mono font-bold mb-2">Free</h3>
            <p className="text-slate-500 font-mono text-sm mb-6">Perfect for getting started</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-mono font-bold">₹0</span>
              <span className="text-slate-500 font-mono">/forever</span>
            </div>
            
            <ul className="space-y-4 mb-8 font-mono text-sm text-slate-700">
              {['Up to 3 family members', 'Up to 10 documents', 'Basic document storage', 'View uploaded documents', 'Basic text extraction'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            
            <Link to="/auth" className="block w-full py-3 px-4 rounded-xl border border-slate-300 text-center font-medium hover:bg-slate-50 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white p-8 rounded-3xl border-2 border-indigo-600 shadow-xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Star className="w-4 h-4" /> Most Popular
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-mono font-bold">Premium</h3>
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-slate-500 font-mono text-sm mb-6">For families who want more</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-mono font-bold">₹249</span>
              <span className="text-slate-500 font-mono">/per month</span>
            </div>
            
            <ul className="space-y-4 mb-8 font-mono text-sm text-slate-700">
              {['Unlimited family members', 'Unlimited documents', 'AI prescription analysis', 'Detailed health summaries', 'Medicine detection & insights', 'Priority support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            
            <Link to="/auth" className="block w-full py-3 px-4 rounded-xl bg-indigo-600 text-white text-center font-medium hover:bg-indigo-700 transition-colors">
              Upgrade Plan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
