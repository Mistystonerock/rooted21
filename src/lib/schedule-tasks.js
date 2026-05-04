// Pre-built task library organized by routine type

export const TASK_COLORS = [
  "#5B8DB8", // blue
  "#6E8F6E", // green
  "#C9A84C", // gold
  "#B84C2A", // orange-red
  "#8B5E34", // brown
  "#7B6FA0", // purple
  "#2F8F8F", // teal
  "#D4849A", // pink
];

export const TASK_LIBRARY = {
  morning: [
    { label: "Wake Up", emoji: "☀️", duration_min: 5, color: "#C9A84C" },
    { label: "Get Dressed", emoji: "👕", duration_min: 10, color: "#5B8DB8" },
    { label: "Brush Teeth", emoji: "🪥", duration_min: 5, color: "#2F8F8F" },
    { label: "Wash Face", emoji: "🚿", duration_min: 5, color: "#5B8DB8" },
    { label: "Eat Breakfast", emoji: "🥣", duration_min: 15, color: "#C9A84C" },
    { label: "Take Vitamins", emoji: "💊", duration_min: 2, color: "#7B6FA0" },
    { label: "Pack Backpack", emoji: "🎒", duration_min: 5, color: "#8B5E34" },
    { label: "Put on Shoes", emoji: "👟", duration_min: 3, color: "#B84C2A" },
    { label: "Hug & Connect", emoji: "🤗", duration_min: 2, color: "#D4849A" },
    { label: "Read Together", emoji: "📖", duration_min: 10, color: "#6E8F6E" },
    { label: "Deep Breaths", emoji: "🌬️", duration_min: 3, color: "#2F8F8F" },
    { label: "Out the Door", emoji: "🚪", duration_min: 2, color: "#C9A84C" },
  ],
  after_school: [
    { label: "Arrive Home", emoji: "🏠", duration_min: 5, color: "#6E8F6E" },
    { label: "Snack Time", emoji: "🍎", duration_min: 10, color: "#C9A84C" },
    { label: "Unwind / Decompress", emoji: "😮‍💨", duration_min: 15, color: "#5B8DB8" },
    { label: "Homework", emoji: "✏️", duration_min: 30, color: "#8B5E34" },
    { label: "Reading Time", emoji: "📚", duration_min: 20, color: "#7B6FA0" },
    { label: "Outside Play", emoji: "🌳", duration_min: 30, color: "#6E8F6E" },
    { label: "Screen Time", emoji: "📱", duration_min: 30, color: "#5B8DB8" },
    { label: "Creative Play", emoji: "🎨", duration_min: 20, color: "#D4849A" },
    { label: "Chores / Helping", emoji: "🧹", duration_min: 10, color: "#8B5E34" },
    { label: "Check-In Chat", emoji: "💬", duration_min: 10, color: "#2F8F8F" },
    { label: "Dinner Prep Help", emoji: "🍳", duration_min: 10, color: "#C9A84C" },
  ],
  bedtime: [
    { label: "Dinner", emoji: "🍽️", duration_min: 20, color: "#C9A84C" },
    { label: "Bath / Shower", emoji: "🛁", duration_min: 15, color: "#5B8DB8" },
    { label: "Put on Pajamas", emoji: "🩲", duration_min: 5, color: "#7B6FA0" },
    { label: "Brush Teeth", emoji: "🪥", duration_min: 5, color: "#2F8F8F" },
    { label: "Calm-Down Activity", emoji: "🧩", duration_min: 10, color: "#6E8F6E" },
    { label: "Story Time", emoji: "📖", duration_min: 15, color: "#D4849A" },
    { label: "Connection Talk", emoji: "💛", duration_min: 10, color: "#D4849A" },
    { label: "Gratitude Share", emoji: "🙏", duration_min: 5, color: "#C9A84C" },
    { label: "Deep Breaths", emoji: "🌬️", duration_min: 5, color: "#2F8F8F" },
    { label: "Lights Out", emoji: "🌙", duration_min: 2, color: "#7B6FA0" },
    { label: "Tuck-In Ritual", emoji: "🫂", duration_min: 5, color: "#D4849A" },
  ],
  weekend: [
    { label: "Slow Wake-Up", emoji: "🌅", duration_min: 15, color: "#C9A84C" },
    { label: "Family Breakfast", emoji: "🥞", duration_min: 20, color: "#C9A84C" },
    { label: "Outside Time", emoji: "🌳", duration_min: 45, color: "#6E8F6E" },
    { label: "Creative Time", emoji: "🎨", duration_min: 30, color: "#D4849A" },
    { label: "Screen Time", emoji: "📱", duration_min: 30, color: "#5B8DB8" },
    { label: "Family Activity", emoji: "🎲", duration_min: 30, color: "#7B6FA0" },
    { label: "Quiet Reading", emoji: "📚", duration_min: 20, color: "#8B5E34" },
    { label: "Chores Together", emoji: "🧹", duration_min: 15, color: "#8B5E34" },
    { label: "Cooking Together", emoji: "👨‍🍳", duration_min: 30, color: "#B84C2A" },
    { label: "Free Play", emoji: "⚽", duration_min: 45, color: "#6E8F6E" },
  ],
  custom: [
    { label: "Task", emoji: "⭐", duration_min: 10, color: "#C9A84C" },
    { label: "Break", emoji: "⏸️", duration_min: 5, color: "#6E8F6E" },
    { label: "Activity", emoji: "🎯", duration_min: 15, color: "#5B8DB8" },
    { label: "Calm Time", emoji: "🌬️", duration_min: 10, color: "#2F8F8F" },
    { label: "Connection", emoji: "💛", duration_min: 5, color: "#D4849A" },
  ],
};

export const ROUTINE_META = {
  morning:      { label: "Morning Routine",    emoji: "☀️",  color: "#C9A84C" },
  after_school: { label: "After-School",       emoji: "🏠",  color: "#6E8F6E" },
  bedtime:      { label: "Bedtime Routine",    emoji: "🌙",  color: "#7B6FA0" },
  weekend:      { label: "Weekend Schedule",   emoji: "🌳",  color: "#5B8DB8" },
  custom:       { label: "Custom Routine",     emoji: "⭐",  color: "#8B5E34" },
};