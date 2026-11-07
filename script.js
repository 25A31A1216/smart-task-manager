
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const openFormBtn = document.getElementById("openFormBtn");
const cancelBtn = document.getElementById("cancelBtn");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");

const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");

let tasks = JSON.parse(localStorage.getItem("smartTasks")) || [];

let currentFilter = "all";
let editingTaskId = null;

// Save tasks to Local Storage
function saveTasks() {
    localStorage.setItem("smartTasks", JSON.stringify(tasks));
}

// Safe text for HTML display
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Open task form
openFormBtn.addEventListener("click", () => {
    editingTaskId = null;
    taskForm.reset();

    document.getElementById("formTitle").textContent = "Add New Task";
    document.getElementById("saveBtn").textContent = "Save Task";

    taskForm.classList.remove("hidden");
    taskTitle.focus();
});

// Close task form
cancelBtn.addEventListener("click", closeForm);

function closeForm() {
    taskForm.classList.add("hidden");
    taskForm.reset();
    editingTaskId = null;
}

// Add or update task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;
    const dueDate = taskDate.value;

    if (!title) {
        alert("Please enter a task title.");
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(t => t.id === editingTaskId);

        if (task) {
            task.title = title;
            task.description = description;
            task.priority = priority;
            task.dueDate = dueDate;
        }
    } else {
        const newTask = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            title,
            description,
            priority,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
    }

    saveTasks();
    closeForm();
    renderTasks();
});

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task) return;

    editingTaskId = id;

    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskPriority.value = task.priority;
    taskDate.value = task.dueDate;

    document.getElementById("formTitle").textContent = "Edit Task";
    document.getElementById("saveBtn").textContent = "Update Task";

    taskForm.classList.remove("hidden");

    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// Delete task
function deleteTask(id) {
    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// Complete or uncomplete task
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
}

// Update dashboard statistics
function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("progress").textContent = percentage + "%";
}

// Filter navigation
document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});

// Search tasks
searchInput.addEventListener("input", renderTasks);

// Filter by priority
priorityFilter.addEventListener("change", renderTasks);

// Render tasks
function renderTasks() {

    updateStatistics();

    const searchText = searchInput.value.toLowerCase().trim();

    const selectedPriority = priorityFilter.value;

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText) ||
            task.description.toLowerCase().includes(searchText);

        const matchesPriority =
            selectedPriority === "all" ||
            task.priority === selectedPriority;

        const matchesStatus =
            currentFilter === "all" ||
            (currentFilter === "completed" && task.completed) ||
            (currentFilter === "pending" && !task.completed);

        return matchesSearch && matchesPriority && matchesStatus;
    });

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
    }

    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        const dateText = task.dueDate
            ? new Date(task.dueDate + "T00:00:00").toLocaleDateString()
            : "No due date";

        card.innerHTML = `
            <input
                type="checkbox"
                class="task-check"
                aria-label="Mark ${escapeHTML(task.title)} as completed"
                ${task.completed ? "checked" : ""}
            >

            <div class="task-info">
                <h3>${escapeHTML(task.title)}</h3>

                <p>${escapeHTML(task.description || "No description added.")}</p>

                <div class="task-meta">
                    <span class="priority ${escapeHTML(task.priority)}">
                        ${escapeHTML(task.priority)} Priority
                    </span>

                    <span class="due-date">
                        📅 ${escapeHTML(dateText)}
                    </span>
                </div>
            </div>

            <div class="task-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        card.querySelector(".task-check").addEventListener("change", () => {
            toggleTask(task.id);
        });

        card.querySelector(".edit-btn").addEventListener("click", () => {
            editTask(task.id);
        });

        card.querySelector(".delete-btn").addEventListener("click", () => {
            deleteTask(task.id);
        });

        taskList.appendChild(card);
    });
}

// Initial application load
renderTasks();
      
