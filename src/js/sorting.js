import { Task } from "./task";

export const insertSortedTasksByDate = (array, task) => {
    if (!(task instanceof Task)) {
        console.error('Invalid task: It must be an instance of `Task`');
        return false;
    }
    if (!(Array.isArray(array))) {
        console.error('Please pass a valid array');
        return false
    }

    let insertIndex = 0;
    while (insertIndex < array.length ){
        const currDate = array[insertIndex].dueDate;

        if (task.dueDate == null) {
            break;
        }
        if (currDate === null) {
            insertIndex++;
            continue;
        }
        if (task.dueDate >= currDate) {
            insertIndex++;
        }
        else break;
    }

    array.splice(insertIndex, 0, task);
    return true;
}

