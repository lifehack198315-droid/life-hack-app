// Think of this as the wiring & plumbing: it makes the UI actually move and react.

// ========= SCREEN SWITCHING =========
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });
}

// Back buttons & navigation pills
document.querySelectorAll("[data-target-screen]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target-screen");
    showScreen(target);
  });
});

// Energy & Safety square -> Page 2
const energySafetyBtn = document.getElementById("energySafetyBtn");
if (energySafetyBtn) {
  energySafetyBtn.addEventListener("click", () => {
    showScreen("screen-safety");
  });
}

// ========= HOME TABS (PLACEHOLDERS FOR NOW) =========
function niceToast(msg) {
  alert(msg); // later we can swap this for a custom popup
}

document.querySelectorAll("[data-action]").forEach((pill) => {
  pill.addEventListener("click", () => {
    const action = pill.getAttribute("data-action");
    switch (action) {
      case "log-water":
        niceToast("Water log coming soon: this will track your daily water intake.");
        break;
      case "log-meal":
        niceToast("Meal log / scanner coming soon: this will track meals and nutrition.");
        break;
      case "grocery-list":
        niceToast("Grocery list coming soon: add items, track what you're running low on.");
        break;
      case "weather":
        showScreen("screen-safety");
        break;
      default:
        niceToast("Feature coming soon.");
    }
  });
});

// ========= ENERGY & SAFETY INTERACTIONS =========
const safetySummary = document.getElementById("safetySummary");

function updateSummary(message) {
  if (!safetySummary) return;
  safetySummary.textContent = message;
}

const uvPill = document.getElementById("pill-uv");
if (uvPill) {
  uvPill.addEventListener("click", () => {
    updateSummary(
      "UV index example: 7 (high). Wear sunscreen, sunglasses, and limit direct sun during peak hours."
    );
  });
}

const tempPill = document.getElementById("pill-temp");
if (tempPill) {
  tempPill.addEventListener("click", () => {
    updateSummary(
      "Temperature example: 89°F, sunny. Stay hydrated, take breaks in the shade, and avoid overexertion."
    );
  });
}

const weatherPill = document.getElementById("pill-weather");
if (weatherPill) {
  weatherPill.addEventListener("click", () => {
    updateSummary(
      "Weather snapshot example: Clear skies, moderate pollution, light breeze. Good for a walk with sun protection."
    );
  });
}

const askAiPill = document.getElementById("pill-ask-ai");
if (askAiPill) {
  askAiPill.addEventListener("click", () => {
    const question = prompt(
      "Ask AI about healthy eating, sexual health, mental health, or general wellness:"
    );
    if (!question) return;

    // Simple canned response for now.
    alert(
      "Great question. In the real app, this box will connect to a powerful AI coach.\n\n" +
        "For now, remember: small consistent habits beat big temporary changes. " +
        "Eat mostly whole foods, stay hydrated, move your body daily, and reach out for professional help when you need it."
    );
  });
}

// ========= MENTAL HEALTH CHECK-IN =========
const mentalForm = document.getElementById("mentalForm");
const mentalResult = document.getElementById("mentalResult");

if (mentalForm && mentalResult) {
  mentalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect scores
    const q1 = Number(
      (mentalForm.querySelector('input[name="q1"]:checked') || {}).value || 0
    );
    const q2 = Number(
      (mentalForm.querySelector('input[name="q2"]:checked') || {}).value || 0
    );
    const q3 = Number(
      (mentalForm.querySelector('input[name="q3"]:checked') || {}).value || 0
    );

    const total = q1 + q2 + q3;

    let headline = "";
    let message = "";

    if (total <= 2) {
      headline = "You seem mostly okay right now.";
      message =
        "Keep checking in with yourself, keep healthy routines, and don’t wait until you’re overwhelmed to ask for help.";
    } else if (total <= 5) {
      headline = "You might be carrying a bit more stress than usual.";
      message =
        "That’s okay — it happens. Try to prioritize sleep, movement, and talking to someone you trust. If this sticks around, consider talking to a professional.";
    } else {
      headline = "You might be struggling more than you’d like to be.";
      message =
        "You deserve support. Consider reaching out to a mental health professional, your doctor, or a trusted person in your life. " +
        "If you ever feel like you might hurt yourself or are in danger, contact your local emergency number or, in the U.S., call or text 988 for immediate support.";
    }

    mentalResult.innerHTML =
      "<strong>" +
      headline +
      "</strong>" +
      "<span>" +
      message +
      "</span>";
  });
}
