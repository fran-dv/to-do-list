import { Project } from "./project";
import { SubTask } from "./subtask";

class Task {
  #title;
  #description;
  #completed;
  #subtasks;
  #dueDate;
  #priority;
  #tags;
  #parentProject;

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
  get description() {
    return this.#description;
  }
  get status() {
    return this.#completed;
  }
  get subtasks() {
    return this.#subtasks;
  }
  get dueDate() {
    return this.#dueDate;
  }
  get priority() {
    return this.#priority;
  }
  get tags() {
    return this.#tags;
  }
  get parentProject() {
    return this.#parentProject;
  }

  set title(title) {
    this.#title = title;
  }
  set description(description) {
    this.#description = description;
  }
  set status(boolean) {
    if (typeof boolean === "boolean") {
      this.#completed = boolean;
    }
  }
  set subtasks(subtasksArray) {
    if (!this.#isSubtasksArray(subtasksArray)) {
      return false;
    }
    this.#subtasks = this.#subtasks;
  }

  #isDateValid(dateString) {
    return !isNaN(new Date(dateString));
  }

  set dueDate(dateString) {
    if (!this.#isDateValid(dateString)) {
      console.error("invalid date string");
      return;
    }
    this.#dueDate = new Date(dateString);
  }
  set priority(number) {
    // Priority values: 0 (neutral), 1 (low), 2 (medium) and 3 (high).
    const isValidNumber =
      typeof number === "number" && number >= 0 && number <= 3;
    if (isValidNumber) {
      this.#priority = number;
    }
  }

  addSubtask(title) {
    this.#subtasks.push(new SubTask(title));
  }

  removeSubtask(subtaskIndex) {
    if (subtaskIndex >= 0 && subtaskIndex < this.#subtasks.length) {
      this.#subtasks.splice(subtaskIndex, 1);
    }
  }

  #isSubtasksArray(subtasksArray) {
    if (!Array.isArray(subtasksArray)) {
      return false;
    }
    subtasksArray.forEach((task) => {
      if (!(task instanceof SubTask)) {
        return false;
      }
    });

    return true;
  }

  addTag(tagName) {
    if (!this.#tags.includes(tagName)) {
      this.#tags.push(String(tagName));
    }
  }

  removeTag(tagName) {
    const index = this.#tags.indexOf(String(tagName));
    if (index !== -1) {
      this.#tags.splice(index, 1);
    }
  }

  #isTagsArray(tagsArray) {
    if (!Array.isArray(tagsArray)) {
      return false;
    }
    tagsArray.forEach((tag) => {
      if (typeof tag !== "string") {
        return false;
      }
    });

    return true;
  }

  set tags(tagsArray) {
    if (!this.#isTagsArray(tagsArray)) {
      return false;
    }
    this.#tags = tagsArray;
  }

  set parentProject(project) {
    if (!(project instanceof Project)) {
      console.error("Please pass a valid Project instance");
      this.#parentProject = null;
      return;
    }
    this.#parentProject = project;
  }

  toJSON() {
    return {
      title: this.title,
      description: this.description,
      status: this.status,
      subtasks: this.subtasks.map((sub) => sub.toJSON()),
      dueDate: this.dueDate,
      priority: this.priority,
      tags: this.tags,
    };
  }

  static getFromJSON(json) {
    const task = new Task(json.title);
    task.description = json.description;
    task.status = json.status;
    task.subtasks = json.subtasks.map((taskJSON) =>
      SubTask.getFromJSON(taskJSON)
    );
    task.dueDate = json.dueDate;
    task.priority = json.priority;
    task.tags = json.tags;

    return task;
  }
}

export { Task, SubTask };
