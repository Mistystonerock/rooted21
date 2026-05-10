import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import LifeStoryEntryCard from "@/components/lifestory/LifeStoryEntryCard";
import LifeStoryForm from "@/components/lifestory/LifeStoryForm";
import { Plus } from "lucide-react";

const ENTRY_TYPES = {
  placement: { label: "Placement", emoji: "🏠", color: "#4A90D9" },
  school: { label: "School Change", emoji: "🏫", color: "#7B5EA7" },
  milestone: { label: "Milestone", emoji: "🌟", color: C.gold },
  medical: { label: "Medical", emoji: "🏥", color: "#E07A5F" },
  family: { label: "Family Moment", emoji: "❤️", color: C.midGreen },
  other: { label: "Other", emoji: "📌", color: C.mutedText },
};

export { ENTRY_TYPES };

export default function ChildLifeStory() {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const profiles = await base44.entities.ChildProfile.list("-created_date", 20);
      setChildren(profiles);
      if (profiles.length > 0) setSelectedChild(profiles[0].first_name);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedChild || !user) return;
    base44.entities.LifeStoryEntry.filter(
      { owner_email: user.email, child_name: selectedChild },
      "sort_order",
      200
    ).then(data => {
      const sorted = [...data].sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(a.date) - new Date(b.date);
      });
      setEntries(sorted);
    });
  }, [selectedChild, user]);

  async function handleSave(formData) {
    const maxOrder = entries.length > 0 ? Math.max(...entries.map(e => e.sort_order || 0)) : 0;
    if (editEntry) {
      const updated = await base44.entities.LifeStoryEntry.update(editEntry.id, formData);
      setEntries(prev => prev.map(e => e.id === editEntry.id ? updated : e));
    } else {
      const created = await base44.entities.LifeStoryEntry.create({
        ...formData,
        owner_email: user.email,
        child_name: selectedChild,
        sort_order: maxOrder + 1,
      });
      setEntries(prev => [...prev, created].sort((a, b) => new Date(a.date) - new Date(b.date)));
    }
    setShowForm(false);
    setEditEntry(null);
  }

  async function handleDelete(id) {
    await base44.entities.LifeStoryEntry.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function handleEdit(entry) {
    setEditEntry(entry);
    setShowForm(true);
  }

  async function onDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(entries);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setEntries(reordered);
    // Persist new order
    await Promise.all(
      reordered.map((e, i) => base44.entities.LifeStoryEntry.update(e.id, { sort_order: i }))
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Life Story" subtitle="A child's journey, told with love" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">

        {/* Intro */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>📖 Every Child Has a Story</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Building a life story helps children with disrupted histories understand where they've been — and feel proud of how far they've come.
          </p>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {children.map(c => (
              <button key={c.id} onClick={() => setSelectedChild(c.first_name)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: selectedChild === c.first_name ? C.darkGreen : C.white,
                  color: selectedChild === c.first_name ? "#fff" : C.darkGreen,
                  border: `1px solid ${selectedChild === c.first_name ? C.darkGreen : C.cream}`,
                  cursor: "pointer",
                }}>
                🧒 {c.first_name}
              </button>
            ))}
          </div>
        )}

        {children.length === 0 && (
          <div className="rounded-xl p-4 text-center" style={{ background: C.cream }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No child profiles yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Add a child profile first to start their life story.</p>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Add button */}
            {!showForm && (
              <button onClick={() => { setEditEntry(null); setShowForm(true); }}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                <Plus size={16} /> Add Life Event
              </button>
            )}

            {showForm && (
              <LifeStoryForm
                initial={editEntry}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditEntry(null); }}
              />
            )}

            {/* Timeline */}
            {entries.length === 0 && !showForm && (
              <p className="text-center text-sm py-8" style={{ color: C.mutedText }}>
                No events yet. Start adding {selectedChild}'s story ✨
              </p>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="timeline">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-0">
                    {entries.map((entry, index) => (
                      <Draggable key={entry.id} draggableId={entry.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.85 : 1,
                            }}
                          >
                            <LifeStoryEntryCard
                              entry={entry}
                              isLast={index === entries.length - 1}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}