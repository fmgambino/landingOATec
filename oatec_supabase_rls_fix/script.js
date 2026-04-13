
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const form = document.getElementById("inscriptionForm");
const messageBox = document.getElementById("formMessage");
const submitButton = form.querySelector('button[type="submit"]');
const birthDateInput = document.getElementById("birthDate");
const ageInput = document.getElementById("age");
const dniInput = document.getElementById("dni");
const createdAtField = document.getElementById("createdAtField");
const honeypotInput = document.getElementById("website");

const THEME_KEY = "oatec-theme";
const CONFIG = window.SUPABASE_CONFIG || {};

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

function showMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "form-message";
  if (type) messageBox.classList.add(type);
}

function calculateAge(birthDate) {
  if (!birthDate) return "";
  const today = new Date();
  const born = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(born.getTime())) return "";

  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  const dayDiff = today.getDate() - born.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
  return age;
}

function validateAgeConsistency(birthDate, age) {
  return String(calculateAge(birthDate)) === String(age);
}

function sanitizeDniInput() {
  dniInput.value = dniInput.value.replace(/\D/g, "").slice(0, 8);
}

function autoFillAge() {
  const calculatedAge = calculateAge(birthDateInput.value);
  if (calculatedAge !== "") ageInput.value = calculatedAge;
}

function validateConfig() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY || !CONFIG.TABLE_NAME) {
    showMessage("Falta completar config.js con la URL, anon key y tabla de Supabase.", "error");
    return false;
  }
  if (/PEGAR_AQUI/.test(CONFIG.SUPABASE_URL) || /PEGAR_AQUI/.test(CONFIG.SUPABASE_ANON_KEY)) {
    showMessage("Todavía no completaste los datos reales de Supabase en config.js.", "error");
    return false;
  }
  return true;
}

function validateFormData(data) {
  if (!data.first_name || !data.last_name) {
    showMessage("Completá nombres y apellidos.", "error");
    return false;
  }
  if (!data.birth_date) {
    showMessage("Ingresá la fecha de nacimiento.", "error");
    return false;
  }
  const age = Number(data.age);
  if (!Number.isInteger(age) || age < 12 || age > 21) {
    showMessage("Ingresá una edad válida entre 12 y 21 años.", "error");
    return false;
  }
  if (!validateAgeConsistency(data.birth_date, data.age)) {
    showMessage("La edad no coincide con la fecha de nacimiento.", "error");
    return false;
  }
  if (!/^\d{7,8}$/.test(data.dni)) {
    showMessage("Ingresá un DNI válido de 7 u 8 números.", "error");
    return false;
  }
  if (!["4", "5", "6", "7"].includes(data.course)) {
    showMessage("Seleccioná un curso válido.", "error");
    return false;
  }
  if (!["A", "B", "C"].includes(data.division)) {
    showMessage("Seleccioná una división válida.", "error");
    return false;
  }
  if (honeypotInput.value.trim() !== "") {
    showMessage("No se pudo enviar el formulario.", "error");
    return false;
  }
  return true;
}

function setSubmittingState(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Enviando..." : "Enviar inscripción";
}

function buildPayload() {
  const createdAt = new Date().toISOString();
  createdAtField.value = createdAt;

  return {
    first_name: document.getElementById("firstName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    age: Number(document.getElementById("age").value.trim()),
    birth_date: document.getElementById("birthDate").value,
    dni: document.getElementById("dni").value.trim(),
    course: document.getElementById("course").value,
    division: document.getElementById("division").value,
    institution: "Instituto San Miguel",
    competition: "OATec ITBA 2026",
    theme: document.getElementById("themeField").value,
    submitted_at_iso: createdAt,
    source: "github-pages",
    status: "pendiente"
  };
}

async function sendToSupabase(payload) {
  const endpoint = `${CONFIG.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(CONFIG.TABLE_NAME)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": CONFIG.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(payload)
  });

  let responseBody = null;
  try { responseBody = await response.json(); } catch (_e) { responseBody = null; }

  if (!response.ok) {
    const detail = responseBody?.message || responseBody?.error_description || responseBody?.details || responseBody?.hint || `HTTP ${response.status}`;
    throw new Error(detail);
  }
  return responseBody;
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!validateConfig()) return;

  const payload = buildPayload();
  if (!validateFormData(payload)) return;

  setSubmittingState(true);
  showMessage("Enviando inscripción...");
  try {
    await sendToSupabase(payload);
    showMessage("Inscripción enviada correctamente. Tus datos ya quedaron registrados.", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    showMessage(`No se pudo guardar la inscripción: ${error.message}`, "error");
  } finally {
    setSubmittingState(false);
  }
}

themeToggle.addEventListener("click", toggleTheme);
birthDateInput.addEventListener("change", autoFillAge);
dniInput.addEventListener("input", sanitizeDniInput);
form.addEventListener("submit", handleSubmit);
initTheme();
