import '/src/css/global.css';
import { Task } from './tasks.js';
import { Project } from './projects.js';
import { MainContent } from './dom-main-content.js';
import { LeftSidebar } from './dom-left-sidebar.js';
import { User } from './users.js';

const CurrentUser = new User('Anonymous');
LeftSidebar.updateUserProjects(CurrentUser);
const Content = new MainContent();
    
const handlePageClicks = (e) => {
    const target = e.target.closest('[data-click]');

    if (target === null) { return };

    switch (target.dataset.click) {
        case 'inbox':
            Content.loadMainContent('inbox');
            break;
        case 'collapse-projects':
            LeftSidebar.toggleProjectsVisibility();
            break;
        case 'collapse-sidebar':
            LeftSidebar.toggleVisibility();
            break;
        case 'add-project':
            LeftSidebar.clickOnAddProject(CurrentUser);
            break;
    }
}

document.body.addEventListener('click', handlePageClicks);

export { CurrentUser };