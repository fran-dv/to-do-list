import { Task } from './tasks.js';

class Project {
    #title;
    #tasks;

    constructor(title){
        this.#title = title;
        this.#tasks = [];
    }

    get title(){
        return this.#title;
    }

    set title(title){
        this.#title = title;
    }

    addTask(title){
        this.#tasks.push(new Task(title));
    }

    removeTask(taskIndex){
        if (taskIndex >= 0 && taskIndex < this.#tasks.length){
            this.#tasks.splice(taskIndex, 1);
        };
        
    }

    get tasks(){
        return this.#tasks;
    }

}

export { Project };