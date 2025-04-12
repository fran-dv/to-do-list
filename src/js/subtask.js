export class SubTask {
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

  toJSON() {
    return {
      title: this.title,
      status: this.status,
    };
  }

  static getFromJSON(json) {
    const subtask = new SubTask(json.title);
    subtask.status = json.status;
    return subtask;
  }
}
