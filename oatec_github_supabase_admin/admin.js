
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const loginCard = document.getElementById("loginCard");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginUser = document.getElementById("loginUser");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const dashboardMessage = document.getElementById("dashboardMessage");
const recordsTableBody = document.getElementById("recordsTableBody");
const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");
const logoutButton = document.getElementById("logoutButton");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const courseFilter = document.getElementById("courseFilter");
const statTotal = document.getElementById("statTotal");
const statPending = document.getElementById("statPending");
const statApproved = document.getElementById("statApproved");
const statRejected = document.getElementById("statRejected");

const THEME_KEY = "oatec-theme";
const CONFIG = window.SUPABASE_CONFIG || {};
let supabaseClient = null;
let allRecords = [];

function applyTheme(theme) {
  body.classList.toggle("dark-theme", theme === "dark");
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const nextTheme = body.classList.contains("dark-theme") ? "light" : "dark";
  applyTheme(nextTheme);
}

function showLoginMessage(text, type = "") {
  loginMessage.textContent = text;
  loginMessage.className = "form-message";
  if (type) loginMessage.classList.add(type);
}

function showDashboardMessage(text, type = "") {
  dashboardMessage.textContent = text;
  dashboardMessage.className = "form-message";
  if (type) dashboardMessage.classList.add(type);
}

function setLoginState(isLoading) {
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? "Ingresando..." : "Ingresar";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function getStatusClass(status) {
  if (status === "aprobado") return "aprobado";
  if (status === "rechazado") return "rechazado";
  return "pendiente";
}

function validateConfig() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY || !CONFIG.TABLE_NAME) {
    showLoginMessage("Falta completar config.js con la URL, anon key y tabla de Supabase.", "error");
    return false;
  }
  if (/PEGAR_AQUI/.test(CONFIG.SUPABASE_URL) || /PEGAR_AQUI/.test(CONFIG.SUPABASE_ANON_KEY)) {
    showLoginMessage("Todavía no completaste los datos reales de Supabase en config.js.", "error");
    return false;
  }
  return true;
}

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

function normalizeAdminIdentifier(rawValue) {
  const value = rawValue.trim();
  if (!value) return "";
  if (value.toLowerCase() === (CONFIG.ADMIN_USERNAME || "admin").toLowerCase()) {
    return CONFIG.ADMIN_EMAIL;
  }
  return value;
}

async function ensureSession() {
  if (!validateConfig()) return;
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) {
    showLoginMessage(error.message, "error");
    return;
  }
  if (data.session) {
    loginCard.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    await loadRecords();
  } else {
    loginCard.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!validateConfig()) return;

  const email = normalizeAdminIdentifier(loginUser.value);
  const password = loginPassword.value;

  if (!email || !password) {
    showLoginMessage("Completá usuario y contraseña.", "error");
    return;
  }

  setLoginState(true);
  showLoginMessage("Verificando acceso...");
  const client = getSupabaseClient();

  try {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;

    showLoginMessage("Acceso correcto.", "success");
    loginForm.reset();
    loginCard.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    await loadRecords();
  } catch (error) {
    console.error(error);
    showLoginMessage(`No se pudo iniciar sesión: ${error.message}`, "error");
  } finally {
    setLoginState(false);
  }
}

function applyFilters(records) {
  const term = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const course = courseFilter.value;

  return records.filter((record) => {
    const haystack = [
      record.first_name,
      record.last_name,
      `${record.first_name || ""} ${record.last_name || ""}`,
      record.dni
    ].join(" ").toLowerCase();

    const matchesTerm = !term || haystack.includes(term);
    const matchesStatus = !status || record.status === status;
    const matchesCourse = !course || record.course === course;
    return matchesTerm && matchesStatus && matchesCourse;
  });
}

function updateStats(records) {
  statTotal.textContent = records.length;
  statPending.textContent = records.filter((item) => item.status === "pendiente").length;
  statApproved.textContent = records.filter((item) => item.status === "aprobado").length;
  statRejected.textContent = records.filter((item) => item.status === "rechazado").length;
}

