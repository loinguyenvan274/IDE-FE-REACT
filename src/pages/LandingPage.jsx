import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Zap, 
  Code2, 
  Lock, 
  Terminal, 
  Cpu, 
  MessageSquare,
  UserCircle,
  ChevronRight,
  Github,
  Twitter,
  Disc as Discord
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-[#c9d1d9] font-sans selection:bg-blue-900/40 overflow-x-hidden">
      {/* Header Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Shield size={18} className="text-[#0a0c10]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">VulnSight IDE</span>
        </div>
        
        <div className="flex items-center space-x-8">
          <a href="#" className="text-sm font-medium border-b-2 border-white pb-0.5 text-white">Overview</a>
          <div className="flex items-center space-x-4 text-[#8b949e]">
            <Discord size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Github size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Twitter size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-32 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-white"
        >
          IDE TRỰC TUYẾN <br />
          <span className="bg-gradient-to-r from-[#4fd1c5] via-[#63b3ed] to-[#4299e1] bg-clip-text text-transparent">
            PHÁT HIỆN MÃ CÓ LỖ HỔNG
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl text-[#8b949e] mb-12 leading-relaxed max-w-2xl"
        >
          Xây dựng một nền tảng phát triển code trực tuyến lấy AI làm lõi chính 
          để phát hiện và cảnh báo lỗ hổng ngay lập tức.
        </motion.p>

        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => navigate('/login')}
          className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/10"
        >
          Bắt đầu với VulnSight IDE
        </motion.button>
      </section>

      {/* Detailed Features Section (Matching your image layout) */}
      <section className="py-24 px-6 bg-[#0a0c10] overflow-hidden border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-32">
          <h2 className="text-4xl font-normal text-center mb-16 text-white">Hướng dẫn trải nghiệm VulnSight</h2>

          {/* Feature 1: Real-time Scanning */}
          <div className="flex flex-col lg:flex-row items-start gap-16">
            <div className="lg:w-[35%] space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                  <Zap size={24} className="text-yellow-400" />
                </div>
                <h3 className="text-2xl font-medium text-white">Real-time Scanning</h3>
              </div>
              <p className="text-lg text-[#8b949e] leading-relaxed">
                Cảnh báo lỗ hổng ngay lập tức khi lập trình viên đang viết code với thời gian phản hồi dưới 500ms.
              </p>
            </div>
            <div className="lg:w-[65%] w-full h-[400px] bg-black rounded-[40px] shadow-2xl relative flex items-center justify-center border-4 border-white/5">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-mono text-sm tracking-[0.5em] uppercase text-center px-8">
                &lt;div class="scanner"&gt;<br />Real-time Analysis<br />&lt;/div&gt;
              </div>
              <div className="absolute top-12 right-12 px-6 py-3 bg-[#0d1612] border border-[#22c55e]/30 rounded-full text-[#22c55e] text-sm font-mono animate-pulse">
                &lt; 500ms
              </div>
            </div>
          </div>

          {/* Feature 2: AI Core (CodeBERT) */}
          <div className="flex flex-col lg:flex-row items-start gap-16">
            <div className="lg:w-[35%] space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                  <Cpu size={24} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-medium text-white">AI Core (CodeBERT)</h3>
              </div>
              <p className="text-lg text-[#8b949e] leading-relaxed">
                Sử dụng mô hình CodeBERT/GraphCodeBERT để phát hiện các lỗi OWASP Top 10 và CWE với F1-score &gt; 0.85.
              </p>
            </div>
            <div className="lg:w-[65%] w-full h-[400px] bg-black rounded-[40px] shadow-2xl relative flex items-center justify-center border-4 border-white/5">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-mono text-sm tracking-[0.5em] uppercase text-center px-8">
                Neural Network Visualization<br />Embedding Space
              </div>
               <div className="absolute -left-6 top-10 w-32 h-32 bg-[#bfdbfe]/10 border border-[#bfdbfe]/30 rounded-full rotate-12 flex items-center justify-center text-center p-4 backdrop-blur-sm">
                 <span className="text-[10px] font-bold text-[#bfdbfe] uppercase leading-tight tracking-tighter">AI INSIGHTS!</span>
               </div>
            </div>
          </div>

          {/* Feature 3: An toàn & Cách ly */}
          <div className="flex flex-col lg:flex-row items-start gap-16">
            <div className="lg:w-[35%] space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                  <Lock size={24} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-medium text-white">An toàn & Cách ly</h3>
              </div>
              <p className="text-lg text-[#8b949e] leading-relaxed">
                Môi trường thực thi Docker Sandboxes (microVM-based), đảm bảo cách ly hoàn toàn giữa người dùng.
              </p>
            </div>
            <div className="lg:w-[65%] w-full h-[400px] bg-black rounded-[40px] shadow-2xl relative flex items-center justify-center border-4 border-white/5">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-mono text-sm tracking-[0.5em] uppercase text-center px-8">
                Virtual Isolation Layer<br />Micro-Container Security
              </div>
              <div className="absolute bottom-12 left-12 px-6 py-3 bg-[#1e1e1e] border border-blue-500/30 rounded-lg text-blue-400 text-sm font-mono">
                isolated_env_v1
              </div>
            </div>
          </div>

          {/* Feature 4: Hỗ trợ đa ngôn ngữ */}
          <div className="flex flex-col lg:flex-row items-start gap-16">
            <div className="lg:w-[35%] space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                  <Terminal size={24} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-medium text-white">Hỗ trợ đa ngôn ngữ</h3>
              </div>
              <p className="text-lg text-[#8b949e] leading-relaxed">
                Tập trung tối ưu cho Python, JavaScript/Node.js và Java.
              </p>
            </div>
            <div className="lg:w-[65%] w-full h-[400px] bg-black rounded-[40px] shadow-2xl relative flex items-center justify-center border-4 border-white/5">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-mono text-sm tracking-[0.5em] uppercase text-center px-8">
                Polyglot Analysis Engine
              </div>
              <div className="flex gap-4">
                <div className="px-5 py-2.5 bg-white/5 rounded-full text-[#c9d1d9] text-xs font-mono border border-white/10">Python</div>
                <div className="px-5 py-2.5 bg-white/5 rounded-full text-[#c9d1d9] text-xs font-mono border border-white/10">Node.js</div>
                <div className="px-5 py-2.5 bg-white/5 rounded-full text-[#c9d1d9] text-xs font-mono border border-white/10">Java</div>
              </div>
              <div className="absolute top-8 right-8 w-24 h-24 bg-[#fef08a]/10 border border-[#fef08a]/30 rounded-full -rotate-12 flex items-center justify-center text-center p-3 opacity-80 backdrop-blur-sm">
                 <span className="text-[10px] font-bold text-[#fef08a] uppercase leading-tight tracking-tighter">Multi-Language Support</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0a0c10]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2 opacity-50">
            <Shield size={20} className="text-white" />
            <span className="font-bold text-white">VulnSight IDE</span>
          </div>
          <div className="text-sm text-[#8b949e]">
            © 2026 VulnSight. Developed for smarter, safer code.
          </div>
          <div className="flex items-center space-x-6 text-[#8b949e]">
            <Github size={18} className="hover:text-white transition-colors cursor-pointer" />
            <Twitter size={18} className="hover:text-white transition-colors cursor-pointer" />
            <Discord size={18} className="hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
