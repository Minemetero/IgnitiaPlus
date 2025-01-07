// ==UserScript==
// @name         IgnitiaPlus
// @namespace    http://tampermonkey.net/
// @version      1.4.2
// @license      Apache-2.0
// @description  Enhance your study experience with IgnitiaPlus
// @author       Minemetero
// @match        *://*.ignitiaschools.com/*
// @icon         https://raw.githubusercontent.com/Minemetero/Minemetero/refs/heads/master/favicon.png
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://unpkg.com/darkreader@latest/darkreader.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.0.1/math.min.js
// @downloadURL  https://update.greasyfork.org/scripts/506350/IgnitiaPlus.user.js
// @updateURL    https://update.greasyfork.org/scripts/506350/IgnitiaPlus.meta.js
// ==/UserScript==

(function () {
    'use strict';

    let clockWidget, timetableWidget, todoWidget;

    /*** CSS Injection ***/
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* General Widget Styles */
            #clockWidget, #timetableWidget, #todoWidget, #minimalist-toolbar-popup {
                position: fixed;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 1000;
                user-select: none;
                overflow: hidden;
            }

            #clockWidget, #timetableWidget, #todoWidget {
                max-width: 90vw;
                max-height: 90vh;
            }

            #clockWidget {
                bottom: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.5);
                padding: 5px 10px;
                cursor: move;
            }

            #timetableWidget {
                bottom: 60px; 
                left: 10px;
                padding: 10px; 
                overflow-y: auto;
            }

            #timetableWidget textarea {
                width: 100%;
                height: calc(100% - 40px);
                background: transparent; 
                color: white;
                border: none; 
                outline: none;
                resize: none;
                margin-top: 5px;
            }

            #todoWidget {
                bottom: 0px; 
                left: 10px;
                padding: 10px; 
                overflow: auto;
            }

            #todoWidget ul {
                list-style-type: none;
                padding: 0; 
                margin-top: 10px;
            }

            #todoWidget ul li {
                margin: 0;
                cursor: pointer;
                padding: 5px;
                border-radius: 3px;
                background-color: rgba(255,255,255,0.1);
            }

            /* Resize Handles */
            .resize-handle {
                width: 10px; 
                height: 10px;
                background-color: rgba(255, 255, 255, 0.5);
                position: absolute;
                bottom: 0; 
                right: 0;
                cursor: nwse-resize;
            }

            #todoWidget .resize-handle {
                width: 15px; 
                height: 15px;
                background-color: rgba(255, 255, 255, 0.7);
                border-bottom-right-radius: 5px;
            }

            /* Minimalist Toolbar */
            #minimalist-toolbar-popup {
                top: 50px; 
                left: 10px;
                width: 250px;
                background: #f9f9f9; 
                color: #333;
                padding: 15px; 
                border: 1px solid #ddd;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: none; 
                flex-direction: column; 
                align-items: center;
                border-radius: 10px; 
                z-index: 1000;
                font-family: Arial, sans-serif;
            }

            #minimalist-toolbar-popup textarea {
                width: 100%; 
                background: #fff; 
                color: #333;
                border: 1px solid #ddd; 
                border-radius: 5px;
                padding: 10px; 
                outline: none; 
                resize: none;
            }

            #minimalist-calculator {
                height: 50px; 
                margin-bottom: 15px;
            }

            #minimalist-notes {
                height: 100px;
            }

            #minimalist-toolbar-popup .toggle-widgets {
                background-color: rgba(0,0,0,0.9);
                color: white; 
                padding: 10px;
                border-radius: 5px; 
                width: 100%;
                margin-top: 10px;
                display: flex; 
                flex-direction: column;
            }

            /* Toolbar Toggle */
            #minimalist-toolbar-toggle {
                position: fixed; 
                top: 10px; 
                left: 10px;
                width: 50px; 
                height: 50px;
                background: linear-gradient(135deg, #007BFF, #0056b3);
                color: #fff;
                text-align: center; 
                line-height: 50px;
                border-radius: 50%; 
                font-size: 20px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                z-index: 1001; 
                cursor: pointer;
                transition: background 0.3s, transform 0.2s;
            }
            #minimalist-toolbar-toggle:hover {
                background: linear-gradient(135deg, #0056b3, #007BFF);
                transform: scale(1.1);
            }

            /* Dark Reader Toggle */
            #dark-reader-toggle {
                position: fixed; 
                bottom: 10px; 
                left: 10px;
                z-index: 10000; 
                padding: 10px;
                background-color: transparent;
                color: white; 
                border-radius: 50%;
                cursor: pointer; 
                font-size: 20px;
                text-align: center;
            }

            /* FadeIn Keyframe for Quote */
            @keyframes fadeIn {
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    /*** Utility Functions ***/
    function injectFavicon(href) {
        const existingFavicon = document.querySelector('link[rel="shortcut icon"]');
        if (existingFavicon) existingFavicon.remove();
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'shortcut icon';
        faviconLink.href = href;
        faviconLink.type = 'image/x-icon';
        document.head.appendChild(faviconLink);
    }

    function adjustElementPosition(element, storageKey) {
        if (!element) return;
        let rect = element.getBoundingClientRect();
        let adjustedLeft = rect.left;
        let adjustedTop = rect.top;
        if (rect.right > window.innerWidth) adjustedLeft = window.innerWidth - rect.width;
        if (rect.bottom > window.innerHeight) adjustedTop = window.innerHeight - rect.height;
        if (rect.left < 0) adjustedLeft = 0;
        if (rect.top < 0) adjustedTop = 0;
        element.style.left = `${adjustedLeft}px`;
        element.style.top = `${adjustedTop}px`;
        localStorage.setItem(storageKey, JSON.stringify({ left: element.style.left, top: element.style.top }));
    }

    function loadSavedPositionAndSize(element, posKey, sizeKey) {
        const savedPos = JSON.parse(localStorage.getItem(posKey));
        if (savedPos) {
            let left = parseInt(savedPos.left, 10);
            let top = parseInt(savedPos.top, 10);
            left = Math.max(0, Math.min(left, window.innerWidth - element.offsetWidth));
            top = Math.max(0, Math.min(top, window.innerHeight - element.offsetHeight));
            element.style.left = `${left}px`;
            element.style.top = `${top}px`;
            element.style.bottom = 'auto'; element.style.right = 'auto';
        }
        const savedSize = JSON.parse(localStorage.getItem(sizeKey));
        if (savedSize) {
            element.style.width = savedSize.width;
            element.style.height = savedSize.height;
        }
    }

    /*** Page Modifiers ***/
    function modifyPageHead() {
        const titleElement = document.querySelector('title');
        if (!titleElement) return;
        const titleText = titleElement.textContent.trim();
        if (titleText === 'Ignitia') {
            titleElement.textContent = 'IgnitiaPlus';
            injectFavicon('https://raw.githubusercontent.com/Minemetero/Minemetero/refs/heads/master/favicon.png');
        } else if (titleText === 'switchedonuk') {
            titleElement.textContent = 'SwitchedOnPlus';
            injectFavicon('https://raw.githubusercontent.com/Minemetero/Minemetero/refs/heads/master/SwitchedOn.png');
        }
    }

    function removeUnwantedElements() {
        const signOutElement = document.getElementById('logout');
        const bannerTabDividers = document.querySelectorAll('.bannerTabDivider');
        const footerElement = document.getElementById('footer');
        if (signOutElement) signOutElement.remove();
        if (footerElement) footerElement.remove();
        bannerTabDividers.forEach(divider => divider.remove());
    }

    function addRefreshWarning() {
        if (window.location.href.includes('/owsoo/home')) return;
        let warningActive = false;
        window.addEventListener('beforeunload', (event) => {
            if (!warningActive) {
                warningActive = true;
                event.preventDefault();
                event.returnValue = '';
                setTimeout(() => { warningActive = false; }, 5000);
            }
        });
    }

    /*** Widgets ***/
    function addCustomizableClock() {
        clockWidget = document.createElement('div');
        clockWidget.id = 'clockWidget';

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        function updateClock() {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            clockWidget.textContent = `${h}:${m}:${s}`;
            clockWidget.appendChild(resizeHandle);
        }

        let isDragging = false, isResizing = false, offsetX, offsetY;
        clockWidget.addEventListener('mousedown', (e) => {
            if (e.target === resizeHandle) return;
            isDragging = true;
            offsetX = e.clientX - clockWidget.offsetLeft;
            offsetY = e.clientY - clockWidget.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;
                newX = Math.max(0, Math.min(newX, window.innerWidth - clockWidget.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - clockWidget.offsetHeight));
                clockWidget.style.left = `${newX}px`;
                clockWidget.style.top = `${newY}px`;
            } else if (isResizing) {
                const newWidth = e.clientX - clockWidget.getBoundingClientRect().left;
                const newHeight = e.clientY - clockWidget.getBoundingClientRect().top;
                clockWidget.style.width = `${newWidth}px`;
                clockWidget.style.height = `${newHeight}px`;
                localStorage.setItem('clockWidgetSize', JSON.stringify({ width: clockWidget.style.width, height: clockWidget.style.height }));
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('clockWidgetPosition', JSON.stringify({ left: clockWidget.style.left, top: clockWidget.style.top }));
            }
            if (isResizing) isResizing = false;
        });

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.preventDefault();
            e.stopPropagation();
        });

        updateClock();
        setInterval(updateClock, 1000);
        document.body.appendChild(clockWidget);
        loadSavedPositionAndSize(clockWidget, 'clockWidgetPosition', 'clockWidgetSize');
    }

    function addClassTimetable() {
        timetableWidget = document.createElement('div');
        timetableWidget.id = 'timetableWidget';

        const timetableHeader = document.createElement('div');
        timetableHeader.textContent = '📅 Class Timetable';
        timetableHeader.style.fontWeight = 'bold';
        timetableHeader.style.cursor = 'move';

        const timetableBody = document.createElement('textarea');
        timetableBody.placeholder = 'Enter your class schedule here...';
        timetableBody.value = localStorage.getItem('timetable') || '';
        timetableBody.addEventListener('input', () => localStorage.setItem('timetable', timetableBody.value));

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        timetableWidget.appendChild(timetableHeader);
        timetableWidget.appendChild(timetableBody);
        timetableWidget.appendChild(resizeHandle);
        document.body.appendChild(timetableWidget);

        let isDragging = false, isResizing = false, offsetX, offsetY;
        timetableHeader.addEventListener('mousedown', (e) => {
            if (e.target === resizeHandle) return;
            isDragging = true;
            offsetX = e.clientX - timetableWidget.offsetLeft;
            offsetY = e.clientY - timetableWidget.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;
                newX = Math.max(0, Math.min(newX, window.innerWidth - timetableWidget.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - timetableWidget.offsetHeight));
                timetableWidget.style.left = `${newX}px`;
                timetableWidget.style.top = `${newY}px`;
            } else if (isResizing) {
                const newWidth = e.clientX - timetableWidget.getBoundingClientRect().left;
                const newHeight = e.clientY - timetableWidget.getBoundingClientRect().top;
                timetableWidget.style.width = `${newWidth}px`;
                timetableWidget.style.height = `${newHeight}px`;
                timetableBody.style.height = 'calc(100% - 40px)';
                localStorage.setItem('timetableWidgetSize', JSON.stringify({ width: timetableWidget.style.width, height: timetableWidget.style.height }));
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('timetableWidgetPosition', JSON.stringify({ left: timetableWidget.style.left, top: timetableWidget.style.top }));
            }
            if (isResizing) isResizing = false;
        });

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.preventDefault();
            e.stopPropagation();
        });

        loadSavedPositionAndSize(timetableWidget, 'timetableWidgetPosition', 'timetableWidgetSize');
    }

    function addTodoList() {
        todoWidget = document.createElement('div');
        todoWidget.id = 'todoWidget';

        const todoHeader = document.createElement('div');
        todoHeader.textContent = '📝 Todo List';
        todoHeader.style.fontWeight = 'bold';
        todoHeader.style.marginBottom = '5px';
        todoHeader.style.cursor = 'move';

        const todoInput = document.createElement('input');
        todoInput.placeholder = 'Add a new task...';
        Object.assign(todoInput.style, { width: '90%', padding: '5px', borderRadius: '3px', border: '1px solid #ddd' });

        const todoList = document.createElement('ul');
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        todoWidget.appendChild(todoHeader);
        todoWidget.appendChild(todoInput);
        todoWidget.appendChild(todoList);
        todoWidget.appendChild(resizeHandle);
        document.body.appendChild(todoWidget);

        const savedTodos = JSON.parse(localStorage.getItem('todoItems')) || [];
        savedTodos.forEach(addTodoItem);

        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && todoInput.value.trim() !== '') {
                addTodoItem(todoInput.value.trim());
                todoInput.value = '';
            }
        });

        let isDragging = false, isResizing = false, offsetX, offsetY;
        let startX, startY, startWidth, startHeight;

        todoHeader.addEventListener('mousedown', (e) => {
            if (isResizing) return;
            isDragging = true;
            offsetX = e.clientX - todoWidget.offsetLeft;
            offsetY = e.clientY - todoWidget.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;
                newX = Math.max(0, Math.min(newX, window.innerWidth - todoWidget.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - todoWidget.offsetHeight));
                todoWidget.style.left = `${newX}px`;
                todoWidget.style.top = `${newY}px`;
            } else if (isResizing) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const newWidth = Math.max(startWidth + deltaX, 50);
                const newHeight = Math.max(startHeight + deltaY, 50);
                todoWidget.style.width = `${newWidth}px`;
                todoWidget.style.height = `${newHeight}px`;
                localStorage.setItem('todoWidgetSize', JSON.stringify({ width: todoWidget.style.width, height: todoWidget.style.height }));
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('todoWidgetPosition', JSON.stringify({ left: todoWidget.style.left, top: todoWidget.style.top }));
            }
            if (isResizing) isResizing = false;
        });

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.preventDefault();
            e.stopPropagation();
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(todoWidget).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(todoWidget).height, 10);
        });

        loadSavedPositionAndSize(todoWidget, 'todoWidgetPosition', 'todoWidgetSize');
        if (!localStorage.getItem('todoWidgetSize')) {
            todoWidget.style.width = '150px';
            todoWidget.style.height = '200px';
        }

        function addTodoItem(todoText) {
            const todoItem = document.createElement('li');
            const index = todoList.children.length + 1;
            todoItem.textContent = `${index}. ${todoText}`;
            todoItem.addEventListener('click', () => {
                todoItem.style.textDecoration = (todoItem.style.textDecoration === 'line-through') ? 'none' : 'line-through';
            });
            todoItem.addEventListener('dblclick', () => {
                todoItem.remove();
                saveTodos();
                updateTodoIndices();
            });
            todoList.appendChild(todoItem);
            saveTodos();
        }

        function saveTodos() {
            const todos = Array.from(todoList.children).map(item => item.textContent.split('. ')[1]);
            localStorage.setItem('todoItems', JSON.stringify(todos));
        }

        function updateTodoIndices() {
            Array.from(todoList.children).forEach((item, index) => {
                const text = item.textContent.split('. ')[1];
                item.textContent = `${index + 1}. ${text}`;
            });
        }
    }

    /*** Dark Mode Toggle ***/
    async function createDarkReaderToggle() {
        const btn = document.createElement('div');
        btn.id = 'dark-reader-toggle';
        btn.textContent = '🔆';
        btn.addEventListener('click', async () => {
            if (await GM.getValue('darkMode', false)) {
                await GM.setValue('darkMode', false);
                disableDarkMode();
            } else {
                await GM.setValue('darkMode', true);
                enableDarkMode();
            }
        });
        document.body.appendChild(btn);

        if (await GM.getValue('darkMode', false)) enableDarkMode();
        else disableDarkMode();
    }

    function enableDarkMode() {
        DarkReader.setFetchMethod(window.fetch);
        DarkReader.enable({ brightness: 105, contrast: 105, sepia: 0 });
        const btn = document.getElementById('dark-reader-toggle');
        if (btn) btn.textContent = '🔅';
        const logoElement = document.querySelector('#gl_logo img');
        if (logoElement) logoElement.src = 'https://raw.githubusercontent.com/BurdenOwl/burdenowl/refs/heads/main/failureswebsite.png';
    }

    function disableDarkMode() {
        DarkReader.disable();
        const btn = document.getElementById('dark-reader-toggle');
        if (btn) btn.textContent = '🔆';
        const logoElement = document.querySelector('#gl_logo img');
        if (logoElement) logoElement.src = 'https://media-release.glynlyon.com/branding/images/ignitia/logo.png';
    }

    /*** Minimalist Toolbar ***/
    function addSoberMinibar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'minimalist-toolbar-popup';

        const toggleButton = document.createElement('div');
        toggleButton.id = 'minimalist-toolbar-toggle';
        toggleButton.textContent = '☰';
        toggleButton.addEventListener('click', () => {
            toolbar.style.display = (toolbar.style.display === 'none') ? 'flex' : 'none';
        });

        const developerName = document.createElement('div');
        developerName.textContent = 'By Minemetero';
        developerName.style.fontWeight = 'bold';
        developerName.style.marginBottom = '15px';
        toolbar.appendChild(developerName);

        const calculator = document.createElement('textarea');
        calculator.id = 'minimalist-calculator';
        calculator.placeholder = 'Calculator (press Enter to evaluate)';
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
                        const expr = input.slice(10, -1);
                        result = math.simplify(expr).toString();
                    } else {
                        result = math.evaluate(input);
                    }
                    calculator.value = `${result}`;
                } catch {
                    calculator.value = 'Error!';
                }
            }
        });
        toolbar.appendChild(calculator);

        const notes = document.createElement('textarea');
        notes.id = 'minimalist-notes';
        notes.placeholder = 'Your Notes...';
        notes.value = localStorage.getItem('minimalistNotes') || '';
        notes.addEventListener('input', () => localStorage.setItem('minimalistNotes', notes.value));
        toolbar.appendChild(notes);

        const toggleMenu = document.createElement('div');
        toggleMenu.className = 'toggle-widgets';

        const widgets = [
            { name: 'Clock', id: 'clockWidget', init: addCustomizableClock },
            { name: 'Class Timetable', id: 'timetableWidget', init: addClassTimetable },
            { name: 'Todo List', id: 'todoWidget', init: addTodoList }
        ];

        widgets.forEach(w => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = w.id;
            checkbox.checked = JSON.parse(localStorage.getItem(w.id) || 'true');
            checkbox.addEventListener('change', () => {
                localStorage.setItem(w.id, checkbox.checked);
                if (checkbox.checked) w.init();
                else document.getElementById(w.id)?.remove();
            });

            const label = document.createElement('label');
            label.htmlFor = w.id;
            label.textContent = w.name;
            label.style.marginBottom = '5px';
            label.style.cursor = 'pointer';

            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'space-between';
            container.style.marginBottom = '2px';

            container.appendChild(checkbox);
            container.appendChild(label);
            toggleMenu.appendChild(container);

            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset';
            resetButton.style.marginLeft = '10px';
            resetButton.style.backgroundColor = '#007BFF';
            resetButton.style.color = 'white';
            resetButton.style.border = 'none';
            resetButton.style.borderRadius = '5px';
            resetButton.style.padding = '5px 10px';
            resetButton.style.cursor = 'pointer';
            resetButton.style.transition = 'background-color 0.3s';

            resetButton.addEventListener('click', () => {
                localStorage.removeItem(`${w.id}Position`);
                localStorage.removeItem(`${w.id}Size`);
                location.reload();
            });

            resetButton.addEventListener('mouseover', () => {
                resetButton.style.backgroundColor = '#0056b3';
            });
            resetButton.addEventListener('mouseout', () => {
                resetButton.style.backgroundColor = '#007BFF';
            });

            container.appendChild(resetButton);
        });

        toggleMenu.style.marginBottom = '2px';

        toolbar.appendChild(toggleMenu);
        document.body.appendChild(toggleButton);
        document.body.appendChild(toolbar);
    }

    /*** Inspirational Quote ***/
    async function loadAndDisplayQuote() {
        const quotesURL = "https://raw.githubusercontent.com/Minemetero/IgnitiaPlus/refs/heads/main/qutoes.json";

        try {
            const response = await fetch(quotesURL, { cache: "no-store" });
            if (!response.ok) {
                console.error("Failed to load quotes:", response.statusText);
                return;
            }

            const quotes = await response.json();
            if (!Array.isArray(quotes) || quotes.length === 0) {
                console.error("Quotes file is empty or not an array.");
                return;
            }

            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
            const quote = quotes[dayOfYear % quotes.length];
            displayQuote(quote);
        } catch (error) {
            console.error("Error fetching quotes:", error);
        }
    }

    function displayQuote(quote) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Merriweather&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        const quoteContainer = document.createElement('div');
        Object.assign(quoteContainer.style, {
            position: 'fixed', top: '50%', right: '200px',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
            color: 'white', padding: '20px', borderRadius: '15px',
            fontFamily: '"Merriweather", serif', fontSize: '22px',
            lineHeight: '1.5', zIndex: '1000', maxWidth: '350px', textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', opacity: '0', animation: 'fadeIn 1s forwards'
        });
        quoteContainer.textContent = quote;

        document.body.appendChild(quoteContainer);

        const loginForm = document.querySelector('.login-form');
        if (loginForm) loginForm.style.display = 'none';

        setTimeout(() => {
            //quoteContainer.remove();
            if (loginForm) loginForm.style.display = 'block';
        }, 2500);
    }

    function removeLoginError() {
        const loginError = document.querySelector('.login-error.alert.alert-error');
        if (loginError) {
            loginError.remove();
        }
    }

    /*** Logout but Better Postion (Credit:BurdenOwl) <- this guys doesn't help me that much... but fine he designed the UI***/
    function logOut() {
        const passwordResetForm = document.getElementById("passwordResetFormWrapper");
        if (!passwordResetForm) return;

        const signOutButton = document.createElement('button');
        signOutButton.id = 'signOut';
        signOutButton.className = 'btn btn-default btn-block';
        signOutButton.textContent = 'Sign Out';

        passwordResetForm.appendChild(signOutButton);

        signOutButton.addEventListener('click', () => {
            const logoutUrl = `${window.location.origin}/owsoo/j_spring_security_logout`;
            window.location.href = logoutUrl;
        });
    }

    /*** Initialization ***/
    async function init() {
        injectCSS();
        if (window.location.pathname === '/owsoo/login/auth') {
            await loadAndDisplayQuote();
            removeLoginError();
        } else {
            modifyPageHead();
            removeUnwantedElements();
            addRefreshWarning();
            await createDarkReaderToggle();
            addSoberMinibar();
            logOut();

            if (JSON.parse(localStorage.getItem('clockWidget') || 'true')) addCustomizableClock();
            if (JSON.parse(localStorage.getItem('timetableWidget') || 'true')) addClassTimetable();
            if (JSON.parse(localStorage.getItem('todoWidget') || 'true')) addTodoList();
        }
    }

    window.addEventListener('load', init);
    window.addEventListener('resize', () => {
        adjustElementPosition(clockWidget, 'clockWidgetPosition');
        adjustElementPosition(timetableWidget, 'timetableWidgetPosition');
        adjustElementPosition(todoWidget, 'todoWidgetPosition');
    });
})();
