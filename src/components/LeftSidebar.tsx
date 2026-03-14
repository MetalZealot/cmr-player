import React, { useState } from 'react';
import { X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeftSidebar = ({ isOpen, onClose }: LeftSidebarProps) => {
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          flex flex-col bg-zinc-900/95 lg:bg-zinc-900/50 border-r border-zinc-800/80
          transition-all duration-300 ease-in-out overflow-hidden shrink-0
          ${isOpen ? 'w-80 sm:w-96 translate-x-0' : 'w-80 sm:w-96 -translate-x-full lg:w-0 lg:translate-x-0'}
        `}
      >
        {/* Inner fixed-width container to prevent content wrapping during transition */}
        <div className="w-80 sm:w-96 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 shrink-0">
            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wider">Station Menu</h2>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors lg:hidden"
              title="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Expandable Calendar Section */}
            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl overflow-hidden">
              <button 
                onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-zinc-100 font-medium">
                  <Calendar size={18} className="text-cyan-500" />
                  <span>Schedule</span>
                </div>
                {isCalendarExpanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
              </button>
              
              {/* Calendar Content */}
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isCalendarExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-zinc-800/50 bg-zinc-950">
                  <iframe 
                    src="https://calendar.google.com/calendar/embed?src=classroom105381064833401524116%40group.calendar.google.com&mode=AGENDA&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&bgcolor=%23ffffff" 
                    style={{ border: 0 }} 
                    width="100%" 
                    height="450" 
                    frameBorder="0" 
                    scrolling="no" 
                    title="Station Schedule"
                    className="rounded-b-xl invert hue-rotate-180 opacity-90 mix-blend-screen"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
