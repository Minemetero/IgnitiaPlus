// ==UserScript==
// @name         IgnitiaPlus
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @license      Apache-2.0
// @description  Enhance your study experience with IgnitiaPlus
// @author       Minemetero
// @match        *://*.ignitiaschools.com/*
// @exclude      *://*.ignitiaschools.com/owsoo/login/auth
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ignitiaschools.com
// @grant        none
// @downloadURL  https://update.greasyfork.org/scripts/506350/IgnitiaPlus.user.js
// @updateURL    https://update.greasyfork.org/scripts/506350/IgnitiaPlus.meta.js
// ==/UserScript==

// THIS FILE ALWAYS STORGE THE LATEST PUBLISHED RELEASE

(function () {
    'use strict';

    // it just cool I guess
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

    function injectFavicon(href) {
        const existingFavicon = document.querySelector('link[rel="shortcut icon"]');
        if (existingFavicon) {
            existingFavicon.remove();
        } //ensure it inject successful

        const faviconLink = document.createElement('link');
        faviconLink.rel = 'shortcut icon';
        faviconLink.href = href;
        faviconLink.type = 'image/x-icon';
        document.head.appendChild(faviconLink);
    }

    // Remove some useless element
    function removeUnwantedElements() {
        const signOutElement = document.getElementById('logout');
        const bannerTabDividers = document.querySelectorAll('.bannerTabDivider');
        const footerElement = document.getElementById('footer'); // I'm bad to make it to stay at bottom, so just remove it.

        if (signOutElement) {
            signOutElement.remove();
        }

        if (footerElement) {
            footerElement.remove(); // Added line to remove the footer
        }

        bannerTabDividers.forEach(divider => divider.remove());
    }

    // Theme Switcher
    function addThemeSwitcher() {
        const themeSwitcher = createThemeSwitcher();
        const themeMenu = createThemeMenu();

        themeSwitcher.addEventListener('click', () => {
            themeMenu.style.display = themeMenu.style.display === 'none' ? 'flex' : 'none';
        });

        document.body.appendChild(themeSwitcher);
        document.body.appendChild(themeMenu);
    }

    function createThemeSwitcher() {
        const themeSwitcher = document.createElement('div');
        Object.assign(themeSwitcher.style, {
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            zIndex: '1000',
            cursor: 'pointer',
            userSelect: 'none'
        });
        themeSwitcher.textContent = 'Switch Theme';
        return themeSwitcher;
    }

    function createThemeMenu() {
        const themeMenu = document.createElement('div');
        Object.assign(themeMenu.style, {
            position: 'fixed',
            bottom: '50px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            zIndex: '1000',
            display: 'none',
            flexDirection: 'column'
        });

        const themes = [
            { text: 'Light Theme', class: 'light-theme' },
            { text: 'Dark Theme', class: 'dark-theme' },
            { text: 'Custom Background', class: 'custom-theme' }
        ];

        themes.forEach(theme => {
            const btn = document.createElement('button');
            btn.textContent = theme.text;
            btn.style.margin = '5px 0';
            btn.style.padding = '5px';
            btn.style.fontSize = '14px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                handleThemeChange(theme.class);
                themeMenu.style.display = 'none';
            });
            themeMenu.appendChild(btn);
        });

        return themeMenu;
    }

    function handleThemeChange(theme) {
        if (theme === 'light-theme') {
            document.body.classList.remove('dark-theme');
            document.body.style.backgroundImage = '';
            localStorage.setItem('theme', 'light');
        } else if (theme === 'dark-theme') {
            document.body.classList.add('dark-theme');
            document.body.style.backgroundImage = '';
            localStorage.setItem('theme', 'dark');
        } else if (theme === 'custom-theme') {
            const imageUrl = prompt('Enter the URL of the background image:');
            if (imageUrl) {
                document.body.classList.remove('dark-theme');
                document.body.style.backgroundImage = `url(${imageUrl})`;
                document.body.style.backgroundSize = 'cover';
                localStorage.setItem('theme', 'custom');
                localStorage.setItem('customBackground', imageUrl);
            }
        }
    }

    // Customizable Clock
    function addCustomizableClock() {
        const clock = document.createElement('div');
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
        clock.id = 'tampermonkey-clock';

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

    // Class Timetable
    function addClassTimetable() {
        const timetableContainer = document.createElement('div');
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
        timetableContainer.id = 'class-timetable';

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

        // Append the container to the body to calculate its dimensions
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
            isDragging = false;
            localStorage.setItem('timetablePosition', JSON.stringify({
                left: timetableContainer.style.left,
                top: timetableContainer.style.top
            }));
        });
    }


    // Anti-falsetouch-refresh
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

    // Sober minibar
    function addSoberMinibar() {
        const toolbar = document.createElement('div');
        Object.assign(toolbar.style, {
            position: 'fixed',
            top: '50px', // Positioned below the ☰ button
            left: '10px',
            width: '250px',
            backgroundColor: '#f9f9f9', // Light neutral background
            color: '#333', // Dark gray text
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #ddd', // Subtle border
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Soft shadow
            fontFamily: '"Arial", sans-serif', // Clean sans-serif font
            fontSize: '14px',
            zIndex: '1000',
            display: 'none', // Initially hidden
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
            backgroundColor: '#007BFF', // Subtle blue
            color: '#fff', // White text
            textAlign: 'center',
            lineHeight: '50px',
            borderRadius: '50%',
            fontFamily: '"Arial", sans-serif',
            fontSize: '20px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Subtle shadow
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
        developerName.textContent = 'By Minemetero'; // Everyone should remember me
        Object.assign(developerName.style, {
            fontWeight: 'bold',
            marginBottom: '15px',
            fontSize: '16px',
            color: '#555', // Medium gray
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
            backgroundColor: '#fff', // White background
            color: '#333', // Dark text
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
                    const result = eval(calculator.value);
                    calculator.value = `${result}`;
                } catch {
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
            backgroundColor: '#fff', // White background
            color: '#333', // Dark text
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
            { name: 'Theme Switcher', id: 'themeSwitcher', initFunction: addThemeSwitcher },
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

    // Todo List
    function addTodoList() {
        const todoContainer = document.createElement('div');
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
        todoContainer.id = 'todo-list';

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
            width: '90%', // Adjusted width for the input box
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
            isDragging = false;
            localStorage.setItem('todoListPosition', JSON.stringify({
                left: todoContainer.style.left,
                top: todoContainer.style.top
            }));
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
            const currentIndex = todoList.children.length + 1; // Get the current index based on the number of existing items
            todoItem.textContent = `${currentIndex}. ${todo}`; // Prepend the index to the todo text
            todoItem.style.margin = '5px 0';
            todoItem.style.cursor = 'pointer';
            todoItem.addEventListener('click', () => {
                todoItem.remove();
                saveTodos(); // Save updated todos after removal
                updateTodoList(); // Update the list after removal
            });
            todoList.appendChild(todoItem);
            saveTodos(); // Save new todo
        }

        function updateTodoList() {
            // Update the numbering of the todo items
            Array.from(todoList.children).forEach((item, index) => {
                item.textContent = `${index + 1}. ${item.textContent.split('. ')[1]}`; // Update the text with the new index
            });
        }

        function saveTodos() {
            const todos = Array.from(todoList.children).map(item => item.textContent);
            localStorage.setItem('todoItems', JSON.stringify(todos));
        }
    }

    // Initialize the enhanced UI and features
    function init() {
        modifyPageHead();
        removeUnwantedElements();
        addSoberMinibar()
        // Initialize widgets based on user preferences
        if (JSON.parse(localStorage.getItem('clock') || 'true')) addCustomizableClock();
        if (JSON.parse(localStorage.getItem('themeSwitcher') || 'true')) addThemeSwitcher();
        if (JSON.parse(localStorage.getItem('classTimetable') || 'true')) addClassTimetable();
        if (JSON.parse(localStorage.getItem('todoList') || 'true')) addTodoList();
    }

    // Apply enhanced dark theme CSS
    const darkThemeCSS = `
        body.dark-theme {
            background-color: #121212 !important;
            color: #ffffff !important;
        }
        .dark-theme * {
            background-color: transparent !important;
            color: #ffffff !important;
            border-color: #333333 !important;
        }
        .dark-theme a {
            color: #1e90ff !important;
        }
        .dark-theme button, .dark-theme input, .dark-theme textarea, .dark-theme select {
            background-color: #333333 !important;
            color: #ffffff !important;
            border-color: #555555 !important;
        }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.innerText = darkThemeCSS;
    document.head.appendChild(styleSheet);

    window.addEventListener('load', init);
    window.addEventListener('resize', () => {
        // For each element, adjust position if necessary
        adjustElementPosition(clock, 'clockPosition');
        adjustElementPosition(timetableContainer, 'timetablePosition');
        adjustElementPosition(todoContainer, 'todoListPosition');
    });

    function adjustElementPosition(element, storageKey) {
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
})();