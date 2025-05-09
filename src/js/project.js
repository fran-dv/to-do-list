import { Task } from "./task.js";

class Project {
  #title;
  #tasks;

  constructor(title) {
    this.#title = title;
    this.#tasks = [];
  }

  get title() {
    return this.#title;
  }
  get tasks() {
    return this.#tasks;
  }

  set title(title) {
    this.#title = title;
  }

  set tasks(tasksArray) {
    if (!this.#isTasksArray(tasksArray)) {
      return false;
    }

    this.#tasks = tasksArray;
  }

  // create a new task
  addTask(title) {
    this.#tasks.push(new Task(title));
    this.tasks[this.tasks.length - 1].parentProject = this;
  }
  // append existing task
  appendTask(task) {
    if (!(task instanceof Task)) {
      return false;
    }

    task.parentProject = this;
    this.#tasks.push(task);
  }

  getTaskIndex(taskToFind) {
    if (!(taskToFind instanceof Task)) {
      console.error("Please pass a valid task.");
      return;
    }

    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i] === taskToFind) {
        return i;
      }
    }

    return false;
  }

  removeTask(taskIndex) {
    if (taskIndex >= 0 && taskIndex < this.#tasks.length) {
      this.tasks[taskIndex].parentProject = null;
      this.#tasks.splice(taskIndex, 1);
    }
  }

  #isTasksArray(tasksArray) {
    if (!Array.isArray(tasksArray)) {
      return false;
    }
    tasksArray.forEach((task) => {
      if (!(task instanceof Task)) {
        return false;
      }
    });

    return true;
  }

  toJSON() {
    return {
      title: this.title,
      tasks: this.tasks.map((t) => t.toJSON()),
    };
  }

  static getFromJSON(json) {
    const project = new Project(json.title);
    project.tasks = json.tasks.map((taskJSON) => Task.getFromJSON(taskJSON));
    return project;
  }

  static getFromJSONWithoutTasks(json) {
    return new Project(json.title);
  }
}

export { Project };
