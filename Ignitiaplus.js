// ==UserScript==
// @name         IgnitiaPlus
// @namespace    http://tampermonkey.net/
// @version      1.0.2
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

(function () {
    'use strict';

    // it just cool I guess
    function modifyPageHead() {
        const titleElement = document.querySelector('title');
        if (titleElement) {
            if (titleElement.textContent.trim() === 'Ignitia') {
                titleElement.textContent = 'IgnitiaPlus';
            } else if (titleElement.textContent.trim() === 'SwitchOn') {
                titleElement.textContent = 'SwitchOnPlus';
            }
        }

        // Inject new favicon link
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'shortcut icon';
        faviconLink.href = 'https://raw.githubusercontent.com/Minemetero/Minemetero/refs/heads/master/favicon.png';
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

        // Theme Menu
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

        const lightThemeBtn = document.createElement('button');
        lightThemeBtn.textContent = 'Light Theme';
        const darkThemeBtn = document.createElement('button');
        darkThemeBtn.textContent = 'Dark Theme(Unfortunately, it not working)';
        const customThemeBtn = document.createElement('button');
        customThemeBtn.textContent = 'Custom Background';

        [lightThemeBtn, darkThemeBtn, customThemeBtn].forEach(btn => {
            Object.assign(btn.style, {
                margin: '5px 0',
                padding: '5px',
                fontSize: '14px',
                cursor: 'pointer'
            });
            btn.addEventListener('click', () => {
                themeMenu.style.display = 'none';
            });
        });

        lightThemeBtn.addEventListener('click', () => {
            document.body.classList.remove('dark-theme');
            document.body.style.backgroundImage = '';
            localStorage.setItem('theme', 'light');
        });

        darkThemeBtn.addEventListener('click', () => {
            document.body.classList.add('dark-theme');
            document.body.style.backgroundImage = '';
            localStorage.setItem('theme', 'dark');
        });

        customThemeBtn.addEventListener('click', () => {
            const imageUrl = prompt('Enter the URL of the background image:');
            if (imageUrl) {
                document.body.classList.remove('dark-theme');
                document.body.style.backgroundImage = `url(${imageUrl})`;
                document.body.style.backgroundSize = 'cover';
                localStorage.setItem('theme', 'custom');
                localStorage.setItem('customBackground', imageUrl);
            }
        });

        themeMenu.appendChild(lightThemeBtn);
        themeMenu.appendChild(darkThemeBtn);
        themeMenu.appendChild(customThemeBtn);

        themeSwitcher.addEventListener('click', () => {
            themeMenu.style.display = themeMenu.style.display === 'none' ? 'flex' : 'none';
        });

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (savedTheme === 'custom') {
            const imageUrl = localStorage.getItem('customBackground');
            if (imageUrl) {
                document.body.style.backgroundImage = `url(${imageUrl})`;
                document.body.style.backgroundSize = 'cover';
            }
        }

        document.body.appendChild(themeSwitcher);
        document.body.appendChild(themeMenu);
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
            userSelect: 'none'
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
                clock.style.left = `${e.clientX - offsetX}px`;
                clock.style.top = `${e.clientY - offsetY}px`;
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
            clock.style.left = savedPosition.left;
            clock.style.top = savedPosition.top;
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
            maxWidth: '250px',
            maxHeight: '200px',
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

        let isDragging = false;
        let offsetX, offsetY;

        timetableHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - timetableContainer.offsetLeft;
            offsetY = e.clientY - timetableContainer.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                timetableContainer.style.left = `${e.clientX - offsetX}px`;
                timetableContainer.style.top = `${e.clientY - offsetY}px`;
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

        const savedPosition = JSON.parse(localStorage.getItem('timetablePosition'));
        if (savedPosition) {
            timetableContainer.style.left = savedPosition.left;
            timetableContainer.style.top = savedPosition.top;
            timetableContainer.style.bottom = 'auto';
            timetableContainer.style.right = 'auto';
        }

        document.body.appendChild(timetableContainer);
    }

    // Anti-falsetouch-refresh
    function addRefreshWarning() {
        let warningActive = false;

        window.addEventListener('beforeunload', (event) => {
            if (!warningActive) {
                event.preventDefault();
                warningActive = true;
                setTimeout(() => {
                    warningActive = false;
                }, 5000); // Prevent multiple triggers in a short time
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
        developerName.textContent = 'By Minemetero';//Everyone should remember me
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

        // Add Todo List Toggle Button
        const todoToggleButton = document.createElement('button');
        todoToggleButton.textContent = 'Toggle Todo List';
        Object.assign(todoToggleButton.style, {
            margin: '10px 0',
            padding: '5px',
            fontSize: '14px',
            cursor: 'pointer',
        });
        toolbar.appendChild(todoToggleButton);

        // Create Todo List Container
        const todoContainer = document.createElement('div');
        Object.assign(todoContainer.style, {
            position: 'relative',
            backgroundColor: '#f9f9f9',
            color: '#333',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #ddd',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            fontFamily: '"Arial", sans-serif',
            fontSize: '14px',
            zIndex: '1000',
            maxWidth: '250px',
            display: 'none', // Initially hidden
            flexDirection: 'column',
            resize: 'both', // Allow resizing
            overflow: 'auto', // Allow scrolling if content overflows
        });
        todoContainer.id = 'todo-list-container';

        // Todo List Header
        const todoHeader = document.createElement('div');
        todoHeader.textContent = '📝 Todo List';
        todoHeader.style.fontWeight = 'bold';
        todoContainer.appendChild(todoHeader);

        // Todo Input
        const todoInput = document.createElement('input');
        todoInput.placeholder = 'Add a new task...';
        Object.assign(todoInput.style, {
            margin: '5px 0',
            padding: '5px',
            fontSize: '14px',
        });
        todoContainer.appendChild(todoInput);

        // Todo List
        const todoList = document.createElement('ul');
        todoContainer.appendChild(todoList);

        // Add Todo Item on Enter
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && todoInput.value.trim() !== '') {
                const todoItem = document.createElement('li');
                todoItem.textContent = todoInput.value;
                todoList.appendChild(todoItem);
                todoInput.value = '';
            }
        });

        // Toggle Todo List Visibility
        todoToggleButton.addEventListener('click', () => {
            todoContainer.style.display = todoContainer.style.display === 'none' ? 'flex' : 'none';
        });

        // Make Todo List Movable
        let isDragging = false;
        let offsetX, offsetY;

        todoHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - todoContainer.offsetLeft;
            offsetY = e.clientY - todoContainer.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                todoContainer.style.left = `${e.clientX - offsetX}px`;
                todoContainer.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
            }
        });

        // Append Todo Container to Toolbar
        toolbar.appendChild(todoContainer);
        document.body.appendChild(toggleButton);
        document.body.appendChild(toolbar);
    }

    // Initialize the enhanced UI and features
    function init() {
        modifyPageHead();
        removeUnwantedElements();
        addCustomizableClock();
        addThemeSwitcher();
        addClassTimetable();
        addRefreshWarning();
        addSoberMinibar();
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
})();
