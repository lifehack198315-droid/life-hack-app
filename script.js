// Life Hack OS - Core JS
// Focus: make Log Water tab + hydration UI + navigation work.

document.addEventListener("DOMContentLoaded", () => {
  // ========================= HELPERS =========================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function todayKey() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  // ========================= SCREEN NAV =========================
  const screens = $$(".screen");
  const navItems = $$(".bottom-nav .nav-item");

  function showScreen(name) {
    // Hide all screens
    screens.forEach((s) => {
      if (s.dataset.screen === name) {
        s.classList.add("screen-active");
      } else {
        s.classList.remove("screen-active");
      }
    });

    // Update bottom nav highlight (only if one matches)
    navItems.forEach((btn) => {
      const target = btn.dataset.screenTarget;
      if (target === name) {
        btn.classList.add("nav-item-active");
      } else {
        btn.classList.remove("nav-item-active");
      }
    });
  }

  // Bottom nav click handlers
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.screenTarget;
      if (target) {
        showScreen(target);
      }
    });
  });

  // Quick action chips to specific screens
  const btnGoWaterLog = $("#btnGoWaterLog");
  const btnGoAddExpense = $("#btnGoAddExpense");
  const btnGoWeatherWeek = $("#btnGoWeatherWeek");

  if (btnGoWaterLog) {
    btnGoWaterLog.addEventListener("click", () => showScreen("waterLog"));
  }
  if (btnGoAddExpense) {
    btnGoAddExpense.addEventListener("click", () => showScreen("addExpense"));
  }
  if (btnGoWeatherWeek) {
    btnGoWeatherWeek.addEventListener("click", () => showScreen("weatherWeek"));
  }

  // Top cards
  const cardWater = $("#card-water");
  const cardMeal = $("#card-meal");
  const cardReceipt = $("#card-receipt");
  const cardWeather = $("#card-weather");

  if (cardWater) {
    cardWater.addEventListener("click", () => showScreen("waterLog"));
  }
  if (cardMeal) {
    cardMeal.addEventListener("click", () => showScreen("health")); // could later go to a food logging screen
  }
  if (cardReceipt) {
    cardReceipt.addEventListener("click", () => showScreen("money"));
  }
  if (cardWeather) {
    cardWeather.addEventListener("click", () => showScreen("weatherWeek"));
  }

  // ========================= WATER / HYDRATION STATE =========================
  const DAILY_GOAL_GLASSES = 8;

  // Elements for "Log Water" screen
  const waterLogFill = $("#waterLogFill");
  const waterLogText = $("#waterLogText");
  const waterLogAddGlass = $("#waterLogAddGlass");
  const waterLogAddCustom = $("#waterLogAddCustom");

  // Elements for "Hydration" tab in Health
  const hydrationFill = $("#hydrationFill");
  const hydrationText = $("#hydrationText");
  const hydrationNote = $("#hydrationNote");
  const btnLogGlass = $("#btnLogGlass");
  const btnLogCustom = $("#btnLogCustom");

  // Element for Today screen summary bar
  const todayWaterText = $("#todayWaterText");

  // Load / reset daily water from localStorage
  let storedDate = localStorage.getItem("lh_waterDate");
  let waterGlasses = Number(localStorage.getItem("lh_waterGlasses") || 0);
  const today = todayKey();

  if (storedDate !== today) {
    // New day, reset
    waterGlasses = 0;
    localStorage.setItem("lh_waterGlasses", "0");
    localStorage.setItem("lh_waterDate", today);
  }

  function saveWater() {
    localStorage.setItem("lh_waterGlasses", String(waterGlasses));
    localStorage.setItem("lh_waterDate", todayKey());
  }

  function clampPercent(val) {
    if (val < 0) return 0;
    if (val > 100) return 100;
    return val;
  }

  function updateWaterUI() {
    const percent = clampPercent((waterGlasses / DAILY_GOAL_GLASSES) * 100);

    // Log Water screen bottle
    if (waterLogFill) {
      waterLogFill.style.height = percent + "%";
    }
    if (waterLogText) {
      waterLogText.textContent = `Today: ${waterGlasses} glass${waterGlasses === 1 ? "" : "es"}`;
    }

    // Health -> Hydration tab bottle
    if (hydrationFill) {
      hydrationFill.style.height = percent + "%";
    }
    if (hydrationText) {
      hydrationText.textContent = `${waterGlasses} / ${DAILY_GOAL_GLASSES} glasses`;
    }
    if (hydrationNote) {
      const remaining = DAILY_GOAL_GLASSES - waterGlasses;
      if (remaining > 2) {
        hydrationNote.textContent = `You’re ${remaining} glasses short of your goal. Take one now.`;
      } else if (remaining > 0) {
        hydrationNote.textContent = `So close. ${remaining} more glass${remaining === 1 ? "" : "es"} to crush today.`;
      } else {
        hydrationNote.textContent = "Goal hit. Great discipline. Keep sipping steady, not crazy.";
      }
    }

    // Today screen mini status
    if (todayWaterText) {
      todayWaterText.textContent = `${waterGlasses} / ${DAILY_GOAL_GLASSES} glasses`;
    }
  }

  // Run once on load
  updateWaterUI();

  function addGlasses(amount) {
    if (!amount || amount <= 0) return;
    waterGlasses += amount;
    if (waterGlasses < 0) waterGlasses = 0;
    saveWater();
    updateWaterUI();
  }

  function promptCustomGlasses() {
    const input = prompt("How many glasses do you want to log? (e.g. 0.5, 1, 2)");
    if (input === null) return; // cancelled
    const num = Number(input);
    if (!num || num <= 0) {
      alert("Enter a positive number.");
      return;
    }
    addGlasses(num);
  }

  // ===== Buttons on Log Water screen =====
  if (waterLogAddGlass) {
    waterLogAddGlass.addEventListener("click", () => addGlasses(1));
  }
  if (waterLogAddCustom) {
    waterLogAddCustom.addEventListener("click", () => promptCustomGlasses());
  }

  // ===== Buttons on Hydration tab in Health =====
  if (btnLogGlass) {
    btnLogGlass.addEventListener("click", () => addGlasses(1));
  }
  if (btnLogCustom) {
    btnLogCustom.addEventListener("click", () => promptCustomGlasses());
  }

  // ========================= (OPTIONAL) PEP TALK BUTTON =========================
  const btnPepTalk = $("#btnPepTalk");
  const coachQuote = $("#coachQuote");

  if (btnPepTalk && coachQuote) {
    const pepTalks = [
      "This time next year they won’t recognize you. One glass of water, one walk, one smart money move at a time.",
      "You’re not behind. You’re just getting honest. Stack one win today and make future-you proud.",
      "Discipline is just choosing what you want most over what you want now. Start with one small action.",
      "You’ve survived 100% of your worst days. Today is for building, not doubting.",
      "Small habits, big revenge story. They’ll see it when the results hit."
    ];

    btnPepTalk.addEventListener("click", () => {
      const pick = pepTalks[Math.floor(Math.random() * pepTalks.length)];
      coachQuote.textContent = pick;
    });
  }

  // ========================= ASK AI PANEL (OPEN/CLOSE ONLY) =========================
  const askAiBtn = $("#askAiBtn");
  const askAiPanel = $("#askAiPanel");
  const askAiClose = $("#askAiClose");

  if (askAiBtn && askAiPanel) {
    askAiBtn.addEventListener("click", () => {
      askAiPanel.classList.add("ask-ai-open");
    });
  }

  if (askAiClose && askAiPanel) {
    askAiClose.addEventListener("click", () => {
      askAiPanel.classList.remove("ask-ai-open");
    });
  }
});

