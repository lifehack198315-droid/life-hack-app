// Life Hack OS - Frontend Logic
// Makes buttons actually DO things.
// Uses localStorage so data sticks when you refresh.

document.addEventListener("DOMContentLoaded", () => {
  // ========= HELPER: SAFE QUERY =========
  const $ = (selector) => document.querySelector(selector);

  // ========= WATER TRACKER =========
  const waterInput = $("#waterInput");          // <input type="number">
  const btnLogWater = $("#btnLogWater");        // button: "Log Water"
  const waterTotalEl = $("#waterTotal");        // span/div to show total
  const waterHistoryEl = $("#waterHistory");    // optional: list of entries

  let waterTotal = Number(localStorage.getItem("lh_waterTotal") || 0);

  function renderWater() {
    if (waterTotalEl) {
      waterTotalEl.textContent = waterTotal + " oz";
    }
  }

  renderWater();

  if (btnLogWater && waterInput) {
    btnLogWater.addEventListener("click", () => {
      const val = Number(waterInput.value);
      if (!val || val <= 0) {
        alert("Enter a positive number of ounces first.");
        return;
      }

      waterTotal += val;
      localStorage.setItem("lh_waterTotal", waterTotal.toString());
      renderWater();

      if (waterHistoryEl) {
        const li = document.createElement("li");
        const now = new Date();
        li.textContent = `${val} oz at ${now.toLocaleTimeString()}`;
        waterHistoryEl.prepend(li);
      }

      waterInput.value = "";
    });
  }

  // ========= EXPENSE TRACKER =========
  const expenseNameInput = $("#expenseName");   // text
  const expenseAmountInput = $("#expenseAmount"); // number
  const btnAddExpense = $("#btnAddExpense");
  const expenseListEl = $("#expenseList");      // <ul> or <div>
  const expenseTotalEl = $("#expenseTotal");    // span/div

  let expenses = JSON.parse(localStorage.getItem("lh_expenses") || "[]");

  function renderExpenses() {
    if (!expenseListEl) return;

    expenseListEl.innerHTML = "";
    let total = 0;

    expenses.forEach((exp, index) => {
      total += exp.amount;

      const li = document.createElement("li");
      li.className = "expense-item";

      const label = document.createElement("span");
      label.textContent = `${exp.name} - $${exp.amount.toFixed(2)}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.className = "btn-small";
      delBtn.addEventListener("click", () => {
        expenses.splice(index, 1);
        localStorage.setItem("lh_expenses", JSON.stringify(expenses));
        renderExpenses();
      });

      li.appendChild(label);
      li.appendChild(delBtn);
      expenseListEl.appendChild(li);
    });

    if (expenseTotalEl) {
      expenseTotalEl.textContent = "$" + total.toFixed(2);
    }
  }

  renderExpenses();

  if (btnAddExpense && expenseNameInput && expenseAmountInput) {
    btnAddExpense.addEventListener("click", () => {
      const name = expenseNameInput.value.trim() || "Unnamed";
      const amount = Number(expenseAmountInput.value);

      if (!amount || amount <= 0) {
        alert("Enter a positive dollar amount.");
        return;
      }

      expenses.push({ name, amount });
      localStorage.setItem("lh_expenses", JSON.stringify(expenses));
      renderExpenses();

      expenseNameInput.value = "";
      expenseAmountInput.value = "";
    });
  }

  // ========= GROCERY LIST =========
  const groceryInput = $("#groceryItem");       // text input
  const btnAddGrocery = $("#btnAddGrocery");
  const groceryListEl = $("#groceryList");      // <ul>

  let groceries = JSON.parse(localStorage.getItem("lh_groceries") || "[]");

  function renderGroceries() {
    if (!groceryListEl) return;
    groceryListEl.innerHTML = "";

    groceries.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "grocery-item";

      const label = document.createElement("span");
      label.textContent = item;

      const doneBtn = document.createElement("button");
      doneBtn.textContent = "✔";
      doneBtn.className = "btn-small";
      doneBtn.addEventListener("click", () => {
        groceries.splice(index, 1);
        localStorage.setItem("lh_groceries", JSON.stringify(groceries));
        renderGroceries();
      });

      li.appendChild(label);
      li.appendChild(doneBtn);
      groceryListEl.appendChild(li);
    });
  }

  renderGroceries();

  if (btnAddGrocery && groceryInput) {
    btnAddGrocery.addEventListener("click", () => {
      const text = groceryInput.value.trim();
      if (!text) {
        alert("Type something for your grocery list.");
        return;
      }

      groceries.push(text);
      localStorage.setItem("lh_groceries", JSON.stringify(groceries));
      renderGroceries();

      groceryInput.value = "";
    });
  }

  // ========= REMINDERS =========
  const reminderInput = $("#reminderText");     // text
  const reminderTimeInput = $("#reminderTime"); // time (optional)
  const btnAddReminder = $("#btnAddReminder");
  const reminderListEl = $("#reminderList");

  let reminders = JSON.parse(localStorage.getItem("lh_reminders") || "[]");

  function renderReminders() {
    if (!reminderListEl) return;
    reminderListEl.innerHTML = "";

    reminders.forEach((rem, index) => {
      const li = document.createElement("li");
      li.className = "reminder-item";

      const label = document.createElement("span");
      label.textContent = rem.time
        ? `${rem.text} at ${rem.time}`
        : rem.text;

      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.className = "btn-small";
      delBtn.addEventListener("click", () => {
        reminders.splice(index, 1);
        localStorage.setItem("lh_reminders", JSON.stringify(reminders));
        renderReminders();
      });

      li.appendChild(label);
      li.appendChild(delBtn);
      reminderListEl.appendChild(li);
    });
  }

  renderReminders();

  if (btnAddReminder && reminderInput) {
    btnAddReminder.addEventListener("click", () => {
      const text = reminderInput.value.trim();
      const time = reminderTimeInput ? reminderTimeInput.value : "";

      if (!text) {
        alert("Reminder text can’t be empty.");
        return;
      }

      reminders.push({ text, time });
      localStorage.setItem("lh_reminders", JSON.stringify(reminders));
      renderReminders();

      reminderInput.value = "";
      if (reminderTimeInput) reminderTimeInput.value = "";
    });
  }

  // ========= MOOD CHECK / MENTAL HEALTH =========
  // Simple 1–10 scale: #moodSlider, button #btnCheckMood, and #moodResult
  const moodSlider = $("#moodSlider");           // <input type="range" min="1" max="10">
  const btnCheckMood = $("#btnCheckMood");
  const moodResultEl = $("#moodResult");

  if (btnCheckMood && moodSlider && moodResultEl) {
    btnCheckMood.addEventListener("click", () => {
      const score = Number(moodSlider.value || 5);
      let message = "";
      let extra = "";

      if (score >= 8) {
        message = "🔥 You’re in a strong place today.";
        extra = "Lock this in with one small win: finish a task you’ve been putting off.";
      } else if (score >= 5) {
        message = "😐 You’re okay, but we can level up.";
        extra = "Pick ONE thing you can control today and crush it. Small steps count.";
      } else if (score >= 3) {
        message = "⚠️ You’re having a rough one, but you are not alone.";
        extra =
          "Text a trusted person, drink some water, and do one tiny act of self-care. You deserve that.";
      } else {
        message = "🚨 This feels very heavy.";
        extra =
          "If you’re thinking about hurting yourself, please reach out for real-world help right now:\n" +
          "• 988 Suicide & Crisis Lifeline (call or text 988 in the U.S.)\n" +
          "• Or go to the nearest ER or emergency service.\n\nYou matter more than you realize.";
      }

      moodResultEl.innerHTML = `
        <strong>Mood score: ${score}/10</strong><br>
        ${message}<br><small>${extra.replace(/\n/g, "<br>")}</small>
      `;
    });
  }

  // ========= “CHECK WEATHER FOR THE WEEK” BUTTON =========
  // We can’t call real APIs without a key, so we’ll simulate a card update.
  const btnCheckWeather = $("#btnCheckWeather");  // button
  const weatherOutputEl = $("#weatherOutput");    // div/section to show fake forecast

  if (btnCheckWeather && weatherOutputEl) {
    btnCheckWeather.addEventListener("click", () => {
      const fakeForecast = [
        "Mon: Partly cloudy · Great for a walk",
        "Tue: Light rain · Pack an umbrella",
        "Wed: Sunny · Hydrate + sunscreen",
        "Thu: Cloudy · Perfect for errands",
        "Fri: Storm chances · Drive carefully",
        "Sat: Warm · Good day for movement",
        "Sun: Chill · Rest + reset"
      ];

      weatherOutputEl.innerHTML = "";
      const ul = document.createElement("ul");
      fakeForecast.forEach((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        ul.appendChild(li);
      });
      weatherOutputEl.appendChild(ul);
    });
  }

  // ========= ASK AI (OFFLINE, MOTIVATIONAL) =========
  const askAiInput = $("#askAiInput");        // textarea or input
  const btnAskAi = $("#btnAskAi");           // button
  const askAiOutput = $("#askAiOutput");     // div for answer

  function generateCoachingReply(question) {
    const q = question.toLowerCase();

    if (q.includes("money") || q.includes("debt") || q.includes("bills")) {
      return "Money is stressful, but you’re not stuck. List your bills, sort them by due date, and attack the smallest one first. Build momentum, not perfection.";
    }

    if (q.includes("health") || q.includes("diet") || q.includes("exercise")) {
      return "Your body doesn’t need perfection, it needs consistency. Today, do one healthy meal and a 10–15 minute walk. That’s it. Stack wins from there.";
    }

    if (q.includes("motivation") || q.includes("lazy") || q.includes("stuck")) {
      return "You don’t need motivation. You need motion. Set a 5-minute timer, start the task, and stop when the timer ends. 5 minutes beats 0 minutes every time.";
    }

    if (q.includes("credit") || q.includes("score") || q.includes("collection")) {
      return "Start with your reports: pull them from annualcreditreport.com, highlight negatives, and tackle one item per week. Slow progress is still progress.";
    }

    if (q.includes("relationship") || q.includes("family") || q.includes("friend")) {
      return "Be honest and specific about how you feel. One calm conversation beats weeks of silent resentment. Lead with ‘I feel…’ instead of ‘You never…’.";
    }

    // Default catch-all
    return "You’re capable of more than you’re giving yourself credit for. Break the problem into the tiniest possible next step and do just that. Then celebrate it.";
  }

  if (btnAskAi && askAiInput && askAiOutput) {
    btnAskAi.addEventListener("click", () => {
      const text = askAiInput.value.trim();
      if (!text) {
        alert("Type a question or problem first.");
        return;
      }

      const reply = generateCoachingReply(text);

      askAiOutput.innerHTML = `
        <p><strong>Your question:</strong> ${text}</p>
        <p><strong>Coach:</strong> ${reply}</p>
      `;

      askAiInput.value = "";
    });
  }

  // ========= OPTIONAL: SCREEN TABS (if you have sidebar buttons) =========
  // Use data-screen on nav buttons and [data-screen-id] on sections.
  const screenButtons = document.querySelectorAll("[data-screen]");
  const screens = document.querySelectorAll("[data-screen-id]");

  function showScreen(id) {
    screens.forEach((section) => {
      section.classList.toggle("is-active", section.dataset.screenId === id);
    });

    screenButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.screen === id);
    });
  }

  if (screenButtons.length && screens.length) {
    screenButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.screen;
        showScreen(id);
      });
    });

    // Default screen: first one
    showScreen(screenButtons[0].dataset.screen);
  }
});
