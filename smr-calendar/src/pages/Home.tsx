"use client";
import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import { useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { type DateSelectArg } from "@fullcalendar/core";
import { useAvailability } from "@/hooks/use-availability";
import { BookingModal } from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Home() {
  const selectingRef = useRef(false);
  const { data, isLoading } = useAvailability();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    selectingRef.current = false;

    setSelectedRange({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });

    setModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const handleDateClick = (clickInfo: DateClickArg) => {
    // if user is drag-selecting, ignore click
    if (selectingRef.current) return;

    const nextDay = new Date(clickInfo.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const endStr = nextDay.toISOString().split("T")[0];

    setSelectedRange({
      start: clickInfo.dateStr,
      end: endStr,
    });

    setModalOpen(true);
  };
  console.log("calendar events:", data?.events);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* --- Header --- */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="SMR Prime Rentals"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white leading-none">
                SMR Prime Rentals
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                The Purr-fect Shots!
              </p>
            </div>
          </div>

          <Button
            className="hidden sm:flex bg-[var(--slate)] hover:opacity-90 text-[var(--cream)] border border-white/5 gap-2"
            onClick={() =>
              window.open(
                "https://m.me/smrprimerentals.",
                "SMR PRIME RENTALS",
              )
            }
          >
            <MessageCircle className="w-4 h-4" />
            Chat Support
          </Button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Context/Intro */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-4 space-y-8"
          >
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all duration-500"></div>

              <h2 className="text-3xl font-display font-bold mb-4">
                Check Availability &{" "}
                <span className="text-primary">Book Now</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Select your preferred dates on the calendar to start your
                booking request. We offer the best deals for your adventures!.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <div>
                    <span className="block font-semibold text-sm">
                      Reserved
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Dates are not available
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-3 h-3 rounded-full bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.5)]"></div>
                  <div>
                    <span className="block font-semibold text-sm">On Hold</span>
                    <span className="text-xs text-muted-foreground">
                      Pending confirmation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-3 h-3 rounded-full bg-transparent border-2 border-primary border-dashed"></div>
                  <div>
                    <span className="block font-semibold text-sm">
                      Available
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click or drag dates to request
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/20 to-transparent p-6 rounded-2xl border border-primary/20">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-primary-foreground/80">
                  Requests are subject to approval. You will receive a
                  confirmation via SMS or Messenger once your booking is
                  approved.
                </p>
              </div>
            </div>

            {/* Mobile Chat Button */}
            <Button
              className="w-full sm:hidden bg-secondary hover:bg-secondary/80 h-12 text-lg"
              onClick={() => window.open("https://m.me/yourpage", "_blank")}
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Chat Support
            </Button>
          </motion.div>

          {/* Right Column: Calendar */}

          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="glass-panel p-6 rounded-2xl min-h-[600px] h-full flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p>Loading availability...</p>
                </div>
              ) : (
                <div className="calendar-wrapper flex-1">
                  <style>{`
                    .fc-event-title { font-weight: 600; font-size: 0.85em; }
                    .fc-toolbar-chunk { display: flex; align-items: center; gap: 0.5rem; }
                    @media (max-width: 640px) {
                      .fc-toolbar { flex-direction: column; gap: 1rem; }
                      .fc-toolbar-title { font-size: 1.25rem !important; }
                    }
                  `}</style>
                  <FullCalendar
                    initialDate="2026-02-01"
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    selectable={true}
                    selectMirror={true}
                    longPressDelay={250}
                    selectLongPressDelay={250}
                    unselectAuto={true}
                    unselectCancel=".dialog, .DialogContent"
                    dayMaxEvents={true}
                    events={data?.events || []}
                    select={handleDateSelect}
                    dateClick={handleDateClick}
                    eventContent={(arg) => {
                      const status = arg.event.extendedProps.status;
                      const isApproved = status === "Approved";

                      return (
                        <div
                          className={`
        flex items-center gap-2
        rounded-xl px-3 py-1.5
        text-[11px] font-semibold uppercase tracking-wide
        transition-all duration-300
        backdrop-blur-md
        ${
          isApproved
            ? "bg-red-500/20 text-red-100 border border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
            : "bg-white/5 text-white/70 border border-white/10"
        }
      `}
                        >
                          {/* Status Dot */}
                          <span
                            className={`
          h-2 w-2 rounded-full
          ${isApproved ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-gray-400"}
        `}
                          />

                          {/* Text */}
                          <span className="truncate">
                            {isApproved ? "Reserved" : "Pending"}
                          </span>
                        </div>
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 py-8 mt-auto bg-background/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2026 SMR Prime Rentals. All rights reserved.</p>
        </div>
      </footer>

      {/* --- Booking Modal --- */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        startStr={selectedRange.start}
        endStr={selectedRange.end}
      />
    </div>
  );
}
