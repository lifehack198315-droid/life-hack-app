// ========= CONFIG =========
// Your OpenWeatherMap API key (already filled in)
const OPENWEATHER_API_KEY = "2560f399beb12ade5c9664c4f97e418a";


// ========= SCREEN SWITCHING =========
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });
}

document.querySelectorAll("[data-target-screen]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target-screen");
    showScreen(target);
  });
});


// ========= ENERGY & SAFETY BUTTON =========
const energySafetyBtn = document.getElementById("energySafetyBtn");
if (energySafetyBtn) {
  energySafetyBtn.addEventListener("click", () => {
    showScreen("screen-safety");
  });
}


// ========= TOAST MESSAGE =========
function niceToast(msg) {
  alert(msg);
}


// ========= HOME ACTION BUTTONS =========
document.querySelectorAll("[data-action]").forEach((pill) => {
  pill.addEventListener("click", () => {
    const action = pill.getAttribute("data-action");

    switch (action) {
      case "log-water":
        showScreen("screen-water");
        break;

      case "log-meal":
        showScreen("screen-meal");
        break;

      case "grocery-list":
        niceToast("Grocery list coming soon.");
        break;

      case "weather":
        showScreen("screen-safety");
        break;

      default:
        niceToast("Feature coming soon.");
    }
  });
});


// ========= WATER TRACKER =========
const waterForm = document.getElementById("waterForm");
const waterAmountInput = document.getElementById("waterAmount");
const waterTimeInput = document.getElementById("waterTime");
const waterList = document.getElementById("waterList");
const waterTotalEl = document.getElementById("waterTotal");

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadWaterLogs() {
  return JSON.parse(localStorage.getItem("water_" + getTodayKey())) || [];
}

function saveWaterLogs(logs) {
  localStorage.setItem("water_" + getTodayKey(), JSON.stringify(logs));
}

function renderWaterLogs() {
  if (!waterList || !waterTotalEl) return;
  const logs = loadWaterLogs();
  waterList.innerHTML = "";
  let total = 0;

  logs.forEach((log) => {
    const li = document.createElement("li");
    li.textContent = `${log.amount} oz at ${log.time}`;
    waterList.appendChild(li);
    total += log.amount;
  });

  waterTotalEl.textContent = `Total: ${total} oz`;
}

if (waterForm) {
  waterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = Number(waterAmountInput.value);
    if (!amount) return;

    const time = waterTimeInput.value
      ? new Date(waterTimeInput.value).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const logs = loadWaterLogs();
    logs.unshift({ amount, time });
    saveWaterLogs(logs);
    renderWaterLogs();

    waterAmountInput.value = "";
    waterTimeInput.value = "";
  });

  renderWaterLogs();
}


// ========= MEAL TRACKER =========
const mealForm = document.getElementById("mealForm");
const mealList = document.getElementById("mealList");

function loadMeals() {
  return JSON.parse(localStorage.getItem("meals")) || [];
}

function saveMeals(meals) {
  localStorage.setItem("meals", JSON.stringify(meals));
}

function renderMeals() {
  if (!mealList) return;
  const meals = loadMeals();
  mealList.innerHTML = "";

  if (meals.length === 0) {
    const li = document.createElement("li");
    li.textContent =
      "No meals logged yet. Start with your next meal, not yesterday's guilt.";
    mealList.appendChild(li);
    return;
  }

  meals.forEach((meal) => {
    const li = document.createElement("li");
    let line = `${meal.time} – ${meal.name}`;
    if (meal.calories && meal.calories !== "?") {
      line += ` (${meal.calories} cal)`;
    }
    li.textContent = line;

    if (meal.notes) {
      const notes = document.createElement("div");
      notes.style.fontSize = "0.8rem";
      notes.style.color = "#9ca3af";
      notes.textContent = meal.notes;
      li.appendChild(notes);
    }

    mealList.appendChild(li);
  });
}

if (mealForm) {
  mealForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const mealNameEl = document.getElementById("mealName");
    const mealCaloriesEl = document.getElementById("mealCalories");
    const mealNotesEl = document.getElementById("mealNotes");

    const name = mealNameEl.value.trim();
    const calories = mealCaloriesEl.value
      ? mealCaloriesEl.value.trim()
      : "?";
    const notes = mealNotesEl.value.trim();

    if (!name) {
      niceToast("Name the meal first.");
      return;
    }

    const time = new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const meals = loadMeals();
    meals.unshift({ name, calories, notes, time });
    saveMeals(meals);
    renderMeals();

    mealForm.reset();
  });

  renderMeals();
}


