class SubTask {
  #title;
  #completed;

  constructor(title) {
    this.#title = title;
    this.#completed = false;
  }

  get title() {
    return this.#title;
  }

  set title(title) {
    this.#title = title;
  }

  get status() {
    return this.#completed;
  }

  set status(boolean) {
    if (typeof boolean === "boolean") {
      this.#completed = boolean;
    }
  }
}

class Task {
  #title;
  #description;
  #completed;
  #subtasks;
  #dueDate;
  #priority;
  #tags;

  constructor(title) {
    this.#title = title;
    this.#description = "";
    this.#completed = false;
    this.#subtasks = [];
    this.#dueDate = null;
    this.#priority = 0;
    this.#tags = [];
  }

  get title() {
    return this.#title;
  }

  set title(title) {
    this.#title = title;
  }

  get description() {
    return this.#description;
  }

  set description(description) {
    this.#description = description;
  }

  get status() {
    return this.#completed;
  }

  set status(boolean) {
    if (typeof boolean === "boolean") {
      this.#completed = boolean;
    }
  }

  addSubtask(title) {
    this.#subtasks.push(new SubTask(title));
  }

  removeSubtask(subtaskIndex) {
    if (subtaskIndex >= 0 && subtaskIndex < this.#subtasks.length){
        this.#subtasks.splice(subtaskIndex, 1);
    };
    
  }

  get subTasks() {
    return this.#subtasks;
  }

  get dueDate() {
    return this.#dueDate;
  }

  set dueDate(dateString) {
    const isDateValid = (dateString) => {
      return !isNaN(new Date(dateString));
    };
    if (isDateValid(dateString)) {
      this.#dueDate = Date(dateString);
    }
  }

  set priority(number) {
    // Priority values: 0 (neutral), 1 (low), 2 (medium) and 3 (high).
    const isValidNumber =
      typeof number === "number" && number >= 0 && number <= 3;
    if (isValidNumber) {
      this.#priority = number;
    }
  }

  get priority() {
    return this.#priority;
  }

  addTag(tagName) {
    if (!this.#tags.includes(tagName)){
        this.#tags.push(String(tagName));
    }
  }

  removeTag(tagName) {
    const index = this.#tags.indexOf(String(tagName));
    if (index !== -1) {
      this.#tags.splice(index, 1);
    }
  }

  get tags() {
    return this.#tags;
  }
}

export { Task, SubTask };
