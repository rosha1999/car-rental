"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CalEvent = { id:string; type:"rental"|"reservation"; carName:string; plate:string; customerName:string; startDate:string; endDate:string; status:string; rentalNumber?:string; reservationNumber?:string; };

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(()=>{
    Promise.all([
      fetch("/api/rentals?limit=200").then(r=>r.json()),
      fetch("/api/reservations?limit=200").then(r=>r.json()),
    ]).then(([rd, rv]) => {
      const rentals: CalEvent[] = (rd.rentals??[]).map((r:Record<string,unknown>) => ({
        id: r.id as string, type: "rental" as const,
        carName: (r.car as {name:string})?.name ?? "-",
        plate: (r.car as {plate:string})?.plate ?? "-",
        customerName: (r.customer as {fullName:string})?.fullName ?? "-",
        startDate: r.startDate as string, endDate: r.endDate as string,
        status: r.status as string, rentalNumber: r.rentalNumber as string,
      }));
      const reservations: CalEvent[] = (rv.reservations??[]).map((r:Record<string,unknown>) => ({
        id: r.id as string, type: "reservation" as const,
        carName: (r.car as {name:string})?.name ?? "-",
        plate: (r.car as {plate:string})?.plate ?? "-",
        customerName: (r.customer as {fullName:string})?.fullName ?? "-",
        startDate: r.startDate as string, endDate: r.endDate as string,
        status: r.status as string, reservationNumber: r.reservationNumber as string,
      }));
      setEvents([...rentals, ...reservations]);
    }).finally(()=>setLoading(false));
  },[]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month+1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const monthName = firstDay.toLocaleString("en-US",{month:"long",year:"numeric"});

  const eventsForDay = (day: number) => {
    const d = new Date(year, month, day);
    return events.filter(e => {
      const s = new Date(e.startDate);
      const en = new Date(e.endDate);
      return d >= new Date(s.getFullYear(),s.getMonth(),s.getDate()) &&
             d <= new Date(en.getFullYear(),en.getMonth(),en.getDate());
    });
  };

  const prev = () => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next = () => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="btn-secondary btn-sm p-2"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-semibold text-gray-800 w-40 text-center">{monthName}</span>
          <button onClick={next} className="btn-secondary btn-sm p-2"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={()=>{setMonth(today.getMonth());setYear(today.getFullYear());}} className="btn-secondary btn-sm">Today</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>Rental</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block"></span>Reservation</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span>Overdue</div>
      </div>

      {loading ? <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div> : (
        <div className="card p-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: startDow}).map((_,i)=><div key={`e${i}`} />)}
            {Array.from({length: daysInMonth}).map((_,i)=>{
              const day = i+1;
              const dayEvents = eventsForDay(day);
              const isToday = year===today.getFullYear()&&month===today.getMonth()&&day===today.getDate();
              return (
                <div key={day} className={cn("min-h-20 p-1 rounded-lg border border-gray-100",isToday&&"border-blue-400 bg-blue-50")}>
                  <div className={cn("text-xs font-semibold mb-1",isToday?"text-blue-600":"text-gray-600")}>{day}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0,3).map(e=>{
                      const href = e.type==="rental"?`/rentals/${e.id}`:`/reservations`;
                      const color = e.status==="OVERDUE"?"bg-red-500 text-white":e.type==="rental"?"bg-blue-500 text-white":"bg-yellow-500 text-white";
                      return (
                        <Link key={e.id} href={href}
                          className={cn("block truncate text-[10px] leading-tight px-1 py-0.5 rounded font-medium hover:opacity-80",color)}
                          title={`${e.carName} - ${e.customerName}`}>
                          {e.carName.split(" ").slice(0,2).join(" ")}
                        </Link>
                      );
                    })}
                    {dayEvents.length>3&&<div className="text-[10px] text-gray-400">+{dayEvents.length-3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events List */}
      <div className="card">
        <h2 className="font-semibold mb-4">This Month Events</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.filter(e=>{
            const s=new Date(e.startDate); const en=new Date(e.endDate);
            return (s.getFullYear()===year&&s.getMonth()===month)||(en.getFullYear()===year&&en.getMonth()===month);
          }).map(e=>(
            <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
              <div>
                <span className={cn("badge text-xs mr-2",e.type==="rental"?"bg-blue-100 text-blue-700":"bg-yellow-100 text-yellow-700")}>{e.type}</span>
                <span className="font-medium">{e.carName}</span>
                <span className="text-gray-500 ml-2">{e.customerName}</span>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(e.startDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}
                {" → "}
                {new Date(e.endDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}