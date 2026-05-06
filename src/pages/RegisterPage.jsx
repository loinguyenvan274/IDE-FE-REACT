import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    containerID: 'default' // Default value for now
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0d0d0d] text-white font-sans overflow-hidden">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-24">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
              <Shield size={18} className="text-[#0d0d0d]" />
            </div>
          </div>
          <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center space-x-2 text-xs text-gray-400">
            <span>You are signing into</span>
            <span className="text-white font-medium flex items-center">
              <Shield size={12} className="mr-1" /> VulnSight
            </span>
            <ChevronRight size={12} className="rotate-90" />
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full text-center space-y-10">
          <h1 className="text-3xl font-medium tracking-tight">Create your account</h1>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-left">
                {error}
              </div>
            )}
            <div className="space-y-1 text-left">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full h-12 bg-transparent border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                required
              />
            </div>
            <div className="space-y-1 text-left">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full h-12 bg-transparent border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                required
              />
            </div>
            <div className="space-y-1 text-left">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 bg-transparent border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                required
              />
            </div>
            <div className="space-y-1 text-left">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-12 bg-transparent border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all text-sm mt-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign up'}
            </button>
          </form>

          <div className="text-sm text-gray-500">
            Already have an account? <button onClick={() => navigate('/login')} className="text-white hover:underline font-medium">Log in</button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto text-center py-4">
          <p className="text-[10px] text-gray-600">
            By continuing, you agree to VulnSight's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Right Side - Visual / Brand Area */}
      <div className="hidden lg:block lg:w-1/2 bg-[#050505] relative overflow-hidden border-l border-white/5">
        {/* Large Decorative Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-10">
          <Shield size={600} strokeWidth={0.5} />
        </div>
        
        {/* Gradient / Spotlight Effect */}
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/5 to-transparent skew-x-[-20deg] origin-top translate-x-12 blur-3xl opacity-30" />
        <div className="absolute right-0 bottom-0 h-1/2 w-full bg-gradient-to-t from-blue-500/10 to-transparent blur-3xl" />
      </div>
    </div>
  );
};

export default RegisterPage;
