const STORAGE_KEY = "studytrack-tasks";

const subjectLabels = {
  general: "General",
  electronica: "Electronică de putere",
  telecom: "Telecomunicații",
  "baze-date": "Baze de date",
  tv: "Sisteme TV",
};

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const subjectInput = document.getElementById("subjectInput");
const dueInput = document.getElementById("dueInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const tabs = document.querySelectorAll(".tab");

let tasks = loadTasks();
let currentFilter = "toate";

// ---------- Persistență (localStorage) ----------
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Randare ----------
function render() {
  const filtered = tasks.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  taskList.innerHTML = "";
  emptyState.hidden = filtered.length !== 0;

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const isOverdue =
      task.due && !task.done && new Date(task.due) < new Date(new Date().toDateString());

    li.innerHTML = `
      <button class="task-check" data-id="${task.id}" aria-label="Marchează finalizat"></button>
      <div class="task-body">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span class="task-subject">${subjectLabels[task.subject] || "General"}</span>
          ${task.due ? `<span class="task-due${isOverdue ? " overdue" : ""}">${formatDate(task.due)}</span>` : ""}
        </div>
      </div>
      <button class="task-delete" data-id="${task.id}" aria-label="Șterge sarcina">✕</button>
    `;
    taskList.appendChild(li);
  });

  const remaining = tasks.filter((t) => !t.done).length;
  taskCount.textContent = `${remaining} sarcin${remaining === 1 ? "ă" : "i"} rămase`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

// ---------- Adăugare sarcină ----------
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: Date.now(),
    title,
    subject: subjectInput.value,
    due: dueInput.value || null,
    done: false,
  });

  saveTasks();
  render();
  taskForm.reset();
  taskInput.focus();
});

// ---------- Bifare / ștergere ----------
taskList.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (e.target.classList.contains("task-check")) {
    const task = tasks.find((t) => t.id === id);
    if (task) task.done = !task.done;
    saveTasks();
    render();
  }

  if (e.target.classList.contains("task-delete")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }
});

// ---------- Filtrare (tab-uri) ----------
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    render();
  });
});

// ---------- Inițializare ----------
render();