// ========= WEATHER API =========
const weatherForm = document.getElementById("weatherForm");
const zipInput = document.getElementById("zipInput");
const weatherDetails = document.getElementById("weatherDetails");
const safetySummary = document.getElementById("safetySummary");

let lastWeather = null;

async function fetchWeather(zip) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("Missing API key");
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
    zip
  )},US&units=imperial&appid=${OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather not found");
  return res.json();
}

if (weatherForm && zipInput && weatherDetails) {
  weatherForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const zip = zipInput.value.trim();
    if (!zip) return;

    weatherDetails.textContent = "Loading...";

    try {
      const data = await fetchWeather(zip);
      lastWeather = data;

      const city = data.name;
      const temp = Math.round(data.main.temp);
      const feels = Math.round(data.main.feels_like);
      const cond = data.weather[0].description;
      const humidity = data.main.humidity;
      const wind = Math.round(data.wind.speed);

      weatherDetails.innerHTML =
        `<strong>${city}</strong><br>` +
        `Temp: ${temp}°F (feels like ${feels}°F)<br>` +
        `Conditions: ${cond}<br>` +
        `Humidity: ${humidity}% · Wind: ${wind} mph`;

      if (safetySummary) {
        safetySummary.textContent =
          `In ${city}, it's ${temp}°F and ${cond}. Dress for ${feels}°F and stay hydrated.`;
      }
    } catch (err) {
      console.error(err);
      weatherDetails.textContent =
        "Could not load weather. Check ZIP or try again.";
    }
  });
}


// ========= SAFETY PILLS =========
function updateSummary(msg) {
  if (safetySummary) safetySummary.textContent = msg;
}

const uvPill = document.getElementById("pill-uv");
if (uvPill) {
  uvPill.addEventListener("click", () => {
    if (!lastWeather) {
      updateSummary("Run a weather check first, then tap this again.");
      return;
    }
    const main = lastWeather.weather[0].main.toLowerCase();
    let msg =
      "UV is probably moderate. Sunscreen is smart if you're outside for a while.";
    if (main.includes("clear")) {
      msg =
        "Likely stronger UV. Use SPF 30+, sunglasses, and limit midday sun.";
    } else if (main.includes("cloud")) {
      msg =
        "Clouds help, but UV still gets through. Sunscreen is still a good idea for long time outside.";
    }
    updateSummary(msg);
  });
}

const tempPill = document.getElementById("pill-temp");
if (tempPill) {
  tempPill.addEventListener("click", () => {
    if (!lastWeather) {
      updateSummary("Check the weather first so I know what you're walking into.");
      return;
    }
    const feels = Math.round(lastWeather.main.feels_like);
    let msg = `Feels like around ${feels}°F. `;
    if (feels >= 90) {
      msg +=
        "That's hot. Hydrate, avoid heavy work in peak heat, and take shade breaks.";
    } else if (feels >= 75) {
      msg +=
        "Warm and good for activity. Still hydrate and listen to your body.";
    } else if (feels <= 40) {
      msg +=
        "Cold. Layer up, cover hands/ears, and limit long exposure if it's windy.";
    } else {
      msg +=
        "Comfortable for most people. Dress in light layers and move your body.";
    }
    updateSummary(msg);
  });
}

const weatherPill = document.getElementById("pill-weather");
if (weatherPill) {
  weatherPill.addEventListener("click", () => {
    if (!lastWeather) {
      updateSummary("Use your ZIP to pull weather first, then tap this.");
      return;
    }
    const cond = lastWeather.weather[0].description;
    const temp = Math.round(lastWeather.main.temp);
    updateSummary(`Overall conditions: ${cond}, about ${temp}°F.`);
  });
}


// ========= ASK AI =========
const askAiPill = document.getElementById("pill-ask-ai");
if (askAiPill) {
  askAiPill.addEventListener("click", () => {
    const q = prompt(
      "Ask AI about healthy eating, sexual health, mental health, or general wellness:"
    );
    if (!q) return;
    alert(
      "In the real version, this will send your question to an AI coach and display a full answer.\n\n" +
        "For now: remember, small consistent habits (sleep, food, movement, support) beat perfection."
    );
  });
}


// ========= MENTAL HEALTH CHECK =========
const mentalForm = document.getElementById("mentalForm");
const mentalResult = document.getElementById("mentalResult");

if (mentalForm && mentalResult) {
  mentalForm.addEventListener("submit", (e) => {
    e.preventDefault();

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
