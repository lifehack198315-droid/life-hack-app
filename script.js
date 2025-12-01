/* ============================================================
   Life Hack OS – Core App Script
   Structured state + UI controller + fake data layer
   ============================================================ */

/* ===================== GLOBAL APP STATE ===================== */

const LifeHackOS = (() => {
  const STORAGE_KEY = "life_hack_os_state_v1";

  // --------- Default state ----------
  const defaultState = {
    user: {
      name: "Joseph Stayton",
      initials: "J",
      streakDays: 6,
      theme: "dark",
      notificationLevel: "standard", // minimal | standard | intense
    },
    goals: {
      stepsPerDay: 10000,
      weeklySpendLimit: 250,
      waterGlassesPerDay: 8,
    },
    health: {
      steps: {
        walk: 4200,
        jog: 1100,
        run: 900,
      },
      caloriesBurned: 425,
      minutesActive: 52,
      sleepHours: 6.5,
      hydration: {
        glasses: 5,
      },
      sugar: {
        grams: 38,
        dailyCap: 50,
      },
      carbs: {
        grams: 145,
        dailyCap: 200,
      },
      conditions: {
        kidneySupport: true,
        weightLoss: true,
        diabetes: false,
      },
      meals: [
        {
          type: "Breakfast",
          time: "7:42 AM",
          description: "Oatmeal, banana",
          sugar: 8,
          carbs: 40,
          flagged: false,
        },
        {
          type: "Lunch",
          time: "12:11 PM",
          description: "Grilled chicken, rice",
          sugar: 4,
          carbs: 55,
          flagged: false,
        },
        {
          type: "Snack",
          time: "3:02 PM",
          description: "Soda (32g sugar)",
          sugar: 32,
          carbs: 48,
          flagged: true,
        },
      ],
      environment: {
        inside: false,
        uvIndex: 7,
        temperatureF: 88,
        minutesInSun: 22,
      },
    },
    style: {
      activeContext: "work", // work | gym | casual | date | event
      closetCounts: {
        tops: 24,
        bottoms: 15,
        shoes: 7,
        jackets: 5,
      },
      todaysOutfit: {
        label: "Smart casual · Weather-ready",
        items: [
          {
            name: "Navy jacket",
            description: "Clean, sharp outer layer",
          },
          {
            name: "Sky blue pinstripe shirt",
            description: "Contrast with jacket, brightens face",
          },
          {
            name: "Dark jeans",
            description: "Balanced and timeless",
          },
          {
            name: "White sneakers",
            description: "Keeps the look modern",
          },
        ],
      },
      weather: {
        tempF: 62,
        condition: "Partly cloudy",
        uvIndex: 5,
        notes: ["Light jacket", "Dry", "Mild breeze"],
      },
    },
    money: {
      thisWeekTotal: 312,
      deltaFromLastWeek: 34,
      categories: [
        { name: "Groceries", amount: 112 },
        { name: "Eating out", amount: 86 },
        { name: "Gas / transport", amount: 54 },
        { name: "Subscriptions", amount: 40 },
        { name: "Other", amount: 20 },
      ],
      transactions: [],
    },
    ai: {
      tone: "coach", // coach | gentle
      freeQuestionsLeft: 3,
      messages: [
        {
          from: "ai",
          text: `I’m your life coach in your pocket.\nAsk me anything about your health, habits, money, style, or day.`,
        },
        {
          from: "user",
          text: "What should I eat today with my kidney issues and my budget?",
        },
        {
          from: "ai",
          text: [
            "Alright, listen. We’re keeping sodium low and money in your pocket.",
            "Here’s a simple plan:",
            "• Breakfast: Oatmeal + berries",
            "• Lunch: Grilled chicken + steamed veggies (no heavy sauces)",
            "• Dinner: Rice + beans + side salad",
            "Drink water with every meal. No sugary drinks today. You can handle that.",
          ].join("\n"),
        },
      ],
    },
  };

  let state = loadState();

  // --------- Persistence ----------
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(defaultState), ...parsed };
    } catch (err) {
      console.warn("Failed to load state, using default:", err);
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Failed to save state:", err);
    }
  }

  // --------- Helpers ----------
  function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
  }

  function sum(arr, key = "amount") {
    return arr.reduce((acc, item) => acc + (item[key] || 0), 0);
  }

  function formatMoney(amount) {
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount).toFixed(0);
    return `${sign}$${abs}`;
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // --------- Public API ----------
  const api = {
    getState() {
      return state;
    },

    update(fn) {
      state = fn(structuredClone(state));
      saveState();
      return state;
    },

    // Health actions
    logWater(glasses = 1) {
      return api.update((draft) => {
        draft.health.hydration.glasses = clamp(
          draft.health.hydration.glasses + glasses,
          0,
          40
        );
        return draft;
      });
    },

    logMeal(meal) {
      return api.update((draft) => {
        draft.health.meals.push(meal);
        draft.health.sugar.grams = clamp(
          draft.health.sugar.grams + (meal.sugar || 0),
          0,
          500
        );
        draft.health.carbs.grams = clamp(
          draft.health.carbs.grams + (meal.carbs || 0),
          0,
          800
        );
        return draft;
      });
    },

    simulateSteps(extraWalk = 0, extraJog = 0, extraRun = 0) {
      return api.update((draft) => {
        draft.health.steps.walk += extraWalk;
        draft.health.steps.jog += extraJog;
        draft.health.steps.run += extraRun;
        const totalAdded = extraWalk + extraJog + extraRun;
        draft.health.caloriesBurned += Math.round(totalAdded * 0.04);
        draft.health.minutesActive += Math.round(totalAdded * 0.01);
        return draft;
      });
    },

    toggleCondition(name, on) {
      return api.update((draft) => {
        if (name in draft.health.conditions) {
          draft.health.conditions[name] =
            typeof on === "boolean"
              ? on
              : !draft.health.conditions[name];
        }
        return draft;
      });
    },

    // Style actions
    setStyleContext(context) {
      return api.update((draft) => {
        draft.style.activeContext = context;
        return draft;
      });
    },

    // Money actions
    addTransaction(tx) {
      return api.update((draft) => {
        draft.money.transactions.push(tx);
        const weekTotal = sum(draft.money.transactions, "amount");
        draft.money.thisWeekTotal = weekTotal;
        draft.money.deltaFromLastWeek = weekTotal - 278; // pretend last week baseline
        // Update categories if name matches
        const cat = draft.money.categories.find(
          (c) => c.name.toLowerCase() === tx.category.toLowerCase()
        );
        if (cat) {
          cat.amount += tx.amount;
        } else {
          draft.money.categories.push({
            name: tx.category,
            amount: tx.amount,
          });
        }
        return draft;
      });
    },

    // AI actions
    setAITone(tone) {
      return api.update((draft) => {
        draft.ai.tone = tone;
        return draft;
      });
    },

    addAIMessage(from, text) {
      return api.update((draft) => {
        draft.ai.messages.push({ from, text });
        return draft;
      });
    },

    useAIQuestion() {
      return api.update((draft) => {
        if (draft.ai.freeQuestionsLeft > 0) {
          draft.ai.freeQuestionsLeft -= 1;
        }
        return draft;
      });
    },

    // Fake small "environment" updates
    randomizeEnvironment() {
      return api.update((draft) => {
        const nowOutside = Math.random() > 0.4;
        draft.health.environment.inside = !nowOutside;
        draft.health.environment.uvIndex = Math.round(randomRange(0, 10));
        draft.health.environment.temperatureF = Math.round(
          randomRange(40, 102)
        );
        if (nowOutside) {
          draft.health.environment.minutesInSun = clamp(
            draft.health.environment.minutesInSun + Math.round(randomRange(1, 6)),
            0,
            180
          );
        }
        return draft;
      });
    },
  };

  return api;
})();

