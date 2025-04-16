import { Settings } from "./dom-settings";
import "/src/css/left-sidebar.css";
import "/src/css/user-settings.css";

const LeftSidebar = (() => {
  const sidebarDiv = document.querySelector("#left-sidebar");

  const _areProjectsCollapsed = () => {
    const collapseBtn = document.querySelector(".projects-collapse");
    if (collapseBtn.classList.contains("collapsed")){
      return true;
    }
    return false;
  }

  const toggleProjectsVisibility = () => {
    const collapseBtn = document.querySelector(".projects-collapse");
    if (collapseBtn.classList.contains("collapsed")) {
      collapseBtn.classList.remove("collapsed");
    } else {
      const existingWarning = document.querySelector(".project-warning");
      collapseBtn.classList.add("collapsed");
      if (existingWarning) {
        existingWarning.remove();
      }
      setTimeout(() => _resetAddProjectsBtn(), 300); // wait for the fade-out animation
    }
  };

  const toggleVisibility = () => {
    if (sidebarDiv.classList.contains("collapsed")) {
      sidebarDiv.classList.remove("hidden");
      setTimeout(() => {
        sidebarDiv.classList.remove("collapsed");
      }, 100)
    } else {
      sidebarDiv.classList.add("collapsed");
      setTimeout(() => {
        sidebarDiv.classList.add('hidden');
      }, 300)
      if (!_areProjectsCollapsed()){
        toggleProjectsVisibility();
      }
    }
  };

  const _createProjectButton = (project) => {
    const projectDiv = document.createElement("div");
    projectDiv.classList.add("option", "project");
    const projectP = document.createElement("p");
    projectP.textContent = `# ${project.title}`;
    projectDiv.appendChild(projectP);

    return projectDiv;
  };

  const updateUserProjects = (user) => {
    const projectsList = document.querySelector(".user-projects");
    const addProjectBtn = document.querySelector(".add.project");
    while (projectsList.firstChild !== addProjectBtn) {
      projectsList.removeChild(projectsList.firstChild);
    }
    user.projects.forEach((project) => {
      projectsList.insertBefore(_createProjectButton(project), addProjectBtn);
    });
    // update local storage
    Settings.storeUserLocally(user);
  };

  const _resetAddProjectsBtn = () => {
    const addBtnDiv = document.querySelector(".add.project");
    const addBtnP = document.querySelector(".add.project > p");
    const addBtnImg = document.querySelector(".add.project > img");
    const input = document.querySelector(".add.input");
    input.value = "";
    addBtnDiv.classList.remove("clicked");
    addBtnP.classList.remove("hidden");
    addBtnImg.classList.remove("hidden");
    input.classList.add("hidden");
  };

  

  const _projectTitleWarning = (msg = "error", input) => {
    const projectsList = document.querySelector(".user-projects");
    const existingWarning = document.querySelector(".project-warning");
    if (existingWarning) {
      existingWarning.remove();
    }
    const warningP = document.createElement("p");
    warningP.classList.add("project-warning");
    warningP.textContent = String(msg);
    projectsList.appendChild(warningP);
    const controller = new AbortController();
    const removeElement = (elem) => {
      elem.remove();
      controller.abort();
      return;
    };
    input.addEventListener("keydown", () => removeElement(warningP), {
      signal: controller.signal,
    });
    input.addEventListener("blur", () => removeElement(warningP), {
      signal: controller.signal,
    });
  };

  const _submitProject = (
    input,
    user,
    controller,
    key = null,
    blur = false
  ) => {
    if ((key !== null && key.code === "Enter") || blur) {
      if (input.value === "") {
        _resetAddProjectsBtn();
        return;
      }
      const titleEntered = user.validateProjectTitle(input.value);
      if (titleEntered === null) {
        _projectTitleWarning("Oops! Not a real name, buddy.", input);
        setTimeout(() => {
          input.focus();
        }, 10);
        return;
      } else if (titleEntered === false) {
        // invalid title
        _projectTitleWarning("This name is already in use", input);
        setTimeout(() => {
          input.focus();
        }, 1);
        return;
      } else {
        // valid title
        const success = user.addProject(titleEntered);
        if (success) {
          controller.abort();
          updateUserProjects(user);
          _resetAddProjectsBtn();
          input.value = "";
          return;
        }
      }
    }
  };

  const _listenForSubmit = (input, user) => {
    const controller = new AbortController();

    input.addEventListener(
      "keydown",
      (key) => _submitProject(input, user, controller, key),
      { signal: controller.signal }
    );
    input.addEventListener(
      "blur",
      () => _submitProject(input, user, controller, null, true),
      { signal: controller.signal }
    );
  };

  const clickOnAddProject = (user) => {
    const addBtnDiv = document.querySelector(".add.project");
    const addBtnP = document.querySelector(".add.project > p");
    const addBtnImg = document.querySelector(".add.project > img");
    const input = document.querySelector(".add.input");
    addBtnDiv.classList.add("clicked");
    addBtnP.classList.add("hidden");
    addBtnImg.classList.add("hidden");
    input.classList.remove("hidden");
    input.focus();
    _listenForSubmit(input, user);
  };

  const clickOnSettingsButton = (user, Settings) => {
    const settingsDialog = document.querySelector("#settings-dialog");
    Settings.loadUserInfoInSettings(user);
    settingsDialog.showModal();
  };

  const updateUserPreviewInfo = (user) => {
    const photoParent = document.querySelector(".photo-circle");
    const photo = document.querySelector(".photo-preview");
    const name = document.querySelector(".full-name");
    const username = document.querySelector(".username");

    if (user.photo) {
      photoParent.classList.remove("empty");
      photo.src = user.photo;
    }

    name.textContent = user.fullname
      ? user.firstname
      : "Your name";
    username.textContent = user.username;
  };

  return {
    toggleVisibility,
    updateUserProjects,
    toggleProjectsVisibility,
    clickOnAddProject,
    clickOnSettingsButton,
    updateUserPreviewInfo,
  };
})();

export { LeftSidebar };
