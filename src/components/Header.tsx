"use client";

import { useAuth } from "@/context/AuthContext";
import { MdNotifications, MdSearch, MdMenu, MdPerson, MdLogout, MdClose, MdCheckCircle } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import Link from "next/link";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "System Update", text: "Welcome to the new dashboard!", time: "Just now", read: false },
    { id: 2, title: "Low Stock Alert", text: "Vanilla Essence is running low.", time: "2h ago", read: false },
    { id: 3, title: "New User", text: "Jane Doe was added to the system.", time: "1d ago", read: true },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-full md:hidden text-gray-600 transition-colors"
        >
          <MdMenu className="w-6 h-6" />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all duration-300 w-64 lg:w-96">
          <MdSearch className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none ml-2 text-sm text-gray-700 w-full placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <MdNotifications className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <div className="flex gap-2 text-xs">
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-indigo-600 hover:text-indigo-700 font-medium">
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-gray-500 hover:text-gray-700">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        <MdCheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>All caught up!</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                          <li key={notification.id} className={clsx("p-4 hover:bg-gray-50 transition-colors", !notification.read && "bg-indigo-50/30")}>
                            <div className="flex justify-between items-start mb-1">
                              <p className={clsx("text-sm font-medium", !notification.read ? "text-indigo-900" : "text-gray-900")}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{notification.text}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-gray-50 rounded-full transition-all duration-200 border border-transparent hover:border-gray-200"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{user?.role?.name || "Role"}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 md:hidden">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role?.name}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)}>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors">
                        <MdPerson className="w-4 h-4" />
                        My Profile
                      </button>
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <MdLogout className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
