// ==========================================================================
// AUREX Week 4 Master Challenge: Core Javascript Application Engine
// ==========================================================================

let taskDatabase = [];
let currentFilterState = 'all';

const taskFormElement = document.getElementById('task-form');
const taskInputElement = document.getElementById('task-input');
const validationErrorText = document.getElementById('validation-error');
const taskDisplayContainer = document.getElementById('task-list');
const filteringButtons = document.querySelectorAll('.filter-btn');

document.addEventListener('DOMContentLoaded', () => {
    loadDatabaseFromStorage();
    setupEventHandlingListeners();
    renderApplicationView();
});

function setupEventHandlingListeners() {
    taskFormElement.addEventListener('submit', handleTaskFormSubmission);

    filteringButtons.forEach(buttonElement => {
        buttonElement.addEventListener('click', (event) => {
            filteringButtons.forEach(btn => {
                btn.style.background = '#f1ecf7';
                btn.style.color = '#6a11cb';
                btn.classList.remove('active');
            });
            
            event.target.style.background = '#6a11cb';
            event.target.style.color = 'white';
            event.target.classList.add('active');

            currentFilterState = event.target.getAttribute('data-filter');
            renderApplicationView();
        });
    });
}

function handleTaskFormSubmission(event) {
    event.preventDefault();
    const taskInputStringValue = taskInputElement.value.trim();

    if (taskInputStringValue === "") {
        validationErrorText.textContent = "⚠️ Error: Task description cannot consist of empty fields.";
        return;
    }

    if (taskInputStringValue.length < 5) {
        validationErrorText.textContent = "⚠️ Validation Failed: Text contents must be at least 5 characters long.";
        return;
    }

    validationErrorText.textContent = "";

    const individualTaskRecord = {
        uniqueIdString: Date.now().toString(),
        textContentData: taskInputStringValue,
        isCompletedStatus: false
    };

    taskDatabase.push(individualTaskRecord);
    syncDatabaseWithLocalStorage();
    
    taskInputElement.value = "";
    renderApplicationView();
}

function triggerTaskDeletion(targetIdString) {
    taskDatabase = taskDatabase.filter(taskItem => taskItem.uniqueIdString !== targetIdString);
    syncDatabaseWithLocalStorage();
    renderApplicationView();
}

function toggleTaskCompletionStatus(targetIdString) {
    taskDatabase = taskDatabase.map(taskItem => {
        if (taskItem.uniqueIdString === targetIdString) {
            return { ...taskItem, isCompletedStatus: !taskItem.isCompletedStatus };
        }
        return taskItem;
    });
    syncDatabaseWithLocalStorage();
    renderApplicationView();
}

function triggerTaskEditInlinePrompt(targetIdString) {
    const taskToModify = taskDatabase.find(taskItem => taskItem.uniqueIdString === targetIdString);
    if (!taskToModify) return;

    const modifiedTextInputString = prompt("Modify current task text entries:", taskToModify.textContentData);
    
    if (modifiedTextInputString !== null && modifiedTextInputString.trim().length >= 5) {
        taskDatabase = taskDatabase.map(taskItem => {
            if (taskItem.uniqueIdString === targetIdString) {
                return { ...taskItem, textContentData: modifiedTextInputString.trim() };
            }
            return taskItem;
        });
        syncDatabaseWithLocalStorage();
        renderApplicationView();
    } else if (modifiedTextInputString !== null) {
        alert("⚠️ Action Refused: Updated text items must span a minimum duration length of 5 letters.");
    }
}

function syncDatabaseWithLocalStorage() {
    localStorage.setItem('internshipTaskItemsCollection', JSON.stringify(taskDatabase));
}

function loadDatabaseFromStorage() {
    const serializedDataCollectionString = localStorage.getItem('internshipTaskItemsCollection');
    if (serializedDataCollectionString) {
        try {
            taskDatabase = JSON.parse(serializedDataCollectionString);
        } catch (parsingFailureError) {
            taskDatabase = [];
        }
    }
}

function renderApplicationView() {
    taskDisplayContainer.innerHTML = "";

    const filteredRecordStack = taskDatabase.filter(taskItem => {
        if (currentFilterState === 'pending') return !taskItem.isCompletedStatus;
        if (currentFilterState === 'completed') return taskItem.isCompletedStatus;
        return true;
    });

    if (filteredRecordStack.length === 0) {
        taskDisplayContainer.innerHTML = `
            <li style="text-align: center; color: #999; padding: 20px; font-style: italic; background: #faf9fc; border-radius: 8px;">
                No active assignment tasks found matching this state selection.
            </li>
        `;
        return;
    }

    filteredRecordStack.forEach(taskItem => {
        const structuralListItemNode = document.createElement('li');
        structuralListItemNode.className = `task-item-card ${taskItem.isCompletedStatus ? 'completed-state' : ''}`;
        
        structuralListItemNode.style.display = "flex";
        structuralListItemNode.style.alignItems = "center";
        structuralListItemNode.style.justifyContent = "space-between";
        structuralListItemNode.style.background = taskItem.isCompletedStatus ? "#f8f9fa" : "#faf9fc";
        structuralListItemNode.style.padding = "14px 18px";
        structuralListItemNode.style.borderRadius = "8px";
        structuralListItemNode.style.borderLeft = taskItem.isCompletedStatus ? "4px solid #a1a1a1" : "4px solid #6a11cb";
        structuralListItemNode.style.marginBottom = "10px";
        structuralListItemNode.style.boxShadow = "0 2px 4px rgba(0,0,0,0.01)";
        structuralListItemNode.style.transition = "transform 0.2s ease";

        const statusTextDisplayLineThrough = taskItem.isCompletedStatus ? "line-through" : "none";
        const textColorSelectionState = taskItem.isCompletedStatus ? "#888888" : "#333333";

        structuralListItemNode.innerHTML = `
            <div style="display: flex; align-items: center; flex: 1; gap: 12px; cursor: pointer;" class="clickable-content-area">
                <input type="checkbox" ${taskItem.isCompletedStatus ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;" class="status-toggle-checkbox">
                <span class="task-description-label" style="text-decoration: ${statusTextDisplayLineThrough}; color: ${textColorSelectionState}; font-size: 1rem; word-break: break-all; font-weight: 500;">
                    ${taskItem.textContentData}
                </span>
            </div>
            <div style="display: flex; gap: 8px;" class="action-buttons-wrapper">
                <button class="edit-action-btn" style="background: #fff3cd; color: #856404; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Edit</button>
                <button class="delete-action-btn" style="background: #f8d7da; color: #721c24; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Delete</button>
            </div>
        `;

        structuralListItemNode.querySelector('.clickable-content-area').addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                toggleTaskCompletionStatus(taskItem.uniqueIdString);
            }
        });
        
        structuralListItemNode.querySelector('.status-toggle-checkbox').addEventListener('change', () => {
            toggleTaskCompletionStatus(taskItem.uniqueIdString);
        });

        structuralListItemNode.querySelector('.edit-action-btn').addEventListener('click', () => {
            triggerTaskEditInlinePrompt(taskItem.uniqueIdString);
        });

        structuralListItemNode.querySelector('.delete-action-btn').addEventListener('click', () => {
            triggerTaskDeletion(taskItem.uniqueIdString);
        });

        taskDisplayContainer.appendChild(structuralListItemNode);
    });
}
