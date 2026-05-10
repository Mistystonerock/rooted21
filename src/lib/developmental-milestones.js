/**
 * Developmental milestones by age range (birth to 18).
 * Physical and behavioral/social-emotional skills.
 * Based on CDC, AAP, and trauma-informed child development frameworks.
 */

export const MILESTONE_RANGES = [
  {
    label: "0–3 months",
    minAge: 0,
    maxAge: 0.25,
    physical: [
      "Lifts head briefly when on tummy",
      "Makes jerky, arm movements",
      "Brings hands to face",
      "Tracks moving objects with eyes",
    ],
    behavioral: [
      "Responds to familiar voices (calms or stirs)",
      "Smiles in response to people",
      "Coos and makes gurgling sounds",
      "Cries differently for different needs",
    ],
  },
  {
    label: "4–6 months",
    minAge: 0.25,
    maxAge: 0.5,
    physical: [
      "Holds head steady without support",
      "Bears weight on legs when standing with support",
      "Rolls from tummy to back",
      "Reaches for objects with both hands",
    ],
    behavioral: [
      "Recognizes familiar faces",
      "Responds to own name",
      "Strings vowels together ('ah', 'eh', 'oh')",
      "Shows curiosity and interest in surroundings",
    ],
  },
  {
    label: "7–12 months",
    minAge: 0.5,
    maxAge: 1,
    physical: [
      "Sits without support",
      "Crawls or scoots",
      "Pulls to stand",
      "Takes first steps (around 9–12 months)",
      "Uses pincer grasp (finger + thumb)",
    ],
    behavioral: [
      "Shows stranger anxiety",
      "Has favorite things and people",
      "Copies sounds and gestures",
      "Bangs objects together",
      "Responds to 'no'",
    ],
  },
  {
    label: "1–2 years",
    minAge: 1,
    maxAge: 2,
    physical: [
      "Walks independently",
      "Climbs onto furniture",
      "Kicks a ball",
      "Scribbles with crayons",
      "Stacks 4+ blocks",
    ],
    behavioral: [
      "Says 10–50 words by age 2",
      "Points to body parts when named",
      "Follows simple 2-step instructions",
      "Imitates household activities",
      "Shows defiant behavior ('No!') — normal independence",
      "Plays alongside (not yet with) other children",
    ],
  },
  {
    label: "2–3 years",
    minAge: 2,
    maxAge: 3,
    physical: [
      "Runs and jumps",
      "Climbs well",
      "Walks up and down stairs one step at a time",
      "Turns pages of a book",
      "Builds towers of 6+ blocks",
    ],
    behavioral: [
      "Speaks in 2–3 word phrases",
      "Names familiar people and objects",
      "Separates from caregivers with some distress (normal)",
      "Shows a wide range of emotions",
      "Magical thinking begins",
      "Tantrums are developmentally expected — regulation is still developing",
    ],
  },
  {
    label: "3–4 years",
    minAge: 3,
    maxAge: 4,
    physical: [
      "Hops and stands on one foot up to 2 seconds",
      "Catches a bounced ball most of the time",
      "Uses scissors",
      "Draws a person with 2–4 body parts",
      "Pedals a tricycle",
    ],
    behavioral: [
      "Understands 'mine', 'his/hers', 'yours'",
      "Shows wide range of emotions",
      "Follows 3-part instructions",
      "Can take turns in games",
      "Begins to negotiate and problem-solve",
      "Pretend play becomes complex",
      "Testing limits is developmentally normal",
    ],
  },
  {
    label: "4–5 years",
    minAge: 4,
    maxAge: 5,
    physical: [
      "Stands on one foot 10+ seconds",
      "Hops, somersaults",
      "Swings, climbs",
      "Uses fork and spoon",
      "Can use the toilet independently",
    ],
    behavioral: [
      "Wants to please friends",
      "Agrees with rules in games",
      "Is more likely to follow rules",
      "Speaks clearly",
      "Tells simple stories",
      "Can distinguish fantasy from reality (most of the time)",
      "Emotions can still be intense — co-regulation still needed",
    ],
  },
  {
    label: "5–6 years",
    minAge: 5,
    maxAge: 6,
    physical: [
      "Skips, hops, and jumps rope",
      "Ties shoelaces (emerging)",
      "Handwriting is emerging",
      "Rides a bike with training wheels",
    ],
    behavioral: [
      "Understands the concept of time",
      "Wants to be like friends",
      "Likes to sing, dance, and act",
      "Begins to understand money",
      "Can separate school and home easily",
      "Beginning to think about the future",
      "Peer relationships become very important",
    ],
  },
  {
    label: "6–8 years",
    minAge: 6,
    maxAge: 8,
    physical: [
      "Fine motor skills are more refined (neat handwriting)",
      "Participates in team sports",
      "Rides bike without training wheels",
      "Losing baby teeth",
    ],
    behavioral: [
      "Reads independently (emerging or established)",
      "Can follow multi-step directions",
      "Understands cause-and-effect",
      "Has a longer attention span",
      "Peer comparison begins ('I'm better/worse than...')",
      "More aware of others' feelings",
      "Can feel shame and guilt — still needs adult support",
    ],
  },
  {
    label: "8–10 years",
    minAge: 8,
    maxAge: 10,
    physical: [
      "Increased coordination and athletic ability",
      "Growth spurts may begin",
      "Early puberty signs may appear (especially girls)",
    ],
    behavioral: [
      "Stronger sense of right and wrong",
      "Strong peer group loyalties",
      "Enjoys collections, hobbies",
      "Can solve problems independently (sometimes)",
      "May begin to push back on parental authority",
      "Anxiety about performance (school, sports) is common",
      "Friendships are crucial to identity",
    ],
  },
  {
    label: "10–12 years",
    minAge: 10,
    maxAge: 12,
    physical: [
      "Puberty actively beginning (both sexes)",
      "Rapid height and weight changes possible",
      "Increased appetite",
      "Body image awareness increases",
    ],
    behavioral: [
      "Strong desire for peer belonging",
      "May question family values",
      "More private — wants personal space",
      "Emotional swings tied to puberty",
      "Risk-taking begins to increase",
      "Crushes and romantic awareness emerge",
      "Still needs adult mentorship and connection",
    ],
  },
  {
    label: "12–14 years",
    minAge: 12,
    maxAge: 14,
    physical: [
      "Puberty well underway",
      "Voice changes (boys)",
      "Increased physical strength",
      "Sleep needs increase significantly",
    ],
    behavioral: [
      "Identity exploration ('Who am I?')",
      "Intense peer influence",
      "Argues to assert independence — this is normal",
      "Risk behaviors may increase",
      "May seem withdrawn or moody",
      "Abstract thinking fully developing (not yet complete)",
      "Connection to trusted adult is protective — even if they push back",
    ],
  },
  {
    label: "14–16 years",
    minAge: 14,
    maxAge: 16,
    physical: [
      "Most reach physical maturity",
      "Increased energy, also irregular sleep patterns",
      "Driver's permit age range",
    ],
    behavioral: [
      "Stronger sense of personal identity",
      "Deep importance of peer group",
      "May experiment with boundaries, rules",
      "Can think more abstractly and long-term",
      "Romantic relationships become significant",
      "Community and purpose become motivating",
      "Emotional regulation is still developing — prefrontal cortex not fully developed",
    ],
  },
  {
    label: "16–18 years",
    minAge: 16,
    maxAge: 18,
    physical: [
      "Physical development nearly complete",
      "For boys, continued muscle and voice development",
      "Driving independently",
    ],
    behavioral: [
      "Solidifying personal values and identity",
      "Planning for future (college, career, independence)",
      "Can regulate emotions more consistently (but still imperfectly)",
      "Relationships and intimacy are central concerns",
      "May strongly question authority",
      "Needs increasing autonomy while still needing guidance",
      "Brain continues developing until age 25",
    ],
  },
];

