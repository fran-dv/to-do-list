import '/src/css/global.css';
import { Task } from './tasks.js';
import { Project } from './projects.js';
import './dom-left-sidebar.js';
import { MainContent } from './dom-main-content.js';

const content = new MainContent();

    
const handlePageClicks = (e) => {
    const target = e.target.closest('[data-click]');

    if (target === null) { return };

    switch (target.dataset.click) {
        case 'inbox':
            content.loadMainContent('inbox');
            break;
    }
}

document.body.addEventListener('click', handlePageClicks);

