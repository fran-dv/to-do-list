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

  set title(title) {
    this.#title = title;
  }

  // create a new task
  addTask(title) {
    this.#tasks.push(new Task(title));
    this.tasks[this.tasks.length - 1].parentProject = this;
  }
  // append existing task
  appendTask(task) {
    if (!(task instanceof Task)){
      return false;
    }

    task.parentProject = this;
    this.#tasks.push(task);
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

  set tasks(tasksArray) {
    if (!this.#isTasksArray(tasksArray)) {
      return false;
    }

    this.#tasks = tasksArray;
  }

  get tasks() {
    return this.#tasks;
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
}

export { Project };
