import { Project } from "./project";
import { Task } from "./task";

class User {
  #photoUrl;
  #fullname;
  #username;
  #projects = [];
  #photoItem = "userPhoto";

  constructor(name) {
    this.#fullname = name;
    this.#username = null;
    this.#projects = [new Project("My Tasks")];
    this.#photoUrl = null;
  }

  get fullname() {
    return this.#fullname;
  }

  get username() {
    return this.#username;
  }

  get photo() {
    return this.#photoUrl;
  }

  get projects() {
    return this.#projects;
  }

  get photoItem() {
    return this.#photoItem;
  }

  set fullname(name) {
    if (this.isValidName(name)) {
      this.#fullname = name;
    }
  }

  set username(username) {
    this.#username = username;
  }

  set photo(url) {
    this.#photoUrl = url;
    localStorage.setItem(this.#photoItem, this.#photoUrl);
  }

  set projects(projectsArray) {
    if (!this.#isProjectsArray(projectsArray)) {
      return false;
    }

    this.#projects = projectsArray;
  }

  isValidName(name) {
    const validNamePattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return validNamePattern.test(name);
  }

  validateNameOrUsername(title) {
    title = String(title);
    if (this.#isWhiteSpaceOnly(title)) {
      return null;
    }
    title = this.#removeStringWhitespaces(title);
    let isValid = this.isValidName(title);

    return isValid ? title : false;
  }

  addProject(title) {
    if (!this.#projects.includes(title)) {
      this.#projects.push(new Project(title));
      return true;
    }
  }

  removeProject(projectName) {
    const index = this.#projects.indexOf(projectName);
    if (index !== -1) {
      this.#projects.splice(index, 0);
    }
  }

  #isProjectsArray(projectsArray) {
    if (!Array.isArray(projectsArray)) {
      return false;
    }
    projectsArray.forEach((proj) => {
      if (!(proj instanceof Task)) {
        return false;
      }
    });

    return true;
  }

  #isWhiteSpaceOnly = (title) => {
    return /^\s*$/.test(title);
  };

  #removeStringWhitespaces = (str) => {
    return str.trim().split(/\s+/).join(" ");
  };

  validateProjectTitle(title) {
    title = String(title);
    if (this.#isWhiteSpaceOnly(title)) {
      return null;
    }
    title = this.#removeStringWhitespaces(title);
    let isValid = true;
    this.#projects.forEach((project) => {
      console.log(
        project.title,
        project.title.toLowerCase() === title.toLowerCase()
      );
      if (project.title.toLowerCase() === title.toLowerCase()) {
        isValid = false;
      }
    });

    return isValid ? title : false;
  }

  toJSON() {
    return {
      fullname: this.fullname,
      username: this.username,
      photo: this.photo,
      projects: this.projects.map((p) => p.toJSON()),
    };
  }

  static getFromJSON(json) {
    if (!json) {
      return null;
    }
    const user = new User(json.fullname);
    user.username = json.username;
    user.photo = json.photo;
    user.projects = json.projects
      ? json.projects.map((proj) => Project.getFromJSON(proj))
      : [];

    return user;
  }

  static getExistingOrCreateNew(name = "Anonymous") {
    const userJSON = localStorage.getItem("User");
    if (!userJSON) {
      const user = new User(name);
      return user;
    }

    return this.getFromJSON(JSON.parse(userJSON));
  }

  static getStoredUser() {
    return this.getFromJSON(JSON.parse(localStorage.getItem("User")));
  }
}

export { User };
