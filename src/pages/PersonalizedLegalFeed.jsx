import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ExternalLink, BookOpen, AlertCircle } from "lucide-react";

const KNOWLEDGE_BASE = {
  iep_and_school: [
    { title: "Understanding IEP Meetings", keywords: ["iep", "school", "education", "meeting"] },
    { title: "Your Rights in Special Education", keywords: ["iep", "special", "education", "rights"] },
    { title: "Advocating at IEP Meetings", keywords: ["iep", "advocate", "school", "meeting"] },
    { title: "Section 504 Plans vs. IEPs", keywords: ["504", "iep", "school", "plan"] },
  ],
  custody_and_family_law: [
    { title: "Navigating Custody Hearings", keywords: ["custody", "hearing", "court", "family"] },
    { title: "Co-Parenting After Separation", keywords: ["co-parent", "custody", "separation"] },
    { title: "Visitation Rights and Schedules", keywords: ["visitation", "custody", "schedule"] },
    { title: "Modifying Custody Orders", keywords: ["custody", "modification", "court", "order"] },
  ],
  child_welfare: [
    { title: "Understanding CPS Investigations", keywords: ["cps", "child", "protective", "services", "investigation"] },
    { title: "Your Rights During CPS Involvement", keywords: ["cps", "rights", "child", "welfare"] },
    { title: "Working with Caseworkers", keywords: ["caseworker", "cps", "child", "welfare"] },
    { title: "Reunification Services and Plans", keywords: ["reunification", "cps", "plan"] },
  ],
  medical_and_health: [
    { title: "Medical Decision-Making Rights", keywords: ["medical", "health", "decision", "healthcare"] },
    { title: "Health Insurance for Children", keywords: ["insurance", "health", "medicaid", "coverage"] },
    { title: "Mental Health Services and Records", keywords: ["mental", "health", "therapy", "counseling"] },
    { title: "Special Needs and Disability Services", keywords: ["disability", "special", "needs", "services"] },
  ],
};

function matchArticles(caseType, milestone) {
  const queries = [milestone?.toLowerCase() || "", caseType?.toLowerCase() || ""];
  const matches = [];

  let baseCategory = "iep_and_school";
  if (caseType === "court") baseCategory = "custody_and_family_law";
  if (caseType === "medical") baseCategory = "medical_and_health";

  const articles = KNOWLEDGE_BASE[baseCategory] || [];

  articles.forEach(article => {
    let score = 0;

    queries.forEach(query => {
      if (query) {
        article.keywords.forEach(keyword => {
          if (keyword.includes(query) || query.includes(keyword)) {
            score += 2;
          }
        });
      }
    });

    if (score > 0 || !milestone) {
      matches.push({ ...article, score, reason: milestone ? `Related to ${milestone}` : `For ${caseType} cases` });
    }
  });

  return matches.sort((a, b) => b.score - a.score).slice(0, 3);
}

export default function PersonalizedLegalFeed() {
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
    ]).then(([u]) => {
      setUser(u);
      if (u) {
        base44.entities.CaseFile.filter({ parent_email: u.email }, "-created_date", 50).then(caseFiles => {
          setCases(caseFiles);

          // Build personalized feed
          const allRecommendations = [];
          const seen = new Set();

          caseFiles.forEach(caseFile => {
            const articles = matchArticles(caseFile.case_type, caseFile.next_milestone);
            articles.forEach(article => {
              if (!seen.has(article.title)) {
                allRecommendations.push({
                  ...article,
                  caseName: caseFile.child_name,
                  caseType: caseFile.case_type,
                });
                seen.add(article.title);
              }
            });
          });

          setFeedItems(allRecommendations);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Legal Feed" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Personalized Legal Feed"
        subtitle="Articles for your cases"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">
        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <BookOpen size={28} color={C.cream} className="mx-auto mb-2" />
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Your Legal Resources</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Articles tailored to your cases and upcoming milestones
          </p>
        </div>

        {/* Feed items */}
        {feedItems.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.cream }}>
            <AlertCircle size={32} color={C.brown} className="mx-auto mb-3" />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No personalized recommendations yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Create a case to see relevant legal articles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedItems.map((item, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: C.darkGreen }}>
                  <span style={{ fontSize: "18px" }}>📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs" style={{ color: C.cream }}>{item.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>
                      {item.reason} • {item.caseName}
                    </p>
                  </div>
                </div>

                <div className="p-4" style={{ background: "#fff" }}>
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color: C.darkGreen }}>
                    This article is relevant to {item.caseName}'s {item.caseType} case.
                  </p>

                  <a
                    href={`/legal-knowledge-base?search=${encodeURIComponent(item.title)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-opacity hover:opacity-80"
                    style={{ background: C.midGreen, color: "#fff", textDecoration: "none" }}
                  >
                    <ExternalLink size={12} />
                    Read Article
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {feedItems.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>💡 TIP</p>
            <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
              Your feed updates as your cases progress. New milestones will automatically surface relevant articles to help you prepare.
            </p>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}