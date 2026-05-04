import { Phone, MapPin, Smile, AlertTriangle, Heart } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function SafetyPlanTemplate({ plan, printMode = false }) {
  if (!plan || !plan.child_name) return null;

  const containerClass = printMode ? "bg-white text-black" : "";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className={`${printMode ? "p-8 font-sans" : "rounded-2xl p-6"}`} style={!printMode ? { background: C.white, border: `1px solid ${C.cream}` } : {}}>
      
      {/* HEADER */}
      <div className={printMode ? "mb-8 pb-6 border-b-2 border-gray-300" : "mb-6 pb-4 rounded-lg p-4 text-center" } style={!printMode ? { background: C.darkGreen } : {}}>
        <p className={printMode ? "text-3xl font-bold mb-1" : "font-serif font-bold text-2xl"} style={printMode ? { color: "black" } : { color: C.cream }}>
          🛡️ Safety Plan for {plan.child_name}
        </p>
        {!printMode && (
          <p className="text-xs mt-1" style={{ color: C.lightGreen }}>Created {today}</p>
        )}
        {printMode && (
          <p className="text-sm text-gray-600 mt-1">Created: {today}</p>
        )}
      </div>

      {/* CHILD INFO */}
      {(plan.child_name || plan.child_age || plan.parent_name) && (
        <div className={printMode ? "mb-8 p-4 border border-gray-300 bg-gray-50" : "mb-6 p-4 rounded-xl"} style={!printMode ? { background: `${C.midGreen}12` } : {}}>
          <p className={printMode ? "font-bold text-lg mb-3" : "font-bold text-sm mb-2"} style={!printMode ? { color: C.darkGreen } : {}}>
            About {plan.child_name}
          </p>
          <div className={printMode ? "grid grid-cols-3 gap-4 text-sm" : "grid grid-cols-3 gap-3 text-xs"}>
            {plan.child_name && (
              <div>
                <p className={printMode ? "font-bold" : "font-bold"} style={!printMode ? { color: C.mutedText } : {}}>Child's Name</p>
                <p className={printMode ? "mt-1 text-base" : "mt-0.5"}>{plan.child_name}</p>
              </div>
            )}
            {plan.child_age && (
              <div>
                <p className={printMode ? "font-bold" : "font-bold"} style={!printMode ? { color: C.mutedText } : {}}>Age</p>
                <p className={printMode ? "mt-1 text-base" : "mt-0.5"}>{plan.child_age}</p>
              </div>
            )}
            {plan.parent_name && (
              <div>
                <p className={printMode ? "font-bold" : "font-bold"} style={!printMode ? { color: C.mutedText } : {}}>Parent/Caregiver</p>
                <p className={printMode ? "mt-1 text-base" : "mt-0.5"}>{plan.parent_name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WARNING SIGNS */}
      {plan.warning_signs && (
        <div className={printMode ? "mb-8" : "mb-6 rounded-xl p-4"} style={!printMode ? { background: "#FFF8E8", border: `1px solid ${C.gold}` } : {}}>
          <div className="flex items-start gap-3 mb-2">
            <AlertTriangle size={printMode ? 20 : 16} color={printMode ? "#B84C2A" : C.brown} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className={printMode ? "font-bold text-lg" : "font-bold text-sm"} style={!printMode ? { color: C.darkGreen } : {}}>
                Warning Signs
              </p>
              <p className={printMode ? "text-base mt-2 text-gray-800 whitespace-pre-wrap" : "text-xs mt-1"} style={!printMode ? { color: C.warmText } : {}}>
                {plan.warning_signs}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY CONTACTS */}
      {plan.contacts && plan.contacts.length > 0 && (
        <div className={printMode ? "mb-8" : "mb-6"}>
          <div className="flex items-center gap-2 mb-3">
            <Phone size={printMode ? 20 : 16} color={C.darkGreen} />
            <p className={printMode ? "font-bold text-lg" : "font-bold text-sm"} style={{ color: C.darkGreen }}>
              Emergency Contacts
            </p>
          </div>
          <div className={printMode ? "space-y-4" : "space-y-2"}>
            {plan.contacts.map((contact, i) => (
              <div key={contact.id || i} className={printMode ? "p-4 border border-gray-300 bg-gray-50" : "p-3 rounded-xl"} style={!printMode ? { background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` } : {}}>
                <div className={printMode ? "flex justify-between items-start" : "flex items-start justify-between"}>
                  <div>
                    <p className={printMode ? "font-bold text-base" : "font-bold text-sm"} style={!printMode ? { color: C.darkGreen } : {}}>{contact.name}</p>
                    {contact.relationship && (
                      <p className={printMode ? "text-sm text-gray-700" : "text-[10px]"} style={!printMode ? { color: C.mutedText } : {}}>
                        {contact.relationship}
                      </p>
                    )}
                    {contact.role && (
                      <p className={printMode ? "text-sm text-gray-700" : "text-[10px]"} style={!printMode ? { color: C.mutedText } : {}}>
                        {contact.role}
                      </p>
                    )}
                  </div>
                  <p className={printMode ? "font-bold text-base text-blue-600" : "font-bold text-sm"} style={!printMode ? { color: C.midGreen } : {}}>
                    {contact.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAFE LOCATIONS */}
      {plan.safe_locations && plan.safe_locations.length > 0 && (
        <div className={printMode ? "mb-8" : "mb-6"}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={printMode ? 20 : 16} color={C.darkGreen} />
            <p className={printMode ? "font-bold text-lg" : "font-bold text-sm"} style={{ color: C.darkGreen }}>
              Safe Locations
            </p>
          </div>
          <div className={printMode ? "space-y-4" : "space-y-2"}>
            {plan.safe_locations.map((loc, i) => (
              <div key={loc.id || i} className={printMode ? "p-4 border border-gray-300 bg-gray-50" : "p-3 rounded-xl"} style={!printMode ? { background: `${C.brown}12`, border: `1px solid ${C.brown}30` } : {}}>
                <p className={printMode ? "font-bold text-base" : "font-bold text-sm"} style={!printMode ? { color: C.darkGreen } : {}}>{loc.name}</p>
                {loc.address && (
                  <p className={printMode ? "text-sm text-gray-700 mt-1" : "text-[10px] mt-0.5"} style={!printMode ? { color: C.mutedText } : {}}>
                    📍 {loc.address}
                  </p>
                )}
                {loc.description && (
                  <p className={printMode ? "text-sm text-gray-800 mt-2 whitespace-pre-wrap" : "text-xs mt-1"} style={!printMode ? { color: C.warmText } : {}}>
                    {loc.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALMING ACTIVITIES */}
      {plan.calming_activities && plan.calming_activities.length > 0 && (
        <div className={printMode ? "mb-8" : "mb-6"}>
          <div className="flex items-center gap-2 mb-3">
            <Smile size={printMode ? 20 : 16} color={C.darkGreen} />
            <p className={printMode ? "font-bold text-lg" : "font-bold text-sm"} style={{ color: C.darkGreen }}>
              Calming Activities
            </p>
          </div>
          <div className={printMode ? "space-y-4" : "space-y-2"}>
            {plan.calming_activities.map((activity, i) => (
              <div key={activity.id || i} className={printMode ? "p-4 border border-gray-300 bg-gray-50" : "p-3 rounded-xl flex items-start gap-2"} style={!printMode ? { background: `${C.gold}12`, border: `1px solid ${C.gold}30` } : {}}>
                <span className={printMode ? "text-2xl" : "text-lg flex-shrink-0"}>{activity.emoji || "✨"}</span>
                <div className="flex-1">
                  <p className={printMode ? "font-bold text-base" : "font-bold text-sm"} style={!printMode ? { color: C.darkGreen } : {}}>{activity.activity}</p>
                  {activity.description && (
                    <p className={printMode ? "text-sm text-gray-800 mt-1 whitespace-pre-wrap" : "text-xs mt-0.5"} style={!printMode ? { color: C.warmText } : {}}>
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IMPORTANT NOTES */}
      {plan.important_notes && (
        <div className={printMode ? "mb-8 p-4 border border-gray-300 bg-gray-50" : "mb-6 p-4 rounded-xl"} style={!printMode ? { background: `${C.cream}60` } : {}}>
          <p className={printMode ? "font-bold text-lg mb-2" : "font-bold text-sm mb-1"} style={!printMode ? { color: C.darkGreen } : {}}>
            Important Notes
          </p>
          <p className={printMode ? "text-base text-gray-800 whitespace-pre-wrap" : "text-xs"} style={!printMode ? { color: C.warmText } : {}}>
            {plan.important_notes}
          </p>
        </div>
      )}

      {/* CRISIS RESOURCES */}
      {plan.crisis_resources && (
        <div className={printMode ? "p-4 border-2 border-red-300 bg-red-50" : "p-4 rounded-xl"} style={!printMode ? { background: "#FEF3EE", border: `1.5px solid #F4C9B8` } : {}}>
          <div className="flex items-start gap-2">
            <Heart size={printMode ? 18 : 14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className={printMode ? "font-bold text-base" : "font-bold text-sm"} style={!printMode ? { color: "#B84C2A" } : { color: "black" }}>
                24/7 Crisis Resources
              </p>
              <p className={printMode ? "text-sm text-gray-800 mt-2 whitespace-pre-wrap" : "text-[10px] mt-1"} style={!printMode ? { color: "#B84C2A" } : {}}>
                {plan.crisis_resources}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PRINT FOOTER */}
      {printMode && (
        <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>This safety plan should be accessible and reviewed regularly with your child and support team.</p>
          <p className="mt-2">Print this plan and post it in visible locations around your home.</p>
        </div>
      )}
    </div>
  );
}