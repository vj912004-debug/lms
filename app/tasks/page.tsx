
"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Filter,
  User,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import Modal from "@/components/Modal";
import { withAuth } from "@/components/withAuth";

function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      if (res.ok) {
        fetchTasks();
        toast.success("Task updated");
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const tasksForSelectedDate = tasks.filter(task => 
    task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
  );

  return (
    <>
    <>
      <div style={{ 
        padding: 'clamp(16px, 4vw, 32px)', 
        minHeight: 'calc(100vh - 70px)', 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '24px' 
      }}>
        {/* Calendar Sidebar */}
        <div style={{ 
          width: '100%', 
          maxWidth: '400px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px' 
        }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{format(currentMonth, "MMMM yyyy")}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="icon-btn-sm"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="icon-btn-sm"><ChevronRight size={16} /></button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '12px' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <span key={d} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{d}</span>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {days.map(day => {
                const hasTasks = tasks.some(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button 
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      height: '36px',
                      border: 'none',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--primary)' : isToday ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      color: isSelected ? 'white' : isToday ? 'var(--primary)' : 'white',
                      fontSize: '13px',
                      fontWeight: isSelected || isToday ? 700 : 400,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s'
                    }}
                  >
                    {format(day, "d")}
                    {hasTasks && !isSelected && (
                      <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: 'var(--primary)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', minHeight: '300px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Upcoming</h3>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Next 7 days</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                <div key={task.id} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => toggleTask(task.id, false)} style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                      <Circle size={16} />
                    </button>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        {task.dueDate ? format(new Date(task.dueDate), "MMM d, h:mm a") : "No due date"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task List Main */}
        <div style={{ flex: 1, minWidth: 'min(100%, 500px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800 }}>Tasks for {format(selectedDate, "MMM d, yyyy")}</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Manage your follow-ups and meetings</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Plus size={16} /> Add Task
            </button>
          </div>

          <div className="glass-card" style={{ flex: 1, padding: 'clamp(20px, 5vw, 32px)', overflowY: 'auto', minHeight: '400px' }}>
            {tasksForSelectedDate.length === 0 ? (
              <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <CalendarIcon size={40} style={{ marginBottom: '16px', opacity: 0.2 }} />
                <p style={{ fontSize: '14px' }}>No tasks scheduled for this day</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasksForSelectedDate.map(task => (
                  <div 
                    key={task.id} 
                    style={{ 
                      padding: '16px', 
                      borderRadius: '14px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      opacity: task.completed ? 0.6 : 1,
                      flexWrap: 'wrap'
                    }}
                  >
                    <button 
                      onClick={() => toggleTask(task.id, task.completed)} 
                      style={{ background: 'none', border: 'none', padding: 0, color: task.completed ? '#10b981' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                    >
                      {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</h4>
                        <span style={{ 
                          fontSize: '9px', 
                          padding: '2px 6px', 
                          borderRadius: '8px', 
                          background: task.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                          color: task.priority === 'HIGH' ? '#ef4444' : 'rgba(255,255,255,0.5)',
                          fontWeight: 700
                        }}>
                          {task.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{task.description || "No description"}</p>
                      {task.lead && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                          Lead: {task.lead.name}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <Clock size={12} /> {task.dueDate ? format(new Date(task.dueDate), "h:mm a") : "All day"}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                        {task.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal 
        key="add-task-modal"
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Task"
      >

        <form onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          const data = {
            title: target.title.value,
            description: target.description.value,
            dueDate: target.dueDate.value,
            priority: target.priority.value,
            type: target.type.value,
          };
          
          try {
            const res = await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              setIsModalOpen(false);
              fetchTasks();
              toast.success("Task created");
            }
          } catch (error) {
            toast.error("Failed to create task");
          }
        }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Title</label>
            <input name="title" type="text" required className="input" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Description</label>
            <textarea name="description" className="input" style={{ minHeight: '100px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Due Date</label>
              <input name="dueDate" type="datetime-local" className="input" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Priority</label>
              <select name="priority" className="input">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Type</label>
            <select name="type" className="input">
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="MEETING">Meeting</option>
              <option value="CALL">Call</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>Create Task</button>
        </form>
      </Modal>
    </>
  );
}


export default withAuth(TasksPage, ["ADMIN", "MANAGER", "SALES"]);
