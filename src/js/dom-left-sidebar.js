import '/src/css/left-sidebar.css';
import { CurrentUser } from './index.js';
import { warn } from 'vue';

const LeftSidebar = ( () => {
    const sidebarDiv = document.querySelector('#left-sidebar');
    

    const toggleVisibility = () => {
        if (sidebarDiv.classList.contains('collapsed')){
            sidebarDiv.classList.remove('collapsed');
        } else {
            sidebarDiv.classList.add('collapsed');
        }
    };

    const _createProjectButton = (project) => {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('option', 'project');
        const projectP = document.createElement('p');
        projectP.textContent = `# ${project.title}`;
        projectDiv.appendChild(projectP);

        return projectDiv;
    }

    const updateUserProjects = (user) => {
        const projectsList = document.querySelector('.user-projects');
        const addProjectBtn = document.querySelector('.add.project');
        while (projectsList.firstChild !== addProjectBtn){
            projectsList.removeChild(projectsList.firstChild);
        };
        user.projects.forEach(project => {
            projectsList.insertBefore(_createProjectButton(project), addProjectBtn);
        });
    }

    const toggleProjectsVisibility = () => {
        const collapseBtn = document.querySelector('.projects-collapse');
        if (collapseBtn.classList.contains('collapsed')){
            collapseBtn.classList.remove('hidden');
            collapseBtn.classList.remove('collapsed');
        } else {
            collapseBtn.classList.add('collapsed');
            setTimeout(()=>{
                collapseBtn.classList.add('hidden');
            }, 300);
        }
    }

    const _resetAddProjectsBtn = () => {
        const addBtnDiv = document.querySelector('.add.project');
        const addBtnP = document.querySelector('.add.project > p');
        const addBtnImg = document.querySelector('.add.project > img');
        const input = document.querySelector('.add.input');
        addBtnDiv.classList.remove('clicked');
        addBtnP.classList.remove('hidden');
        addBtnImg.classList.remove('hidden');
        input.classList.add('hidden');
    }

    const _projectTitleWarning = (msg = 'error', input) => {
        const projectsList = document.querySelector('.user-projects');
        const existingWarning = document.querySelector('.project-warning');
        if (existingWarning){
            existingWarning.remove();
        }
        const warningP = document.createElement('p');
        warningP.classList.add('project-warning');
        warningP.textContent = String(msg);
        projectsList.appendChild(warningP);
        const controller = new AbortController();
        const removeElement = (elem) => {
            elem.remove();
            controller.abort();
            return;
        }
        input.addEventListener('keydown', () => removeElement(warningP), { signal : controller.signal });
        input.addEventListener('blur', () => removeElement(warningP), { signal : controller.signal });
        
    }

    const _listenForSubmit = (input, user) => {
        const controller = new AbortController();

        const submitProject = (key = null, blur = false) => {
            if ((key !== null && key.code === 'Enter') || blur) {
                if (input.value === ''){
                    _resetAddProjectsBtn();
                    return;
                }
                const titleEntered = user.validateProjectTitle(input.value);
                if (titleEntered === null) {
                    _projectTitleWarning('It is not a name friend', input);
                    return;
                } else if (titleEntered === false) { // invalid title
                    _projectTitleWarning('The name already in use', input);
                    return;
                } else { // valid title
                    const success = user.addProject(titleEntered);
                    if (success) {
                        controller.abort();
                        updateUserProjects(user);
                        _resetAddProjectsBtn();
                        input.value = '';
                        return;
                    }
                }
            }
        }
        input.addEventListener('keydown', (key) => submitProject(key), { signal : controller.signal });
        input.addEventListener('blur', () => submitProject(null, true), { signal : controller.signal });
    }

    const clickOnAddProject = (user) => {
        const addBtnDiv = document.querySelector('.add.project');
        const addBtnP = document.querySelector('.add.project > p');
        const addBtnImg = document.querySelector('.add.project > img');
        const input = document.querySelector('.add.input');
        addBtnDiv.classList.add('clicked');
        addBtnP.classList.add('hidden');
        addBtnImg.classList.add('hidden');
        input.classList.remove('hidden');
        input.focus();
        _listenForSubmit(input, user);
    }


    return { 
        toggleVisibility,
        updateUserProjects,
        toggleProjectsVisibility,
        clickOnAddProject,
    };

} )();

export { LeftSidebar };