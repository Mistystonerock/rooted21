import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Search, X, Bookmark } from "lucide-react";
import { SavedResourcesProvider, useSaved } from "@/components/resources/SavedResourcesContext";
import ResourceCard, { TYPE_META } from "@/components/resources/ResourceCard";
import AddResourcePanel from "@/components/resources/AddResourcePanel";
import LocalResources from "@/components/resources/LocalResources";
import FillableWorksheets from "@/components/resources/FillableWorksheets";
import { useEffect } from "react";

const CATEGORIES = [
  { id: "all",        label: "All",                 emoji: "📚" },
  { id: "trauma",     label: "Trauma Basics",        emoji: "🧠" },
  { id: "sensory",    label: "Sensory Regulation",   emoji: "🎯" },
  { id: "selfcare",   label: "Self-Care",            emoji: "🌿" },
  { id: "attachment", label: "Attachment",           emoji: "💛" },
  { id: "behavior",   label: "Behavior Tools",       emoji: "🛠️" },
  { id: "grief",      label: "Grief & Loss",         emoji: "🕊️" },
  { id: "system",     label: "Navigating Systems",   emoji: "⚖️" },
  { id: "reading",    label: "Recommended Reading",  emoji: "📖" },
];

const SEED_RESOURCES = [
  // ── TRAUMA BASICS ───────────────────────────────────────────────
  { id: 1, category: "trauma", type: "article", title: "What Is Childhood Trauma?", author: "National Child Traumatic Stress Network", desc: "A foundational overview of how trauma affects children's development, behavior, and relationships.", url: "https://www.nctsn.org/what-is-child-trauma/about-child-trauma", free: true, featured: true },
  { id: 2, category: "trauma", type: "article", title: "How Trauma Affects the Brain", author: "Child Welfare Information Gateway", desc: "Plain-language explanation of the neuroscience behind trauma responses — the survival brain, triggers, and the 3 R's.", url: "https://www.childwelfare.gov/topics/can/impact/", free: true },
  { id: 3, category: "trauma", type: "pdf",     title: "TBRI® Overview for Caregivers", author: "TCU Karyn Purvis Institute", desc: "A printable one-page summary of Trust-Based Relational Intervention principles for parents and caregivers.", url: "https://child.tcu.edu/about-us/tbri/", free: true, featured: true },
  { id: 4, category: "trauma", type: "book",    title: "The Body Keeps the Score", author: "Bessel van der Kolk, MD", desc: "Landmark book on how trauma lives in the body and what can heal it. Essential reading for any trauma-informed caregiver.", url: "https://www.besselvanderkolk.com/resources/the-body-keeps-the-score", free: false },
  { id: 5, category: "trauma", type: "video",   title: "Understanding ACEs: Adverse Childhood Experiences", author: "CDC", desc: "Short explainer video on adverse childhood experiences and their lifelong impact on health and behavior.", url: "https://www.cdc.gov/aces/index.html", free: true },
  // ── SENSORY REGULATION ──────────────────────────────────────────
  { id: 6,  category: "sensory", type: "article", title: "Sensory Processing in Traumatized Children", author: "STAR Institute for Sensory Processing", desc: "How trauma disrupts sensory processing, what it looks like in everyday behavior, and how to help.", url: "https://sensoryhealth.org/basic/sensory-processing-disorder-and-trauma", free: true, featured: true },
  { id: 7,  category: "sensory", type: "pdf",     title: "Printable Sensory Diet Template", author: "Rooted 21 / OT Toolkit", desc: "A fill-in-the-blank daily sensory diet template you can use with an occupational therapist to support your child's regulation.", url: "https://www.ot-resource.com/sensory-diet.shtml", free: true },
  { id: 8,  category: "sensory", type: "article", title: "Building a Calm-Down Corner at Home", author: "Child Mind Institute", desc: "Step-by-step guide to creating a calming space for dysregulated children, including what to put in it.", url: "https://childmind.org/article/creating-calm-corner/", free: true },
  { id: 9,  category: "sensory", type: "book",    title: "The Out-of-Sync Child", author: "Carol Kranowitz", desc: "The definitive parent guide to understanding and supporting children with sensory processing challenges.", url: "https://out-of-sync-child.com/", free: false },
  // ── SELF-CARE ───────────────────────────────────────────────────
  { id: 10, category: "selfcare", type: "article", title: "Secondary Traumatic Stress in Caregivers", author: "National Child Traumatic Stress Network", desc: "What secondary traumatic stress is, how to recognize it in yourself, and concrete strategies for recovery.", url: "https://www.nctsn.org/trauma-informed-care/secondary-traumatic-stress", free: true, featured: true },
  { id: 11, category: "selfcare", type: "pdf",     title: "Caregiver Self-Care Assessment", author: "Child Welfare Trauma Training Toolkit", desc: "A printable self-assessment to identify your own stress load, resilience factors, and gaps in self-care.", url: "https://www.childwelfare.gov/topics/systemwide/workforce/workforcewellbeing/", free: true },
  { id: 12, category: "selfcare", type: "audio",   title: "Regulated & Ready: Podcast for Trauma Caregivers", author: "The Adoption Connection", desc: "Short podcast episodes on caregiver burnout, nervous system regulation, and staying grounded through hard parenting moments.", url: "https://adoptionconnection.org/podcast/", free: true },
  { id: 13, category: "selfcare", type: "article", title: "Rest Is Not a Luxury: Why Caregiver Rest Matters", author: "Empowered to Connect", desc: "Research-backed article on why caregiver restoration isn't selfish — it's the most therapeutic thing you can do.", url: "https://empoweredtoconnect.org/", free: true },
  // ── ATTACHMENT ──────────────────────────────────────────────────
  { id: 14, category: "attachment", type: "article", title: "Attachment Theory: What It Is and Why It Matters", author: "Simply Psychology", desc: "An accessible, well-organized explanation of Bowlby's attachment theory and its implications for parenting.", url: "https://www.simplypsychology.org/bowlby.html", free: true, featured: true },
  { id: 15, category: "attachment", type: "book",    title: "Connected Parenting", author: "Jennifer Kolari", desc: "Practical attachment-based strategies for building deep connection with children who push you away.", url: "https://jenniferkolari.com/connected-parenting/", free: false },
  { id: 16, category: "attachment", type: "video",   title: "The Still Face Experiment", author: "Dr. Edward Tronick", desc: "Famous developmental psychology video demonstrating the critical importance of attunement and responsiveness in early attachment.", url: "https://www.youtube.com/watch?v=apzXGEbZht0", free: true },
  { id: 17, category: "attachment", type: "article", title: "PACE: Playfulness, Acceptance, Curiosity, Empathy", author: "Dan Hughes / DDP Network", desc: "The full PACE framework for creating healing relationships with children from hard places.", url: "https://ddpnetwork.org/about-ddp/meant-pace/", free: true },
  // ── BEHAVIOR TOOLS ──────────────────────────────────────────────
  { id: 18, category: "behavior", type: "article", title: "The IDEAL Response: TBRI® Correcting Strategies", author: "TCU Karyn Purvis Institute", desc: "A guide to the TBRI® IDEAL correcting response — Immediate, Direct, Efficient, Action-based, Leveled.", url: "https://child.tcu.edu/about-us/tbri/", free: true, featured: true },
  { id: 19, category: "behavior", type: "pdf",     title: "Behavior as Communication: A Parent Cheat Sheet", author: "Rooted 21 Program", desc: "One-page printable guide for decoding what common challenging behaviors are communicating underneath.", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", free: true },
  { id: 20, category: "behavior", type: "article", title: "Why Consequences Don't Work for Traumatized Children", author: "Empowered to Connect", desc: "Explains why traditional punishment-based discipline backfires with children from hard places, and what to do instead.", url: "https://empoweredtoconnect.org/", free: true },
  { id: 21, category: "behavior", type: "book",    title: "Beyond Consequences, Logic & Control", author: "Heather Forbes & Bryan Post", desc: "A must-read for caregivers of children whose behaviors defy conventional parenting strategies.", url: "https://beyondconsequences.com/", free: false },
  // ── GRIEF & LOSS ────────────────────────────────────────────────
  { id: 22, category: "grief", type: "article", title: "Helping Children Grieve Losses in Foster & Adoptive Care", author: "Child Welfare Information Gateway", desc: "How to recognize grief in children who may not have language for it, and how to support them through loss.", url: "https://www.childwelfare.gov/topics/adoption/adopt-parenting/child-issues/", free: true, featured: true },
  { id: 23, category: "grief", type: "article", title: "Life Books: Helping Children Tell Their Own Story", author: "Adoption Learning Partners", desc: "How to create a life book with your child to integrate their history, build identity, and process loss.", url: "https://www.adoptionlearningpartners.org/", free: true },
  { id: 24, category: "grief", type: "book",    title: "Twenty Things Adopted Kids Wish Their Adoptive Parents Knew", author: "Sherrie Eldridge", desc: "A compassionate guide for adoptive and foster parents navigating questions of identity, loss, and belonging.", url: "https://sherrieeldridge.com/", free: false },
  // ── NAVIGATING SYSTEMS ──────────────────────────────────────────
  { id: 25, category: "system", type: "article", title: "A Parent's Guide to the Child Welfare System", author: "Child Welfare Information Gateway", desc: "Plain-language overview of how CPS, courts, and foster care work — what to expect and how to advocate.", url: "https://www.childwelfare.gov/topics/famcentered/familysupportservices/family-resource-centers/", free: true, featured: true },
  { id: 26, category: "system", type: "pdf",     title: "Court Preparation Checklist for Families", author: "Rooted 21 Program", desc: "A printable checklist to help families prepare for court dates — documentation, questions, and support.", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", free: true },
  { id: 27, category: "system", type: "article", title: "How to Advocate for Your Child at School", author: "Understood.org", desc: "Step-by-step guide for parents navigating IEPs, 504 plans, and trauma-informed school accommodations.", url: "https://www.understood.org/en/school-learning/special-services/ieps", free: true },
  // ── RECOMMENDED READING ─────────────────────────────────────────
  { id: 28, category: "reading", type: "book", title: "Parenting the Hurt Child", author: "Gregory Keck & Regina Kupecky", desc: "Hands-on guide for adoptive and foster parents working with children who have experienced early trauma.", url: "https://www.amazon.com/Parenting-Hurt-Child-Gregory-Keck/dp/1576836088", free: false, featured: true },
  { id: 29, category: "reading", type: "book", title: "The Whole-Brain Child", author: "Daniel J. Siegel & Tina Payne Bryson", desc: "Neuroscience-informed strategies for nurturing your child's developing mind. Practical, readable, and research-backed.", url: "https://www.drdansiegel.com/book/the-whole-brain-child/", free: false },
  { id: 30, category: "reading", type: "book", title: "Attaching in Adoption", author: "Deborah D. Gray", desc: "Comprehensive resource for adoptive families on building secure attachment with children from hard places.", url: "https://debdgray.com/attaching-in-adoption/", free: false },
  { id: 31, category: "reading", type: "book", title: "No-Drama Discipline", author: "Daniel J. Siegel & Tina Payne Bryson", desc: "How to redirect behavior and build a whole brain — the companion to The Whole-Brain Child.", url: "https://www.drdansiegel.com/book/no-drama-discipline/", free: false },
];

const CUSTOM_KEY = "rooted21_custom_resources";

function LibraryContent() {
  const { saved } = useSaved();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState(null);
  const [tab, setTab] = useState("browse"); // "browse" | "saved"
  const [user, setUser] = useState(null);
  const [customResources, setCustomResources] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const allResources = useMemo(() => [...SEED_RESOURCES, ...customResources], [customResources]);

  function handleAddResource(r) {
    const updated = [...customResources, r];
    setCustomResources(updated);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(updated));
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const pool = tab === "saved" ? allResources.filter(r => saved.includes(r.id)) : allResources;
    return pool.filter(r => {
      const matchCat = activeCategory === "all" || r.category === activeCategory;
      const matchType = !activeType || r.type === activeType;
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.author?.toLowerCase().includes(q) || r.desc?.toLowerCase().includes(q);
      return matchCat && matchType && matchSearch;
    });
  }, [search, activeCategory, activeType, tab, allResources, saved]);

  const featured = filtered.filter(r => r.featured);
  const rest = filtered.filter(r => !r.featured);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <Link to="/dashboard" aria-label="Back" className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ width: 44, height: 44, background: "#ffffff18" }}>
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Resource Library</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Articles · PDFs · Books · Videos</p>
        </div>
        <div className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: "#ffffff18", color: C.lightGreen }}>
          {allResources.length} resources
        </div>
      </div>

      {/* Browse / Saved tabs */}
      <div className="flex border-b" style={{ background: C.white, borderColor: C.cream }}>
        {[
          { id: "browse", label: "Browse All" },
          { id: "saved",  label: `Saved (${saved.length})`, icon: <Bookmark size={11} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-colors"
            style={{
              borderColor: tab === t.id ? C.darkGreen : "transparent",
              color: tab === t.id ? C.darkGreen : C.mutedText,
              background: "transparent", border: "none", cursor: "pointer",
              borderBottom: `2px solid ${tab === t.id ? C.darkGreen : "transparent"}`,
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {/* Add Resource (admin only) */}
        {tab === "browse" && <AddResourcePanel userRole={user?.role} onAdd={handleAddResource} />}

        {/* Search */}
        <div className="relative">
          <Search size={14} color={C.mutedText} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources, authors, topics…"
            className="w-full rounded-xl pl-9 pr-9 py-2.5 text-sm"
            style={{ border: `1.5px solid ${C.cream}`, background: C.white }} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={13} color={C.mutedText} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                background: activeCategory === cat.id ? C.darkGreen : C.cream,
                color: activeCategory === cat.id ? C.white : C.mutedText,
                border: "none", cursor: "pointer",
              }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(TYPE_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <button key={key} onClick={() => setActiveType(activeType === key ? null : key)}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: activeType === key ? meta.color : `${meta.color}15`,
                  color: activeType === key ? "white" : meta.color,
                  border: "none", cursor: "pointer",
                }}>
                <Icon size={9} /> {meta.label}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {(search || activeCategory !== "all" || activeType) && (
          <p className="text-[11px]" style={{ color: C.mutedText }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "all" && ` in ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
          </p>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <p className="text-2xl mb-2">{tab === "saved" ? "🔖" : "🔍"}</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              {tab === "saved" ? "No saved resources yet" : "Nothing found"}
            </p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              {tab === "saved"
                ? "Tap the bookmark icon on any resource to save it here."
                : "Try clearing the search or selecting a different category."}
            </p>
          </div>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <div>
            <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>★ FEATURED</p>
            <div className="space-y-2.5">
              {featured.map(r => <ResourceCard key={r.id} r={r} />)}
            </div>
          </div>
        )}

        {/* All resources */}
        {rest.length > 0 && (
          <div>
            {featured.length > 0 && (
              <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
                ALL RESOURCES
              </p>
            )}
            <div className="space-y-2.5">
              {rest.map(r => <ResourceCard key={r.id} r={r} />)}
            </div>
          </div>
        )}

        {tab === "browse" && (
          <>
            <FillableWorksheets />
            <LocalResources />
          </>
        )}

        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <p className="text-[11px] leading-relaxed text-center" style={{ color: C.mutedText }}>
            Resources link to external sites. Rooted 21 does not own or control external content.
            Free resources are prioritized. Book links go to author or publisher websites.
          </p>
        </div>
        <div className="pb-6" />
      </div>
    </div>
  );
}

export default function ResourceLibrary() {
  return (
    <SavedResourcesProvider>
      <LibraryContent />
    </SavedResourcesProvider>
  );
}