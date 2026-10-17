const STORAGE_KEY = "day9-task-tracker-task";
function isTask(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    if (!("id" in value) || !("title" in value) || !("completed" in value)) {
        return false;
    }
    return (typeof value.id === "number" &&
        Number.isSafeInteger(value.id) &&
        value.id > 0 &&
        typeof value.title === "string" &&
        typeof value.completed === "boolean");
}
function loadTask() {
    try {
        const saveTasks = localStorage.getItem(STORAGE_KEY);
        if (saveTasks === null) {
            return [];
        }
        const parseTasks = JSON.parse(saveTasks);
        if (!Array.isArray(parseTasks)) {
            return [];
        }
        return parseTasks.filter(isTask);
    }
    catch (error) {
        console.error("Could not load saved task:", error);
        return [];
    }
}
let task = loadTask();
function getNextId() {
    const maxId = task.reduce((max, task) => {
        return Math.max(max, task.id);
    }, 0);
    return maxId + 1;
}
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(task));
        return true;
    }
    catch (error) {
        console.error("Could not save tasks:", error);
        return false;
    }
}
let currentFilter = "all";
function getVisibleTasks() {
    if (currentFilter === "active") {
        return task.filter((item) => !item.completed);
    }
    if (currentFilter === "completed") {
        return task.filter((item) => item.completed);
    }
    return task;
}
function createIdGenerator() {
    let nextId = getNextId();
    return function generateId() {
        return nextId++;
    };
}
const generateId = createIdGenerator();
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const taskFilter = document.querySelector("#taskFilter");
const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const activeCount = document.querySelector("#activeCount");
const clearCompletedBtn = document.querySelector("#clearCompletedBtn");
if (!taskForm ||
    !taskInput ||
    !taskList ||
    !taskFilter ||
    !totalCount ||
    !activeCount ||
    !completedCount ||
    !clearCompletedBtn) {
    throw new Error("Required HTML elements were not found.");
}
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = taskInput.value.trim();
    if (title === "") {
        return;
    }
    const newTask = {
        id: generateId(),
        title: title,
        completed: false,
    };
    task.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
});
taskFilter.addEventListener("change", () => {
    currentFilter = taskFilter.value;
    renderTasks();
});
clearCompletedBtn.addEventListener("click", () => {
    task = task.filter((item) => !item.completed);
    saveTasks();
    renderTasks();
});
function renderTasks() {
    if (!taskList || !totalCount || !activeCount || !completedCount) {
        return;
    }
    taskList.replaceChildren();
    const completedTasks = task.filter((item) => item.completed);
    const activeTasks = task.filter((item) => !item.completed);
    totalCount.textContent = String(task.length);
    activeCount.textContent = String(activeTasks.length);
    completedCount.textContent = String(completedTasks.length);
    const visibleTasks = getVisibleTasks();
    visibleTasks.forEach((item) => {
        const li = document.createElement("li");
        li.className = "task-item";
        if (item.completed) {
            li.classList.add("completed");
        }
        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = item.completed;
        checkbox.setAttribute("aria-label", `Complete ${item.title}`);
        checkbox.addEventListener("change", () => {
            item.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });
        // Task title
        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = item.title;
        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${item.title}`);
        deleteButton.addEventListener("click", () => {
            task = task.filter((currentTask) => currentTask.id !== item.id);
            saveTasks();
            renderTasks();
        });
        li.append(checkbox, title, deleteButton);
        taskList.appendChild(li);
    });
}
renderTasks();
export {};
//# sourceMappingURL=script.js.map