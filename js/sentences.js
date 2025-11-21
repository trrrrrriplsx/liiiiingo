// js/sentences.js
import { getLearnedItems, markItemAsLearned, updateStats, currentUser } from "./firebase.js";

let attempts = 0;
const maxAttempts = 3;
let currentTargetSentence = "";

// Массив всех предложений уровня (кэшируем)
let currentLevelSentences = [];
let learnedItems = [];

async function startLevel(level) {
  if (!currentUser) {
    showStatus("⚠️ Please log in first.");
    return;
  }

  // Загружаем предложения и выученные
  currentLevelSentences = window.lingoflowData.sentences[level];
  learnedItems = await getLearnedItems("sentences", level);

  if (!currentLevelSentences) {
    showStatus("⚠️ Sentences not found for level " + level);
    return;
  }

  // Фильтруем выученные
  const availableSentences = currentLevelSentences.filter(sentence => !learnedItems.includes(sentence));
  if (availableSentences.length === 0) {
    showStatus("🎉 All sentences in this level are learned!");
    return;
  }

  currentTargetSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
  document.getElementById("target-sentence").textContent = currentTargetSentence;

  attempts = 0; // Сброс попыток
}

async function startRecording() {
  if (!currentTargetSentence) {
    showStatus("⚠️ Please select a sentence first.");
    return;
  }

  if (attempts >= maxAttempts) {
    showStatus("❌ No more attempts. Try another sentence.");
    return;
  }

  attempts++;

  speakAndListen(currentTargetSentence, async (isCorrect) => {
    if (isCorrect) {
      await markItemAsLearned("sentences", getLevelFromUrl(), currentTargetSentence);
      showStatus("Correct! ✅ This sentence is learned.");
      attempts = maxAttempts; // Успешно — больше не пробуем
    } else if (attempts >= maxAttempts) {
      showStatus("❌ Too many attempts.");
      await updateStats(false); // Неудача после 3 попыток
    } else {
      showStatus(`Try again! ${maxAttempts - attempts} attempts left.`);
    }
  });
}

// Вспомогательная функция для получения уровня из URL (для универсальности)
function getLevelFromUrl() {
  const path = window.location.pathname;
  if (path.includes("A1")) return "A1";
  if (path.includes("A2")) return "A2";
  if (path.includes("B1")) return "B1";
  if (path.includes("B2")) return "B2";
  if (path.includes("C1")) return "C1";
  if (path.includes("C2")) return "C2";
  return "A1"; // fallback
}