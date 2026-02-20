import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  User, Trash2
} from "lucide-react";

const API = "http://localhost:3001";

/* ── types ─────────────────────────────────────────────── */
interface CalEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  color: string;
  userId?: string;
  userName?: string;
  location?: string;
  type: string;
  createdAt: string;
}

type View = "month" | "week" | "day";

/* ── helpers ────────────────────────────────────────────── */
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
];

const EVENT_TYPES = [
  { value: "event",    label: "Événement",   color: "#5B3EFF" },
  { value: "meeting",  label: "Réunion",     color: "#0EA5E9" },
  { value: "task",     label: "Tâche",       color: "#F59E0B" },
  { value: "reminder", label: "Rappel",      color: "#10B981" },
  { value: "absence",  label: "Absence",     color: "#EF4444" },
];

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function fmtDate(date: Date, opts: Intl.DateTimeFormatOptions) {
  return date.toLocaleString("fr-FR", opts);
}

function colorBg(hex: string, alpha = 0.12) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function makeDefaultForm(prefill?: { startAt?: string; endAt?: string }) {
  const now = new Date();
  now.setMinutes(0,0,0);
  const end = new Date(now); end.setHours(end.getHours()+1);
  const pad = (n:number)=>String(n).padStart(2,"0");
  const fmt2 = (dt:Date) => `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  return {
    title:"", description:"", location:"", userName:"", type:"event", color:"#5B3EFF", allDay:false,
    startAt: prefill?.startAt ?? fmt2(now),
    endAt:   prefill?.endAt   ?? fmt2(end),
  };
}

/* ── EVENT MODAL ─────────────────────────────────────────── */
interface ModalProps {
  event?: CalEvent | null;
  prefill?: { startAt?: string; endAt?: string };
  onClose: () => void;
  onSave: (data: Omit<CalEvent,"id"|"createdAt">) => void;
  onDelete?: () => void;
}

function EventModal({ event, prefill, onClose, onSave, onDelete }: ModalProps) {
  const [form, setForm] = useState(() =>
    event ? {
      title: event.title, description: event.description ?? "",
      startAt: toLocalInput(event.startAt), endAt: toLocalInput(event.endAt),
      allDay: event.allDay, color: event.color,
      userName: event.userName ?? "", location: event.location ?? "", type: event.type,
    } : makeDefaultForm(prefill)
  );

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      startAt: new Date(form.startAt).toISOString(),
      endAt:   new Date(form.endAt).toISOString(),
    } as Omit<CalEvent,"id"|"createdAt">);
  };

  const selectedType = EVENT_TYPES.find(t => t.value === form.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            {event ? "Modifier l'événement" : "Nouvel événement"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9]">
            <X size={18} className="text-[#64748B]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Titre *</label>
            <input required value={form.title} onChange={e=>set("title",e.target.value)}
              placeholder="Nom de l'événement"
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B3EFF]/30 focus:border-[#5B3EFF]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Type</label>
              <select value={form.type} onChange={e=>{
                const t=EVENT_TYPES.find(x=>x.value===e.target.value);
                set("type",e.target.value);
                if(t) set("color",t.color);
              }} className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B3EFF]/30 focus:border-[#5B3EFF]">
                {EVENT_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Couleur</label>
              <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-xl px-3 py-2 h-[42px]">
                <input type="color" value={form.color} onChange={e=>set("color",e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" />
                <span className="text-sm text-[#64748B]">{form.color}</span>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={()=>set("allDay",!form.allDay)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.allDay?"bg-[#5B3EFF]":"bg-[#E2E8F0]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.allDay?"translate-x-5":"translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-[#0F172A]">Journée entière</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Début</label>
              <input type={form.allDay?"date":"datetime-local"}
                value={form.allDay?form.startAt.slice(0,10):form.startAt}
                onChange={e=>set("startAt", form.allDay?e.target.value+"T00:00":e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B3EFF]/30 focus:border-[#5B3EFF]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Fin</label>
              <input type={form.allDay?"date":"datetime-local"}
                value={form.allDay?form.endAt.slice(0,10):form.endAt}
                onChange={e=>set("endAt", form.allDay?e.target.value+"T23:59":e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B3EFF]/30 focus:border-[#5B3EFF]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Participant</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input value={form.userName} onChange={e=>set("userName",e.target.value)} placeholder="Nom"
                  className="w-full border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B3EFF]/30 focus:border-[#5B3EFF]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Lieu</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Lieu"
                  className="w-full border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B3EFF]/30 focus:border-[#5B3EFF]" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1 block">Description</label>
            <textarea rows={3} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Détails optionnels..."
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] resize-none focus:outline-none focus:ring-2 focus:ring-[#5B3EFF]/30 focus:border-[#5B3EFF]" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            {onDelete && (
              <button type="button" onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 border border-red-200 transition-colors">
                <Trash2 size={14} /> Supprimer
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                Annuler
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: selectedType?.color ?? "#5B3EFF" }}>
                {event ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── MONTH VIEW ──────────────────────────────────────────── */
function MonthView({ date, events, onDayClick, onEventClick }: {
  date: Date; events: CalEvent[];
  onDayClick: (d: Date) => void;
  onEventClick: (e: CalEvent) => void;
}) {
  const year = date.getFullYear(), month = date.getMonth();
  const today = new Date();
  const startCell = startOfWeek(new Date(year, month, 1));
  const cells: Date[] = [];
  const cur = new Date(startCell);
  while (cells.length < 42) { cells.push(new Date(cur)); cur.setDate(cur.getDate()+1); }

  const eventsOnDay = (d: Date) => events.filter(ev => {
    const s = new Date(ev.startAt), e = new Date(ev.endAt);
    const ds = new Date(d); ds.setHours(0,0,0,0);
    const de = new Date(d); de.setHours(23,59,59,999);
    return s <= de && e >= ds;
  });

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-b border-[#E2E8F0]">
        {DAYS_FR.map(d=><div key={d} className="py-2 text-center text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows:"repeat(6,1fr)" }}>
        {cells.map((cell, i) => {
          const isCurMonth = cell.getMonth()===month;
          const isToday = sameDay(cell, today);
          const dayEvs = eventsOnDay(cell);
          return (
            <div key={i} onClick={()=>onDayClick(cell)}
              className={`border-r border-b border-[#E2E8F0] p-1 cursor-pointer hover:bg-[#F8FAFC] transition-colors min-h-[90px] ${!isCurMonth?"bg-[#FAFAFA]":""}`}>
              <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ml-0.5
                ${isToday?"bg-[#5B3EFF] text-white":isCurMonth?"text-[#0F172A]":"text-[#CBD5E1]"}`}>
                {cell.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvs.slice(0,3).map(ev=>(
                  <div key={ev.id} onClick={e=>{e.stopPropagation();onEventClick(ev);}}
                    className="text-xs px-1.5 py-0.5 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor:colorBg(ev.color), color:ev.color, borderLeft:`2px solid ${ev.color}` }}>
                    {!ev.allDay&&<span className="opacity-70 mr-1">{fmtDate(new Date(ev.startAt),{hour:"2-digit",minute:"2-digit"})}</span>}
                    {ev.title}
                  </div>
                ))}
                {dayEvs.length>3&&<div className="text-xs text-[#94A3B8] pl-1">+{dayEvs.length-3} autres</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── WEEK VIEW ───────────────────────────────────────────── */
function WeekView({ date, events, onSlotClick, onEventClick }: {
  date: Date; events: CalEvent[];
  onSlotClick: (d: Date) => void;
  onEventClick: (e: CalEvent) => void;
}) {
  const today = new Date();
  const weekStart = startOfWeek(date);
  const days: Date[] = Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);return d;});
  const hours = Array.from({length:24},(_,i)=>i);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="grid border-b border-[#E2E8F0]" style={{gridTemplateColumns:"52px repeat(7,1fr)"}}>
        <div className="py-2"/>
        {days.map((d,i)=>{
          const isToday=sameDay(d,today);
          const allDay=events.filter(ev=>ev.allDay&&sameDay(new Date(ev.startAt),d));
          return (
            <div key={i} className="py-2 text-center border-l border-[#E2E8F0]">
              <div className="text-xs text-[#94A3B8] font-medium uppercase">{DAYS_FR[i]}</div>
              <div className={`text-sm font-semibold mt-0.5 w-8 h-8 mx-auto flex items-center justify-center rounded-full
                ${isToday?"bg-[#5B3EFF] text-white":"text-[#0F172A]"}`}>{d.getDate()}</div>
              <div className="px-1 space-y-0.5 mt-0.5">
                {allDay.map(ev=>(
                  <div key={ev.id} onClick={e=>{e.stopPropagation();onEventClick(ev);}}
                    className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer"
                    style={{backgroundColor:colorBg(ev.color),color:ev.color}}>{ev.title}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid" style={{gridTemplateColumns:"52px repeat(7,1fr)"}}>
          {hours.map(h=>(
            <>
              <div key={`h${h}`} className="border-b border-[#E2E8F0] py-2 text-right pr-2">
                <span className="text-[10px] text-[#94A3B8]">{String(h).padStart(2,"0")}:00</span>
              </div>
              {days.map((d,di)=>{
                const slotEvs=events.filter(ev=>{if(ev.allDay)return false;const s=new Date(ev.startAt);return sameDay(s,d)&&s.getHours()===h;});
                return (
                  <div key={`${h}-${di}`}
                    onClick={()=>{const s=new Date(d);s.setHours(h,0,0,0);onSlotClick(s);}}
                    className="border-l border-b border-[#E2E8F0] min-h-[48px] hover:bg-[#F8FAFC] cursor-pointer transition-colors p-0.5">
                    {slotEvs.map(ev=>(
                      <div key={ev.id} onClick={e=>{e.stopPropagation();onEventClick(ev);}}
                        className="text-xs px-1.5 py-1 rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        style={{backgroundColor:colorBg(ev.color,0.15),color:ev.color,borderLeft:`3px solid ${ev.color}`}}>
                        <div className="font-medium truncate">{ev.title}</div>
                        {ev.location&&<div className="opacity-70 truncate">{ev.location}</div>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── DAY VIEW ────────────────────────────────────────────── */
function DayView({ date, events, onSlotClick, onEventClick }: {
  date: Date; events: CalEvent[];
  onSlotClick: (d: Date) => void;
  onEventClick: (e: CalEvent) => void;
}) {
  const today = new Date();
  const isToday = sameDay(date, today);
  const hours = Array.from({length:24},(_,i)=>i);
  const allDay = events.filter(ev=>ev.allDay&&sameDay(new Date(ev.startAt),date));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-[#E2E8F0] px-6 py-3">
        <div className={`inline-flex items-center gap-2 text-lg font-semibold ${isToday?"text-[#5B3EFF]":"text-[#0F172A]"}`}>
          {fmtDate(date,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          {isToday&&<span className="text-xs bg-[#5B3EFF] text-white px-2 py-0.5 rounded-full font-medium">Aujourd'hui</span>}
        </div>
        {allDay.length>0&&(
          <div className="flex flex-wrap gap-1 mt-2">
            {allDay.map(ev=>(
              <div key={ev.id} onClick={()=>onEventClick(ev)}
                className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
                style={{backgroundColor:colorBg(ev.color),color:ev.color}}>{ev.title}</div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {hours.map(h=>{
          const slotEvs=events.filter(ev=>{if(ev.allDay)return false;const s=new Date(ev.startAt);return sameDay(s,date)&&s.getHours()===h;});
          return (
            <div key={h} className="flex border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer min-h-[60px]"
              onClick={()=>{const s=new Date(date);s.setHours(h,0,0,0);onSlotClick(s);}}>
              <div className="w-16 shrink-0 text-right pr-3 py-2">
                <span className="text-xs text-[#94A3B8]">{String(h).padStart(2,"0")}:00</span>
              </div>
              <div className="flex-1 px-2 py-1 space-y-1" onClick={e=>e.stopPropagation()}>
                {slotEvs.map(ev=>(
                  <div key={ev.id} onClick={()=>onEventClick(ev)}
                    className="rounded-xl px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{backgroundColor:colorBg(ev.color,0.15),borderLeft:`4px solid ${ev.color}`}}>
                    <div className="text-sm font-semibold" style={{color:ev.color}}>{ev.title}</div>
                    {ev.description&&<div className="text-xs text-[#64748B] mt-0.5">{ev.description}</div>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Clock size={11}/>
                        {fmtDate(new Date(ev.startAt),{hour:"2-digit",minute:"2-digit"})} — {fmtDate(new Date(ev.endAt),{hour:"2-digit",minute:"2-digit"})}
                      </span>
                      {ev.location&&<span className="flex items-center gap-1"><MapPin size={11}/>{ev.location}</span>}
                      {ev.userName&&<span className="flex items-center gap-1"><User size={11}/>{ev.userName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN PAGE ───────────────────────────────────────────── */
export default function Planning() {
  const [view, setView] = useState<View>("month");
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    event?: CalEvent | null;
    prefill?: { startAt?: string; endAt?: string };
  }>({ open: false });

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/events`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const navigate = (dir: 1 | -1) => {
    const d = new Date(current);
    if (view==="month") d.setMonth(d.getMonth()+dir);
    else if (view==="week") d.setDate(d.getDate()+7*dir);
    else d.setDate(d.getDate()+dir);
    setCurrent(d);
  };

  const headerLabel = () => {
    if (view==="month") return `${MONTHS_FR[current.getMonth()]} ${current.getFullYear()}`;
    if (view==="week") {
      const ws=startOfWeek(current), we=new Date(ws); we.setDate(ws.getDate()+6);
      return `${ws.getDate()} ${MONTHS_FR[ws.getMonth()]} — ${we.getDate()} ${MONTHS_FR[we.getMonth()]} ${we.getFullYear()}`;
    }
    return fmtDate(current,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  };

  const openNewModal = (d: Date) => {
    const pad=(n:number)=>String(n).padStart(2,"0");
    const fmt2=(dt:Date)=>`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    const end=new Date(d); end.setHours(d.getHours()+1);
    setModal({ open:true, event:null, prefill:{ startAt:fmt2(d), endAt:fmt2(end) } });
  };

  const handleSave = async (data: Omit<CalEvent,"id"|"createdAt">) => {
    try {
      if (modal.event) {
        const res = await fetch(`${API}/api/events/${modal.event.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
        const updated = await res.json();
        setEvents(evs=>evs.map(e=>e.id===modal.event!.id?updated:e));
      } else {
        const res = await fetch(`${API}/api/events`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
        const created = await res.json();
        setEvents(evs=>[...evs,created]);
      }
      setModal({ open:false });
    } catch(e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!modal.event) return;
    await fetch(`${API}/api/events/${modal.event.id}`,{method:"DELETE"});
    setEvents(evs=>evs.filter(e=>e.id!==modal.event!.id));
    setModal({ open:false });
  };

  const now = new Date();
  const upcoming = events
    .filter(e=>new Date(e.startAt)>=now)
    .sort((a,b)=>new Date(a.startAt).getTime()-new Date(b.startAt).getTime())
    .slice(0,8);

  const viewBtns: {key:View;label:string}[] = [
    {key:"month",label:"Mois"},{key:"week",label:"Semaine"},{key:"day",label:"Jour"}
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col p-4 gap-4">
        <button onClick={()=>setModal({open:true,event:null})}
          className="flex items-center gap-2 justify-center w-full py-2.5 rounded-xl bg-[#5B3EFF] text-white text-sm font-medium hover:bg-[#4B2EEF] transition-colors">
          <Plus size={16}/> Nouvel événement
        </button>

        {/* mini calendar */}
        <div className="border border-[#E2E8F0] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={()=>{const d=new Date(current);d.setMonth(d.getMonth()-1);setCurrent(d);}} className="p-1 rounded hover:bg-[#F1F5F9]">
              <ChevronLeft size={14} className="text-[#64748B]"/>
            </button>
            <span className="text-xs font-semibold text-[#0F172A]">{MONTHS_FR[current.getMonth()].slice(0,3)} {current.getFullYear()}</span>
            <button onClick={()=>{const d=new Date(current);d.setMonth(d.getMonth()+1);setCurrent(d);}} className="p-1 rounded hover:bg-[#F1F5F9]">
              <ChevronRight size={14} className="text-[#64748B]"/>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} className="text-center text-[9px] text-[#94A3B8] font-medium">{d}</div>)}
            {(()=>{
              const y=current.getFullYear(),m=current.getMonth();
              const start=startOfWeek(new Date(y,m,1));
              const cells:Date[]=[];
              const c=new Date(start);
              while(cells.length<35){cells.push(new Date(c));c.setDate(c.getDate()+1);}
              return cells.map((cell,i)=>{
                const isT=sameDay(cell,new Date()),isCur=cell.getMonth()===m;
                return (
                  <button key={i} onClick={()=>{setCurrent(new Date(cell));setView("day");}}
                    className={`text-[10px] w-6 h-6 mx-auto flex items-center justify-center rounded-full transition-colors
                      ${isT?"bg-[#5B3EFF] text-white":isCur?"text-[#0F172A] hover:bg-[#F1F5F9]":"text-[#CBD5E1]"}`}>
                    {cell.getDate()}
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* upcoming events */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">À venir</div>
          {upcoming.length===0
            ? <p className="text-xs text-[#94A3B8]">Aucun événement</p>
            : upcoming.map(ev=>(
              <div key={ev.id} onClick={()=>setModal({open:true,event:ev})}
                className="mb-2 p-2 rounded-xl cursor-pointer hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:ev.color}}/>
                  <span className="text-xs font-medium text-[#0F172A] truncate">{ev.title}</span>
                </div>
                <div className="text-[10px] text-[#94A3B8] pl-3.5">
                  {fmtDate(new Date(ev.startAt),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                </div>
                {ev.userName&&<div className="text-[10px] text-[#94A3B8] pl-3.5 flex items-center gap-0.5"><User size={9}/>{ev.userName}</div>}
              </div>
            ))
          }
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* toolbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={()=>navigate(-1)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <ChevronLeft size={18} className="text-[#64748B]"/>
            </button>
            <button onClick={()=>navigate(1)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <ChevronRight size={18} className="text-[#64748B]"/>
            </button>
          </div>
          <button onClick={()=>setCurrent(new Date())}
            className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors">
            Aujourd'hui
          </button>
          <h2 className="text-base font-semibold text-[#0F172A] flex-1">{headerLabel()}</h2>
          <div className="flex bg-[#F1F5F9] rounded-lg p-0.5 gap-0.5">
            {viewBtns.map(v=>(
              <button key={v.key} onClick={()=>setView(v.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium
                  ${view===v.key?"bg-white text-[#5B3EFF] shadow-sm":"text-[#64748B] hover:text-[#0F172A]"}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#5B3EFF] border-t-transparent rounded-full"/>
          </div>
        ) : view==="month" ? (
          <MonthView date={current} events={events}
            onDayClick={d=>{setCurrent(d);openNewModal(d);}}
            onEventClick={ev=>setModal({open:true,event:ev})}/>
        ) : view==="week" ? (
          <WeekView date={current} events={events}
            onSlotClick={openNewModal}
            onEventClick={ev=>setModal({open:true,event:ev})}/>
        ) : (
          <DayView date={current} events={events}
            onSlotClick={openNewModal}
            onEventClick={ev=>setModal({open:true,event:ev})}/>
        )}
      </main>

      {modal.open && (
        <EventModal
          event={modal.event}
          prefill={modal.prefill}
          onClose={()=>setModal({open:false})}
          onSave={handleSave}
          onDelete={modal.event?handleDelete:undefined}
        />
      )}
    </div>
  );
}
