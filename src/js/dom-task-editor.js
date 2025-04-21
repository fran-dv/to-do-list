import { DateUtils } from "./date-utils";
import { Task } from "./task";
import "/src/css/task-editor.css";
import deleteSubtaskImg from "/src/assets/image/delete.svg";
import { User } from "./user";
import { SubTask } from "./subtask";

export const TaskEditor = (() => {
  const classes = {
    completed: "completed",
    selected: "selected",
  };

  const _togglePrioritySelection = (priorityOption, input, remove = false) => {
    if (
      !priorityOption ||
      priorityOption.tagName !== "DIV" ||
      !priorityOption.classList.contains("priority-option") ||
      !input ||
      input.tagName !== "INPUT" ||
      input.type !== "radio"
    ) {
      console.error("Please pass a valid priority option div and input");
      return;
    }

    if (remove) {
      priorityOption.classList.remove(classes.selected);
      input.checked = false;
      return;
    }

    priorityOption.classList.add(classes.selected);
    input.checked = true;
  };

  const _getPriorityDiv = (priorityValue) => {
    const form = document.querySelector("#edit-task-form");
    const defaultPriorityValue = 0;
    if (priorityValue === null) {
      const selectedOption = form.querySelector(`.priority-option.selected`);
      if (selectedOption) {
        return form.querySelector(`.priority-option.selected`);
      }
      priorityValue = defaultPriorityValue;
    }

    if (priorityValue === undefined || priorityValue < 0 || priorityValue > 3) {
      console.error(
        `Invalid priority value: ${priorityValue}. It should be a number from 0 to 3`
      );
      return false;
    }

    const currentPriority = form.querySelector(
      `.priority-option[data-priority="${priorityValue}"]`
    );

    return currentPriority;
  };

  const _emptySubtasksDiv = () => {
    const form = document.querySelector("#edit-task-form");
    const newSubtaskInput = form.querySelector("#new-subtask");
    const subtasksDiv = form.querySelector(".subtasks");
    // remove all subtasks but no the input
    while (subtasksDiv.firstChild !== newSubtaskInput) {
      subtasksDiv.firstChild.remove();
    }
  };

  const _loadPriorityOptions = (task = null) => {
    if (task !== null && !(task instanceof Task)) {
      console.error("Invalid task. It should be a Task instance");
      return;
    }

    const priorityValue = task === null ? null : task.priority;

    const currentPriorityDiv = _getPriorityDiv(priorityValue);
    const currentPriorityInput = currentPriorityDiv.querySelector("input");
    currentPriorityInput.checked = true;
    _togglePrioritySelection(currentPriorityDiv, currentPriorityInput);
  };

  const _generateSubtaskDiv = (
    subtask,
    subtaskNumber = "-1",
    parentTaskIndex = "-1"
  ) => {
    if (subtaskNumber === "-1") {
      const subtasksDiv = document.querySelector(".subtasks");
      subtaskNumber = subtasksDiv.dataset.amount;
    }
    const container = document.createElement("div");
    container.classList.add("sub", "task");
    container.setAttribute("data-index", subtaskNumber);
    container.setAttribute("data-completed", subtask.status ? "1" : "0");
    container.setAttribute("data-parent-index", parentTaskIndex);

    // hidden text input with subtask title
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.classList.add("hidden");
    titleInput.id = `title-subtask-${subtaskNumber}`;
    titleInput.value = subtask.title;
    titleInput.name = `title-subtask-${subtaskNumber}`;
    container.appendChild(titleInput);

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
    deleteDiv.setAttribute("data-click", "delete-subtask");
    const deleteImg = document.createElement("img");
    deleteImg.alt = "Delete subtask";
    deleteImg.src = deleteSubtaskImg;
    deleteDiv.appendChild(deleteImg);
    container.appendChild(deleteDiv);

    return container;
  };

  const _updateSubtasksAmountAttr = (subtasksDiv, operation) => {
    let newSubtasksAmount = parseInt(subtasksDiv.dataset.amount);

    if (operation === true) {
      ++newSubtasksAmount;
    }
    if (operation === false) {
      --newSubtasksAmount;
    }
    if (operation === null) {
      newSubtasksAmount = 0;
    }

    subtasksDiv.setAttribute("data-amount", newSubtasksAmount);
  };

  const _handleSubtaskSubmits = (
    subtasksDiv,
    user,
    input,
    controller,
    keydownEvent = null,
    blur = false
  ) => {
    if (keydownEvent && !(keydownEvent instanceof KeyboardEvent)) {
      console.error("Invalid Keydown event. It must be KeyboardEvent type");
      return;
    }
    if (keydownEvent && keydownEvent.code !== "Enter") {
      return;
    }
    if (keydownEvent) {
      keydownEvent.preventDefault();
    }
    if (
      !subtasksDiv ||
      subtasksDiv.tagName !== "DIV" ||
      !subtasksDiv.classList.contains("subtasks")
    ) {
      console.error("Please pass a valid subtasks div container");
      return;
    }
    if (!user || !(user instanceof User)) {
      console.error("Please pass a valid User object");
      return;
    }
    if (!input || input.tagName !== "INPUT") {
      console.error("Please pass a valid text input element");
      return;
    }

    if (input.value === "") {
      return;
    }

    if (!controller || !(controller instanceof AbortController)) {
      console.error("Please pass a valid AbortController to remove listeners");
      return;
    }

    if (!keydownEvent && !blur) {
      return;
    }

    const taskIndexAttr = input
      .closest("#edit-task-form")
      .getAttribute("data-index");

    if (taskIndexAttr === null || taskIndexAttr === undefined) {
      console.error("Form parent does not contains data-index attribute");
      return;
    }

    const taskIndex = parseInt(taskIndexAttr);
    const subtaskIndex = parseInt(subtasksDiv.dataset.amount);
    let subtask;

    if (taskIndex !== -1) {
      const task = user.tasks[taskIndex];
      task.addSubtask(input.value);
      subtask = task.subtasks[subtaskIndex];
    } else {
      subtask = new SubTask(input.value);
    }

    const newSubtaskDiv = _generateSubtaskDiv(subtask, subtaskIndex, taskIndex);
    subtasksDiv.insertBefore(
      newSubtaskDiv,
      subtasksDiv.querySelector("#new-subtask")
    );

    const increment = true;
    _updateSubtasksAmountAttr(subtasksDiv, increment);

    input.value = "";
  };

  const _loadSubtasks = (
    subtasks,
    subtasksDiv,
    emptyContainerBefore = false
  ) => {
    const form = document.querySelector("#edit-task-form");
    const addSubtaskInput = form.querySelector("#new-subtask");
    if (subtasks && subtasks.length > -1) {
      if (emptyContainerBefore) {
        _emptySubtasksDiv();
      }

      for (let i = 0; i < subtasks.length; i++) {
        const subtaskDiv = _generateSubtaskDiv(subtasks[i], i);
        subtasksDiv.insertBefore(subtaskDiv, addSubtaskInput);
      }

      subtasksDiv.setAttribute("data-amount", subtasks.length);
    }
  };

  const _loadSubtasksSection = (user, task, form, controller) => {
    // subtasks section
    const subtasksDiv = form.querySelector(".subtasks");
    const addSubtaskInput = form.querySelector("#new-subtask");
    const subtasks = task instanceof Task ? task.subtasks : null;
    if (subtasks) {
      _loadSubtasks(subtasks, subtasksDiv);
    }

    addSubtaskInput.addEventListener(
      "keydown",
      (e) =>
        _handleSubtaskSubmits(
          subtasksDiv,
          user,
          addSubtaskInput,
          controller,
          e
        ),
      {
        signal: controller.signal,
      }
    );

    addSubtaskInput.addEventListener(
      "blur",
      () =>
        _handleSubtaskSubmits(
          subtasksDiv,
          user,
          addSubtaskInput,
          controller,
          null,
          true
        ),
      {
        signal: controller.signal,
      }
    );
  };

  const _generateDropdownItem = (title, index) => {
    const item = document.createElement("div");
    item.classList.add("drop-menu-item");
    item.setAttribute("data-click", "dropdown-item");
    item.setAttribute("data-index", `${index}`);
    const p = document.createElement("p");
    p.textContent = title;
    item.appendChild(p);

    return item;
  };

  const _destroyProjectDropdown = () => {
    const form = document.querySelector("#edit-task-form");
    const dropDiv = form.querySelector("#project-selector");
    const projectP = dropDiv.querySelector(".task-project");
    const dropContent = dropDiv.querySelector("#project-dropdown-content");

    projectP.textContent = "";
    while (dropContent.firstChild) {
      dropContent.firstChild.remove();
    }
  };

  const _loadProjectsDropdown = (user, projectIndex = null) => {
    if (!user || !(user instanceof User)) {
      console.error("Please pass a valid user. It should be an User instance");
      return;
    }
    if (
      projectIndex !== null &&
      (typeof projectIndex !== "number" ||
        projectIndex < 0 ||
        projectIndex >= user.projects.length)
    ) {
      console.error(
        "Invalid project index. It should be null or a number within range of user's projects array"
      );
      return;
    }

    const form = document.querySelector("#edit-task-form");
    const dropDiv = form.querySelector("#project-selector");
    const projectInput = dropDiv.querySelector("#project-input");
    const dropBtn = dropDiv.querySelector(".dropdown-btn");
    const projectP = dropBtn.querySelector(".task-project");
    const dropContent = dropDiv.querySelector("#project-dropdown-content");

    const defaultProjectIndex = 0;
    const index = projectIndex ? projectIndex : defaultProjectIndex;

    const projects = user.projects;
    for (let i = 0; i < projects.length; i++) {
      const currentProjectTitle = projects[i].title;
      const item = _generateDropdownItem(currentProjectTitle, i);
      if (i === index) {
        continue;
      }
      dropContent.appendChild(item);
    }

    dropDiv.setAttribute("data-project-index", `${index}`);
    projectInput.value = String(index);
    projectP.textContent = user.projects[index].title;
  };

  const _removeFormPopulation = (controllersToAbort = []) => {
    if (!Array.isArray(controllersToAbort)) {
      console.error("Please pass a valid array with the controller/s to abort");
      return;
    } else {
      controllersToAbort.forEach((item) => {
        if (!(item instanceof AbortController)) {
          console.error(
            `Item ${controllersToAbort.indexOf(
              item
            )} is not a valid ControllerAbort instance`
          );
          return;
        }
      });
    }

    const form = document.querySelector("#edit-task-form");
    form.setAttribute("data-index", "-1");

    const taskCheck = form.querySelector(".task-check");
    const checkInput = form.querySelector(".check > input[type='checkbox']");
    if (taskCheck.classList.contains(classes.completed)) {
      taskCheck.classList.remove(classes.completed);
      checkInput.checked = false;
    }

    // reset date picker
    const dateInput = form.querySelector("#date-input");
    dateInput.value = "";
    const dateP = form.querySelector("#current-task-date");
    dateP.textContent = "Due date";

    // reset priority selector (deselect)
    const priorityDiv = _getPriorityDiv(null);
    const priorityInput = priorityDiv.querySelector("input");
    const removeSelection = true;
    _togglePrioritySelection(priorityDiv, priorityInput, removeSelection);

    // reset project selector
    _destroyProjectDropdown();
    _hideProjectsDropdown(form.querySelector("#project-selector"));

    // reset title
    const titleInput = form.querySelector("#task-title");
    titleInput.value = "";

    // reset description
    const descriptionInput = form.querySelector("#task-description");
    descriptionInput.value = "";

    // reset subtasks
    const newSubtaskInput = form.querySelector("#new-subtask");
    newSubtaskInput.value = "";
    _emptySubtasksDiv();
    _updateSubtasksAmountAttr(form.querySelector(".subtasks"), null);

    // remove abort controllers
    controllersToAbort.forEach((controller) => {
      controller.abort();
    });
  };

  const popUp = (user, taskDiv = null) => {
    const dialog = document.querySelector("#task-editor-dialog");
    const projectP = dialog.querySelector(".task-project");

    const form = dialog.querySelector("#edit-task-form");
    const dateInput = form.querySelector("#date-input");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;

    const controller = new AbortController();

    // - creating new task

    if (!taskDiv || !taskDiv.classList.contains("task")) {
      _loadPriorityOptions(null);
      _loadProjectsDropdown(user);
      form.setAttribute("data-index", "-1");
      _loadSubtasksSection(user, null, form, controller);
      dialog.showModal();
      dialog.addEventListener("close", () => _removeFormPopulation(), {
        once: true,
      });
      return;
    }

    // - editing existing task

    const taskIndex = parseInt(taskDiv.dataset.index);
    const task = user.tasks[taskIndex];

    form.setAttribute("data-index", `${taskIndex}`);
    const taskCheck = form.querySelector(".task-check");
    const checkInput = form.querySelector("#editor-task-check-input");

    // task parent project
    const parentProject = task.parentProject;
    const parentProjectIndex = user.getProjectIndex(parentProject);
    _loadProjectsDropdown(user, parentProjectIndex);

    // task status
    if (task.status) {
      taskCheck.classList.add(classes.completed);
      checkInput.checked = true;
    } else {
      checkInput.checked = false;
    }

    // task due date
    if (task.dueDate) {
      const isoDate = task.dueDate.toISOString().split("T")[0];
      dateInput.value = isoDate;
      const currentTaskDateP = form.querySelector("#current-task-date");
      currentTaskDateP.textContent = DateUtils.getFormattedDate(task.dueDate);
    }

    // priority options
    _loadPriorityOptions(task);

    // task title
    const taskTitleInput = form.querySelector("#task-title");
    taskTitleInput.value = task.title;

    // task description
    const taskDescriptionInput = form.querySelector("#task-description");
    taskDescriptionInput.value = task.description;

    _loadSubtasksSection(user, task, form, controller);

    dialog.showModal();

    dialog.addEventListener(
      "close",
      () => _removeFormPopulation([controller]),
      {
        once: true,
      }
    );
  };

  const closeEditor = () => {
    const dialog = document.querySelector("#task-editor-dialog");
    dialog.close();
  };

  const clickOnCheckTask = (checkDiv, parentForm) => {
    if (!parentForm || parentForm.tagName !== "FORM") {
      console.error("Please pass the task editor form");
    }

    // input and check div
    const radioInput = document.querySelector("#editor-task-check-input");
    const taskCheckDiv = checkDiv.querySelector(".task-check");

    taskCheckDiv.classList.toggle(classes.completed);
    radioInput.checked = radioInput.checked ? false : true;
  };

  const _isDatePickerDiv = (datePickerDiv) => {
    return (
      datePickerDiv &&
      datePickerDiv.tagName === "DIV" &&
      datePickerDiv.classList.contains("date")
    );
  };

  const _getLocalDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate;
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

    const localDate = _getLocalDate(dateInput.value);

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
    const removeSelection = true;
    _togglePrioritySelection(
      selectedPriorDiv,
      selectedPriorInput,
      removeSelection
    );

    _togglePrioritySelection(priorityDiv, priorityInput);
  };

  const clickOnDeleteSubtask = (user, subtaskDiv) => {
    if (
      !subtaskDiv ||
      subtaskDiv.tagName !== "DIV" ||
      !subtaskDiv.classList.contains("sub", "task")
    ) {
      console.error("Please pass a valid subtask div");
      return;
    }

    const parentForm = subtaskDiv.closest("#edit-task-form");
    const parentTaskIndex = parseInt(parentForm.getAttribute("data-index"));
    const isParentTaskNew = parentTaskIndex === -1;
    const subtaskIndex = parseInt(subtaskDiv.getAttribute("data-index"));
    const isSubtaskNew = !(
      user.tasks[parentTaskIndex].subtasks[subtaskIndex] instanceof SubTask
    );

    const subtasksDiv = parentForm.querySelector(".subtasks");
    if (!isParentTaskNew && !isSubtaskNew) {
      const parentTask = user.tasks[parentTaskIndex];
      parentTask.removeSubtask(subtaskIndex);
      _loadSubtasks(parentTask.subtasks, subtasksDiv, true);
    } else {
      const decrement = false;
      _updateSubtasksAmountAttr(subtasksDiv, decrement);
    }

    subtaskDiv.remove();
  };

  let isDropdownOpen = false;

  const _openProjectsDropdown = (dropDiv) => {
    const content = dropDiv.querySelector(".dropdown-content");
    content.classList.remove("hidden");
    isDropdownOpen = true;
  };

  const _hideProjectsDropdown = (dropDiv) => {
    const content = dropDiv.querySelector(".dropdown-content");
    content.classList.add("hidden");
    isDropdownOpen = false;
  };

  const clickOnProjectsDropdown = (dropdownDiv) => {
    if (
      !dropdownDiv ||
      dropdownDiv.tagName !== "DIV" ||
      !dropdownDiv.classList.contains("dropdown")
    ) {
      console.error("Invalid dropdown div");
      return;
    }

    if (isDropdownOpen) {
      _hideProjectsDropdown(dropdownDiv);
      return;
    }

    _openProjectsDropdown(dropdownDiv);
  };

  const clickOnProjectsDropdownItem = (user, item) => {
    if (!item || item.tagName !== "DIV" || !item.dataset.index) {
      console.error("Please pass a valid dropdown item div");
      return;
    }
    const dropdownDiv = item.closest("#project-selector");
    const projectIndex = parseInt(item.dataset.index);
    _loadProjectsDropdown(user, projectIndex);
    _hideProjectsDropdown(dropdownDiv);
  };

  const _getFormSubtasks = (task, form, formData) => {
    const subtasksDiv = form.querySelector(".subtasks");
    const amount = parseInt(subtasksDiv.dataset.amount);

    const subtasks = [];
    for (let i = 0; i < amount; i++) {
      const title = formData.get(`title-subtask-${i}`);
      const titleExists = (subtask) => subtask.title === title;
      const exist = task.subtasks.findIndex(titleExists) !== -1 ? true : false;

      if (!exist) {
        subtasks.push(new SubTask(title));
      }
    }

    return subtasks;
  };

  const saveTask = (user, form) => {
    if (!form || form.tagName !== "FORM") {
      console.error("Please pass a valid form");
      return;
    }

    const formData = new FormData(form);

    const data = {
      status: formData.get("task-check") === null ? false : true,
      date: formData.get("task-date") === "" ? null : formData.get("task-date"),
      priority: parseInt(formData.get("priority")),
      projectIndex: parseInt(formData.get("task-project")),
      title: formData.get("task-title"),
      description: formData.get("task-description"),
      subtasks: (task) => _getFormSubtasks(task, form, formData),
    };

    const idxAttr = form.dataset.index;
    const index = parseInt(idxAttr, 10);
    const existingTask = index !== -1 && index < user.tasks.length;

    let task;

    if (existingTask) {
      task = user.tasks[index];

      const oldProjIdx = user.getProjectIndex(task.parentProject);
      if (oldProjIdx !== data.projectIndex) {
        user.removeTask(index);
        user.addTask(task, data.projectIndex);
      }
    } else {
      task = new Task(data.title);
    }

    task.title = data.title;
    task.description = data.description;
    task.status = data.status;
    if (data.date) {
      const localDate = _getLocalDate(data.date);
      task.dueDate = localDate;
    }
    task.priority = data.priority;
    task.subtasks = data.subtasks(task);

    if (!existingTask) {
      user.addTask(task, data.projectIndex);
    }

    closeEditor();
  };

  return {
    popUp,
    clickOnCheckTask,
    closeEditor,
    clickOnDatePicker,
    clickOnSelectPriority,
    clickOnDeleteSubtask,
    clickOnProjectsDropdown,
    clickOnProjectsDropdownItem,
    saveTask,
  };
})();
