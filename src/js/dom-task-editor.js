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
      console.log("removing...")
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
    if (priorityValue === null){
      const selectedOption = form.querySelector(`.priority-option.selected`);
      if (selectedOption) {
        return form.querySelector(`.priority-option.selected`);
      }
      priorityValue = defaultPriorityValue;
    }

    if (
      priorityValue === undefined || 
      priorityValue < 0 ||
      priorityValue > 3
    ) {
      console.error(`Invalid priority value: ${priorityValue}. It should be a number from 0 to 3`);
      return false;
    }

    const currentPriority = form.querySelector(
      `.priority-option[data-priority="${priorityValue}"]`
    );
    
    return currentPriority;
  }


  const _emptySubtasksDiv = () => {
    const form = document.querySelector("#edit-task-form")
    const newSubtaskInput = form.querySelector("#new-subtask");
    const subtasksDiv = form.querySelector(".subtasks");
    // remove all subtasks but no the input
    while (subtasksDiv.firstChild !== newSubtaskInput) {
      subtasksDiv.firstChild.remove();
    }
  }

  const _loadPriorityOptions = (task = null) => {

    if(task !== null && !(task instanceof Task)) {
      console.error("Invalid task. It should be a Task instance");
      return;
    }

    const priorityValue = task === null ? null : task.priority;

    const currentPriorityDiv = _getPriorityDiv(priorityValue);
    const currentPriorityInput = currentPriorityDiv.querySelector("input");
    currentPriorityInput.checked = true;
    _togglePrioritySelection(currentPriorityDiv, currentPriorityInput);
  
    
  }

  const _removeFormPopulation = ( controllersToAbort = []) => {
    // if (!(task instanceof Task)) {
    //   console.error("Please pass a Task instance");
    //   return;
    // }
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

    // reset priority selector (deselect)
    const priorityDiv = _getPriorityDiv(null);
    const priorityInput = priorityDiv.querySelector("input");
    const removeSelection = true;
    _togglePrioritySelection(priorityDiv, priorityInput, removeSelection)

    const dateInput = form.querySelector("#date-input");
    dateInput.value = "";
    const dateP = form.querySelector("#current-task-date");
    dateP.textContent = "Due date";

    const titleInput = form.querySelector("#task-title");
    titleInput.value = "";

    const descriptionInput = form.querySelector("#task-description");
    descriptionInput.value = "";

    const newSubtaskInput = form.querySelector("#new-subtask");
    newSubtaskInput.value = "";

    _emptySubtasksDiv();

    // remove abort controllers
    controllersToAbort.forEach((controller) => {
      controller.abort();
    });
  };

  const _generateSubtaskDiv = (
    subtask,
    subtaskNumber = "-1",
    parentTaskIndex = "-1"
  ) => {
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

    const taskIndex = input
      .closest("#edit-task-form")
      .getAttribute("data-index");
    if (!taskIndex) {
      return;
    }

    const newSubtaskDiv = _generateSubtaskDiv(new SubTask(input.value));
    subtasksDiv.insertBefore(
      newSubtaskDiv,
      subtasksDiv.querySelector("#new-subtask")
    );
    input.value = "";
  };

  const _loadSubtasks = (subtasks, subtasksDiv, emptyContainerBefore=false) => {
    const form = document.querySelector("#edit-task-form")
    const addSubtaskInput = form.querySelector("#new-subtask");
    if (subtasks && subtasks.length > -1) {
      if (emptyContainerBefore){
        _emptySubtasksDiv();
      }

      for (let i = 0; i < subtasks.length; i++) {
        const subtaskDiv = _generateSubtaskDiv(subtasks[i], i);
        subtasksDiv.insertBefore(subtaskDiv, addSubtaskInput);
      }
    }
  }

  const _loadSubtasksSection = (user, task, form, controller) => {
     // subtasks section
     const subtasks = task.subtasks;
     const subtasksDiv = form.querySelector(".subtasks");
     const addSubtaskInput = form.querySelector("#new-subtask");
     
     _loadSubtasks(subtasks, subtasksDiv);
 
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
  }

  

  const _loadProjectDropdown = (user, dropDiv, dropBtn, dropContent) => {

    // projectP.textContent = user.projects[0].title;



  }

  const popUp = (user, taskDiv = null) => {
    const dialog = document.querySelector("#task-editor-dialog");
    const projectP = dialog.querySelector(".task-project");

    const form = dialog.querySelector("#edit-task-form");
    const dateInput = form.querySelector("#date-input");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;

    // creating new task
    if (!taskDiv || !taskDiv.classList.contains("task")) {
      _loadPriorityOptions(null);
      _loadProjectDropdown();
      dialog.showModal();
      dialog.addEventListener("close",() => _removeFormPopulation(), {once: true,});
      return;
    }

    // editing existing task
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
    _loadPriorityOptions(task);

    // task title
    const taskTitleInput = form.querySelector("#task-title");
    taskTitleInput.value = task.title;

    // task description
    const taskDescriptionInput = form.querySelector("#task-description");
    taskDescriptionInput.value = task.description;

    const controller = new AbortController();    

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
    const removeSelection = true;
    _togglePrioritySelection(selectedPriorDiv, selectedPriorInput, removeSelection);

    _togglePrioritySelection(priorityDiv, priorityInput);
  };

  const clickOnDeleteSubtask = (user, subtaskDiv) =>{
    if (
      !subtaskDiv || 
      subtaskDiv.tagName !== "DIV" || 
      !subtaskDiv.classList.contains("sub", "task")
    ){
      console.error("Please pass a valid subtask div");
      return;
    }
    
    const parentForm = subtaskDiv.closest("#edit-task-form");
    const parentTaskIndex = parseInt(parentForm.getAttribute("data-index"));
    const isParentTaskNew = parentTaskIndex === -1;
    const subtaskIndex = parseInt(subtaskDiv.getAttribute("data-index"))
    const isSubtaskNew = subtaskIndex === -1;

    if (!isParentTaskNew && !isSubtaskNew){
      const parentTask = user.tasks[parentTaskIndex];
      parentTask.removeSubtask(subtaskIndex);
      const subtasksDiv = parentForm.querySelector(".subtasks");
      _loadSubtasks(parentTask.subtasks, subtasksDiv, true);
    }

    subtaskDiv.remove();
  }

  return {
    popUp,
    clickOnCheckTask,
    clickOnClose,
    clickOnDatePicker,
    clickOnSelectPriority,
    clickOnDeleteSubtask,
  };
})();
