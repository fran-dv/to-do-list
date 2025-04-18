import { DateUtils } from "./date-utils";
import { Task } from "./task";
import "/src/css/task-editor.css";
import deleteSubtaskImg from "/src/assets/image/delete.svg";

export const TaskEditor = (() => {
  const classes = {
    completed: "completed",
    selected: "selected",
  };

  const _toggleSelected = (priorityOption) => {
    if (
      !priorityOption ||
      !priorityOption.classList.contains("priority-option")
    ) {
      console.error("Please pass a valid priority option div");
      return;
    }

    priorityOption.classList.toggle(classes.selected);
  };

  const _removeFormPopulation = (task) => {
    if (!(task instanceof Task)) {
      console.error("Please pass a Task instance");
      return;
    }

    const form = document.querySelector("#edit-task-form");

    const taskCheck = form.querySelector(".task-check");
    if (taskCheck.classList.contains(classes.completed)) {
      taskCheck.classList.remove(classes.completed);
    }

    const dateP = form.querySelector("#current-task-date");
    dateP.textContent = "Due date";

    _toggleSelected(
      form.querySelector(`.priority-option[data-priority="${task.priority}"]`)
    );

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

    // creating new task
    if (!taskDiv || !taskDiv.classList.contains("task")) {
      projectP.textContent = user.projects[0].title;
      dialog.showModal();
      return;
    }

    // editing task
    const taskIndex = parseInt(taskDiv.dataset.index);
    const task = user.tasks[taskIndex];
    const form = dialog.querySelector("#edit-task-form");
    const taskCheck = form.querySelector(".task-check");

    // task parent project
    projectP.textContent = task.parentProject.title;

    // task status
    if (task.status) {
      taskCheck.classList.add("completed");
    }

    // task due date
    if (task.dueDate) {
      const currentTaskDateP = form.querySelector("#current-task-date");
      currentTaskDateP.textContent = DateUtils.getFormattedDate(task.dueDate);
    }

    // priority options
    const currentPriority = form.querySelector(
      `.priority-option[data-priority="${task.priority}"]`
    );
    _toggleSelected(currentPriority);

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

  return {
    popUp,
  };
})();
