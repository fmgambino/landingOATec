const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyqrNBhNjxYwUoa23_LW5A7xUvzM9SwiHYg4TLC9ZgObeIRx48L0RM7nd-fY0bzqsze/exec";

const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const form = document.getElementById("inscriptionForm");
const iframe = document.getElementById("hidden_iframe");
const messageBox = document.getElementById("formMessage");
const submitButton = form.querySelector('button[type="submit"]');
const birthDateInput = document.getElementById("birthDate");
const ageInput = document.getElementById("age");
const dniInput = document.getElementById("dni");
const createdAtField = document.getElementById("createdAtField");

const THEME_KEY = "oatec-theme";
let submitStarted = false;
let submitTimeoutId = null;

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
  if (type) {
    messageBox.classList.add(type);
  }
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
  return String(calculateAge(birthDate)) === String(age);
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

function setSubmittingState(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Enviando..." : "Enviar inscripción";
}

function resetSubmissionState() {
  submitStarted = false;

  if (submitTimeoutId) {
    clearTimeout(submitTimeoutId);
    submitTimeoutId = null;
  }

  setSubmittingState(false);
}

function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    age: document.getElementById("age").value.trim(),
    birthDate: document.getElementById("birthDate").value,
    dni: document.getElementById("dni").value.trim(),
    course: document.getElementById("course").value,
    division: document.getElementById("division").value
  };

  if (!validateFormData(payload)) return;

  if (!form) {
    showMessage("No se encontró el formulario.", "error");
    return;
  }

  if (!iframe) {
    showMessage("No se encontró el iframe oculto.", "error");
    return;
  }

  if (!createdAtField) {
    showMessage("Falta el campo oculto createdAtField en el HTML.", "error");
    return;
  }

  form.action = GOOGLE_SCRIPT_URL;
  form.method = "POST";
  form.target = "hidden_iframe";

  createdAtField.value = new Date().toISOString();

  submitStarted = true;
  setSubmittingState(true);
  showMessage("Enviando inscripción...");

  try {
    form.submit();
  } catch (error) {
    console.error(error);
    resetSubmissionState();
    showMessage("No se pudo enviar el formulario.", "error");
    return;
  }

  submitTimeoutId = window.setTimeout(() => {
    if (!submitStarted) return;

    resetSubmissionState();
    showMessage(
      "Formulario enviado. Si no impacta en la planilla, revisá el deployment del Web App y que esté publicado para Anyone.",
      "error"
    );
  }, 8000);
}

iframe.addEventListener("load", () => {
  if (!submitStarted) return;

  resetSubmissionState();
  showMessage("Solicitud enviada. Verificá la planilla para confirmar el registro.", "success");
  form.reset();
});

themeToggle.addEventListener("click", toggleTheme);
birthDateInput.addEventListener("change", autoFillAge);
dniInput.addEventListener("input", sanitizeDniInput);
form.addEventListener("submit", handleSubmit);

initTheme();