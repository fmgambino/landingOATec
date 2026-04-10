const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby4J5XhtcyqpFjzB0D3RHPgy_VWCIoK6scH2s81h9NydzwkT7eD6zvHNHgE6v-4tU8/exec";

const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const form = document.getElementById("inscriptionForm");
const messageBox = document.getElementById("formMessage");
const submitButton = form.querySelector('button[type="submit"]');
const birthDateInput = document.getElementById("birthDate");
const ageInput = document.getElementById("age");
const dniInput = document.getElementById("dni");

const THEME_KEY = "oatec-theme";

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

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function validateAgeConsistency(birthDate, age) {
  const calculatedAge = calculateAge(birthDate);
  return String(calculatedAge) === String(age);
}

function sanitizeDniInput() {
  dniInput.value = dniInput.value.replace(/\D/g, "").slice(0, 8);
}

function autoFillAge() {
  const calculatedAge = calculateAge(birthDateInput.value);
  if (calculatedAge !== "") {
    ageInput.value = calculatedAge;
  }
}

function validateFormData(data) {
  if (!data.firstName || !data.lastName) {
    showMessage("Completá nombres y apellidos.", "error");
    return false;
  }

  if (!data.birthDate) {
    showMessage("Ingresá la fecha de nacimiento.", "error");
    return false;
  }

  const age = Number(data.age);
  if (!Number.isInteger(age) || age < 12 || age > 21) {
    showMessage("Ingresá una edad válida entre 12 y 21 años.", "error");
    return false;
  }

  if (!validateAgeConsistency(data.birthDate, data.age)) {
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

  return true;
}

function buildFormBody(payload) {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value ?? "");
  });

  return params;
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    age: document.getElementById("age").value.trim(),
    birthDate: document.getElementById("birthDate").value,
    dni: document.getElementById("dni").value.trim(),
    course: document.getElementById("course").value,
    division: document.getElementById("division").value,
    theme: "Desafío Espacial",
    institution: "Instituto San Miguel",
    competition: "OATec ITBA 2026",
    createdAt: new Date().toISOString()
  };

  if (!validateFormData(payload)) return;

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PEGAR_AQUI")) {
    showMessage("Configurá la URL pública del Web App de Google Apps Script en script.js.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  showMessage("Enviando inscripción...");

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: buildFormBody(payload)
    });

    showMessage("Inscripción enviada correctamente. Revisá la Google Sheet en unos segundos.", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    showMessage("Ocurrió un error al enviar los datos. Revisá la URL del Web App y que el despliegue esté accesible para cualquier usuario.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar inscripción";
  }
}

themeToggle.addEventListener("click", toggleTheme);
birthDateInput.addEventListener("change", autoFillAge);
dniInput.addEventListener("input", sanitizeDniInput);
form.addEventListener("submit", handleSubmit);

initTheme();
