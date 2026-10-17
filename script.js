"use strict";

// 1. Select the HTML elements we need.
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const taskFilter = document.querySelector("#taskFilter");
const totalCount = document.querySelector("#totalCount");
const activeCount = document.querySelector("#activeCount");
const completedCount = document.querySelector("#completedCount");
const emptyMessage = document.querySelector("#emptyMessage");
const feedback = document.querySelector("#feedback");
const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

const STORAGE_KEY = "day6-task-tracker-tasks";

// 2. Load previously saved tasks.
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks === null) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    // Ignore malformed entries from unexpected stored data.
    return parsedTasks.filter(
      (task) =>
        task !== null &&
        typeof task === "object" &&
        !Array.isArray(task) &&
        Number.isSafeInteger(task.id) &&
        task.id > 0 &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean",
    );
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

// 3. Keep the task data in memory.
let tasks = loadTasks();
let currentFilter = "all";

// 4. Closure: create a private ID generator.
function createIdGenerator() {
  let nextId =
    tasks.reduce((maximum, task) => {
      return Math.max(maximum, task.id);
    }, 0) + 1;

  return function generateId() {
    if (nextId > Number.MAX_SAFE_INTEGER) {
      throw new Error("No more safe task IDs are available.");
    }

    return nextId++;
  };
}

const generateId = createIdGenerator();

// 5. Save the current array to localStorage.
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    feedback.textContent =
      "Changes may not be saved. Check your browser storage settings.";
    return false;
  }
}

// 6. Calculate and display task statistics.
function updateStats() {
  const completed = tasks.reduce((count, task) => {
    return count + (task.completed ? 1 : 0);
  }, 0);

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  activeCount.textContent = tasks.length - completed;
}

// 7. Return the tasks matching the selected filter.
function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

// 8. Build one task's DOM elements safely.
function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.id = String(task.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.className = "task-checkbox";
  checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  if (task.completed) {
    title.classList.add("is-completed");
  }

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

  item.append(checkbox, title, deleteButton);

  return item;
}

// 9. Render the interface from the current data.
function renderTasks() {
  const visibleTasks = getVisibleTasks();

  // Replace the old list with the current visible tasks.
  taskList.replaceChildren(
    ...visibleTasks.map((task) => createTaskElement(task)),
  );

  updateStats();

  emptyMessage.hidden = visibleTasks.length > 0;

  if (visibleTasks.length === 0) {
    const messages = {
      all: "No tasks yet. Add your first task above!",
      active: "No active tasks. Nice work!",
      completed: "No completed tasks yet.",
    };

    emptyMessage.textContent = messages[currentFilter];
  }
}

// 10. Add a task when the form is submitted.
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    feedback.textContent = "Please enter a task description.";
    taskInput.focus();
    return;
  }

  if (title.length > 200) {
    feedback.textContent = "Keep your task under 200 characters.";
    return;
  }

  try {
    tasks.push({
      id: generateId(),
      title: title,
      completed: false,
    });
  } catch (error) {
    feedback.textContent = error.message;
    return;
  }

  taskInput.value = "";
  currentFilter = "all";
  taskFilter.value = "all";

  const saved = saveTasks();
  renderTasks();

  feedback.textContent = saved
    ? "Task added successfully."
    : "Task added, but could not be saved permanently.";

  taskInput.focus();
});

// 11. Handle checkbox changes and delete clicks.
taskList.addEventListener("change", (event) => {
  if (!event.target.matches(".task-checkbox")) {
    return;
  }

  const item = event.target.closest(".task-item");
  const id = Number(item.dataset.id);

  tasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        completed: event.target.checked,
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
  feedback.textContent = "Task status updated.";
});

taskList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-button");

  if (!deleteButton) {
    return;
  }

  const item = deleteButton.closest(".task-item");
  const id = Number(item.dataset.id);

  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
  feedback.textContent = "Task deleted.";
});

// 12. Change the visible tasks when the filter changes.
taskFilter.addEventListener("change", (event) => {
  currentFilter = event.target.value;
  renderTasks();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => task.completed === false);

  saveTasks();
  renderTasks();
});

// 13. Show saved tasks as soon as the app opens.
renderTasks();
