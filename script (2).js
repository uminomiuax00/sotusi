
let questions = [];
let currentIndex = 0;
let filteredQuestions = [];
let userChecks = {};

Id("blockSelect").value;    // e.g., "A"
const yearBlock = document.getElementById("yearSelect").value; // 例: "2-2024"
const block = document.getElementById("blockSelect").value;    // 例: "A"
const filename = `${yearBlock}${block}.json`;                  // → "2-2024A.json"
// → "1-2024A.json"


  try {
    const response = await fetch(filename);
    questions = await response.json();
    loadProgress(year, block);
    applyFilters();
    startExercise();
  } catch (e) {
    alert("問題ファイルが見つかりませんでした。");
  }
});

function applyFilters() {
  const checkedFilters = Array.from(document.querySelectorAll(".filter-check:checked")).map(el => el.value);
  const filterUnanswered = document.getElementById("filterUnanswered").checked;
  filteredQuestions = questions.filter(q => {
    const key = `${q.number}`;
    const mark = userChecks[key] || "";
    if (filterUnanswered && mark) return false;
    if (checkedFilters.length === 0) return true;
    return checkedFilters.includes(mark);
  });
  if (filteredQuestions.length === 0) {
    alert("該当する問題がありません。");
    return;
  }
  currentIndex = 0;
  showQuestion();
}

function startExercise() {
  document.getElementById("selection-area").style.display = "none";
  document.getElementById("filter-area").style.display = "block";
  document.getElementById("question-area").style.display = "block";
  applyFilters();
}

function showQuestion() {
  const q = filteredQuestions[currentIndex];
  document.getElementById("progress").textContent = `進捗: ${currentIndex + 1}/${filteredQuestions.length}`;
  document.getElementById("question-number").textContent = `No.${q.number}`;
  document.getElementById("question-text").textContent = q.question;
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  const keys = Object.keys(q.choices || q.options || {});
  keys.forEach(k => {
    const text = (q.choices || q.options)[k];
    const btn = document.createElement("button");
    btn.textContent = `${k}: ${text}`;
    btn.onclick = () => {
      if (q.answer.includes(k)) {
        document.getElementById("explanation").textContent = "○ " + q.explanation;
        userChecks[q.number] = "〇";
      } else {
        document.getElementById("explanation").textContent = "× " + q.explanation;
        userChecks[q.number] = "×";
      }
      saveProgress();
      updateCheckButtons(q.number);
    };
    choicesDiv.appendChild(btn);
  });

  document.getElementById("explanation").textContent = "";

  updateCheckButtons(q.number);
}

function updateCheckButtons(number) {
  const mark = userChecks[number] || "";
  document.querySelectorAll("#check-buttons input").forEach(el => {
    el.checked = el.value === mark;
    el.onclick = () => {
      userChecks[number] = el.value;
      saveProgress();
    };
  });
}

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentIndex < filteredQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  }
});

document.getElementById("endBtn").addEventListener("click", () => {
  document.getElementById("selection-area").style.display = "block";
  document.getElementById("filter-area").style.display = "block";
  document.getElementById("question-area").style.display = "none";
});

document.querySelectorAll(".filter-check, #filterUnanswered").forEach(el => {
  el.addEventListener("change", applyFilters);
});

function saveProgress() {
  const year = document.getElementById("yearSelect").value;
  const block = document.getElementById("blockSelect").value;
  localStorage.setItem(`check-${year}-${block}`, JSON.stringify(userChecks));
}

function loadProgress(year, block) {
  const saved = localStorage.getItem(`check-${year}-${block}`);
  userChecks = saved ? JSON.parse(saved) : {};
}
