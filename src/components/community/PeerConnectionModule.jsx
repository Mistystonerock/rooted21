import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Check, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";

const GROUPS = [
  { key: "reunification", label: "Reunification", emoji: "🌱", description: "Working toward reunification, visits, plans, and progress." },
  { key: "guardianship", label: "Guardianship", emoji: "🛡️", description: "Support for guardianship, permanency, and family roles." },
  { key: "kinship", label: "Kinship Care", emoji: "👨‍👩‍👧", description: "Relative and kin caregivers supporting children they love." },
  { key: "foster_care", label: "Foster Care", emoji: "🏠", description: "Foster parents navigating daily care and system expectations." },
  { key: "substance_recovery", label: "Recovery Support", emoji: "💚", description: "Families impacted by recovery, treatment, relapse prevention, and repair." },
  { key: "court_support", label: "Court Support", emoji: "⚖️", description: "Preparing for hearings, reports, documentation, and next steps." },
  { key: "school_advocacy", label: "School Advocacy", emoji: "🏫", description: "IEPs, meetings, behavior plans, and school communication." },
  { key: "caregiver_wellbeing", label: "Caregiver Well-Being", emoji: "🌿", description: "Burnout prevention, self-care, grief, and emotional support." },
];

const TAGS = ["reunification", "guardianship", "kinship", "foster care", "adoption", "CPS", "court", "school advocacy", "IEP", "trauma parenting", "teens", "sibling group", "substance-use recovery", "relative caregiver", "mental health", "respite", "single parent"];

function threadKey(a, b) {
  return [a, b].sort().join("__");
}

