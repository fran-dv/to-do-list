import { Project } from './projects';


class User {
    #fullname;
    #username;
    #photo;
    #projects;

    constructor(name){
        this.#fullname = name;
        this.#username = null;
        this.#photo = null;
        this.#projects = [new Project('My Tasks')];
    }

    get fullname(){
        return this.#fullname;
    }

    set fullname(name){
        this.#fullname = name;
    }

    get username() {
        return this.#username;
    }

    set username(username){
        this.#username = username;
    }

    get photo() {
        return this.#photo;
    }

    set photo(photoSrc){
        this.#photo = photoSrc;
    }

    addProject(title){
        if (!this.#projects.includes(title)){
            this.#projects.push(new Project(title));
        }
    }

    removeProject(projectName){
        const index = this.#projects.indexOf(projectName);
        if (index !== -1){
            this.#projects.splice(index, 0);
        }
    }

    get projects(){
        return this.#projects;
    }
}

export { Project };