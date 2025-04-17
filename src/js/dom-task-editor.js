import "/src/css/task-editor.css";

export const TaskEditor = (() => {
  const popUp = (taskIndex = null) => {
    const dialog = document.querySelector("#task-editor-dialog");
    if (taskIndex) {
    }

    dialog.showModal();
  };

  return {
    popUp,
  };
})();
