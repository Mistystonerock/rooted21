const panelButtons = document.querySelectorAll("[data-panel-target]");
const panels = document.querySelectorAll(".panel-card");
const mobileButtons = document.querySelectorAll("[data-mobile-panel]");
const roleButtons = document.querySelectorAll("[data-role-target]");
const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authRole = document.getElementById("auth-role");
const authMessage = document.getElementById("auth-message");
const authStatus = document.getElementById("auth-status");
const authSubmit = document.getElementById("auth-submit");
const signOutButton = document.getElementById("sign-out-button");
const workspace = document.getElementById("workspace");
const workspaceTitle = document.getElementById("workspace-title");
const workspaceCopy = document.getElementById("workspace-copy");
const workspaceGrid = document.getElementById("workspace-grid");
const workspaceActions = document.getElementById("workspace-actions");
const audio = document.getElementById("rooted21-audio");
const musicControl = document.getElementById("music-control");
const musicLabel = document.getElementById("music-label");
const founderEmail = "rooted21parenting@gmail.com";
const supabaseClient = window.supabase && window.ROOTED_SUPABASE_URL && window.ROOTED_SUPABASE_ANON_KEY
  ? window.supabase.createClient(window.ROOTED_SUPABASE_URL, window.ROOTED_SUPABASE_ANON_KEY)
  : null;

const roleCopy = {
  therapist: {
    title: "Therapist View",
    detail: "Behavior logs, class completions, co-parenting insights, and approved summaries."
  },
  cps: {
    title: "CPS Worker View",
    detail: "Case plan milestones, checklist progress, visit logs, uploaded case plans, and court-ready summaries."
  },
  court: {
    title: "Court/Legal View",
    detail: "Court packet readiness, co-parenting logs, completion certificates, and attorney-review exports."
  },
  school: {
    title: "School Support View",
    detail: "IEP/504 preparation, attendance notes, school communication logs, and behavior documentation."
  }
};

const dashboardContent = {
  founder: {
    title: "Founder / Super Admin Dashboard",
    copy: "Full Rooted 21 oversight for users, professionals, admins, legal/compliance items, AI safety, analytics, and launch readiness.",
    cards: [
      ["Founder Controls", "Manage platform settings, admin accounts, legal documents, monetization plans, and production readiness."],
      ["User Oversight", "Review families, professionals, admins, waitlist interest, invitations, and deactivated accounts."],
      ["Access Codes & QR", "Generate, revoke, audit, and monitor all professional/family links."],
      ["AI Safety", "Maintain Moxie boundaries, disclaimers, escalation language, and user-review requirements."],
      ["Reports", "Review court-ready, CPS-ready, therapist-ready, and attorney-review summary activity."],
      ["Funding Tracker", "Track grants, donations, sponsorships, premium classes, and future licensing opportunities."]
    ]
  },
  admin: {
    title: "Admin Dashboard",
    copy: "Operational tools for managing content, users, resources, surveys, announcements, and support workflows.",
    cards: [
      ["User Management", "Approve accounts, manage roles, review access requests, and issue beta invitations."],
      ["Resources", "Add and verify housing, food, benefits, legal aid, school, veteran, and recovery resources."],
      ["Classes", "Manage the 21-day parenting class, anger management modules, quizzes, activities, and certificates."],
      ["Announcements", "Send targeted updates to families, caregivers, professionals, or all users."]
    ]
  },
  family: {
    title: "Family Mobile Dashboard",
    copy: "A calm daily hub for case plans, court preparation, parenting class progress, behavior logs, resources, and document organization.",
    cards: [
      ["SOS Support", "Grounding prompts, calming steps, safety reminders, and crisis-boundary resource guidance."],
      ["My Plan", "Track appointments, court dates, visits, case plan tasks, recovery goals, housing, and class deadlines."],
      ["Moxie AI", "Break down next steps, rewrite co-parenting messages, and summarize behavior patterns for review."],
      ["Document Vault", "Organize case plans, court orders, parenting plans, medical records, school records, and IDs."]
    ]
  },
  caregiver: {
    title: "Kinship / Foster Caregiver Dashboard",
    copy: "Tools for guardianship documents, school support, caregiving milestones, behavior tracking, and professional linking.",
    cards: [
      ["Caregiver Records", "Keep guardianship, placement, child, school, and meeting documents together."],
      ["School Support", "Prepare for IEP/504 meetings, teacher communication, attendance reviews, and behavior plans."],
      ["Milestones", "Track child progress, routines, appointments, resources, and stability goals."],
      ["Professional Links", "Scan or enter access codes and choose what information can be shared."]
    ]
  },
  professional: {
    title: "Professional Read-Only Portal",
    copy: "Consent-based access for therapists, CPS workers, court/legal support, and school professionals.",
    cards: [
      ["Assigned Families", "View approved family progress, behavior logs, class completions, and selected reports."],
      ["QR Codes", "Generate secure access codes for families to scan or enter manually."],
      ["Reports", "Prepare court/CPS-ready or therapist-ready summaries from user-approved data."],
      ["Audit Log", "Every view, export, link, and code action is tracked for accountability."]
    ]
  }
};

