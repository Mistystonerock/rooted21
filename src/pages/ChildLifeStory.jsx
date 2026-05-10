import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import MobileHeader from "@/components/mobile/MobileHeader";
import LifeStoryEntryForm from "@/components/lifestory/LifeStoryEntryForm";
import LifeStoryCard from "@/components/lifestory/LifeStoryCard";
import { Plus, BookOpen, Users } from "lucide-react";

export default function ChildLifeStory() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.ChildProfile.list("-created_date", 20);
      const names = [...new Set(profiles.map(p => p.first_name).filter(Boolean))];
      setChildren(names);
      if (names.length > 0) {
        setSelectedChild(names[0]);
        loadEntries(u.email, names[0]);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function loadEntries(email, childName) {
    setLoading(true);
    const data = await base44.entities.LifeStoryEntry.filter(
      { parent_email: email, child_name: childName },
      "sort_order",
      200
    );
    // Sort by sort_order, then date
    const sorted = data.sort((a, b) => {
      if (a.sort_order != null && b.sort_order != null) return a.sort_order - b.sort_order;
      return new Date(a.date || "9999") - new Date(b.date || "9999");
    });
    setEntries(sorted);
    setLoading(false);
  }

  function handleChildChange(name) {
    setSelectedChild(name);
    loadEntries(user.email, name);
  }

  async function handleSave(entryData) {
    if (editingEntry) {
      const updated = await base44.entities.LifeStoryEntry.update(editingEntry.id, entryData);
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? updated : e));
    } else {
      const newEntry = await base44.entities.LifeStoryEntry.create({
        ...entryData,
        parent_email: user.email,
        child_name: selectedChild,
        sort_order: entries.length,
      });
      setEntries(prev => [...prev, newEntry]);
    }
    setShowForm(false);
    setEditingEntry(null);
  }

  async function handleDelete(id) {
    await base44.entities.LifeStoryEntry.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function handleEdit(entry) {
    setEditingEntry(entry);
    setShowForm(true);
  }

  async function handleDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(entries);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setEntries(reordered);
    // Persist new sort_order
    await Promise.all(
      reordered.map((e, i) => base44.entities.LifeStoryEntry.update(e.id, { sort_order: i }))
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Life Story"
        subtitle={selectedChild ? `${selectedChild}'s Journey` : "Build a child's timeline"}
        backTo="/dashboard"
      />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">

        {/* Child selector */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {children.map(name => (
              <button
                key={name}
                onClick={() => handleChildChange(name)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: selectedChild === name ? C.darkGreen : C.white,
                  color: selectedChild === name ? "#fff" : C.darkGreen,
                  border: `1px solid ${selectedChild === name ? C.darkGreen : C.cream}`,
                  cursor: "pointer",
                }}
              >
                🧒 {name}
              </button>
            ))}
          </div>
        )}

        {/* No child profiles */}
        {children.length === 0 && !loading && (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1.5px dashed ${C.midGreen}` }}>
            <Users size={28} color={C.midGreen} className="mx-auto mb-2" />
            <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>Add a Child Profile First</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Go to Child Profiles to add a child before building their life story.</p>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Intro card */}
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: C.darkGreen }}>
              <BookOpen size={20} color={C.gold} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
                  {selectedChild}'s Life Story
                </p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.lightGreen }}>
                  Build a chronological timeline of placements, milestones, and memories. Drag entries to reorder. Photos and documents can be attached to each moment.
                </p>
              </div>
            </div>

            {/* Add button */}
            {!showForm && (
              <button
                onClick={() => { setEditingEntry(null); setShowForm(true); }}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Plus size={16} /> Add Life Event
              </button>
            )}

            {/* Form */}
            {showForm && (
              <LifeStoryEntryForm
                entry={editingEntry}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingEntry(null); }}
              />
            )}

            {/* Timeline */}
            {loading ? (
              <div className="text-center py-10">
                <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent` }} />
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
                <p className="text-3xl mb-2">📖</p>
                <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>No events yet</p>
                <p className="text-xs" style={{ color: C.mutedText }}>Start adding placements, school changes, milestones, and meaningful moments to build {selectedChild}'s story.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="timeline">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="relative"
                    >
                      {/* Vertical line */}
                      <div
                        className="absolute left-[19px] top-4 bottom-4 w-0.5"
                        style={{ background: C.cream, zIndex: 0 }}
                      />

                      <div className="space-y-3">
                        {entries.map((entry, index) => (
                          <Draggable key={entry.id} draggableId={entry.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.85 : 1,
                                }}
                              >
                                <LifeStoryCard
                                  entry={entry}
                                  dragHandleProps={provided.dragHandleProps}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </>
        )}

        <div className="pb-10" />
      </div>
    </div>
  );
}