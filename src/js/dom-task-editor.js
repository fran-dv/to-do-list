import { DateUtils } from "./date-utils";
import { Task } from "./task";
import "/src/css/task-editor.css";
import deleteSubtaskImg from "/src/assets/image/delete.svg";

export const TaskEditor = (() => {
  const classes = {
    completed: "completed",
    selected: "selected",
  };

  const _toggleSelected = (priorityOption, input) => {
    if (
      !priorityOption ||
      !priorityOption.classList.contains("priority-option") ||
      !input ||
      input.tagName !== "INPUT" ||
      input.type !== "radio"
    ) {
      console.error("Please pass a valid priority option div and input");
      return;
    }

    priorityOption.classList.toggle(classes.selected);
    input.checked = input.checked ? false : true;
  };

  const _removeFormPopulation = (task) => {
    if (!(task instanceof Task)) {
      console.error("Please pass a Task instance");
      return;
    }

    const form = document.querySelector("#edit-task-form");
    form.setAttribute("data-index", "-1");

    const taskCheck = form.querySelector(".task-check");
    const checkInput = form.querySelector(".check > input[type='checkbox']");
    if (taskCheck.classList.contains(classes.completed)) {
      taskCheck.classList.remove(classes.completed);
      checkInput.checked = false;
    }

    const dateInput = form.querySelector("#date-input");
    dateInput.value = "";
    const dateP = form.querySelector("#current-task-date");
    dateP.textContent = "Due date";

    // toggle priority options
    const selectedPriorDiv = form.querySelector(
      `.priority-option[data-priority="${task.priority}"]`
    );
    const priorInput = selectedPriorDiv.querySelector("input");
    _toggleSelected(selectedPriorDiv, priorInput);

    const titleInput = form.querySelector("#task-title");
    titleInput.value = "";

    const descriptionInput = form.querySelector("#task-description");
    descriptionInput.value = "";

    const newSubtaskInput = form.querySelector("#new-subtask");
    newSubtaskInput.value = "";

    const subtasksDiv = form.querySelector(".subtasks");
    // remove all subtasks but no the input
    while (subtasksDiv.firstChild !== newSubtaskInput) {
      subtasksDiv.firstChild.remove();
    }
  };

  const _generateSubtaskDiv = (subtask, subtaskNumber) => {
    const container = document.createElement("div");
    container.classList.add("sub", "task");
    container.setAttribute("data-index", subtaskNumber);
    container.setAttribute("data-completed", subtask.status ? "1" : "0");

    // radio input
    const input = document.createElement("input");
    input.type = "radio";
    input.classList.add("hidden");
    input.name = "subtask-selection";
    input.id = `subtask-${subtaskNumber}`;
    container.appendChild(input);

    // custom radio div
    const radioButton = document.createElement("div");
    radioButton.classList.add("task-check");
    radioButton.setAttribute("data-click", "complete-subtask");
    container.appendChild(radioButton);

    // task title
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("task-title");
    const titleP = document.createElement("p");
    titleP.textContent = subtask.title;
    titleDiv.appendChild(titleP);
    container.appendChild(titleDiv);

    // delete button
    const deleteDiv = document.createElement("div");
    deleteDiv.classList.add("delete");
    const deleteImg = document.createElement("img");
    deleteImg.alt = "Delete subtask";
    deleteImg.src = deleteSubtaskImg;
    deleteDiv.appendChild(deleteImg);
    container.appendChild(deleteDiv);

    return container;
  };

  const popUp = (user, taskDiv = null) => {
    const dialog = document.querySelector("#task-editor-dialog");
    const projectP = dialog.querySelector(".task-project");

    const form = dialog.querySelector("#edit-task-form");
    const dateInput = form.querySelector("#date-input");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;

    // creating new task
    if (!taskDiv || !taskDiv.classList.contains("task")) {
      projectP.textContent = user.projects[0].title;
      dialog.showModal();
      return;
    }

    // edit existing task
    const taskIndex = parseInt(taskDiv.dataset.index);
    const task = user.tasks[taskIndex];

    form.setAttribute("data-index", `${taskIndex}`);
    const taskCheck = form.querySelector(".task-check");
    const checkInput = form.querySelector(".check > input[type='checkbox']");

    // task parent project
    projectP.textContent = task.parentProject.title;

    // task status
    if (task.status) {
      taskCheck.classList.add(classes.completed);
      checkInput.checked = true;
    }

    // task due date
    if (task.dueDate) {
      const isoDate = task.dueDate.toISOString().split("T")[0];
      dateInput.value = isoDate;
      const currentTaskDateP = form.querySelector("#current-task-date");
      currentTaskDateP.textContent = DateUtils.getFormattedDate(task.dueDate);
    }

    // priority options
    const currentPriority = form.querySelector(
      `.priority-option[data-priority="${task.priority}"]`
    );
    const currentPriorityInput = currentPriority.querySelector("input");
    currentPriorityInput.checked = true;
    _toggleSelected(currentPriority, currentPriorityInput);

    // task title
    const taskTitleInput = form.querySelector("#task-title");
    taskTitleInput.value = task.title;

    // task description
    const taskDescriptionInput = form.querySelector("#task-description");
    taskDescriptionInput.value = task.description;

    // subtasks section
    const subtasks = task.subtasks;
    const subtasksDiv = form.querySelector(".subtasks");
    const addSubtaskInput = form.querySelector("#new-subtask");
    if (subtasks && subtasks.length > -1) {
      for (let i = 0; i < subtasks.length; i++) {
        const subtaskDiv = _generateSubtaskDiv(subtasks[i], i);
        subtasksDiv.insertBefore(subtaskDiv, addSubtaskInput);
      }
    }

    dialog.showModal();
    dialog.addEventListener("close", () => _removeFormPopulation(task), {
      once: true,
    });
  };

  const clickOnClose = (user, saveChanges = false) => {
    const dialog = document.querySelector("#task-editor-dialog");

    const form = dialog.querySelector("#edit-task-form");
    const currentTaskIndex = form.dataset.index;
    if (saveChanges) {
    }

    dialog.close();
  };

  const clickOnCheckTask = (checkDiv, parentForm) => {
    if (
      !parentForm ||
      parentForm.tagName !== "FORM" ||
      !parentForm.dataset.index
    ) {
      console.error("Please pass the task editor form");
    }

    if (parentForm.dataset.index === "-1") {
      return;
    }

    // input and check div
    const radioInput = document.querySelector("input");
    const taskCheckDiv = checkDiv.querySelector(".task-check");

    const status = taskCheckDiv.classList.contains(classes.completed)
      ? false
      : true;

    taskCheckDiv.classList.toggle(classes.completed);
    radioInput.checked = status;
  };

  const _isDatePickerDiv = (datePickerDiv) => {
    return (
      datePickerDiv &&
      datePickerDiv.tagName === "DIV" &&
      datePickerDiv.classList.contains("date")
    );
  };

  const _displayDatePicked = (datePickerDiv) => {
    if (!_isDatePickerDiv(datePickerDiv)) {
      console.error("Please pass the task editor's date picker div");
      return;
    }

    const dateInput = datePickerDiv.querySelector("input[type='date']");
    const currentDateP = datePickerDiv.querySelector("#current-task-date");
    if (!dateInput.value) {
      currentDateP.textContent = "Due date";
      return;
    }

    // Adjust date picked with local time
    const [year, month, day] = dateInput.value.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);

    currentDateP.textContent = DateUtils.getFormattedDate(localDate);
  };

  const clickOnDatePicker = (datePickerDiv) => {
    if (!_isDatePickerDiv(datePickerDiv)) {
      console.error("Please pass the task editor's date picker div");
      return;
    }

    const dateInput = datePickerDiv.querySelector("#date-input");
    dateInput.showPicker();

    dateInput.addEventListener(
      "change",
      () => _displayDatePicked(datePickerDiv),
      { once: true }
    );
  };

  const clickOnSelectPriority = (priorityDiv) => {
    if (!priorityDiv || !priorityDiv.classList.contains("priority-option")) {
      console.error("Please pass a valid task editor's priority div");
      return;
    }
    if (priorityDiv.classList.contains("selected")) {
      return;
    }

    const parentDiv = priorityDiv.closest(".priority");
    const priorityInput = priorityDiv.querySelector("input[type='radio']");

    // deselect current task priority
    const selectedPriorDiv = parentDiv.querySelector(".selected");
    const selectedPriorInput = selectedPriorDiv.querySelector(
      "input[type='radio']"
    );
    _toggleSelected(selectedPriorDiv, selectedPriorInput);

    // select pressed priority
    _toggleSelected(priorityDiv, priorityInput);
  };

  return {
    popUp,
    clickOnCheckTask,
    clickOnClose,
    clickOnDatePicker,
    clickOnSelectPriority,
  };
})();
