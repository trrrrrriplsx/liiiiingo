// speech.js — общая логика распознавания речи, озвучки и проверки

// Проверка поддержки Web Speech API
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  console.error("Web Speech API не поддерживается в этом браузере.");
  alert("Web Speech API не поддерживается в вашем браузере.");
}

// Проверка поддержки Speech Synthesis API
if (!'speechSynthesis' in window) {
  console.error("Speech Synthesis API не поддерживается в этом браузере.");
}

// Озвучка текста
function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  } else {
    alert("Озвучка не поддерживается в вашем браузере.");
  }
}

// Функция для расстояния Левенштейна
function levenshtein(a, b) {
  const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

// Проверка "насколько верно"
function isCloseEnough(result, expected, threshold = 0.8) {
  const normResult = result.toLowerCase().trim().replace(/\s+/g, ' ');
  const normExpected = expected.toLowerCase().trim().replace(/\s+/g, ' ');

  if (normResult === normExpected) return true; // Точное совпадение

  const distance = levenshtein(normResult, normExpected);
  const maxLength = Math.max(normResult.length, normExpected.length);
  const similarity = 1 - (distance / maxLength);

  return similarity >= threshold;
}

// Обновлённая функция распознавания
function speakAndListen(targetText, onResult) {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Сбрасываем старые сообщения
  clearResult();

  showStatus("Recording...");

  recognition.start();

  recognition.onresult = function (event) {
    const result = event.results[0][0].transcript;

    // Проверяем, насколько близко
    const isCorrect = isCloseEnough(result, targetText);

    if (isCorrect) {
      showStatus("Correct! ✅", true);
    } else {
      showStatus(`Not quite. ❌ You said: "${result}"`, false);
    }

    // Вызываем внешнюю функцию для обработки результата
    if (onResult) onResult(isCorrect);
  };

  recognition.onerror = function (event) {
    showStatus("Error: " + event.error);
  };
}

function showStatus(message, isCorrect = null) {
  const statusEl = document.getElementById("status-msg");
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = "";

  if (isCorrect === true) statusEl.classList.add("correct");
  if (isCorrect === false) statusEl.classList.add("incorrect");
}

function clearResult() {
  const statusEl = document.getElementById("status-msg");
  const userResponseEl = document.getElementById("user-response");

  if (statusEl) statusEl.textContent = "";
  if (statusEl) statusEl.className = "";
  if (userResponseEl) userResponseEl.textContent = "";
}

// Функция получения случайного элемента
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Экспортируем функции
window.speakAndListen = speakAndListen;
window.showStatus = showStatus;
window.clearResult = clearResult;
window.getRandomItem = getRandomItem;
window.speakText = speakText;