// Life Hack OS – UI Wiring (UPGRADED with persistence)

// Helpers to safely use localStorage
function loadNumber(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  } catch (e) {
    return fallback;
  }
}

function saveNumber(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    // ignore if storage not available
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ================== BOTTOM NAV: SCREEN SWITCHING ==================
  const screens = document.querySelectorAll(".screen");
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-screen-target");

      screens.forEach((s) => {
        s.classList.toggle("screen-active", s.dataset.screen === target);
      });

      navItems.forEach((n) => n.classList.remove("nav-item-active"));
      btn.classList.add("nav-item-active");
    });
  });

  // ================== HEALTH TABS ==================
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("tab-active"));
      tab.classList.add("tab-active");

      tabContents.forEach((content) => {
        const isActive = content.getAttribute("data-tab-content") === target;
        content.classList.toggle("tab-content-active", isActive);
      });
    });
  });

  // ================== ASK AI PANEL OPEN/CLOSE ==================
  const askAiBtn = document.getElementById("askAiBtn");
  const askAiPanel = document.getElementById("askAiPanel");
  const askAiClose = document.getElementById("askAiClose");

  if (askAiBtn && askAiPanel && askAiClose) {
    askAiBtn.addEventListener("click", () => {
      askAiPanel.classList.add("ask-ai-open");
    });

    askAiClose.addEventListener("click", () => {
      askAiPanel.classList.remove("ask-ai-open");
    });
  }

  // ================== ASK AI – TONE TOGGLE (PERSISTENT) ==================
  let currentTone = (function () {
    try {
      return localStorage.getItem("lh_currentTone") || "coach";
    } catch (e) {
      return "coach";
    }
  })();

  const toneButtons = document.querySelectorAll(".tone-btn");

  // Initial tone button state
  toneButtons.forEach((btn) => {
    const tone = btn.getAttribute("data-tone") || "coach";
    if (tone === currentTone) {
      btn.classList.add("tone-active");
    } else {
      btn.classList.remove("tone-active");
    }
  });

  toneButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toneButtons.forEach((b) => b.classList.remove("tone-active"));
      btn.classList.add("tone-active");
      currentTone = btn.getAttribute("data-tone") || "coach";
      try {
        localStorage.setItem("lh_currentTone", currentTone);
      } catch (e) {
        // ignore
      }
    });
  });

  // ================== ASK AI – SIMPLE BRAIN + FREE QUESTION COUNTER ==================
  const messagesContainer = document.getElementById("askAiMessages");
  const askAiInput = document.getElementById("askAiInput");
  const askAiSend = document.getElementById("askAiSend");
  const askAiFooter = document.getElementById("askAiFooter");

  let freeQuestions = loadNumber("lh_freeQuestions", 3);

  function updateFreeQuestionsFooter() {
    if (!askAiFooter) return;
    if (freeQuestions > 0) {
      askAiFooter.textContent = `${freeQuestions} free questions left · Upgrade for unlimited`;
    } else {
      askAiFooter.textContent =
        "Free questions used · Upgrade for unlimited coaching (future feature).";
    }
  }

  updateFreeQuestionsFooter();

   function buildCoachReply(question) {
    const q = (question || "").toLowerCase();

    // If kidney mode is on, we bias almost EVERYTHING toward kidney protection
    if (kidneyModeOn) {
      if (q.includes("eat") || q.includes("food") || q.includes("diet")) {
        return "Kidney-first plan: low sodium, simple ingredients. Think baked or grilled protein, steamed or frozen veggies without heavy sauce, and rice/beans with light seasoning. Avoid canned soups, instant noodles, and salty snacks. Always run big changes past your kidney doctor.";
      }

      if (q.includes("water") || q.includes("drink") || q.includes("hydration")) {
        return "Hydration matters, but the exact amount depends on your kidneys and heart. Follow the daily fluid limit your doctor gave you. Use this app to stay close to that number—not to randomly chug water.";
      }

      if (q.includes("sodium") || q.includes("salt")) {
        return "Your kidneys LOVE low-sodium days. Keep most meals under heavy salt. Choose fresh or frozen over canned, skip the extra soy sauce and seasoning packets, and taste your food before you reach for the salt shaker.";
      }
    }

    // Kidney-specific question even if not explicit “mode”
    if (q.includes("kidney")) {
      return "Kidney mode ON: low sodium, controlled fluids, movement, and careful with meds. You win by being boring and consistent. Build a cheap rotation: rice/beans, grilled or baked chicken, steamed veggies, and water or unsweet tea. Confirm details with your kidney doctor or dietitian.";
    }

    if (q.includes("money") || q.includes("spend") || q.includes("broke") || q.includes("budget")) {
      return "Money talk: for the next 7 days, track EVERY dollar. No guessing. Once you see where it goes, we cut one expensive habit and move that money to bills, meds, or savings.";
    }

    if (q.includes("weight") || q.includes("fat") || q.includes("lose")) {
      return "Weight loss is consistency, not torture. Pick ONE: daily step goal or daily sugar cap. Hit that for 14 days straight. We build from there.";
    }

    if (q.includes("style") || q.includes("clothes") || q.includes("outfit")) {
      return "Style rule: clean, fitted, and simple beats loud and sloppy. Dark pants, clean sneakers, sharp jacket or top. You’ll look like you have your life together even on off days.";
    }

    if (q.includes("tired") || q.includes("sleep")) {
      return "Sleep is kidney-support too. Better rest helps blood pressure and sugar control. Pick a shutdown time tonight and honor it like a contract.";
    }

    if (q.includes("motivation") || q.includes("lazy") || q.includes("stuck")) {
      return "Motivation comes AFTER action. Set a 10-minute timer and do one small task—walk, drink water, prep a low-sodium meal, or pay a bill. When the timer ends, you’re allowed to stop. Most days, you won’t.";
    }

    // Default based on tone
    if (currentTone === "gentle") {
      return "Take a breath. You don’t have to fix everything today. Pick one small kidney-safe move: drink within your fluid limit, pick a low-sodium meal, or take a short walk. Then give yourself credit for it.";
    }

    return "You already know the next right step. Your job is to DO it, not overthink it. Make one kidney-safe decision in the next 30 minutes—less salt, better meal, small walk—before you open social media again.";
  }

  function appendMessage(text, from = "ai") {
    if (!messagesContainer) return;
    const msg = document.createElement("div");
    msg.classList.add("msg", from === "user" ? "msg-user" : "msg-ai");
    msg.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function sendQuestion() {
    if (!askAiInput || !askAiSend) return;
    const question = askAiInput.value.trim();
    if (!question) return;

    if (freeQuestions <= 0) {
      appendMessage(
        "Free limit hit. Imagine this is where the upgrade paywall kicks in. For now, reset your brain by taking one small action from our last answer.",
        "ai"
      );
      return;
    }

    appendMessage(question, "user");
    const reply = buildCoachReply(question);
    appendMessage(reply, "ai");

    freeQuestions -= 1;
    saveNumber("lh_freeQuestions", freeQuestions);
    updateFreeQuestionsFooter();

    askAiInput.value = "";
  }

  if (askAiSend && askAiInput) {
    askAiSend.addEventListener("click", sendQuestion);
    askAiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendQuestion();
      }
    });
  }

  // ================== HYDRATION LOGIC (PERSISTENT) ==================
  const hydrationText = document.getElementById("hydrationText");
  const hydrationFill = document.getElementById("hydrationFill");
  const hydrationNote = document.getElementById("hydrationNote");
  const todayWaterText = document.getElementById("todayWaterText");
  const btnLogGlass = document.getElementById("btnLogGlass");
  const btnLogCustom = document.getElementById("btnLogCustom");

  let waterCurrent = loadNumber("lh_waterCurrent", 5);
  const waterGoal = 8;

  function updateHydrationUI() {
    if (hydrationText) {
      hydrationText.textContent = `${waterCurrent} / ${waterGoal} glasses`;
    }
    if (todayWaterText) {
      todayWaterText.textContent = `${waterCurrent} / ${waterGoal} glasses`;
    }
    if (hydrationFill) {
      const pct = Math.max(0, Math.min(100, (waterCurrent / waterGoal) * 100));
      hydrationFill.style.height = `${pct}%`;
    }
    if (hydrationNote) {
      const diff = waterGoal - waterCurrent;
      if (diff > 0) {
        hydrationNote.textContent = `You’re ${diff} glass${diff === 1 ? "" : "es"} short of your goal. Take one now.`;
      } else {
        hydrationNote.textContent = "Hydration goal hit. Maintain it and your energy will thank you.";
      }
    }
    saveNumber("lh_waterCurrent", waterCurrent);
  }

  updateHydrationUI();

  if (btnLogGlass) {
    btnLogGlass.addEventListener("click", () => {
      waterCurrent = Math.min(waterGoal + 4, waterCurrent + 1); // allow a bit above goal
      updateHydrationUI();
    });
  }

  if (btnLogCustom) {
    btnLogCustom.addEventListener("click", () => {
      const input = prompt("How many glasses of water have you had today?");
      if (!input) return;
      const value = Number(input);
      if (Number.isNaN(value) || value < 0) {
        alert("Enter a valid number.");
        return;
      }
      waterCurrent = value;
      updateHydrationUI();
    });
  }

  // Quick action on Today: "+ Log water" etc.
  const todayQuickActions = document.querySelectorAll(".quick-actions-today .chip");
  todayQuickActions.forEach((chip) => {
    chip.addEventListener("click", () => {
      const text = chip.textContent.toLowerCase();
      if (text.includes("log water")) {
        waterCurrent = Math.min(waterGoal + 4, waterCurrent + 1);
        updateHydrationUI();
      } else if (text.includes("check weather")) {
        alert("Future feature: real-time weather API and outfit picker. For now, assume Texas: hydrate and dress in layers.");
      } else if (text.includes("scan outfit")) {
        alert("Future feature: scan clothes with camera and build your closet. For now, rock that navy jacket + pinstripe shirt.");
      } else if (text.includes("add expense")) {
        alert("Jump to the Money tab to track spending. Quick-add buttons there simulate expenses right now.");
      }
    });
  });

  // ================== MONEY – QUICK ADD (PERSISTENT) ==================
  const moneySpentEl = document.getElementById("moneySpent");
  const moneyDiffEl = document.getElementById("moneyDiff");
  const moneyQuickChips = document.querySelectorAll(".quick-actions-money .chip");

  let moneySpent = loadNumber("lh_moneySpent", 312);
  let moneyVsLastWeek = loadNumber("lh_moneyVsLastWeek", 34);

  function updateMoneyUI() {
    if (moneySpentEl) {
      moneySpentEl.textContent = `$${moneySpent.toFixed(0)}`;
    }
    if (moneyDiffEl) {
      moneyDiffEl.textContent = `+ $${moneyVsLastWeek.toFixed(0)}`;
    }
    saveNumber("lh_moneySpent", moneySpent);
    saveNumber("lh_moneyVsLastWeek", moneyVsLastWeek);
  }

  updateMoneyUI();

  moneyQuickChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const amount = Number(chip.getAttribute("data-amount")) || 0;
      if (amount <= 0) return;
      moneySpent += amount;
      moneyVsLastWeek += amount * 0.5; // fake comparison
      updateMoneyUI();
    });
  });

  // ================== COACH PEP TALK BUTTON ==================
  const btnPepTalk = document.getElementById("btnPepTalk");
  const coachQuote = document.getElementById("coachQuote");

  const pepTalks = [
    "This time next year, your future self will either thank you or blame you. Today decides which one it is.",
    "Drink water, move 10 minutes, and spend with intention. Those three alone will change your whole life.",
    "You’ve survived every bad day so far. Now it’s time to build days you actually enjoy living.",
    "You’re not behind—you’re just starting your serious chapter. Act like it.",
    "No more ‘all or nothing’. Today is ‘something or nothing’. Choose something."
  ];

  if (btnPepTalk && coachQuote) {
    btnPepTalk.addEventListener("click", () => {
      const random = pepTalks[Math.floor(Math.random() * pepTalks.length)];
      coachQuote.textContent = random;
    });
  }

  console.log("Life Hack OS wiring script (UPGRADED) loaded.");
});