export default function PeerConnectionModule({ user }) {
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ display_name: "", bio: "", family_type: "reunification", tags: [], group_interests: [], zip_code: "", messaging_opt_in: false, safety_agreement_accepted: false });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [allProfiles, allMemberships, myMessages] = await Promise.all([
      base44.entities.PeerConnectionProfile.list("-updated_date", 200),
      base44.entities.PeerGroupMembership.list("-created_date", 300),
      base44.entities.PeerMessage.list("-created_date", 200),
    ]);
    const mine = allProfiles.find(item => item.user_email === user.email);
    setProfile(mine || null);
    setProfiles(allProfiles.filter(item => item.user_email !== user.email && item.is_active !== false && item.moderation_status !== "paused"));
    setMemberships(allMemberships);
    setMessages(myMessages);
    if (mine) setForm({ display_name: mine.display_name || "", bio: mine.bio || "", family_type: mine.family_type || "reunification", tags: mine.tags || [], group_interests: mine.group_interests || [], zip_code: mine.zip_code || "", messaging_opt_in: !!mine.messaging_opt_in, safety_agreement_accepted: !!mine.safety_agreement_accepted });
  }

  function toggle(key, value) {
    setForm(prev => ({ ...prev, [key]: prev[key].includes(value) ? prev[key].filter(item => item !== value) : [...prev[key], value] }));
  }

  async function saveProfile() {
    setSaving(true);
    const payload = { ...form, user_email: user.email, user_name: user.full_name, is_active: true, moderation_status: "approved" };
    const saved = profile ? await base44.entities.PeerConnectionProfile.update(profile.id, payload) : await base44.entities.PeerConnectionProfile.create(payload);
    const existingGroups = memberships.filter(item => item.user_email === user.email).map(item => item.group_key);
    const newGroups = form.group_interests.filter(group => !existingGroups.includes(group));
    await Promise.all(newGroups.map(group => base44.entities.PeerGroupMembership.create({ group_key: group, group_label: GROUPS.find(item => item.key === group)?.label || group, user_email: user.email, display_name: form.display_name, status: "approved", joined_at: new Date().toISOString() })));
    setProfile(saved);
    await loadData();
    setSaving(false);
  }

  const myGroupKeys = useMemo(() => new Set((profile?.group_interests || form.group_interests || [])), [profile, form.group_interests]);
  const matches = useMemo(() => profiles
    .filter(item => item.messaging_opt_in && item.safety_agreement_accepted)
    .map(item => {
      const sharedTags = (item.tags || []).filter(tag => (profile?.tags || form.tags).includes(tag));
      const sharedGroups = (item.group_interests || []).filter(group => myGroupKeys.has(group));
      return { ...item, sharedTags, sharedGroups, score: sharedTags.length + sharedGroups.length };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score), [profiles, profile, form.tags, myGroupKeys]);

  const selectedThread = selectedPeer ? messages.filter(message => message.thread_key === threadKey(user.email, selectedPeer.user_email)) : [];

  async function sendMessage() {
    if (!draft.trim() || !selectedPeer || !profile?.messaging_opt_in || !profile?.safety_agreement_accepted) return;
    const created = await base44.entities.PeerMessage.create({
      sender_email: user.email,
      sender_display_name: profile.display_name,
      recipient_email: selectedPeer.user_email,
      recipient_display_name: selectedPeer.display_name,
      body: draft.trim(),
      thread_key: threadKey(user.email, selectedPeer.user_email),
      is_connection_request: selectedThread.length === 0,
      safety_acknowledged: true,
      moderation_status: "visible",
    });
    setMessages(prev => [created, ...prev]);
    setDraft("");
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <section className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
        <div className="flex items-center gap-2"><Sparkles size={16} color={C.gold} /><p className="font-serif text-sm font-bold" style={{ color: C.cream }}>Peer Matching</p></div>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.lightGreen }}>Create an opt-in profile, join moderated groups, and message families with similar lived experiences.</p>
      </section>

      <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="flex items-center gap-2"><ShieldCheck size={16} color={C.midGreen} /><p className="text-sm font-black" style={{ color: C.darkGreen }}>Peer Connection Profile</p></div>
        <input value={form.display_name} onChange={e => setForm(prev => ({ ...prev, display_name: e.target.value }))} placeholder="Display name or nickname" className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
        <textarea value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Brief intro: what kind of peer support are you looking for?" rows={3} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
        <select value={form.family_type} onChange={e => setForm(prev => ({ ...prev, family_type: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
          <option value="reunification">Reunification</option><option value="guardianship">Guardianship</option><option value="kinship">Kinship</option><option value="foster">Foster Care</option><option value="adoptive">Adoptive</option><option value="substance_recovery">Substance-use Recovery</option><option value="court_involved">Court Involved</option><option value="school_advocacy">School Advocacy</option><option value="other">Other</option>
        </select>
        <input value={form.zip_code} onChange={e => setForm(prev => ({ ...prev, zip_code: e.target.value }))} placeholder="ZIP code optional" maxLength={5} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
        <div><p className="mb-2 text-[10px] font-black" style={{ color: C.mutedText }}>TAGS</p><div className="flex flex-wrap gap-1.5">{TAGS.map(tag => <button key={tag} onClick={() => toggle("tags", tag)} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: form.tags.includes(tag) ? C.midGreen : C.offWhite, color: form.tags.includes(tag) ? C.white : C.darkGreen, border: `1px solid ${C.cream}` }}>{tag}</button>)}</div></div>
        <div><p className="mb-2 text-[10px] font-black" style={{ color: C.mutedText }}>MODERATED GROUPS</p><div className="grid gap-2">{GROUPS.map(group => <button key={group.key} onClick={() => toggle("group_interests", group.key)} className="rounded-xl p-3 text-left" style={{ background: form.group_interests.includes(group.key) ? `${C.midGreen}18` : C.offWhite, border: `1px solid ${form.group_interests.includes(group.key) ? C.midGreen : C.cream}` }}><span className="text-sm font-black" style={{ color: C.darkGreen }}>{group.emoji} {group.label}</span><span className="mt-1 block text-[11px]" style={{ color: C.mutedText }}>{group.description}</span></button>)}</div></div>
        <label className="flex gap-2 text-xs" style={{ color: C.darkGreen }}><input type="checkbox" checked={form.safety_agreement_accepted} onChange={e => setForm(prev => ({ ...prev, safety_agreement_accepted: e.target.checked }))} /> I agree to use peer support safely, kindly, and without sharing private case details.</label>
        <label className="flex gap-2 text-xs" style={{ color: C.darkGreen }}><input type="checkbox" checked={form.messaging_opt_in} onChange={e => setForm(prev => ({ ...prev, messaging_opt_in: e.target.checked }))} /> Allow opt-in messages from matched parents.</label>
        <button onClick={saveProfile} disabled={saving || !form.display_name.trim()} className="w-full rounded-2xl py-3 text-sm font-black" style={{ background: C.darkGreen, color: C.white, border: "none" }}>{saving ? "Saving…" : profile ? "Update Peer Profile" : "Create Peer Profile"}</button>
      </section>

      <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="mb-3 flex items-center gap-2"><Users size={16} color={C.midGreen} /><p className="text-sm font-black" style={{ color: C.darkGreen }}>Your moderated groups</p></div>
        <div className="grid gap-2">{GROUPS.filter(group => myGroupKeys.has(group.key)).map(group => <div key={group.key} className="rounded-xl p-3" style={{ background: C.offWhite }}><p className="text-sm font-black" style={{ color: C.darkGreen }}>{group.emoji} {group.label}</p><p className="text-[11px]" style={{ color: C.mutedText }}>Joined · moderated discussion group</p></div>)}</div>
        {myGroupKeys.size === 0 && <p className="text-xs" style={{ color: C.mutedText }}>Choose groups in your profile to join moderated discussions.</p>}
      </section>

      <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="flex items-center gap-2"><MessageCircle size={16} color={C.midGreen} /><p className="text-sm font-black" style={{ color: C.darkGreen }}>Suggested peer connections</p></div>
        {!profile && <p className="text-xs" style={{ color: C.mutedText }}>Create your Peer Connection profile to see matches.</p>}
        {profile && matches.length === 0 && <p className="text-xs" style={{ color: C.mutedText }}>No opt-in matches yet. Try adding more tags or groups.</p>}
        {matches.slice(0, 8).map(match => <div key={match.id} className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}><div className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full font-black" style={{ background: C.cream, color: C.darkGreen }}>{match.display_name?.[0] || "P"}</div><div className="min-w-0 flex-1"><p className="text-sm font-black" style={{ color: C.darkGreen }}>{match.display_name}</p><p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{match.bio || "Opted in for safe peer support."}</p><p className="mt-1 text-[10px]" style={{ color: C.brown }}>{[...match.sharedGroups, ...match.sharedTags].slice(0, 4).join(" · ")}</p></div><button onClick={() => setSelectedPeer(match)} className="rounded-xl px-3 py-2 text-[11px] font-black" style={{ background: C.darkGreen, color: C.white, border: "none" }}>Message</button></div></div>)}
      </section>

      {selectedPeer && (
        <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
          <div className="flex items-center justify-between"><p className="text-sm font-black" style={{ color: C.darkGreen }}>Message {selectedPeer.display_name}</p><button onClick={() => setSelectedPeer(null)} className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>Close</button></div>
          <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl p-3" style={{ background: C.offWhite }}>{selectedThread.length === 0 && <p className="text-xs" style={{ color: C.mutedText }}>Send a gentle connection request. Only message families who have opted in.</p>}{selectedThread.slice().reverse().map(message => <div key={message.id} className="rounded-xl p-2 text-xs" style={{ background: message.sender_email === user.email ? C.darkGreen : C.white, color: message.sender_email === user.email ? C.white : C.darkGreen, border: `1px solid ${C.cream}` }}><p className="font-black">{message.sender_display_name}</p><p className="mt-1 leading-relaxed">{message.body}</p></div>)}</div>
          {!profile?.messaging_opt_in || !profile?.safety_agreement_accepted ? <p className="rounded-xl p-3 text-xs" style={{ background: "#FEF3C7", color: C.darkGreen }}>Turn on messaging and accept the safety agreement in your profile before sending messages.</p> : <div className="flex gap-2"><input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a safe, supportive message…" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} /><button onClick={sendMessage} disabled={!draft.trim()} className="rounded-xl px-4 text-sm font-black" style={{ background: C.darkGreen, color: C.white, border: "none" }}><Check size={15} /></button></div>}
          <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>Safety note: avoid sharing addresses, legal strategy, confidential case details, or emergency requests in peer messages.</p>
        </section>
      )}
    </div>
  );
}