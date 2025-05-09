import "/src/css/global.css";
import { Task } from "./task.js";
import { Project } from "./project.js";
import { MainContent } from "./dom-main-content.js";
import { LeftSidebar } from "./dom-left-sidebar.js";
import { User } from "./user.js";
import { Settings } from "./dom-settings.js";
import { TaskEditor } from "./dom-task-editor.js";

const CurrentUser = User.getExistingOrCreateNew("Name");
LeftSidebar.updateUserProjects(CurrentUser);
LeftSidebar.updateUserPreviewInfo(CurrentUser);
const Content = new MainContent(CurrentUser);

const handlePageClicks = (e) => {
  const target = e.target.closest("[data-click]");

  if (target === null) {
    return;
  }

  switch (target.dataset.click) {
    case "inbox":
      Content.loadMainContent(CurrentUser, "inbox");
      break;
    case "collapse-projects":
      LeftSidebar.toggleProjectsVisibility();
      break;
    case "collapse-sidebar":
      LeftSidebar.toggleVisibility();
      break;
    case "add-project":
      LeftSidebar.clickOnAddProject(CurrentUser);
      break;
    case "user-settings":
      LeftSidebar.clickOnSettingsButton(CurrentUser, Settings);
      break;
    case "exit-settings":
      Settings.clickOnExitSettings(CurrentUser);
      break;
    case "upload-photo":
      Settings.clickOnUploadPhoto();
      break;
    case "new-name":
      Settings.clickOnNewName(CurrentUser);
      break;
    case "new-username":
      Settings.clickOnNewUsername(CurrentUser);
      break;
    case "save-settings":
      e.preventDefault();
      const saveSettings = true;
      Settings.clickOnExitSettings(CurrentUser, saveSettings);
      Content.updateContent(CurrentUser);
      break;
    case "new-task":
      TaskEditor.popUp(CurrentUser);
      break;
    case "edit-task":
      TaskEditor.popUp(CurrentUser, target);
      break;
    case "finished-tasks":
      Content.loadMainContent(CurrentUser, "finished");
      break;
    case "complete-task":
      const parentTaskDiv = target.closest(".task");
      Content.clickOnCheckTask(CurrentUser, parentTaskDiv);
      break;
    case "close-editor":
      TaskEditor.closeEditor();
      break;
    case "complete-task-editor":
      const parentForm = target.closest("form");
      TaskEditor.clickOnCheckTask(target, parentForm);
      break;
    case "date-picker":
      TaskEditor.clickOnDatePicker(target);
      break;
    case "select-priority":
      TaskEditor.clickOnSelectPriority(target);
      break;
    case "delete-subtask":
      TaskEditor.clickOnDeleteSubtask(CurrentUser, target.closest(".sub.task"));
      break;
    case "projects-dropdown":
      TaskEditor.clickOnProjectsDropdown(target);
      break;
    case "dropdown-item":
      TaskEditor.clickOnProjectsDropdownItem(CurrentUser, target);
      break;
    case "save-task":
      e.preventDefault();
      TaskEditor.saveTask(CurrentUser, target.closest("#edit-task-form"));
      Content.updateContent(CurrentUser);
      break;
    case "delete-task":
      e.preventDefault();
      TaskEditor.deleteTask(CurrentUser, target.closest("#edit-task-form"));
      Content.updateContent(CurrentUser);
      break;
    case "complete-subtask":
      TaskEditor.clickOnCheckSubtask(CurrentUser, target.closest("#edit-task-form"), target.closest(".sub.task"));
      break;
  }
};

document.body.addEventListener("click", handlePageClicks);
document.querySelector("#edit-task-form").addEventListener("submit", (e) => {
  e.preventDefault();
});

export { CurrentUser };
