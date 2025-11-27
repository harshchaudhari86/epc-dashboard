"use client";

import React from 'react';
import { Building2, LayoutDashboard, FileText, Users, PieChart } from 'lucide-react';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  activeView: string;
  setView: (v: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView }) => (
  <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 shadow-lg">
    <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
      <div className="w-10 h-10  rounded-lg flex items-center justify-center text-white">
        <img src="/Sereno_Logo.png" alt="Sereno Logo" className="h-12" />
      </div>
      <span className="font-bold text-gray-900 text-xl tracking-tight">EPC Nexus</span>
    </div>

    <nav className="flex-1 p-4 space-y-1">
      <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" isActive={activeView === 'dashboard'} onClick={() => setView('dashboard')} />
      <SidebarItem icon={<FileText size={18} />} label="Active Tenders" isActive={activeView === 'tender'} onClick={() => setView('tender')} />
      <SidebarItem icon={<Users size={18} />} label="Vendors" isActive={false} onClick={() => {}} />
      <SidebarItem icon={<PieChart size={18} />} label="Analytics" isActive={false} onClick={() => {}} />
    </nav>

    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 text-xs font-bold border border-blue-100">
          JD
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Harsh Chaudhari</p>
          <p className="text-xs text-gray-500">Head of Estimation</p>
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;