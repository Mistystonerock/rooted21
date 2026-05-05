import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Star, Users, ThumbsUp, MessageSquare, BarChart3 } from "lucide-react";

function extractThemes(text) {
  if (!text) return [];
  const keywords = [
    "pace", "pace of class", "speed", "too fast", "too slow",
    "content", "material", "topics",
    "interaction", "engage", "participation",
    "time", "duration", "length",
    "clear", "clarity", "confusing", "confused",
    "examples", "case studies", "real-world",
    "exercises", "activities", "practice",
    "resources", "handouts", "materials",
    "energy", "enthusiasm", "engaging",
    "Q&A", "questions", "answers",
  ];
  
  const foundThemes = [];
  const lowerText = text.toLowerCase();
  
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      foundThemes.push(keyword);
    }
  });
  
  return [...new Set(foundThemes)];
}

function getTopThemes(feedbackList) {
  const themeCount = {};
  
  feedbackList.forEach(fb => {
    if (fb.improvements) {
      const themes = extractThemes(fb.improvements);
      themes.forEach(theme => {
        themeCount[theme] = (themeCount[theme] || 0) + 1;
      });
    }
  });
  
  return Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme, count]) => ({ theme, count }));
}

export default function InstructorFeedbackDashboard() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      
      // For now, assume instructor can see all classes (admin-only feature)
      if (u?.role === "admin") {
        base44.entities.LiveClass.list("-created_date").then(classes => {
          setClasses(classes);
          
          base44.entities.ClassFeedback.list("-feedback_date", 1000).then(fb => {
            setFeedback(fb);
            setLoading(false);
          });
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Feedback Analytics" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Feedback Analytics" backTo="/dashboard" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Admin only</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>This feature is only available to administrators.</p>
        </div>
      </div>
    );
  }

  const filteredFeedback = selectedClass
    ? feedback.filter(fb => fb.class_id === selectedClass)
    : feedback;

  const totalResponses = filteredFeedback.length;
  const avgInstructorRating = totalResponses > 0
    ? (filteredFeedback.reduce((sum, fb) => sum + (fb.instructor_rating || 0), 0) / totalResponses).toFixed(1)
    : 0;
  const avgContentRating = totalResponses > 0
    ? (filteredFeedback.reduce((sum, fb) => sum + (fb.content_rating || 0), 0) / totalResponses).toFixed(1)
    : 0;
  const recommendationRate = totalResponses > 0
    ? Math.round((filteredFeedback.filter(fb => fb.would_recommend).length / totalResponses) * 100)
    : 0;

  const topThemes = getTopThemes(filteredFeedback);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Feedback Analytics" subtitle="Class feedback aggregation" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Class filter */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-xs font-bold mb-2" style={{ color: C.mutedText }}>FILTER BY CLASS</p>
          <select
            value={selectedClass || ""}
            onChange={e => setSelectedClass(e.target.value || null)}
            className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.title} ({cls.abbr})
              </option>
            ))}
          </select>
        </div>

        {/* Response count */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: C.darkGreen }}>
          <Users size={24} color={C.cream} />
          <div>
            <p className="font-serif font-bold" style={{ color: C.cream }}>
              {totalResponses} {totalResponses === 1 ? "Response" : "Responses"}
            </p>
            <p className="text-xs" style={{ color: C.lightGreen }}>
              Anonymous feedback submitted
            </p>
          </div>
        </div>

        {/* Rating cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} color={C.gold} fill={C.gold} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>INSTRUCTOR</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: C.darkGreen }}>
              {avgInstructorRating}
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>out of 5</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>CONTENT</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: C.darkGreen }}>
              {avgContentRating}
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>out of 5</p>
          </div>
        </div>

        {/* Recommendation rate */}
        <div className="rounded-2xl p-4" style={{ background: C.midGreen }}>
          <div className="flex items-center gap-3 mb-3">
            <ThumbsUp size={20} color="#fff" />
            <p className="font-bold" style={{ color: "#fff" }}>Would Recommend</p>
          </div>
          <p className="text-3xl font-extrabold" style={{ color: "#fff" }}>
            {recommendationRate}%
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            {filteredFeedback.filter(fb => fb.would_recommend).length} of {totalResponses} respondents
          </p>
        </div>

        {/* Common improvement themes */}
        {topThemes.length > 0 && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} color={C.brown} />
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Top Improvement Themes</p>
            </div>
            <div className="space-y-2">
              {topThemes.map(({ theme, count }) => (
                <div key={theme} className="flex items-center justify-between pb-2 border-b" style={{ borderColor: C.cream }}>
                  <p className="text-xs font-medium capitalize" style={{ color: C.darkGreen }}>
                    {theme}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: C.cream, color: C.brown }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback samples */}
        {filteredFeedback.filter(fb => fb.improvements).length > 0 && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Written Feedback Samples</p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredFeedback
                .filter(fb => fb.improvements)
                .slice(0, 5)
                .map((fb, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl text-xs"
                    style={{ background: C.offWhite }}
                  >
                    <p style={{ color: C.darkGreen }}>{fb.improvements}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px]" style={{ color: C.mutedText }}>
                        Instructor:
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < fb.instructor_rating ? C.gold : C.cream}
                            color={i < fb.instructor_rating ? C.gold : C.cream}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {totalResponses === 0 && (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.cream }}>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
              No feedback yet
            </p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              Feedback will appear here once participants complete their classes.
            </p>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}