/* ===================== UI CONTROLLER ===================== */

const LifeHackUI = (() => {
  const selectors = {
    screens: ".screen",
    navItem: ".nav-item",
    activeScreenClass: "screen-active",
    activeNavClass: "nav-item-active",
    // Ask AI
    askAiBtn: "#askAiBtn",
    askAiPanel: "#askAiPanel",
    askAiClose: "#askAiClose",
    askAiMessages: ".ask-ai-messages",
    askAiInput: ".ask-ai-input",
    askAiSend: ".ask-ai-send",
    askAiToneButtons: ".tone-btn",
    askAiFooter: ".ask-ai-footer",
    // Health tabs
    tabButton: ".tab",
    tabContent: ".tab-content",
  };

  /* ---------- DOM Helper ---------- */
  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function setText(selector, text) {
    const el = $(selector);
    if (el) el.textContent = text;
  }

  /* ---------- Screen Navigation ---------- */
  function initScreenNavigation() {
    const screens = $all(selectors.screens);
    const navItems = $all(selectors.navItem);

    navItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-screen-target");
        if (!target) return;

        screens.forEach((screen) => {
          screen.classList.toggle(
            selectors.activeScreenClass,
            screen.dataset.screen === target
          );
        });

        navItems.forEach((nav) => nav.classList.remove(selectors.activeNavClass));
        btn.classList.add(selectors.activeNavClass);
      });
    });
  }

  /* ---------- Health Tabs ---------- */
  function initHealthTabs() {
    const tabs = $all(selectors.tabButton);
    const contents = $all(selectors.tabContent);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab");
        if (!target) return;

        tabs.forEach((t) => t.classList.remove("tab-active"));
        contents.forEach((c) =>
          c.classList.remove("tab-content-active")
        );

        tab.classList.add("tab-active");

        const activeContent = contents.find(
          (c) => c.getAttribute("data-tab-content") === target
        );
        if (activeContent) {
          activeContent.classList.add("tab-content-active");
        }
      });
    });
  }

  /* ---------- Ask AI Panel ---------- */
  function initAskAI() {
    const panel = $(selectors.askAiPanel);
    const openBtn = $(selectors.askAiBtn);
    const closeBtn = $(selectors.askAiClose);
    const input = $(selectors.askAiInput);
    const sendBtn = $(selectors.askAiSend);

    if (!panel || !openBtn || !closeBtn || !input || !sendBtn) {
      console.warn("Ask AI elements not found – check HTML structure.");
      return;
    }

    openBtn.addEventListener("click", () => {
      panel.classList.add("ask-ai-open");
      scrollAIMessagesToBottom();
      input.focus();
    });

    closeBtn.addEventListener("click", () => {
      panel.classList.remove("ask-ai-open");
    });

    sendBtn.addEventListener("click", handleAISend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAISend();
      }
    });

    // Tone toggle
    $all(selectors.askAiToneButtons).forEach((btn) => {
      btn.addEventListener("click", () => {
        const label = btn.textContent.trim().toLowerCase();
        const tone = label === "gentle" ? "gentle" : "coach";
        LifeHackOS.setAITone(tone);
        $all(selectors.askAiToneButtons).forEach((b) =>
          b.classList.remove("tone-active")
        );
        btn.classList.add("tone-active");
      });
    });

    renderAIMessages();
    renderAIFooter();
  }

  function handleAISend() {
    const input = $(selectors.askAiInput);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const stateBefore = LifeHackOS.getState();
    if (stateBefore.ai.freeQuestionsLeft <= 0) {
      LifeHackOS.addAIMessage(
        "ai",
        "You’ve hit your free question limit. Upgrade your membership to keep the conversation going."
      );
      renderAIMessages();
      scrollAIMessagesToBottom();
      return;
    }

    // Add user message + reduce free questions
    LifeHackOS.addAIMessage("user", text);
    LifeHackOS.useAIQuestion();

    renderAIMessages();
    scrollAIMessagesToBottom();
    input.value = "";

    // Simulate AI thinking with small delay
    setTimeout(() => {
      const tone = LifeHackOS.getState().ai.tone;
      const reply = generateAIReply(text, tone);
      LifeHackOS.addAIMessage("ai", reply);
      renderAIMessages();
      renderAIFooter();
      scrollAIMessagesToBottom();
    }, 350);
  }

  function renderAIMessages() {
    const container = $(selectors.askAiMessages);
    if (!container) return;
    const { ai } = LifeHackOS.getState();

    container.innerHTML = "";

    ai.messages.forEach((msg) => {
      const div = document.createElement("div");
      div.classList.add("msg");
      if (msg.from === "user") {
        div.classList.add("msg-user");
      } else {
        div.classList.add("msg-ai");
      }

      // Support basic bulleted lines
      const paragraphs = msg.text.split("\n");
      paragraphs.forEach((line) => {
        if (line.trim().startsWith("•")) {
          const ul = div.querySelector("ul") || document.createElement("ul");
          if (!div.contains(ul)) div.appendChild(ul);
          const li = document.createElement("li");
          li.textContent = line.replace(/^[•\-\*]\s*/, "");
          ul.appendChild(li);
        } else if (line.trim().length > 0) {
          const p = document.createElement("p");
          p.textContent = line;
          div.appendChild(p);
        }
      });

      container.appendChild(div);
    });
  }

  function renderAIFooter() {
    const footer = $(selectors.askAiFooter);
    if (!footer) return;
    const { ai } = LifeHackOS.getState();
    const left = ai.freeQuestionsLeft;

    if (left > 0) {
      footer.textContent = `${left} free question${left === 1 ? "" : "s"} left · Upgrade for unlimited`;
    } else {
      footer.textContent = "No free questions left · Upgrade for unlimited access";
    }
  }

  function scrollAIMessagesToBottom() {
    const container = $(selectors.askAiMessages);
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }

  /* ---------- AI Reply Generator ---------- */
  function generateAIReply(question, tone) {
    const q = question.toLowerCase();

    // Simple keyword routing
    if (q.includes("kidney") || q.includes("renal")) {
      return kidneyReply(tone);
    }

    if (q.includes("sugar") || q.includes("carb")) {
      return sugarReply(tone);
    }

    if (q.includes("money") || q.includes("spend") || q.includes("budget")) {
      return moneyReply(tone);
    }

    if (q.includes("outfit") || q.includes("clothes") || q.includes("wear")) {
      return outfitReply(tone);
    }

    if (q.includes("water") || q.includes("hydrate") || q.includes("dehydrated")) {
      return waterReply(tone);
    }

    if (q.includes("steps") || q.includes("walk") || q.includes("run") || q.includes("jog")) {
      return stepsReply(tone);
    }

    // General fallback
    return generalReply(tone);
  }

  function kidneyReply(tone) {
    if (tone === "gentle") {
      return [
        "Because of kidney health, we want to protect you from high sodium and heavy processed foods.",
        "Here’s a simple, gentle framework for today:",
        "• Focus on fresh or frozen vegetables over canned.",
        "• Choose baked or grilled proteins without heavy sauces.",
        "• Avoid salty snacks, canned soups, and deli meats.",
        "Drink water regularly and keep notes of how you feel. Slow and steady wins here."
      ].join("\n");
    }

    return [
      "Listen, your kidneys don’t need extra punishment.",
      "Here’s today’s move:",
      "• No salty junk, no canned soups, no processed deli meats.",
      "• Baked or grilled proteins, light seasoning, lots of veggies.",
      "• Water with every meal.",
      "You’re in control of this. Protect your kidneys like they’re your retirement account."
    ].join("\n");
  }

  function sugarReply(tone) {
    if (tone === "gentle") {
      return [
        "Your body runs better when sugar is in check.",
        "Try this today:",
        "• Replace at least one soda or juice with water or unsweet tea.",
        "• If you want something sweet, choose fruit instead of candy.",
        "• Keep desserts small and earlier in the day.",
        "Tiny adjustments add up faster than you think."
      ].join("\n");
    }

    return [
      "Too much sugar is silently slowing you down.",
      "Here’s how we attack it today:",
      "• One sugary drink? Fine. More than that? No.",
      "• If you’re craving sweet, grab fruit, not candy.",
      "• No sugar bombs late at night.",
      "You’re not a slave to sugar. You call the shots."
    ].join("\n");
  }

  function moneyReply(tone) {
    const { money, goals } = LifeHackOS.getState();
    const over =
      money.thisWeekTotal - goals.weeklySpendLimit;

    if (tone === "gentle") {
      return [
        `You’ve spent about ${formatMoney(money.thisWeekTotal)} so far this week.`,
        over > 0
          ? `That’s around ${formatMoney(over)} over your target, but you can still course-correct.`
          : `You’re still under your target. That’s a good sign.`,
        "One simple adjustment:",
        "• Choose one meal at home instead of ordering out.",
        "• Pause one non-essential purchase.",
        "You don’t need perfection. You just need direction."
      ].join("\n");
    }

    return [
      `You’re at ${formatMoney(money.thisWeekTotal)} this week.`,
      over > 0
        ? `That’s about ${formatMoney(over)} over your target. That’s your wake-up call.`
        : "You’re still under your goal. Good. Let’s keep it that way.",
      "Here’s what you do:",
      "• No more random impulse buys this week.",
      "• One solid grocery run beats five drive-thru trips.",
      "You either tell your money where to go, or it disappears. Your choice."
    ].join("\n");
  }

  function outfitReply(tone) {
    const { style } = LifeHackOS.getState();
    const { todaysOutfit, weather } = style;

    const header = `Based on the weather (${weather.tempF}°F, ${weather.condition}) and your smart-casual vibe, here’s the fit:`;
    const items = todaysOutfit.items.map(
      (i) => `• ${i.name} – ${i.description}`
    );

    if (tone === "gentle") {
      return [
        header,
        ...items,
        "Choose what feels most like you, and keep it simple and clean. Confidence comes from consistency."
      ].join("\n");
    }

    return [
      header,
      ...items,
      "No overthinking. Clean, sharp, and intentional. Walk out the door looking like you did it on purpose."
    ].join("\n");
  }

  function waterReply(tone) {
    const { health, goals } = LifeHackOS.getState();
    const current = health.hydration.glasses;
    const target = goals.waterGlassesPerDay;
    const remaining = Math.max(target - current, 0);

    if (tone === "gentle") {
      return [
        `You’ve had ${current} glasses of water so far. Your goal is ${target}.`,
        remaining > 0
          ? `You’re only ${remaining} glass${remaining === 1 ? "" : "es"} away.`
          : "You’ve already hit your goal. Nicely done.",
        "Take one small step: grab one glass now and sip it slowly."
      ].join("\n");
    }

    return [
        `Water check: ${current}/${target} glasses.`,
        remaining > 0
          ? `You’re ${remaining} glass${remaining === 1 ? "" : "es"} behind. Fix that with one glass right now.`
          : "You already hit your goal. That’s what I like to see.",
        "Your brain, your mood, your energy—water touches all of it. Handle it."
      ].join("\n");
  }

  function stepsReply(tone) {
    const { health, goals } = LifeHackOS.getState();
    const total =
      health.steps.walk + health.steps.jog + health.steps.run;
    const remaining = Math.max(goals.stepsPerDay - total, 0);

    if (tone === "gentle") {
      return [
        `You’re at ${total.toLocaleString()} steps today. Your goal is ${goals.stepsPerDay.toLocaleString()}.`,
        remaining > 0
          ? `You’re only ${remaining.toLocaleString()} steps short.`
          : "You’ve already hit your goal. That’s great work.",
        "Take a short walk break—5–10 minutes is enough to move the needle."
      ].join("\n");
    }

    return [
      `Steps so far: ${total.toLocaleString()} / ${goals.stepsPerDay.toLocaleString()}.`,
      remaining > 0
        ? `That’s ${remaining.toLocaleString()} short. Don’t negotiate with yourself.`
        : "Goal hit. That’s how it’s done.",
      "Stand up, put the phone in your pocket, and give me one more quick loop. No excuses."
    ].join("\n");
  }

  function generalReply(tone) {
    if (tone === "gentle") {
      return [
        "I’ve got you.",
        "Ask me about one of these next:",
        "• Your health (steps, water, sugar, sleep)",
        "• Your money (spending, saving, goals)",
        "• Your style (outfits, what to wear today)",
        "• Your routine (what to focus on today)",
        "We’ll take it one smart move at a time."
      ].join("\n");
    }

    return [
      "Okay, here’s the deal:",
      "You’ve got health to protect, money to manage, and a life to tighten up.",
      "Ask me something specific about:",
      "• Health (steps, food, water, or conditions)",
      "• Money (spending, cutting back, or planning)",
      "• Style (what to wear, how to present yourself)",
      "You lead with a question. I’ll meet you with a plan."
    ].join("\n");
  }

  /* ---------- Renderers for static sections that depend on state ---------- */
  function renderTodayScreen() {
    const state = LifeHackOS.getState();
    const { health, money, goals } = state;

    // Score calculations (simple placeholder logic)
    const stepRatio =
      (health.steps.walk + health.steps.jog + health.steps.run) /
      goals.stepsPerDay;
    const waterRatio =
      health.hydration.glasses / goals.waterGlassesPerDay;
    const sleepRatio = health.sleepHours / 8;

    const avg = (stepRatio + waterRatio + sleepRatio) / 3;
    const score = Math.round(clamp(avg * 100, 0, 100));

    const scoreEl = document.querySelector(
      '.screen[data-screen="today"] .score'
    );
    if (scoreEl) scoreEl.textContent = score.toString();

    // Update environment pill text if present
    const env = health.environment;
    const card = document.querySelector(
      '.screen[data-screen="today"] .card:nth-child(2) .card-sub'
    );
    if (card) {
      card.innerHTML = env.inside
        ? "You’re currently <strong>inside</strong>."
        : "You’re currently <strong>outside</strong>.";
    }

    const pills = document.querySelectorAll(
      '.screen[data-screen="today"] .card:nth-child(2) .pill-row .pill'
    );
    if (pills[0]) {
      pills[0].textContent = `UV ${env.uvIndex} · ${
        env.uvIndex >= 7 ? "High" : env.uvIndex >= 3 ? "Moderate" : "Low"
      }`;
    }
    if (pills[1]) {
      pills[1].textContent = `${env.temperatureF}°F`;
    }
    if (pills[2]) {
      pills[2].textContent =
        env.minutesInSun > 15 ? "Hydrate now" : "You’re okay";
    }

    // Money summary
    const moneyValueEl = document.querySelector(
      '.screen[data-screen="today"] .card:nth-child(3) .money-value'
    );
    const moneySubEl = document.querySelector(
      '.screen[data-screen="today"] .card:nth-child(3) .card-sub'
    );
    if (moneyValueEl) {
      moneyValueEl.textContent = formatMoney(money.thisWeekTotal);
    }
    if (moneySubEl) {
      moneySubEl.textContent = `You’re ${formatMoney(
        money.deltaFromLastWeek
      )} over last week’s pace.`;
    }
  }

  function renderHealthScreen() {
    const state = LifeHackOS.getState();
    const { health, goals } = state;

    // Hydration bottle
    const percent = clamp(
      (health.hydration.glasses / goals.waterGlassesPerDay) * 100,
      0,
      130
    );
    const waterFill = document.querySelector(
      '.tab-content[data-tab-content="hydration"] .water-fill'
    );
    const hydrationText = document.querySelector(
      ".hydration-text"
    );
    const hydrationNote = document.querySelector(
      ".hydration-note"
    );

    if (waterFill) {
      waterFill.style.height = `${percent}%`;
    }
    if (hydrationText) {
      hydrationText.textContent = `${health.hydration.glasses} / ${goals.waterGlassesPerDay} glasses`;
    }
    if (hydrationNote) {
      const remaining = Math.max(
        goals.waterGlassesPerDay - health.hydration.glasses,
        0
      );
      hydrationNote.textContent =
        remaining > 0
          ? `You’re ${remaining} glass${
              remaining === 1 ? "" : "es"
            } short of your goal. Take one now.`
          : "You’ve hit your water goal. Nicely done.";
    }

    // Sugar + carbs
    const sugarMeter = document.querySelector(
      '.tab-content[data-tab-content="food"] .meter:nth-child(1) .meter-fill'
    );
    const sugarValue = document.querySelector(
      '.tab-content[data-tab-content="food"] .meter:nth-child(1) .meter-value'
    );
    const sugarPercent = clamp(
      (health.sugar.grams / health.sugar.dailyCap) * 100,
      0,
      130
    );
    if (sugarMeter) sugarMeter.style.width = `${sugarPercent}%`;
    if (sugarValue)
      sugarValue.textContent = `${health.sugar.grams}g / ${health.sugar.dailyCap}g`;

    const carbMeter = document.querySelector(
      '.tab-content[data-tab-content="food"] .meter:nth-child(2) .meter-fill'
    );
    const carbValue = document.querySelector(
      '.tab-content[data-tab-content="food"] .meter:nth-child(2) .meter-value'
    );
    const carbPercent = clamp(
      (health.carbs.grams / health.carbs.dailyCap) * 100,
      0,
      130
    );
    if (carbMeter) carbMeter.style.width = `${carbPercent}%`;
    if (carbValue)
      carbValue.textContent = `${health.carbs.grams}g / ${health.carbs.dailyCap}g`;

    // Conditions pills
    const pills = document.querySelectorAll(
      '.tab-content[data-tab-content="conditions"] .pill-row .pill'
    );
    const cond = health.conditions;
    if (pills[0]) {
      pills[0].textContent = `Kidney Support: ${cond.kidneySupport ? "ON" : "OFF"}`;
      pills[0].classList.toggle("pill-on", cond.kidneySupport);
    }
    if (pills[1]) {
      pills[1].textContent = `Weight Loss: ${cond.weightLoss ? "ON" : "OFF"}`;
      pills[1].classList.toggle("pill-on", cond.weightLoss);
    }
    if (pills[2]) {
      pills[2].textContent = `Diabetes: ${cond.diabetes ? "ON" : "OFF"}`;
      pills[2].classList.toggle("pill-on", cond.diabetes);
    }
  }

  function renderStyleScreen() {
    const state = LifeHackOS.getState();
    const { style } = state;

    const weatherCard = document.querySelector(
      '.screen[data-screen="style"] .card:nth-child(2) .card-sub'
    );
    if (weatherCard) {
      weatherCard.textContent = `${style.weather.tempF}°F · ${style.weather.condition} · UV ${style.weather.uvIndex}`;
    }

    // Dress-for chips
    const chips = document.querySelectorAll(
      '.screen[data-screen="style"] .chip'
    );
    chips.forEach((chip) => {
      const text = chip.textContent.trim().toLowerCase();
      let key = "work";
      if (text.includes("gym")) key = "gym";
      else if (text.includes("casual")) key = "casual";
      else if (text.includes("date")) key = "date";
      else if (text.includes("event")) key = "event";

      chip.classList.toggle("chip-active", key === style.activeContext);

      chip.addEventListener("click", () => {
        LifeHackOS.setStyleContext(key);
        chips.forEach((c) => c.classList.remove("chip-active"));
        chip.classList.add("chip-active");
      });
    });
  }

  function renderMoneyScreen() {
    const state = LifeHackOS.getState();
    const { money, goals } = state;

    const moneyValueEl = document.querySelector(
      '.screen[data-screen="money"] .money-value'
    );
    const diffEl = document.querySelector(
      '.screen[data-screen="money"] .money-diff'
    );
    const cardsList = document.querySelector(
      '.screen[data-screen="money"] .card:nth-child(3) .list'
    );

    if (moneyValueEl) {
      moneyValueEl.textContent = formatMoney(money.thisWeekTotal);
    }
    if (diffEl) {
      diffEl.textContent = `${money.deltaFromLastWeek >= 0 ? "+" : ""}${formatMoney(
        money.deltaFromLastWeek
      )}`;
      diffEl.classList.toggle(
        "money-diff-bad",
        money.thisWeekTotal > goals.weeklySpendLimit
      );
    }

    if (cardsList) {
      cardsList.innerHTML = "";
      money.categories.forEach((cat) => {
        const li = document.createElement("li");
        const title = document.createElement("span");
        const sub = document.createElement("span");
        title.className = "list-title";
        sub.className = "list-sub";
        title.textContent = cat.name;
        sub.textContent = formatMoney(cat.amount);
        li.appendChild(title);
        li.appendChild(sub);
        cardsList.appendChild(li);
      });
    }
  }

  function renderProfile() {
    const state = LifeHackOS.getState();
    const { user } = state;

    const nameEl = document.querySelector(".profile-name");
    const avatarEls = document.querySelectorAll(".avatar-circle");
    const greetingEl = document.querySelector(".greeting");
    const streakEls = document.querySelectorAll(".streak");

    if (nameEl) nameEl.textContent = user.name;
    avatarEls.forEach((a) => (a.textContent = user.initials || "J"));
    if (greetingEl)
      greetingEl.textContent = `Good Morning, ${user.name.split(" ")[0]}`;
    streakEls.forEach(
      (s) => (s.textContent = `Streak: ${user.streakDays} days`)
    );
  }

  /* ---------- Actions (buttons for water / quick add etc.) ---------- */
  function initActionButtons() {
    // Log water buttons
    const logWaterButtons = $all(".btn-primary, .chip");
    logWaterButtons.forEach((btn) => {
      const text = btn.textContent.toLowerCase();
      if (text.includes("log water") || text.includes("log 1 glass")) {
        btn.addEventListener("click", () => {
          LifeHackOS.logWater(1);
          renderHealthScreen();
          renderTodayScreen();
        });
      }
      if (text.includes("log custom")) {
        btn.addEventListener("click", () => {
          const input = prompt(
            "How many glasses of water do you want to log?",
            "2"
          );
          const val = parseInt(input || "0", 10);
          if (!isNaN(val) && val > 0) {
            LifeHackOS.logWater(val);
            renderHealthScreen();
            renderTodayScreen();
          }
        });
      }
    });

    // Quick Add expense chips
    const moneyChips = document.querySelectorAll(
      '.screen[data-screen="money"] .chip'
    );
    moneyChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const rawCategory = chip.textContent.replace("+", "").trim();
        const amountInput = prompt(
          `Amount for ${rawCategory}?`,
          "20"
        );
        const amount = parseFloat(amountInput || "0");
        if (isNaN(amount) || amount <= 0) return;

        LifeHackOS.addTransaction({
          category: rawCategory,
          amount,
          createdAt: new Date().toISOString(),
        });

        renderMoneyScreen();
        renderTodayScreen();
      });
    });
  }

  /* ---------- Periodic Sim (just to feel alive) ---------- */
  function startSimulationLoop() {
    // Every 40 seconds, randomize small environment changes.
    setInterval(() => {
      LifeHackOS.randomizeEnvironment();
      renderTodayScreen();
      renderHealthScreen();
      renderStyleScreen();
    }, 40000);
  }

  /* ---------- Init ---------- */
  function init() {
    initScreenNavigation();
    initHealthTabs();
    initAskAI();
    initActionButtons();

    renderProfile();
    renderTodayScreen();
    renderHealthScreen();
    renderStyleScreen();
    renderMoneyScreen();

    startSimulationLoop();
  }

  return { init };
})();

/* ===================== BOOTSTRAP ===================== */

document.addEventListener("DOMContentLoaded", () => {
  LifeHackUI.init();
});