/**
 * Returns milestones relevant to a child's age.
 * @param {number|string} age
 */
export function getMilestonesForAge(age) {
  const numAge = parseFloat(age);
  if (isNaN(numAge)) return null;
  return MILESTONE_RANGES.find(r => numAge >= r.minAge && numAge < r.maxAge + 1) || null;
}

/**
 * Builds a short milestone context string for the AI prompt.
 * @param {Array} children — array of ChildProfile objects
 */
export function buildMilestoneContext(children) {
  if (!children || children.length === 0) return "";

  let ctx = "\n\n--- DEVELOPMENTAL MILESTONES (Age-Appropriate Reference) ---";
  ctx += "\nUse these to contextualize behavior and guide coaching. Reference them naturally when relevant.\n";

  children.forEach(child => {
    if (!child.age) return;
    const milestone = getMilestonesForAge(child.age);
    if (!milestone) return;

    ctx += `\n${child.first_name} (age ${child.age}) — Developmental range: ${milestone.label}`;
    ctx += `\n  Typical physical skills at this age: ${milestone.physical.slice(0, 3).join("; ")}`;
    ctx += `\n  Typical behavioral/social-emotional skills: ${milestone.behavioral.slice(0, 4).join("; ")}`;
    ctx += `\n  ⚠️ Trauma context: Children from hard places may be months or years behind developmentally. Behavior that seems "too young" may be developmentally appropriate for their trauma history. Avoid shaming and meet them where they are.`;
  });

  return ctx;
}