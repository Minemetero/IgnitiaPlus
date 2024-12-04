// ==UserScript==
// @name         IgnitiaPlus
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @license      Apache-2.0
// @description  Enhance your study experience with IgnitiaPlus
// @author       Minemetero
// @match        *://*.ignitiaschools.com/*
// @exclude      *://*.ignitiaschools.com/owsoo/login/auth
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ignitiaschools.com
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://unpkg.com/darkreader@latest/darkreader.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.0.0/math.min.js
// @downloadURL  https://update.greasyfork.org/scripts/506350/IgnitiaPlus.user.js
// @updateURL    https://update.greasyfork.org/scripts/506350/IgnitiaPlus.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // Global variables for widgets
    let clock, timetableContainer, todoContainer;

    // Modify the page title and favicon
    function modifyPageHead() {
        const titleElement = document.querySelector('title');
        if (titleElement) {
            if (titleElement.textContent.trim() === 'Ignitia') {
                titleElement.textContent = 'IgnitiaPlus';
                injectFavicon('https://raw.githubusercontent.com/Minemetero/Minemetero/refs/heads/master/favicon.png');
            } else if (titleElement.textContent.trim() === 'switchedonuk') {
                titleElement.textContent = 'SwitchedOnPlus';
                injectFavicon('https://raw.githubusercontent.com/Minemetero/Minemetero/refs/heads/master/SwitchedOn.png');
            }
        }
    }

    // Inject favicon into the page
    function injectFavicon(href) {
        const existingFavicon = document.querySelector('link[rel="shortcut icon"]');
        if (existingFavicon) {
            existingFavicon.remove();
        }

        const faviconLink = document.createElement('link');
        faviconLink.rel = 'shortcut icon';
        faviconLink.href = href;
        faviconLink.type = 'image/x-icon';
        document.head.appendChild(faviconLink);
    }

    // Remove unwanted elements from the page
    function removeUnwantedElements() {
        const signOutElement = document.getElementById('logout');
        const bannerTabDividers = document.querySelectorAll('.bannerTabDivider');
        const footerElement = document.getElementById('footer');

        if (signOutElement) {
            signOutElement.remove();
        }

        if (footerElement) {
            footerElement.remove();
        }

        bannerTabDividers.forEach(divider => divider.remove());
    }

    // Add a customizable clock to the page
    function addCustomizableClock() {
        clock = document.createElement('div');
        Object.assign(clock.style, {
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            zIndex: '1000',
            cursor: 'move',
            userSelect: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'hidden',
        });
        clock.id = 'clock';

        function updateClock() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            clock.textContent = `${hours}:${minutes}:${seconds}`;
        }

        let isDragging = false;
        let offsetX, offsetY;

        clock.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - clock.offsetLeft;
            offsetY = e.clientY - clock.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                // Constrain within viewport
                newX = Math.max(0, Math.min(newX, window.innerWidth - clock.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - clock.offsetHeight));

                clock.style.left = `${newX}px`;
                clock.style.top = `${newY}px`;
                clock.style.bottom = 'auto';
                clock.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('clockPosition', JSON.stringify({
                    left: clock.style.left,
                    top: clock.style.top
                }));
            }
        });

        const savedPosition = JSON.parse(localStorage.getItem('clockPosition'));
        if (savedPosition) {
            let savedLeft = parseInt(savedPosition.left, 10);
            let savedTop = parseInt(savedPosition.top, 10);

            // Constrain within viewport
            savedLeft = Math.max(0, Math.min(savedLeft, window.innerWidth - clock.offsetWidth));
            savedTop = Math.max(0, Math.min(savedTop, window.innerHeight - clock.offsetHeight));

            clock.style.left = `${savedLeft}px`;
            clock.style.top = `${savedTop}px`;
            clock.style.bottom = 'auto';
            clock.style.right = 'auto';
        }

        updateClock();
        setInterval(updateClock, 1000);
        document.body.appendChild(clock);
    }

    // Add class timetable widget
    function addClassTimetable() {
        timetableContainer = document.createElement('div');
        Object.assign(timetableContainer.style, {
            position: 'fixed',
            bottom: '60px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            zIndex: '1000',
            maxWidth: '30vw',
            maxHeight: '40vh',
            overflowY: 'auto',
            cursor: 'move',
            userSelect: 'none'
        });
        timetableContainer.id = 'timetableContainer';

        const timetableHeader = document.createElement('div');
        timetableHeader.textContent = '📅 Class Timetable';
        timetableHeader.style.fontWeight = 'bold';
        timetableContainer.appendChild(timetableHeader);

        const timetableBody = document.createElement('textarea');
        Object.assign(timetableBody.style, {
            width: '100%',
            height: '150px',
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            outline: 'none',
            resize: 'none',
            marginTop: '5px'
        });
        timetableBody.placeholder = 'Enter your class schedule here...';
        timetableBody.value = localStorage.getItem('timetable') || '';
        timetableBody.addEventListener('input', () => {
            localStorage.setItem('timetable', timetableBody.value);
        });
        timetableContainer.appendChild(timetableBody);

        document.body.appendChild(timetableContainer);

        const savedPosition = JSON.parse(localStorage.getItem('timetablePosition'));
        if (savedPosition) {
            let savedLeft = parseInt(savedPosition.left, 10);
            let savedTop = parseInt(savedPosition.top, 10);

            // Constrain within viewport
            savedLeft = Math.max(0, Math.min(savedLeft, window.innerWidth - timetableContainer.offsetWidth));
            savedTop = Math.max(0, Math.min(savedTop, window.innerHeight - timetableContainer.offsetHeight));

            timetableContainer.style.left = `${savedLeft}px`;
            timetableContainer.style.top = `${savedTop}px`;
            timetableContainer.style.bottom = 'auto';
            timetableContainer.style.right = 'auto';
        }

        let isDragging = false;
        let offsetX, offsetY;

        timetableHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - timetableContainer.offsetLeft;
            offsetY = e.clientY - timetableContainer.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                // Constrain within viewport
                newX = Math.max(0, Math.min(newX, window.innerWidth - timetableContainer.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - timetableContainer.offsetHeight));

                timetableContainer.style.left = `${newX}px`;
                timetableContainer.style.top = `${newY}px`;
                timetableContainer.style.bottom = 'auto';
                timetableContainer.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('timetablePosition', JSON.stringify({
                    left: timetableContainer.style.left,
                    top: timetableContainer.style.top
                }));
            }
        });
    }

    // Add refresh warning to prevent accidental navigation
    function addRefreshWarning() {
        let warningActive = false;

        if (window.location.href.includes('/owsoo/home')) {
            return;
        }
        window.addEventListener('beforeunload', (event) => {
            if (!warningActive) {
                warningActive = true;
                event.preventDefault();
                event.returnValue = ''; // Required for some browsers to show the dialog
                setTimeout(() => {
                    warningActive = false;
                }, 5000);
            }
        });
    }

    // Add sober minibar with tools
    function addSoberMinibar() {
        const toolbar = document.createElement('div');
        Object.assign(toolbar.style, {
            position: 'fixed',
            top: '50px',
            left: '10px',
            width: '250px',
            backgroundColor: '#f9f9f9',
            color: '#333',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #ddd',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            fontFamily: '"Arial", sans-serif',
            fontSize: '14px',
            zIndex: '1000',
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
        });
        toolbar.id = 'minimalist-toolbar-popup';

        // Toggle button to show/hide the toolbar
        const toggleButton = document.createElement('div');
        Object.assign(toggleButton.style, {
            position: 'fixed',
            top: '10px',
            left: '10px',
            width: '50px',
            height: '50px',
            backgroundColor: '#007BFF',
            color: '#fff',
            textAlign: 'center',
            lineHeight: '50px',
            borderRadius: '50%',
            fontFamily: '"Arial", sans-serif',
            fontSize: '20px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            zIndex: '1001',
            cursor: 'pointer',
            userSelect: 'none',
        });
        toggleButton.textContent = '☰';

        toggleButton.addEventListener('click', () => {
            toolbar.style.display = toolbar.style.display === 'none' ? 'flex' : 'none';
        });

        // Add Developer Name
        const developerName = document.createElement('div');
        developerName.textContent = 'By Minemetero';
        Object.assign(developerName.style, {
            fontWeight: 'bold',
            marginBottom: '15px',
            fontSize: '16px',
            color: '#555',
        });
        toolbar.appendChild(developerName);

        // Calculator Tool
        const calculator = document.createElement('textarea');
        calculator.id = 'minimalist-calculator';
        calculator.placeholder = 'Calculator (press Enter to evaluate)';
        Object.assign(calculator.style, {
            width: '100%',
            height: '50px',
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            outline: 'none',
            resize: 'none',
            fontFamily: '"Arial", sans-serif',
            fontSize: '14px',
        });
        calculator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                try {
                    let input = calculator.value.trim();
                    let result;
                    if (input.startsWith('sqrt(') && input.endsWith(')')) {
                        const number = input.slice(5, -1);
                        result = math.sqrt(math.evaluate(number));
                    } else if (input.startsWith('simplify(') && input.endsWith(')')) {
                        const expression = input.slice(10, -1);
                        result = math.simplify(expression).toString();
                    } else {
                        result = math.evaluate(input);
                    }
                    // Round the result if it's a number
                    if (typeof result === 'number') {
                        result = math.round(result, 2); // Round to 2 decimal places
                    }
                    calculator.value = `${result}`;
                } catch (error) {
                    calculator.value = 'Error!';
                }
            }
        });
        toolbar.appendChild(calculator);

        // Notes Section
        const notes = document.createElement('textarea');
        notes.id = 'minimalist-notes';
        notes.placeholder = 'Your Notes...';
        Object.assign(notes.style, {
            width: '100%',
            height: '100px',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            outline: 'none',
            resize: 'none',
            fontFamily: '"Arial", sans-serif',
            fontSize: '14px',
        });
        notes.value = localStorage.getItem('minimalistNotes') || '';
        notes.addEventListener('input', () => {
            localStorage.setItem('minimalistNotes', notes.value);
        });
        toolbar.appendChild(notes);

        // Add Toggle Menu within Sober Minibar
        const toggleMenu = document.createElement('div');
        Object.assign(toggleMenu.style, {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '10px',
            width: '100%',
        });

        const widgets = [
            { name: 'Clock', id: 'clock', initFunction: addCustomizableClock },
            { name: 'Class Timetable', id: 'classTimetable', initFunction: addClassTimetable },
            { name: 'Todo List', id: 'todoList', initFunction: addTodoList }
        ];

        widgets.forEach(widget => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = widget.id;
            checkbox.checked = JSON.parse(localStorage.getItem(widget.id) || 'true');
            checkbox.addEventListener('change', () => {
                localStorage.setItem(widget.id, checkbox.checked);
                if (checkbox.checked) {
                    widget.initFunction();
                } else {
                    document.getElementById(widget.id)?.remove();
                }
            });

            const label = document.createElement('label');
            label.htmlFor = widget.id;
            label.textContent = widget.name;
            label.style.marginBottom = '10px';
            label.style.cursor = 'pointer';

            const widgetContainer = document.createElement('div');
            widgetContainer.style.display = 'flex';
            widgetContainer.style.alignItems = 'center';
            widgetContainer.style.marginBottom = '5px';

            widgetContainer.appendChild(checkbox);
            widgetContainer.appendChild(label);
            toggleMenu.appendChild(widgetContainer);
        });

        toolbar.appendChild(toggleMenu);

        document.body.appendChild(toggleButton);
        document.body.appendChild(toolbar);
    }

    // Add todo list widget
    function addTodoList() {
        todoContainer = document.createElement('div');
        Object.assign(todoContainer.style, {
            position: 'fixed',
            bottom: '0px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            zIndex: '1000',
            maxWidth: '250px',
            maxHeight: '200px',
            overflowY: 'auto',
            cursor: 'move',
            userSelect: 'none'
        });
        todoContainer.id = 'todoContainer';

        // Load saved position
        const savedPosition = JSON.parse(localStorage.getItem('todoListPosition'));
        if (savedPosition) {
            let savedLeft = parseInt(savedPosition.left, 10);
            let savedTop = parseInt(savedPosition.top, 10);

            // Constrain within viewport
            savedLeft = Math.max(0, Math.min(savedLeft, window.innerWidth - todoContainer.offsetWidth));
            savedTop = Math.max(0, Math.min(savedTop, window.innerHeight - todoContainer.offsetHeight));

            todoContainer.style.left = `${savedLeft}px`;
            todoContainer.style.top = `${savedTop}px`;
        }

        const todoHeader = document.createElement('div');
        todoHeader.textContent = '📝 Todo List';
        todoHeader.style.fontWeight = 'bold';
        todoContainer.appendChild(todoHeader);

        const todoInput = document.createElement('input');
        todoInput.placeholder = 'Add a new task...';
        Object.assign(todoInput.style, {
            width: '90%',
            padding: '5px',
            marginTop: '5px',
            borderRadius: '3px',
            border: '1px solid #ddd',
            outline: 'none',
            fontSize: '14px'
        });
        todoContainer.appendChild(todoInput);

        const todoList = document.createElement('ul');
        todoList.style.listStyleType = 'none';
        todoList.style.padding = '0';
        todoContainer.appendChild(todoList);

        // Load saved todo items
        const savedTodos = JSON.parse(localStorage.getItem('todoItems')) || [];
        savedTodos.forEach(todo => addTodoItem(todo));

        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && todoInput.value.trim() !== '') {
                addTodoItem(todoInput.value);
                todoInput.value = '';
            }
        });

        // Dragging functionality
        let isDragging = false;
        let offsetX, offsetY;

        todoHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - todoContainer.offsetLeft;
            offsetY = e.clientY - todoContainer.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                // Constrain within viewport
                newX = Math.max(0, Math.min(newX, window.innerWidth - todoContainer.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - todoContainer.offsetHeight));

                todoContainer.style.left = `${newX}px`;
                todoContainer.style.top = `${newY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('todoListPosition', JSON.stringify({
                    left: todoContainer.style.left,
                    top: todoContainer.style.top
                }));
            }
        });

        // Resizing functionality
        const resizeHandle = document.createElement('div');
        Object.assign(resizeHandle.style, {
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            cursor: 'nwse-resize'
        });
        todoContainer.appendChild(resizeHandle);

        let isResizing = false;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isResizing) {
                const newWidth = e.clientX - todoContainer.getBoundingClientRect().left;
                const newHeight = e.clientY - todoContainer.getBoundingClientRect().top;
                todoContainer.style.width = `${newWidth}px`;
                todoContainer.style.height = `${newHeight}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });

        document.body.appendChild(todoContainer);

        function addTodoItem(todo) {
            const todoItem = document.createElement('li');
            const currentIndex = todoList.children.length + 1;
            todoItem.textContent = `${currentIndex}. ${todo}`;
            todoItem.style.margin = '5px 0';
            todoItem.style.cursor = 'pointer';
            todoItem.addEventListener('click', () => {
                todoItem.remove();
                saveTodos();
                updateTodoList();
            });
            todoList.appendChild(todoItem);
            saveTodos();
        }

        function updateTodoList() {
            // Update the numbering of the todo items
            Array.from(todoList.children).forEach((item, index) => {
                item.textContent = `${index + 1}. ${item.textContent.split('. ')[1]}`;
            });
        }

        function saveTodos() {
            const todos = Array.from(todoList.children).map(item => item.textContent.split('. ')[1]);
            localStorage.setItem('todoItems', JSON.stringify(todos));
        }
    }

    // Initialize Dark Reader
    const namespace = 'dark-reader-toggle';
    const btn = document.createElement('div');

    async function createDarkReaderToggle() {
        // Create button
        btn.id = namespace;
        btn.textContent = '🔆';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: '10000',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            textAlign: 'center',
        });

        // Add click event
        btn.addEventListener('click', async () => {
            if (await GM.getValue('darkMode', false)) {
                await GM.setValue('darkMode', false);
                disableDarkMode();
            } else {
                await GM.setValue('darkMode', true);
                enableDarkMode();
            }
        });

        // Append button
        document.body.appendChild(btn);

        // Set initial mode
        if (await GM.getValue('darkMode', false)) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    }

    // Enable Dark Mode
    function enableDarkMode() {
        DarkReader.setFetchMethod(window.fetch);
        DarkReader.enable({
            brightness: 105,
            contrast: 105,
            sepia: 0,
        });
        btn.textContent = '🔅';

        const logoElement = document.querySelector('#gl_logo img');
        if (logoElement) {
            logoElement.src = 'https://raw.githubusercontent.com/BurdenOwl/burdenowl/refs/heads/main/failureswebsite.png';
        }
    }

    // Disable Dark Mode
    function disableDarkMode() {
        DarkReader.disable();
        btn.textContent = '🔆';

        const logoElement = document.querySelector('#gl_logo img');
        if (logoElement) {
            logoElement.src = 'https://media-release.glynlyon.com/branding/images/ignitia/logo.png';
        }
    }

    // Adjust element position within viewport
    function adjustElementPosition(element, storageKey) {
        if (!element) return;
        let rect = element.getBoundingClientRect();

        let adjustedLeft = rect.left;
        let adjustedTop = rect.top;

        if (rect.right > window.innerWidth) {
            adjustedLeft = window.innerWidth - element.offsetWidth;
        }
        if (rect.bottom > window.innerHeight) {
            adjustedTop = window.innerHeight - element.offsetHeight;
        }
        if (rect.left < 0) {
            adjustedLeft = 0;
        }
        if (rect.top < 0) {
            adjustedTop = 0;
        }

        element.style.left = `${adjustedLeft}px`;
        element.style.top = `${adjustedTop}px`;

        // Save adjusted position
        localStorage.setItem(storageKey, JSON.stringify({
            left: element.style.left,
            top: element.style.top
        }));
    }

    // Initialize the enhanced UI and features
    async function init() {
        modifyPageHead();
        removeUnwantedElements();
        addRefreshWarning();
        await createDarkReaderToggle();
        addSoberMinibar();

        // Initialize widgets based on user preferences
        if (JSON.parse(localStorage.getItem('clock') || 'true')) addCustomizableClock();
        if (JSON.parse(localStorage.getItem('classTimetable') || 'true')) addClassTimetable();
        if (JSON.parse(localStorage.getItem('todoList') || 'true')) addTodoList();
    }
    window.addEventListener('load', init);
    window.addEventListener('resize', () => {
        adjustElementPosition(clock, 'clockPosition');
        adjustElementPosition(timetableContainer, 'timetablePosition');
        adjustElementPosition(todoContainer, 'todoListPosition');
    });
})();
