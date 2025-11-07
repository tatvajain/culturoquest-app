import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// This is the content from our old homepage, now a reusable component
const LandingContent = () => {
    const FeatureCard = ({ icon, title, children }) => (
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
          <div className="text-teal-500 w-10 h-10 mx-auto mb-3">{icon}</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-600">{children}</p>
        </div>
      );

    return (
        <div className="text-center flex flex-col h-full justify-center p-8 lg:p-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="text-5xl font-extrabold tracking-tight">
                    Discover the <span className="gradient-text">Story of India.</span>
                </h1>
                <p className="text-lg mt-4 text-slate-600 max-w-xl mx-auto">
                    Learning isn't just about dates and facts. It's an adventure. Start your journey with CulturoQuest.
                </p>
            </motion.div>
    
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-3 gap-4 mt-12"
            >
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 119 0zM16.5 18.75a9 9 0 00-9 0m9 0a9 9 0 01-9 0m9 0c1.657 0 3-4.03 3-9s-1.343-9-3-9-3 4.03-3 9 1.343 9 3 9z" /></svg>}
                    title="Interactive Sagas"
                >
                    Journey through chapters of history.
                </FeatureCard>
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>}
                    title="Fun Mini-Games"
                >
                    Learn by playing, not just by reading.
                </FeatureCard>
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                    title="Real Progress"
                >
                    Earn points and unlock achievements.
                </FeatureCard>
            </motion.div>
        </div>
    );
};

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(''); // To show error messages
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    const { email, password } = formData;
    if (!email || !password) {
        return setError('Please fill in all fields');
    }

    // --- UPDATED: Call the real API ---
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/'); // Success! Go to the dashboard.
    } else {
      setError(result.message); // Show the error from the server
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: The Landing Page Content */}
        <div className="hidden lg:block bg-slate-100">
            <LandingContent />
        </div>

        {/* Right Side: The Login Form */}
        <div className="flex items-center justify-center p-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold">Welcome <span className="gradient-text">Back!</span></h2>
                    <p className="mt-2 text-slate-600">Log in to continue your journey.</p>
                </div>
                <form onSubmit={onSubmit} className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 space-y-6">
                    {/* --- NEW: Error Message Display --- */}
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            className="w-full p-3 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-0 transition duration-300 focus:shadow-md"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            className="w-full p-3 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-0 transition duration-300 focus:shadow-md"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl shadow-orange-500/20"
                    >
                        Log In
                    </button>
                </form>
                <p className="text-center mt-6 text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-teal-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    </div>
  );
}