function showPanel(target) {
  panelButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.panelTarget === target);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `panel-${target}`);
  });
}

panelButtons.forEach((button) => {
  button.addEventListener("click", () => showPanel(button.dataset.panelTarget));
});

mobileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.mobilePanel === "resources" ? "vault" : "tools";
    showPanel(target);
    document.querySelector(".feature-panel").scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

roleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    roleButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    const copy = roleCopy[button.dataset.roleTarget];
    document.getElementById("role-title").textContent = copy.title;
    document.getElementById("role-detail").textContent = copy.detail;
  });
});

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem("rooted21Session"));
  } catch (error) {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem("rooted21Session", JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem("rooted21Session");
}

function getRequestedRole(email) {
  if (email === founderEmail) {
    return "founder";
  }

  return authRole.value === "admin" || authRole.value === "founder" ? "family" : authRole.value;
}

function renderDashboard(session) {
  const content = dashboardContent[session.role] || dashboardContent.family;
  workspace.classList.remove("is-locked");
  workspaceTitle.textContent = content.title;
  workspaceCopy.textContent = `${session.email} - ${session.authMode || "local"} access - ${content.copy}`;
  signOutButton.hidden = false;
  workspaceGrid.innerHTML = content.cards
    .map(([title, copy]) => `
      <article class="workspace-card">
        <h3>${title}</h3>
        <p>${copy}</p>
      </article>
    `)
    .join("");
  renderWorkspaceActions(session);
}

function renderLockedState() {
  workspace.classList.add("is-locked");
  workspaceTitle.textContent = "Sign in to open your dashboard.";
  workspaceCopy.textContent = "Role-based tools will appear here after login.";
  signOutButton.hidden = true;
  workspaceGrid.innerHTML = "";
  workspaceActions.innerHTML = "";
}

function getLocalRecords(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function saveLocalRecord(key, record) {
  const records = getLocalRecords(key);
  records.unshift({ ...record, id: crypto.randomUUID(), savedMode: "Local preview", created_at: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(records.slice(0, 12)));
  return records[0];
}

async function saveSupabaseRecord(table, record) {
  if (!supabaseClient) {
    return null;
  }

  const { data, error } = await supabaseClient.from(table).insert(record).select().single();
  if (error) {
    throw error;
  }
  return data;
}

async function ensureFamily(session) {
  if (!supabaseClient || !session.userId) {
    const localFamily = getLocalRecords("rooted21Families")[0];
    return localFamily || saveLocalRecord("rooted21Families", {
      owner_user_id: "local",
      caregiver_name: session.email,
      household_summary: "Local preview family profile"
    });
  }

  const existing = await supabaseClient
    .from("rooted21_families")
    .select("id")
    .eq("owner_user_id", session.userId)
    .maybeSingle();

  if (existing.data) {
    return existing.data;
  }

  const created = await saveSupabaseRecord("rooted21_families", {
    owner_user_id: session.userId,
    caregiver_name: session.email,
    household_summary: "Rooted 21 family profile"
  });

  return created;
}

function renderSavedList(records, emptyText) {
  if (!records.length) {
    return `<p class="form-note">${emptyText}</p>`;
  }

  return `
    <div class="saved-list">
      ${records.slice(0, 5).map((record) => `
        <article>
          <strong>${record.title || record.name || record.category || record.code || "Saved item"}</strong>
          <span>${record.notes || record.what_happened || record.household_summary || record.status || record.savedMode || "Saved"}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function actionTemplate(session) {
  if (session.role === "founder" || session.role === "admin") {
    return `
      <div class="workspace-form-card">
        <h3>Add Resource</h3>
        <form class="live-form" data-live-form="resource">
          <label>Category <input name="category" placeholder="Housing, Legal Aid, Recovery" required /></label>
          <label>Resource name <input name="name" placeholder="Organization name" required /></label>
          <label>Notes <textarea name="notes" placeholder="What families should know"></textarea></label>
          <button class="button button-primary" type="submit">Save Resource</button>
        </form>
        <div data-saved-list="resource">${renderSavedList(getLocalRecords("rooted21Resources"), "Saved resources will appear here.")}</div>
      </div>
    `;
  }

  if (session.role === "professional") {
    return `
      <div class="workspace-form-card">
        <h3>Create Professional Access Code</h3>
        <form class="live-form" data-live-form="access-code">
          <label>Professional type
            <select name="professional_type">
              <option value="therapist">Therapist</option>
              <option value="cps">CPS Worker</option>
              <option value="court_legal">Court / Legal Support</option>
              <option value="school">School Professional</option>
            </select>
          </label>
          <label>Code label <input name="notes" placeholder="Example: Intake QR for June families" /></label>
          <button class="button button-primary" type="submit">Generate Code</button>
        </form>
        <div data-saved-list="access-code">${renderSavedList(getLocalRecords("rooted21AccessCodes"), "Generated access codes will appear here.")}</div>
      </div>
    `;
  }

  return `
    <div class="workspace-form-card">
      <h3>Start My Case Plan</h3>
      <form class="live-form" data-live-form="case-plan">
        <label>Plan title <input name="title" placeholder="CPS case plan, court prep, school plan" required /></label>
        <label>Agency or court <input name="agency" placeholder="Agency, court, or support team" /></label>
        <label>Notes <textarea name="notes" placeholder="What needs to be tracked?"></textarea></label>
        <button class="button button-primary" type="submit">Save Case Plan</button>
      </form>
      <div data-saved-list="case-plan">${renderSavedList(getLocalRecords("rooted21CasePlans"), "Saved case plans will appear here.")}</div>
    </div>
    <div class="workspace-form-card">
      <h3>Log Behavior or Daily Moment</h3>
      <form class="live-form" data-live-form="behavior-log">
        <label>What happened? <textarea name="what_happened" placeholder="Briefly describe the moment" required></textarea></label>
        <label>Possible trigger <input name="possible_trigger" placeholder="Tired, transition, visit, school, hunger" /></label>
        <label>What helped? <textarea name="what_helped" placeholder="What calmed, connected, or supported repair?"></textarea></label>
        <button class="button button-primary" type="submit">Save Behavior Log</button>
      </form>
      <div data-saved-list="behavior-log">${renderSavedList(getLocalRecords("rooted21BehaviorLogs"), "Saved behavior logs will appear here.")}</div>
    </div>
  `;
}

function renderWorkspaceActions(session) {
  workspaceActions.innerHTML = `
    <div class="workspace-actions__header">
      <div>
        <p class="eyebrow">Working Feature Starter</p>
        <h3>Save real Rooted 21 records</h3>
      </div>
      <span class="status">${session.authMode || "Local preview"}</span>
    </div>
    <div class="workspace-actions__grid">${actionTemplate(session)}</div>
  `;

  workspaceActions.querySelectorAll("[data-live-form]").forEach((form) => {
    form.addEventListener("submit", (event) => handleLiveForm(event, session));
  });
}

async function handleLiveForm(event, session) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.dataset.liveForm;
  const formData = Object.fromEntries(new FormData(form).entries());
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    async function persistRecord(table, localKey, record, shouldUseSupabase = true) {
      if (shouldUseSupabase) {
        await saveSupabaseRecord(table, record).catch((error) => {
          console.warn(`Supabase save failed for ${table}:`, error.message);
        });
      }
      saveLocalRecord(localKey, record);
    }

    if (type === "resource") {
      const record = {
        category: formData.category,
        name: formData.name,
        notes: formData.notes,
        verification_status: "needs_review"
      };
      await persistRecord("rooted21_resources", "rooted21Resources", record);
    }

    if (type === "access-code") {
      const code = `R21-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const record = {
        professional_user_id: session.userId,
        professional_type: formData.professional_type,
        code,
        notes: formData.notes
      };
      if (session.userId) {
        await persistRecord("rooted21_access_codes", "rooted21AccessCodes", record);
      } else {
        saveLocalRecord("rooted21AccessCodes", record);
      }
    }

    if (type === "case-plan") {
      const family = await ensureFamily(session);
      const record = {
        family_id: family.id,
        title: formData.title,
        agency: formData.agency,
        notes: formData.notes
      };
      if (session.userId) {
        await persistRecord("rooted21_case_plans", "rooted21CasePlans", record);
      } else {
        saveLocalRecord("rooted21CasePlans", record);
      }
    }

    if (type === "behavior-log") {
      const family = await ensureFamily(session);
      const record = {
        family_id: family.id,
        what_happened: formData.what_happened,
        possible_trigger: formData.possible_trigger,
        what_helped: formData.what_helped
      };
      if (session.userId) {
        await persistRecord("rooted21_behavior_logs", "rooted21BehaviorLogs", record);
      } else {
        saveLocalRecord("rooted21BehaviorLogs", record);
      }
    }

    form.reset();
    renderWorkspaceActions(session);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = submitButton.textContent.replace("Saving...", "Save");
  }
}

function openLogin() {
  document.getElementById("login").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => authEmail.focus(), 350);
}

document.querySelectorAll("[data-auth-open]").forEach((button) => {
  button.addEventListener("click", openLogin);
});

authEmail.addEventListener("input", () => {
  const email = normalizeEmail(authEmail.value);
  if (email === founderEmail) {
    authRole.value = "founder";
    authMessage.textContent = "Founder email recognized. You will enter as Founder / Super Admin.";
  } else {
    authMessage.textContent = "Choose the role you want to preview for this prototype.";
  }
});

async function upsertProfile(session) {
  if (!supabaseClient || !session.userId) {
    return;
  }

  const { error } = await supabaseClient
    .from("rooted21_profiles")
    .upsert({
      user_id: session.userId,
      email: session.email,
      role: session.role,
      display_name: session.email === founderEmail ? "Rooted 21 Founder" : session.email,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });

  if (error) {
    console.warn("Profile upsert failed:", error.message);
  }
}

async function getProfileRole(user, fallbackRole) {
  if (!supabaseClient || !user) {
    return fallbackRole;
  }

  if (normalizeEmail(user.email || "") === founderEmail) {
    return "founder";
  }

  const { data, error } = await supabaseClient
    .from("rooted21_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return fallbackRole;
  }

  return data.role || fallbackRole;
}

async function signInWithSupabase(email, password, requestedRole) {
  const signIn = await supabaseClient.auth.signInWithPassword({ email, password });

  if (!signIn.error && signIn.data.user) {
    const role = await getProfileRole(signIn.data.user, requestedRole);
    return {
      email,
      role,
      userId: signIn.data.user.id,
      authMode: "Supabase",
      signedInAt: new Date().toISOString()
    };
  }

  const signUp = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: requestedRole,
        display_name: email === founderEmail ? "Rooted 21 Founder" : email
      }
    }
  });

  if (signUp.error) {
    throw signUp.error;
  }

  const user = signUp.data.user;
  return {
    email,
    role: await getProfileRole(user, requestedRole),
    userId: user ? user.id : null,
    authMode: "Supabase",
    signedInAt: new Date().toISOString()
  };
}

function createLocalSession(email, role) {
  return {
    email,
    role,
    authMode: "Local preview",
    signedInAt: new Date().toISOString()
  };
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = normalizeEmail(authEmail.value);
  const requestedRole = getRequestedRole(email);
  const password = authPassword.value;

  authSubmit.disabled = true;
  authMessage.textContent = "Signing in...";

  let session;

  try {
    if (!supabaseClient) {
      session = createLocalSession(email, requestedRole);
      authMessage.textContent = "Supabase is not loaded. Local preview access opened.";
    } else {
      session = await signInWithSupabase(email, password, requestedRole);
      await upsertProfile(session);
      authMessage.textContent = session.role === "founder"
        ? "Founder access opened with Supabase."
        : "Account access opened with Supabase.";
    }
  } catch (error) {
    session = createLocalSession(email, requestedRole);
    authMessage.textContent = `Supabase could not complete login (${error.message}). Local preview opened for now.`;
  } finally {
    authSubmit.disabled = false;
  }

  saveSession(session);
  renderDashboard(session);
  workspace.scrollIntoView({ behavior: "smooth", block: "start" });
});

signOutButton.addEventListener("click", async () => {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }

  clearSession();
  renderLockedState();
  openLogin();
});

async function initializeAuth() {
  if (!supabaseClient) {
    authStatus.textContent = "Supabase is not loaded. Local preview mode is available.";
    const existingSession = getStoredSession();
    if (existingSession && existingSession.email) {
      renderDashboard(existingSession);
    } else {
      renderLockedState();
    }
    return;
  }

  authStatus.textContent = "Supabase connected. Real sign-in is available.";
  const { data } = await supabaseClient.auth.getSession();

  if (data.session && data.session.user) {
    const email = normalizeEmail(data.session.user.email || "");
    const role = await getProfileRole(data.session.user, getRequestedRole(email));
    const session = {
      email,
      role,
      userId: data.session.user.id,
      authMode: "Supabase",
      signedInAt: new Date().toISOString()
    };
    saveSession(session);
    renderDashboard(session);
    return;
  }

  const existingSession = getStoredSession();
  if (existingSession && existingSession.email && existingSession.authMode === "Local preview") {
    renderDashboard(existingSession);
  } else {
    renderLockedState();
  }
}

initializeAuth();

function updateMusicState(isPlaying) {
  musicControl.classList.toggle("is-playing", isPlaying);
  musicControl.setAttribute("aria-pressed", String(isPlaying));
  musicLabel.textContent = isPlaying ? "Pause Song" : "Play Song";
}

async function playMusic() {
  try {
    audio.volume = 0.32;
    await audio.play();
    localStorage.setItem("rooted21Music", "playing");
    updateMusicState(true);
  } catch (error) {
    localStorage.setItem("rooted21Music", "paused");
    updateMusicState(false);
  }
}

function pauseMusic() {
  audio.pause();
  localStorage.setItem("rooted21Music", "paused");
  updateMusicState(false);
}

musicControl.addEventListener("click", () => {
  if (audio.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    audio.volume = 0.18;
  } else {
    audio.volume = 0.32;
  }
});

updateMusicState(false);

if (localStorage.getItem("rooted21Music") === "playing") {
  playMusic();
}
