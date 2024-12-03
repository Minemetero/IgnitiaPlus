// ==UserScript==
// @name         IgnitiaPlus
// @namespace    http://tampermonkey.net/
// @version      1.4.0
// @license      Apache-2.0
// @description  Enhance your study experience with IgnitiaPlus
// @author       Minemetero
// @match        *://*.ignitiaschools.com/*
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

    //Add Inspirational Quote of the Day function
    function addInspirationalQuote() {
        const quotes = [
            "The best way to predict your future is to create it. - Abraham Lincoln",
            "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
            "Believe you can and you're halfway there. - Theodore Roosevelt",
            "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
            "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Success is not the key to happiness. Happiness is the key to success. - Albert Schweitzer",
            "Hardships often prepare ordinary people for an extraordinary destiny. - C.S. Lewis",
            "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
            "It does not matter how slowly you go as long as you do not stop. - Confucius",
            "Dream big and dare to fail. - Norman Vaughan",
            "Keep your face always toward the sunshine—and shadows will fall behind you. - Walt Whitman",
            "Act as if what you do makes a difference. It does. - William James",
            "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
            "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
            "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
            "Do not wait to strike till the iron is hot, but make it hot by striking. - William Butler Yeats",
            "You miss 100% of the shots you don’t take. - Wayne Gretzky",
            "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
            "I can’t change the direction of the wind, but I can adjust my sails to always reach my destination. - Jimmy Dean",
            "If you want to achieve greatness stop asking for permission. - Anonymous",
            "The only place where success comes before work is in the dictionary. - Vidal Sassoon",
            "Fall seven times and stand up eight. - Japanese Proverb",
            "Opportunities don’t happen, you create them. - Chris Grosser",
            "Don’t wait. The time will never be just right. - Napoleon Hill",
            "In the middle of every difficulty lies opportunity. - Albert Einstein",
            "Strive not to be a success, but rather to be of value. - Albert Einstein",
            "Life is 10% what happens to us and 90% how we react to it. - Charles R. Swindoll",
            "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
            "If you want to lift yourself up, lift up someone else. - Booker T. Washington",
            "Do what you can, with what you have, where you are. - Theodore Roosevelt",
            "Courage is not the absence of fear, but the triumph over it. - Nelson Mandela",
            "The only journey is the one within. - Rainer Maria Rilke",
            "Challenges are what make life interesting, and overcoming them is what makes life meaningful. - Joshua J. Marine",
            "Do not follow where the path may lead. Go instead where there is no path and leave a trail. - Ralph Waldo Emerson",
            "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
            "It always seems impossible until it’s done. - Nelson Mandela",
            "Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart. - Roy T. Bennett",
            "The biggest risk is not taking any risk. - Mark Zuckerberg",
            "Success is not in what you have, but who you are. - Bo Bennett",
            "You don’t have to be great to start, but you have to start to be great. - Zig Ziglar",
            "Hustle until your haters ask if you’re hiring. - Anonymous",
            "Do something today that your future self will thank you for. - Sean Patrick Flanery",
            "Opportunities are like sunrises. If you wait too long, you miss them. - William Arthur Ward",
            "The secret of getting ahead is getting started. - Mark Twain",
            "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
            "Your limitation—it’s only your imagination. - Anonymous",
            "Dream it. Wish it. Do it. - Anonymous",
            "Nothing will work unless you do. - Maya Angelou",
            "If you can dream it, you can do it. - Walt Disney",
            "Act as though it were impossible to fail. - Dorothea Brande",
            "Believe in yourself and all that you are. - Christian D. Larson",
            "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
            "Every moment is a fresh beginning. - T.S. Eliot",
            "Don’t let yesterday take up too much of today. - Will Rogers",
            "Turn your wounds into wisdom. - Oprah Winfrey",
            "Success is a state of mind. If you want success, start thinking of yourself as a success. - Joyce Brothers",
            "Great things are done by a series of small things brought together. - Vincent Van Gogh",
            "If opportunity doesn’t knock, build a door. - Milton Berle",
            "Perseverance is not a long race; it is many short races one after another. - Walter Elliot",
            "Life is about making an impact, not making an income. - Kevin Kruse",
            "Believe in the power of your dreams. - Anonymous"
        ];
        
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Lobster&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Get today's date
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);

        // Select a quote based on dayOfYear
        const quote = quotes[dayOfYear % quotes.length];

        // Create a container div
        const quoteContainer = document.createElement('div');
        Object.assign(quoteContainer.style, {
            position: 'fixed',
            top: '50%',
            right: '20px',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            fontFamily: '"Lobster", cursive',
            fontSize: '22px',
            lineHeight: '1.5',
            zIndex: '1000',
            maxWidth: '350px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease-in-out',
            opacity: '0',
            animation: 'fadeIn 1s forwards',
        });

        quoteContainer.textContent = quote;

        // Append to body
        document.body.appendChild(quoteContainer);

        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(`
            @keyframes fadeIn {
                to {
                    opacity: 1;
                }
            }
        `, styleSheet.cssRules.length);
    }

    // Initialize the enhanced UI and features
    async function init() {
        if (window.location.pathname === '/owsoo/login/auth') {
            addInspirationalQuote();
        } else {
            // We are on other pages
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
    }
    window.addEventListener('load', init);
    window.addEventListener('resize', () => {
        adjustElementPosition(clock, 'clockPosition');
        adjustElementPosition(timetableContainer, 'timetablePosition');
        adjustElementPosition(todoContainer, 'todoListPosition');
    });
})();

