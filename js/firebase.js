// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Твоя конфигурация из шага 4
const firebaseConfig = {
    apiKey: "AIzaSyCC0FbBPK4V7EMfkr0xty9Qc9Ck-cLu18s",
    authDomain: "lingoflow-c169e.firebaseapp.com",
    projectId: "lingoflow-c169e",
    storageBucket: "lingoflow-c169e.firebasestorage.app",
    messagingSenderId: "542175265484",
    appId: "1:542175265484:web:2723ae3b6f2558f034b869"
  };

// Инициализация
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Хранение текущего пользователя
export let currentUser = null;

// Проверка аутентификации
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User logged in:", user.uid);
  } else {
    currentUser = null;
    console.log("User not logged in.");
  }
});

// Функция загрузки данных пользователя
export const loadUserData = async function() {
  if (!currentUser) return null;

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    // Создаём нового пользователя с пустыми данными
    const initialData = {
      stats: { total: 0, correct: 0 },
      learned: { words: {}, sentences: {} },
      progress: { words: {}, sentences: {} }
    };
    await setDoc(doc(db, "users", currentUser.uid), initialData);
    return initialData;
  }
};

// Функция обновления статистики
export const updateStats = async function(isCorrect) {
  if (!currentUser) return;

  await updateDoc(doc(db, "users", currentUser.uid), {
    "stats.total": increment(1),
    "stats.correct": isCorrect ? increment(1) : increment(0)
  });
};

// Функция сохранения "выученного" слова/фразы
export const markItemAsLearned = async function(type, level, item) {
  if (!currentUser) return;

  const fieldPath = `learned.${type}.${level}`;
  await updateDoc(doc(db, "users", currentUser.uid), {
    [fieldPath]: arrayUnion(item)
  });
};

// Функция получения "выученных" слов/фраз
export const getLearnedItems = async function(type, level) {
  if (!currentUser) return [];

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data.learned[type][level] || [];
  }
  return [];
};

// Функция сброса статистики и прогресса
export const resetStats = async function() {
  if (!currentUser) return;

  await setDoc(doc(db, "users", currentUser.uid), {
    stats: { total: 0, correct: 0 },
    learned: { words: {}, sentences: {} },
    progress: { words: {}, sentences: {} }
  });
  location.reload(); // Обновляем страницу
};

// Функция получения имени
export const getUsername = function() {
  return currentUser ? currentUser.email || currentUser.uid : "Guest";
};