"use strict";

const STORAGE_KEYS = {
  feeling: "bloom_today_feeling",
  care: "bloom_today_care",
  checkInDate: "bloom_checkin_date",
  journals: "bloom_journals",
  delights: "bloom_delights",
  eveningMode: "bloom_evening_mode",
  reminders: "bloom_reminders"
};

const gentleSteps = [
  "Drink a glass of water.",
  "Take three slow breaths.",
  "Step outside for five minutes.",
  "Stretch gently for two minutes.",
  "Spend a quiet moment in prayer or reflection.",
  "Send a kind message to someone you love.",
  "Do one thing that supports your purpose.",
  "Put your phone down and rest for five minutes.",
  "Notice one thing that is beautiful today.",
  "Speak gently to yourself today."
];

document.addEventListener("DOMContentLoaded", () => {
  initialiseNavigation();
  initialiseDailyCheckIn();
  initialiseGentleStep();
  initialiseJournal();
  initialiseQuietJoys();
  initialiseSettings();
  initialiseVoiceRecording();
  updateGarden();
  registerServiceWorker();
});

/* ---------- Navigation ---------- */

function initialiseNavigation() {
  const navButtons = document.querySelectorAll(".nav-button");
  const pages = document.querySelectorAll(".page");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;

      pages.forEach((page) => {
        page.classList.toggle("active", page.dataset.page === target);
      });

      navButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      if (target === "garden") {
        updateGarden();
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });
}

/* ---------- Daily check-in ---------- */

function initialiseDailyCheckIn() {
  const today = getTodayKey();
  const savedDate = localStorage.getItem(STORAGE_KEYS.checkInDate);

  if (savedDate !== today) {
    localStorage.removeItem(STORAGE_KEYS.feeling);
    localStorage.removeItem(STORAGE_KEYS.care);
    localStorage.setItem(STORAGE_KEYS.checkInDate, today);
  }

  initialiseChoiceGroup(
    '[data-group="day-feeling"] button',
    STORAGE_KEYS.feeling
  );

  initialiseChoiceGroup(
    '[data-group="care-area"] button',
    STORAGE_KEYS.care
  );
}

function initialiseChoiceGroup(selector, storageKey) {
  const buttons = document.querySelectorAll(selector);
  const savedValue = localStorage.getItem(storageKey);

  buttons.forEach((button) => {
    if (button.textContent.trim() === savedValue) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");

      localStorage.setItem(storageKey, button.textContent.trim());
      localStorage.setItem(STORAGE_KEYS.checkInDate, getTodayKey());

      updateGarden();
    });
  });
}

/* ---------- Gentle step ---------- */

function initialiseGentleStep() {
  const stepElement = document.getElementById("gentle-step");

  if (!stepElement) {
    return;
  }

  const dayNumber = Math.floor(Date.now() / 86400000);
  const stepIndex = dayNumber % gentleSteps.length;

  stepElement.textContent = gentleSteps[stepIndex];
}

/* ---------- Journal ---------- */

function initialiseJournal() {
  const journalBox = document.getElementById("journal-entry");
  const saveButton = document.getElementById("save-journal");
  const status = document.getElementById("journal-status");

  if (!journalBox || !saveButton) {
    return;
  }

  saveButton.addEventListener("click", () => {
    const text = journalBox.value.trim();

    if (!text) {
      showTemporaryMessage(status
