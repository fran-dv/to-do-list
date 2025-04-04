
class MainContent {
    #sections = {
        inbox: 'inbox',
    }
    #defaultContent = this.#sections.inbox;
    #currentContent;

    

    constructor(sectionToLoad = this.#defaultContent){
        this.loadMainContent(sectionToLoad);
    }


    isContentSectionValid(section) {
        return section in this.#sections;
    }

    loadInboxContent(){
        
    };

    loadMainContent(contentToLoad = this.#defaultContent){
        if (this.isContentSectionValid(contentToLoad)){
            switch (contentToLoad) {
                case this.#sections.inbox:
                    this.loadInboxContent();
                    this.#currentContent = this.#sections.inbox;
                    break;
            };
        } else {
            throw new Error('Invalid content section');
        };
    };
}

export { MainContent };