"use client";

import { Sidebar } from "@/layout/dashboard/sidebar";
import { Navbar } from "@/layout/dashboard/navbar";
import * as React from "react";
import { useState, createContext, useContext } from "react";

interface SidebarContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
    return context;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen((prev) => !prev);

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
            <div className="flex min-h-screen bg-[#F9FAFB] relative overflow-x-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Mobile Overlay */}
                {isOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-screen lg:ml-64 transition-all duration-300">
                    {/* Navbar */}
                    <Navbar />

                    {/* Page Content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
}
