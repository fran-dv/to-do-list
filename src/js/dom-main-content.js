import { compareAsc, format } from 'date-fns';
import { DateUtils } from './date-utils';
import '/src/css/inbox.css';
import '/src/css/tasks.css';
import addTaskImage from '/src/assets/image/plus.svg';
import { sortTasksByCategory } from './sorting';
export class MainContent {
  #sections = {
    inbox: "inbox",
  };
  #defaultContent = this.#sections.inbox;
  #currentContent;

  constructor(user = null, sectionToLoad = this.#defaultContent) {
    this.loadMainContent(user, sectionToLoad);
  }

  get currentContent(){
    return this.#currentContent;
  }

  isContentSectionValid(section) {
    return section in this.#sections;
  }

  #randomInt (max) {
    return Math.floor(Math.random() * max);
  } 

  #generateInboxWelcome(user) {
    const greetings = [
      "Hope you're having a great day.",
      "Let’s make today productive.",
      "Nice to see you back.",
      "You’re doing great — keep going!",
      "Let’s get some tasks done.",
      "Small steps make big progress.",
      "Let’s keep things moving.",
      "You're one step closer to your goals.",
      "Every task completed is a win.",
      "You’ve got this!",
    ]
    const welcomeTitle = `Good ${DateUtils.getDayMoment()}, ${user.firstname}.` ;
    const welcomeSubtitle = greetings[this.#randomInt(greetings.length)];

    const container = document.createElement('div');
    container.id = 'welcome-container';
    const h1 = document.createElement('h1');
    const h2 = document.createElement('h2');
    h1.classList.add('welcome', 'title');
    h2.classList.add('welcome', 'subtitle');
    h1.textContent = welcomeTitle;
    h2.textContent = welcomeSubtitle;
    container.appendChild(h1);
    container.appendChild(h2);

    return container;
  }

  #generateEmptyInboxDiv(){
    const emptyMsg = "Your task list is spotless. Great job!";

    const container =  document.createElement('div');
    const emptyMsgDiv = document.createElement('div');
    emptyMsgDiv.classList.add('no-tasks-msg');
    const emptyMsgH3 = document.createElement('h3');
    emptyMsgH3.textContent = emptyMsg;
    emptyMsgDiv.appendChild(emptyMsgH3);
    container.appendChild(emptyMsgDiv);
    return container;
  }

  #generateTaskDiv(user, task, taskNumber){
    const container =  document.createElement('div');
    container.classList.add('task');
    container.setAttribute('data-click', 'edit-task');
    container.setAttribute('data-index', taskNumber);
    container.setAttribute('data-completed', '0');
    container.setAttribute('data-priority', String(task.priority))
    // radio input
    const input = document.createElement('input');
    input.type = 'radio';
    input.classList.add('hidden');
    input.name = 'task-selection';
    input.id = `task-${taskNumber}`;
    container.appendChild(input);
    // custom radio div
    const radioButton = document.createElement('div');
    radioButton.classList.add('task-check');
    container.appendChild(radioButton);
    // task title
    const title = document.createElement('h2');
    title.classList.add('task-title');
    title.textContent = task.title;
    container.appendChild(title);
    // due date
    if (task.dueDate instanceof Date){
      const dueDate = document.createElement('p');
      dueDate.classList.add('due-date');
      const currentYear = new Date().getFullYear();
      if (task.dueDate.getFullYear() > currentYear){
        dueDate.textContent = format(task.dueDate, 'MMM d yyyy');
      } else {
        dueDate.textContent = format(task.dueDate, 'MMM d');
      }
      container.appendChild(dueDate);
    }
    

    return container;
  }

  #generateTasksSection(user, sortCategory){
    const container =  document.createElement('div');
    container.id = 'inbox-tasks';

    const tasksByDate = user.tasks;

    if (!tasksByDate || tasksByDate.length === 0) {
      const emptyInboxDiv = this.#generateEmptyInboxDiv();
      container.appendChild(emptyInboxDiv);
      container.classList.add('no-tasks');
      return container;
    }

    for(let i = 0; i < tasksByDate.length; i++){
      const taskDiv = this.#generateTaskDiv(user, tasksByDate[i], i);
      container.appendChild(taskDiv);
    }
  
    return container;
  }

  #resetMainContentDiv(){
    const mainDiv = document.querySelector('#dynamic-content');
    while (mainDiv.firstChild){
      mainDiv.removeChild(mainDiv.firstChild);
    }
  }

  #generateTaskListHeader(text){
    const container = document.createElement('div');
    container.classList.add('task-list-title');
    const h2 = document.createElement('h2');
    h2.textContent = String(text);
    container.appendChild(h2);
    
    // add task button
    const addTaskDiv = document.createElement('div');
    addTaskDiv.classList.add('add-task-button')
    const addTaskImg = document.createElement('img');
    addTaskImg.src = addTaskImage;
    addTaskDiv.appendChild(addTaskImg)
    container.appendChild(addTaskDiv);

    return container;
  }

  loadInboxContent(user) {
    const mainDiv = document.querySelector('#dynamic-content');
    const inboxDiv = document.createElement('div');
    inboxDiv.id = 'inbox';

    const welcomeDiv = this.#generateInboxWelcome(user);
    inboxDiv.appendChild(welcomeDiv);

    const tasksTitle = this.#generateTaskListHeader('Your tasks');
    inboxDiv.appendChild(tasksTitle);

    const tasksDiv = this.#generateTasksSection(user, 'dueDate');
    inboxDiv.appendChild(tasksDiv);
  
    this.#resetMainContentDiv();
    mainDiv.appendChild(inboxDiv);
  }

  clickOnCheckTask(user, taskDiv){
    const index = taskDiv.dataset.index;
    const input = taskDiv.querySelector('input');
    const task = user.tasks[index];
    if (taskDiv.dataset.completed === '1'){
      taskDiv.dataset.completed = '0';
      input.checked = false;
      return;
    }
    taskDiv.dataset.completed = '1';
    input.checked = true;
    return;
  }

  loadMainContent(user, contentToLoad = this.#defaultContent) {
    if (this.isContentSectionValid(contentToLoad)) {
      switch (contentToLoad) {
        case this.#sections.inbox:
          this.loadInboxContent(user);
          this.#currentContent = this.#sections.inbox;
          break;
      }
    } else {
      throw new Error("Invalid content section");
    }
  }

  updateContent(user){
    this.loadMainContent(user, this.currentContent);
  }
}

