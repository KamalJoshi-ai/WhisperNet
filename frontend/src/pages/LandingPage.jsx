import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiShield, 
  FiZap, 
  FiImage, 
  FiLayers, 
  FiSmartphone, 
  FiLock, 
  FiArrowRight, 
  FiGithub, 
  FiTwitter, 
  FiInstagram, 
  FiMessageSquare, 
  FiSend,
  FiActivity,
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiMenu,
  FiX
} from "react-icons/fi";
import { AiFillLayout } from "react-icons/ai";
import useUserStore from "../store/useUserStore";

const features = [
  {
    title: "End-to-End Encryption",
    description: "Every whisper is encrypted. Your conversations are private and only readable by the sender and recipient.",
    icon: FiLock,
    glowColor: "group-hover:shadow-lime-500/10 border-lime-500/20"
  },
  {
    title: "Real-time WebSockets",
    description: "Instant message delivery with ultra-low latency WebSocket connections. Communication that keeps pace with you.",
    icon: FiZap,
    glowColor: "group-hover:shadow-emerald-500/10 border-emerald-500/20"
  },
  {
    title: "Rich Media & CDN Storage",
    description: "Share images, documents, and media seamlessly. Powered by high-speed CDN and Cloudinary delivery.",
    icon: FiImage,
    glowColor: "group-hover:shadow-teal-500/10 border-teal-500/20"
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Encryption Demo States
  const [plainText, setPlainText] = useState("");
  const [encMode, setEncMode] = useState("binary"); // binary | mock_aes | hex
  const [copied, setCopied] = useState(false);

  // Live Chat Preview Mock Messages
  const [chatMessages, setChatMessages] = useState([
    { sender: "Kaiser12", text: "Hey! Did you check out the new WhisperNet platform? 🚀", time: "12:04" },
    { sender: "You", text: "Yes! The real-time messaging feels incredibly fast.", time: "12:05" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  // Live Chat Demo Loop
  useEffect(() => {
    let timer1, timer2, timer3, timer4, timer5;

    const runChatDemo = () => {
      // Step 1: Kaiser12 typing (after 3s)
      timer1 = setTimeout(() => {
        setTypingUser("Kaiser12");
        setIsTyping(true);
      }, 3000);

      // Step 2: Kaiser12 sends message (after 5s)
      timer2 = setTimeout(() => {
        setIsTyping(false);
        setTypingUser("");
        setChatMessages(prev => [
          ...prev,
          { sender: "Kaiser12", text: "That is because of the Socket.io WebSocket connections! E2E encryption is also active. 🔐", time: "12:06" }
        ]);
      }, 5500);

      // Step 3: You start typing (after 8s)
      timer3 = setTimeout(() => {
        setTypingUser("You");
        setIsTyping(true);
      }, 8500);

      // Step 4: You send message (after 10s)
      timer4 = setTimeout(() => {
        setIsTyping(false);
        setTypingUser("");
        setChatMessages(prev => [
          ...prev,
          { sender: "You", text: "Awesome! Let me invite Bob to this whisper-room.", time: "12:07" }
        ]);
      }, 10500);

      // Step 5: Reset timeline (after 15s)
      timer5 = setTimeout(() => {
        setChatMessages([
          { sender: "Kaiser12", text: "Hey! Did you check out the new WhisperNet platform? 🚀", time: "12:04" },
          { sender: "You", text: "Yes! The real-time messaging feels incredibly fast.", time: "12:05" },
        ]);
      }, 15000);
    };

    runChatDemo();
    const interval = setInterval(runChatDemo, 16000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearInterval(interval);
    };
  }, []);

  // Encrypter Helper
  const getEncryptedText = () => {
    if (!plainText) return "Waiting for plain text inputs...";
    
    if (encMode === "binary") {
      return plainText
        .split("")
        .map(char => char.charCodeAt(0).toString(2).padStart(8, "0"))
        .join(" ");
    }
    
    if (encMode === "mock_aes") {
      let hash = "";
      const seed = "whispernet_secret_salt_99x";
      for (let i = 0; i < plainText.length; i++) {
        const charCode = plainText.charCodeAt(i) ^ seed.charCodeAt(i % seed.length);
        hash += charCode.toString(16).padStart(2, "0");
      }
      return `ENC_AES256::[${hash.toUpperCase()}]`;
    }

    if (encMode === "hex") {
      return plainText
        .split("")
        .map(char => char.charCodeAt(0).toString(16).toUpperCase())
        .join(" ");
    }

    return plainText;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEncryptedText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 selection:bg-[#00C853]/30 selection:text-lime-200 overflow-x-hidden font-sans relative">
      
      {/* ─── FLOATING NEON GLOWS ─── */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00C853]/5 blur-[130px] pointer-events-none -z-10 animate-pulse duration-[12s]" />
      <div className="absolute top-[35%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-teal-500/5 blur-[140px] pointer-events-none -z-10" />

      {/* ─── FLOATING NAVBAR ─── */}
      <header className="fixed top-5 left-0 right-0 z-50 px-4 md:px-8 max-w-7xl mx-auto">
        <nav className="flex items-center justify-between px-6 py-4.5 rounded-full border border-slate-800 bg-[#0B0F17]/90 backdrop-blur-xl shadow-2xl">
          {/* Logo with Green Accents & AiFillLayout */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#00C853] flex items-center justify-center shadow-lg shadow-[#00C853]/20 group-hover:scale-105 transition-transform duration-300">
              <AiFillLayout className="text-[#0B0F17] w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-[#00E676] transition-colors">
              WhisperNet
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-wider text-slate-400">
            <a href="#features" className="hover:text-[#00E676] transition-colors">Features</a>
            <a href="#demo" className="hover:text-[#00E676] transition-colors">Encryption Sandbox</a>
            <a href="#custom-section" className="hover:text-[#00E676] transition-colors">Workspace</a>
          </div>

          {/* Action CTA */}
          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <Link 
                to="/chat" 
                className="relative group overflow-hidden px-6 py-3 rounded-full text-xs font-bold bg-[#00C853] hover:bg-[#00E676] text-[#0B0F17] hover:shadow-lg hover:shadow-[#00C853]/25 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                Go to Chat
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/user-login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/user-login" 
                  className="relative group overflow-hidden px-6 py-3 rounded-full text-xs font-bold bg-white text-zinc-950 hover:bg-[#00E676] hover:text-[#0B0F17] transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  Launch App
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="absolute top-18 left-4 right-4 bg-[#0B0F17]/98 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 flex flex-col gap-6 shadow-2xl md:hidden z-50">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-slate-400 hover:text-[#00E676] transition-colors"
            >
              Features
            </a>
            <a 
              href="#demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-slate-400 hover:text-[#00E676] transition-colors"
            >
              Encryption Sandbox
            </a>
            <a 
              href="#custom-section" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-slate-400 hover:text-[#00E676] transition-colors"
            >
              Workspace
            </a>
            <hr className="border-slate-800" />
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <Link 
                  to="/chat" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#00C853] hover:bg-[#00E676] text-[#0B0F17] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Go to Chat
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/user-login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-slate-400 hover:text-white font-bold py-2.5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/user-login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-white text-zinc-950 hover:bg-[#00E676] hover:text-[#0B0F17] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Launch App
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-36 md:pt-48 pb-28 px-6 md:px-12 max-w-7xl mx-auto min-h-[95vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          
          {/* Left Column: Headlines and actions */}
          <div className="lg:col-span-6 flex flex-col text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2.5 self-start bg-[#00C853]/10 border border-[#00C853]/30 text-[#00E676] text-xs font-semibold px-4.5 py-2.5 rounded-full mb-8 shadow-sm">
              <FiActivity className="w-3.5 h-3.5 animate-pulse" />
              Now Active: Realtime Encrypted Chat
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
              Connect. <br />
              <span className="bg-gradient-to-r from-lime-400 via-emerald-400 to-[#00E676] bg-clip-text text-transparent">
                Whisper-Quiet.
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-base md:text-lg mb-12 leading-relaxed max-w-xl">
              WhisperNet is a next-generation real-time chat dashboard built with end-to-end security parameters. Send instant texts, check user statuses, and exchange files under a beautiful glassmorphic deck.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-5 mb-10">
              <Link to={isAuthenticated ? "/chat" : "/user-login"} className="w-full sm:w-auto">
                <button className="group relative w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#00C853] to-emerald-600 hover:from-[#00E676] hover:to-emerald-500 text-[#0B0F17] font-extrabold px-9 py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-[#00C853]/10 hover:shadow-xl hover:shadow-[#00C853]/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                  {isAuthenticated ? "Enter Dashboard" : "Start Chatting Now"}
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <a href="#features" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold px-9 py-5 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                  Explore Features
                </button>
              </a>
            </div>

            {/* Status indicator */}
            <p className="text-slate-500 text-xs flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C853] animate-ping" />
              100% Encrypted transactions & zero tracker cookies.
            </p>
          </div>

          {/* Right Column: PRECISE RECREATION OF USER'S CHAT DASHBOARD SCREENSHOT */}
          <div className="lg:col-span-6 flex items-center justify-center w-full relative">
            
            {/* Ambient Back Glow */}
            <div className="absolute w-[450px] h-[340px] bg-[#00C853]/5 rounded-full blur-[80px] pointer-events-none -z-10" />
            
            {/* Dashboard Container Mockup */}
            <div className="w-full max-w-[580px] aspect-[1.8/1] rounded-2xl border border-slate-800 bg-[#0F1424] shadow-2xl flex flex-col overflow-hidden relative group">
              
              {/* Glowing Outline border on hover */}
              <div className="absolute inset-0 border border-[#00C853]/5 rounded-2xl pointer-events-none group-hover:border-[#00C853]/25 transition-colors duration-500" />
              
              {/* Header Bar */}
              <div className="h-10 px-5 border-b border-slate-900 bg-[#0B0F19] flex items-center justify-center relative">
                <div className="absolute left-4 flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                </div>
                <h3 className="text-xs font-bold text-slate-300">WhisperNet — Fast & Secure Chat</h3>
              </div>

              {/* Body Panels split exactly like screenshot */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* 1. Left Sidebar Navigation Panel */}
                <div className="w-1/4 bg-[#0B0F19] border-r border-slate-900 flex flex-col justify-between p-3.5">
                  
                  {/* Top Links */}
                  <div className="space-y-2">
                    {/* Brand / Logo using AiFillLayout exactly as configured in Sidebar.jsx */}
                    <div className="flex items-center gap-2 mb-4 px-2">
                      <AiFillLayout className="text-[#00C853] w-5 h-5 flex-shrink-0" />
                      <span className="text-[10px] font-black text-white">WhisperNet</span>
                    </div>

                    {/* Navigation Items (Active Green badge matching screenshot!) */}
                    <div className="rounded-lg bg-[#00A859] text-white px-3 py-1.5 flex items-center gap-2.5 text-[9px] font-bold shadow-md shadow-[#00A859]/20">
                      <AiFillLayout className="w-3.5 h-3.5" />
                      <span>Chats</span>
                    </div>
                    <div className="text-slate-400 px-3 py-1.5 flex items-center gap-2.5 text-[9px] font-bold hover:text-white transition-colors">
                      <div className="w-3 h-3 rounded-full border border-slate-500 flex items-center justify-center text-[7px]">S</div>
                      <span>Status</span>
                    </div>
                    <div className="text-slate-400 px-3 py-1.5 flex items-center gap-2.5 text-[9px] font-bold hover:text-white transition-colors">
                      <div className="w-3 h-3 rounded-full border border-slate-500 flex items-center justify-center text-[7px]">P</div>
                      <span>Profile</span>
                    </div>
                    <div className="text-slate-400 px-3 py-1.5 flex items-center gap-2.5 text-[9px] font-bold hover:text-white transition-colors">
                      <div className="w-3 h-3 rounded-full border border-slate-500 flex items-center justify-center text-[7px]">S</div>
                      <span>Settings</span>
                    </div>
                  </div>

                  {/* Bottom details */}
                  <div className="space-y-3">
                    <div className="text-slate-400 px-2 flex items-center gap-1.5 text-[8px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      <span>Light Mode</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[9px] font-bold text-emerald-400">
                        U
                      </div>
                      <div className="text-[7px] text-left leading-tight">
                        <p className="font-extrabold text-white">My Account</p>
                        <p className="text-slate-500">kamaljoshi3524@gmail.com</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. Middle Chats List Panel (Exactly matching contacts in screenshot) */}
                <div className="w-[32%] bg-[#0F1423] border-r border-slate-900 flex flex-col p-3">
                  
                  {/* Title */}
                  <div className="flex items-center justify-between mb-3 px-1.5">
                    <h4 className="font-bold text-[11px] text-white">Chats</h4>
                  </div>

                  {/* Search Bar */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-[9px] text-slate-500 mb-4 text-left">
                    Search or start new Chat
                  </div>

                  {/* Chat items */}
                  <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                    {/* Kaiser12 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">K</div>
                        <div className="text-left text-[9px]">
                          <p className="font-bold text-white">Kaiser12</p>
                          <p className="text-[#00E676] text-[8px]">still</p>
                        </div>
                      </div>
                      <span className="text-[7px] text-slate-500">15 days ago</span>
                    </div>

                    {/* Rahul09 */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">R</div>
                      <div className="text-left text-[9px]">
                        <p className="font-bold text-slate-400">Rahul09</p>
                        <p className="text-slate-600 text-[8px]">No messages yet</p>
                      </div>
                    </div>

                    {/* vpokhrival */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">V</div>
                      <div className="text-left text-[9px]">
                        <p className="font-bold text-slate-400">vpokhrival</p>
                        <p className="text-slate-600 text-[8px]">No messages yet</p>
                      </div>
                    </div>

                    {/* Rahuuuuuuuul */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">R</div>
                      <div className="text-left text-[9px]">
                        <p className="font-bold text-slate-400">Rahuuuuuuuul</p>
                        <p className="text-slate-600 text-[8px]">No messages yet</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Right Message View Screen (Select a chat to start messaging) */}
                <div className="flex-1 bg-[#182035] flex flex-col items-center justify-center p-6 text-center">
                  {/* Central icon */}
                  <div className="w-14 h-14 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4 text-slate-500">
                    <FiMessageSquare className="w-6 h-6" />
                  </div>
                  
                  <h4 className="text-[11px] font-extrabold text-slate-300 mb-1">Select a chat to start messaging</h4>
                  <p className="text-[9px] text-slate-500 max-w-[160px] leading-relaxed">Choose from your existing conversations</p>
                </div>

              </div>

            </div>

            {/* Central Circle with AiFillLayout behind Mockup (for backdrop aesthetic) */}
            <div className="absolute -top-12 right-[-24px] w-28 h-28 rounded-full bg-[#0F1424] border border-slate-800 flex items-center justify-center shadow-lg -z-10">
              <AiFillLayout className="text-[#00E676] w-10 h-10 animate-pulse duration-[3s]" />
            </div>

            {/* Floating drag and drop cloud mockup badge */}
            <div className="absolute top-[40%] left-[-48px] bg-[#0F1424] text-slate-200 p-4.5 rounded-2xl shadow-xl border border-slate-800 max-w-[160px] text-left cursor-pointer hover:-translate-y-0.5 transition-transform hidden xl:block">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 mb-3 text-[#00E676]">
                <FiUploadCloud className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold leading-tight mb-1">Drag & drop files</p>
              <p className="text-[8px] text-slate-500 leading-none">instant Cloudinary upload</p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── LIME FEATURES GRID SECTION ─── */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-900 relative">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00E676] mb-3 block">
            Designed for Privacy
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white">
            Engineered with Integrity.
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            WhisperNet replaces basic, unsecure messaging routes with a modern stack featuring custom security layers and immediate connectivity.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className={`group relative rounded-2xl border bg-[#0F1424] p-8 hover:bg-[#182035] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.glowColor}`}
              >
                {/* Glow Backdrop */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#00C853]/0 to-[#00C853]/0 group-hover:from-[#00C853]/[0.02] group-hover:to-teal-500/[0.02] transition-colors pointer-events-none" />

                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-center justify-center mb-6 group-hover:border-slate-700 transition-colors">
                  <Icon className="w-5 h-5 text-[#00E676] transition-colors" />
                </div>

                <h3 className="font-bold text-white text-lg mb-3 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── ENCRYPTED MESSAGING SANDBOX ─── */}
      <section id="demo" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-900">
        <div className="bg-[#0F1424] border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          
          {/* Internal Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#00C853]/5 blur-[80px] pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Intro text */}
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00E676] mb-3 block">
                Interactive Showcase
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
                How is your whisper encrypted?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Type any message in the widget to watch how WhisperNet intercepts inputs and converts plain characters into cryptographic bitstreams. 
              </p>

              {/* Mode Selector pills */}
              <div className="flex gap-2 p-1.5 bg-[#0B0F17] rounded-xl border border-slate-800 self-start inline-flex">
                <button 
                  onClick={() => setEncMode("binary")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    encMode === "binary" ? "bg-[#00C853] text-[#0B0F17]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Binary Bits
                </button>
                <button 
                  onClick={() => setEncMode("mock_aes")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    encMode === "mock_aes" ? "bg-[#00C853] text-[#0B0F17]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  AES Cipher
                </button>
                <button 
                  onClick={() => setEncMode("hex")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    encMode === "hex" ? "bg-[#00C853] text-[#0B0F17]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Hex Hash
                </button>
              </div>
            </div>

            {/* Right side: Interactive Widget */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Plain Text Input</label>
                <textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Type a secret message here..."
                  maxLength={100}
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/20 transition-all resize-none h-24"
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex justify-between">
                  <span>Encrypted Whisper Stream</span>
                  {plainText && (
                    <button 
                      onClick={handleCopy}
                      className="text-[#00E676] hover:text-[#00C853] transition-colors capitalize text-[9px] cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Stream"}
                    </button>
                  )}
                </label>
                <div className="w-full bg-[#070A10] border border-slate-800 rounded-2xl p-5 min-h-[96px] relative font-mono text-[11px] leading-relaxed break-all text-lime-400 shadow-inner flex items-center">
                  <div className="w-full">
                    {getEncryptedText()}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── DUAL COLUMN INTERACTIVE SHOWCASE ─── */}
      <section id="custom-section" className="max-w-7xl mx-auto px-6 md:px-12 my-12">
        <div className="rounded-[32px] bg-[#0F1424] text-white p-8 md:p-14 shadow-2xl border border-slate-800 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Features info */}
            <div className="lg:col-span-5 text-left flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                <span className="italic font-serif font-normal text-[#00E676]">Chats</span> with Confidence
              </h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm">
                Create secure connections with our fully responsive real-time client. Send instant images, documents, and messaging ciphers.
              </p>

              <div className="flex flex-col gap-3 max-w-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
                  <FiCheckCircle className="text-[#00E676] w-4.5 h-4.5 flex-shrink-0" />
                  <span className="text-xs text-slate-300 font-semibold">100% Secure WebSockets</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
                  <FiCheckCircle className="text-[#00E676] w-4.5 h-4.5 flex-shrink-0" />
                  <span className="text-xs text-slate-300 font-semibold">Custom Lime/Dark Interface</span>
                </div>
              </div>
            </div>

            {/* Right Column: Stacked browser mockup cards */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end py-6">
              <div className="relative w-full max-w-[400px] h-[240px] flex items-center justify-center">
                
                {/* Back card */}
                <div className="absolute w-[85%] h-[85%] bg-[#0B0F17] rounded-2xl shadow-lg border border-slate-800 -translate-y-6 translate-x-6 opacity-60">
                  <div className="h-6 border-b border-slate-900 px-3 flex items-center gap-1 bg-[#0F1424] rounded-t-2xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  </div>
                </div>

                {/* Middle card */}
                <div className="absolute w-[90%] h-[90%] bg-[#0B0F17] rounded-2xl shadow-lg border border-slate-800 -translate-y-3 translate-x-3 opacity-80">
                  <div className="h-6 border-b border-slate-900 px-3 flex items-center gap-1 bg-[#0F1424] rounded-t-2xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  </div>
                </div>

                {/* Foreground front card */}
                <div className="absolute w-full h-[95%] bg-[#0B0F17] rounded-2xl shadow-xl border border-slate-800 text-white">
                  {/* Mock Window Header */}
                  <div className="h-7 border-b border-slate-900 px-3 flex items-center justify-between bg-[#0F1424] rounded-t-2xl">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                      <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                      <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                    </div>
                    <span className="text-[9px] font-bold text-[#00E676] uppercase tracking-wider">whispernet.conf</span>
                  </div>

                  {/* Mock Message list */}
                  <div className="p-4.5 space-y-3 text-[10px]">
                    <div className="flex gap-2">
                      <div className="w-5.5 h-5.5 rounded bg-[#00C853] text-[#0B0F17] flex items-center justify-center font-bold text-[8px]">K</div>
                      <div className="bg-[#0F1424] border border-slate-800 rounded-r-xl rounded-bl-xl p-2 max-w-[80%] leading-relaxed text-slate-200">
                        Hey! The components are responsive and highly customizable.
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="bg-[#00A859] text-white rounded-l-xl rounded-br-xl p-2 max-w-[80%] leading-relaxed">
                        Indeed! Makes real-time state management feel lightweight.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ─── */}
      <section className="py-28 px-6 border-t border-slate-900 text-center relative overflow-hidden">
        {/* Glow behind final CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00C853]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-white">
            Ready to enter the network?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Create an account in seconds, connect securely, and experience chat communication the way it was designed to be.
          </p>

          <Link to={isAuthenticated ? "/chat" : "/user-login"} className="inline-block">
            <button className="group relative flex items-center gap-2.5 bg-white text-[#0B0F17] font-bold px-10 py-5 rounded-2xl transition-all duration-300 hover:bg-[#00E676] hover:-translate-y-1 active:translate-y-0 shadow-xl cursor-pointer">
              Launch WhisperNet App
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 px-6 border-t border-slate-900 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00C853] flex items-center justify-center">
              <AiFillLayout className="text-[#0B0F17] w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-white text-base">WhisperNet</span>
          </div>

          {/* Center Copyright */}
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} WhisperNet Inc. All rights reserved. Encrypted end-to-end communication.
          </p>

          {/* Right Social Links */}
          <div className="flex items-center gap-6 text-slate-400">
            <a href="https://github.com/KamalJoshi-ai/WhisperNet" className="hover:text-[#00E676] transition-colors" aria-label="GitHub">
              <FiGithub className="w-5 h-5" />
            </a>
            
          </div>
        </div>
      </footer>

    </div>
  );
}