function renderTable(records) {
  if (!records.length) {
    recordsTableBody.innerHTML = '<tr><td colspan="8" class="empty-state-cell">No se encontraron inscripciones con los filtros actuales.</td></tr>';
    return;
  }

  recordsTableBody.innerHTML = records.map((record) => `
    <tr>
      <td>${escapeHtml(formatDate(record.created_at))}</td>
      <td>
        <div class="student-cell">
          <span class="student-name">${escapeHtml(record.first_name)} ${escapeHtml(record.last_name)}</span>
          <span class="student-meta">Nac.: ${escapeHtml(record.birth_date || "—")}</span>
        </div>
      </td>
      <td>${escapeHtml(record.age)}</td>
      <td>${escapeHtml(record.dni)}</td>
      <td>${escapeHtml(record.course)}°</td>
      <td>${escapeHtml(record.division)}</td>
      <td>${escapeHtml(record.theme)}</td>
      <td>
        <span class="status-pill ${getStatusClass(record.status)}">${escapeHtml(record.status)}</span>
        <select class="status-select" data-id="${record.id}">
          <option value="pendiente" ${record.status === "pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="aprobado" ${record.status === "aprobado" ? "selected" : ""}>Aprobado</option>
          <option value="rechazado" ${record.status === "rechazado" ? "selected" : ""}>Rechazado</option>
        </select>
      </td>
    </tr>
  `).join("");

  recordsTableBody.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const id = event.target.dataset.id;
      const newStatus = event.target.value;
      await updateStatus(id, newStatus);
    });
  });
}

function refreshView() {
  const filtered = applyFilters(allRecords);
  updateStats(allRecords);
  renderTable(filtered);
}

async function loadRecords() {
  showDashboardMessage("Cargando inscripciones...");
  const client = getSupabaseClient();

  try {
    const { data, error } = await client
      .from(CONFIG.TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    allRecords = data || [];
    refreshView();

    if (allRecords.length) {
      showDashboardMessage(`Se cargaron ${allRecords.length} inscripción(es).`, "success");
    } else {
      showDashboardMessage("Todavía no hay inscripciones registradas.", "success");
    }
  } catch (error) {
    console.error(error);
    showDashboardMessage(`No se pudieron cargar los datos: ${error.message}`, "error");
  }
}

async function updateStatus(id, status) {
  showDashboardMessage("Actualizando estado...");
  const client = getSupabaseClient();

  try {
    const { error } = await client
      .from(CONFIG.TABLE_NAME)
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    const target = allRecords.find((item) => String(item.id) === String(id));
    if (target) target.status = status;

    refreshView();
    showDashboardMessage("Estado actualizado correctamente.", "success");
  } catch (error) {
    console.error(error);
    showDashboardMessage(`No se pudo actualizar el estado: ${error.message}`, "error");
    await loadRecords();
  }
}

function exportCsv() {
  const filtered = applyFilters(allRecords);
  if (!filtered.length) {
    showDashboardMessage("No hay datos para exportar.", "error");
    return;
  }

  const headers = [
    "ID","Fecha registro","Nombres","Apellidos","Edad","Fecha nacimiento","DNI",
    "Curso","Division","Institucion","Competencia","Tematica","Estado","Timestamp ISO"
  ];

  const rows = filtered.map((item) => [
    item.id,
    item.created_at,
    item.first_name,
    item.last_name,
    item.age,
    item.birth_date,
    item.dni,
    item.course,
    item.division,
    item.institution,
    item.competition,
    item.theme,
    item.status,
    item.submitted_at_iso
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => {
      const cell = String(value ?? "");
      return /[",;\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
    }).join(";"))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const fileName = `inscripciones-oatec-${new Date().toISOString().slice(0, 10)}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showDashboardMessage("CSV exportado correctamente.", "success");
}

async function handleLogout() {
  const client = getSupabaseClient();
  await client.auth.signOut();
  allRecords = [];
  recordsTableBody.innerHTML = '<tr><td colspan="8" class="empty-state-cell">Sesión cerrada.</td></tr>';
  loginCard.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  showLoginMessage("Sesión cerrada.", "success");
}

themeToggle.addEventListener("click", toggleTheme);
loginForm.addEventListener("submit", handleLogin);
refreshButton.addEventListener("click", loadRecords);
exportButton.addEventListener("click", exportCsv);
logoutButton.addEventListener("click", handleLogout);
searchInput.addEventListener("input", refreshView);
statusFilter.addEventListener("change", refreshView);
courseFilter.addEventListener("change", refreshView);

initTheme();
ensureSession();
