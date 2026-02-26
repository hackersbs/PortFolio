// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                    WINDOWS 11 DESKTOP SIMULATOR - CODE                     ║
// ║                                                                            ║
// ║  Structure:                                                                ║
// ║  1. SYSTEM UTILITIES & CORE FUNCTIONS                                     ║
// ║  2. GLOBAL STATE & VARIABLES                                              ║
// ║  3. NOTIFICATION SYSTEM                                                   ║
// ║  4. APPLICATION FEATURES                                                  ║
// ║     - Calculator                                                          ║
// ║     - Notepad                                                             ║
// ║     - Browser                                                             ║
// ║  5. WINDOW MANAGEMENT                                                     ║
// ║  6. EVENT HANDLERS & INTERACTIONS                                         ║
// ║  7. MODAL SYSTEM                                                          ║
// ║  8. INITIALIZATION                                                        ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SYSTEM UTILITIES & CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Display notification message to user
 * @param {string} message - Notification text
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);
    log.event(`Notification: ${message} (${type})`);

    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 400);
    }, duration);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GLOBAL STATE & VARIABLES
// ═══════════════════════════════════════════════════════════════════════════════

// Window management state
let windows = [];
let windowZIndex = 300;
let offsetX = 50;
let offsetY = 50;
let draggedWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isResizingWindow = null;
let resizeOffsetX = 0;
let resizeOffsetY = 0;

// Console logger utility
const log = {
    info: (msg) => console.log(`%c[Windows 11 UI]%c ${msg}`, 'color: #0078d4; font-weight: bold;', 'color: white;'),
    action: (msg) => console.log(`%c[ACTION]%c ${msg}`, 'color: #107c10; font-weight: bold;', 'color: #90EE90;'),
    event: (msg) => console.log(`%c[EVENT]%c ${msg}`, 'color: #FFB900; font-weight: bold;', 'color: #FFEB3B;'),
    error: (msg) => console.log(`%c[ERROR]%c ${msg}`, 'color: #A4373A; font-weight: bold;', 'color: #FF6B6B;'),
};

/**
 * Update system clock display
 */
function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}`;
}

log.info('Windows 11 UI System initialized');

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// [Notification functions already defined above in section 1]

// ═══════════════════════════════════════════════════════════════════════════════
// 4. APPLICATION FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 4.1 CALCULATOR FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
let calcHistory = '0';
let calcPrevValue = null;
let calcOperation = null;
let calcNewNumber = true;
let calcMemory = 0;

function setupCalculator(windowEl) {
    const display = windowEl.querySelector('.calc-display');
    const historyDisplay = windowEl.querySelector('.calc-history');
    const buttons = windowEl.querySelectorAll('.calc-btn');

    function updateDisplay() {
        display.textContent = calcDisplay;
        historyDisplay.textContent = calcHistory;
    }

    function clear() {
        calcDisplay = '0';
        calcHistory = '0';
        calcPrevValue = null;
        calcOperation = null;
        calcNewNumber = true;
        updateDisplay();
        log.event('Calculator cleared');
    }

    function deleteLastChar() {
        if (calcDisplay.length > 1) {
            calcDisplay = calcDisplay.slice(0, -1);
        } else {
            calcDisplay = '0';
        }
        calcNewNumber = false;
        updateDisplay();
    }

    function sqrt() {
        const value = parseFloat(calcDisplay);
        calcDisplay = String(Math.sqrt(value));
        calcNewNumber = true;
        updateDisplay();
    }

    function calculate(nextOperation) {
        const currentValue = parseFloat(calcDisplay);

        if (calcPrevValue === null) {
            calcPrevValue = currentValue;
            calcHistory = currentValue + (nextOperation || '');
        } else if (calcOperation) {
            let result;
            const prev = calcPrevValue;
            const curr = currentValue;

            switch (calcOperation) {
                case '+':
                    result = prev + curr;
                    break;
                case '−':
                    result = prev - curr;
                    break;
                case '×':
                    result = prev * curr;
                    break;
                case '÷':
                    result = prev / curr;
                    break;
                default:
                    return;
            }

            calcDisplay = String(result);
            calcPrevValue = result;
            calcHistory = result + (nextOperation || '');
        }

        calcOperation = nextOperation;
        calcNewNumber = true;
        updateDisplay();
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = btn.textContent.trim();

            if (value === 'C') {
                clear();
            } else if (value === '⌫') {
                deleteLastChar();
            } else if (value === '√') {
                sqrt();
            } else if (value === 'MC') {
                calcMemory = 0;
                showNotification('Memory cleared', 'info', 1500);
            } else if (value === 'MR') {
                calcDisplay = String(calcMemory);
                calcNewNumber = true;
                updateDisplay();
            } else if (value === 'M+') {
                calcMemory += parseFloat(calcDisplay);
                showNotification(`M+ (Memory: ${calcMemory})`, 'info', 1500);
                calcNewNumber = true;
            } else if (value === 'M−') {
                calcMemory -= parseFloat(calcDisplay);
                showNotification(`M− (Memory: ${calcMemory})`, 'info', 1500);
                calcNewNumber = true;
            } else if (value === '=') {
                calculate(null);
                showNotification(`= ${calcDisplay}`, 'success', 1500);
            } else if (['+', '−', '×', '÷'].includes(value)) {
                calculate(value);
            } else if (value === '.') {
                if (!calcDisplay.includes('.')) {
                    calcDisplay += '.';
                    calcNewNumber = false;
                    updateDisplay();
                }
            } else {
                if (calcNewNumber) {
                    calcDisplay = value;
                    calcNewNumber = false;
                } else {
                    if (calcDisplay === '0') {
                        calcDisplay = value;
                    } else {
                        calcDisplay += value;
                    }
                }
                updateDisplay();
            }
        });
    });

    log.event('Calculator setup complete with Windows 11 style');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.2 NOTEPAD SAVE/LOAD FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
function setupNotepadSaveLoad(windowEl, windowObj) {
    const textarea = windowEl.querySelector('.notepad-textarea');
    const menuItems = windowEl.querySelectorAll('.notepad-menu-item');

    // Load saved content on open
    const savedContent = localStorage.getItem('notepad-content');
    if (savedContent) {
        textarea.value = savedContent;
        log.event('Notepad: Content loaded from localStorage');
    }

    // Setup Save functionality
    menuItems.forEach(item => {
        if (item.textContent.trim() === 'Save') {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.setItem('notepad-content', textarea.value);
                showNotification('File saved successfully', 'success');
                log.action('Notepad: Content saved to localStorage');
            });
        }

        if (item.textContent.trim() === 'Save As') {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const filename = prompt('Enter filename:', 'untitled.txt');
                if (filename) {
                    localStorage.setItem(`notepad-${filename}`, textarea.value);
                    showNotification(`File saved as ${filename}`, 'success');
                    log.action(`Notepad: Content saved as ${filename}`);
                }
            });
        }

        if (item.textContent.trim() === 'Open') {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const filename = prompt('Enter filename to open:', 'untitled.txt');
                if (filename) {
                    const content = localStorage.getItem(`notepad-${filename}`);
                    if (content) {
                        textarea.value = content;
                        showNotification(`File ${filename} opened`, 'success');
                        log.action(`Notepad: File ${filename} opened`);
                    } else {
                        showNotification(`File ${filename} not found`, 'error');
                    }
                }
            });
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.3 BROWSER SEARCH FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
function setupBrowserSearch(windowEl) {
    const searchInput = windowEl.querySelector('#portfolio-search-input');
    const searchBtn = windowEl.querySelector('#portfolio-search-btn');
    const viewBtn = windowEl.querySelector('#portfolio-view-btn');

    // Search button handler
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchQuery = searchInput.value.trim();
            if (searchQuery.length > 0) {
                log.event(`Portfolio search: "${searchQuery}"`);
                showNotification(`Searching for: ${searchQuery}`, 'info', 1500);

                // Redirect to portfolio with search query
                setTimeout(() => {
                    window.location.href = `Portfolio/Portfolio.html?search=${encodeURIComponent(searchQuery)}`;
                }, 300);
            } else {
                showNotification('Please enter a search term', 'warning');
            }
        });
    }

    // View Full Portfolio button
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            log.event('Opening full portfolio from browser');
            showNotification('Opening your portfolio...', 'success', 1500);
            setTimeout(() => {
                window.location.href = 'Portfolio/Portfolio.html';
            }, 300);
        });
    }

    // Enter key in search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.4 ADDITIONAL APPS
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// 5. EVENT HANDLERS & INTERACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 5.1 RIGHT-CLICK CONTEXT MENU
// ─────────────────────────────────────────────────────────────────────────────
function setupContextMenu(windowEl, windowObj) {
    let contextMenu = null;

    windowEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        // Remove existing menu
        if (contextMenu) contextMenu.remove();

        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';

        const isMinimized = windowEl.style.display === 'none';

        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="snap-left">📌 Snap Left</div>
            <div class="context-menu-item" data-action="snap-right">📌 Snap Right</div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="${isMinimized ? 'restore' : 'minimize'}">
                ${isMinimized ? '▲ Restore' : '▼ Minimize'}
            </div>
            <div class="context-menu-item" data-action="maximize">□ ${windowObj.isMaximized ? 'Restore' : 'Maximize'}</div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="close">✕ Close</div>
        `;

        document.body.appendChild(contextMenu);

        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;

                switch (action) {
                    case 'snap-left':
                        snapWindow(windowEl, 'left');
                        break;
                    case 'snap-right':
                        snapWindow(windowEl, 'right');
                        break;
                    case 'minimize':
                        windowEl.style.display = 'none';
                        break;
                    case 'restore':
                        windowEl.style.display = 'flex';
                        break;
                    case 'maximize':
                        windowEl.querySelector('.window-btn.maximize').click();
                        break;
                    case 'close':
                        windowEl.querySelector('.window-btn.close').click();
                        break;
                }

                contextMenu.remove();
                contextMenu = null;
            });
        });

        // Close menu on outside click
        document.addEventListener('click', function closeContextMenu() {
            if (contextMenu) contextMenu.remove();
            document.removeEventListener('click', closeContextMenu);
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.2 WINDOW SNAP FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
function snapWindow(windowEl, direction) {
    const windowObj = windows.find(w => w.element === windowEl);
    if (!windowObj) return;

    if (!windowObj.previousState) {
        windowObj.previousState = {
            width: windowEl.offsetWidth,
            height: windowEl.offsetHeight,
            left: windowEl.offsetLeft,
            top: windowEl.offsetTop
        };
    }

    const width = window.innerWidth / 2;
    const height = window.innerHeight - 60;

    if (direction === 'left') {
        windowEl.style.left = '0px';
        windowEl.style.top = '0px';
        windowEl.style.width = width + 'px';
        windowEl.style.height = height + 'px';
        windowEl.style.borderRadius = '0';
        log.event(`Window snapped to left`);
        showNotification('Window snapped to left', 'info', 2000);
    } else if (direction === 'right') {
        windowEl.style.left = width + 'px';
        windowEl.style.top = '0px';
        windowEl.style.width = width + 'px';
        windowEl.style.height = height + 'px';
        windowEl.style.borderRadius = '0';
        log.event(`Window snapped to right`);
        showNotification('Window snapped to right', 'info', 2000);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.3 START MENU & SEARCH FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
function setupStartMenuSearch() {
    const searchInput = document.getElementById('start-search');
    const startMenuApps = document.getElementById('start-menu-apps');
    const menuItems = Array.from(startMenuApps.querySelectorAll('.start-menu-item'));

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();

        menuItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        log.event(`Start Menu search: "${query}"`);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.4 WIDGETS PANEL FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
function setupWidgetsPanel() {
    const systemTray = document.querySelector('.system-tray');
    const widgetsPanel = document.getElementById('widgets-panel');

    // Add widgets button to taskbar
    const widgetsBtn = document.createElement('button');
    widgetsBtn.className = 'taskbar-app';
    widgetsBtn.title = 'Quick Settings';
    widgetsBtn.innerHTML = '⚙️';
    widgetsBtn.style.marginLeft = 'auto';
    widgetsBtn.style.marginRight = '10px';

    widgetsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        widgetsPanel.classList.toggle('hidden');
        log.event('Widgets panel toggled');
    });

    document.querySelector('.taskbar-end').insertBefore(widgetsBtn, systemTray);

    // Setup widget toggles
    document.querySelectorAll('.widget-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle.classList.toggle('active');
            const widget = toggle.dataset.widget;
            const state = toggle.classList.contains('active') ? 'enabled' : 'disabled';
            showNotification(`${widget.charAt(0).toUpperCase() + widget.slice(1)} ${state}`, 'info', 2000);
            log.event(`Widget ${widget} toggled`);
        });
    });

    // Setup widget sliders
    document.querySelectorAll('.widget-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const widget = slider.dataset.widget;
            const value = e.target.value;
            if (widget === 'brightness') {
                document.body.style.filter = `brightness(${value}%)`;
            }
            log.event(`Widget ${widget} set to ${value}`);
        });
    });

    // Close widgets when clicking outside
    document.addEventListener('click', (e) => {
        if (!widgetsPanel.contains(e.target) && !widgetsBtn.contains(e.target)) {
            widgetsPanel.classList.add('hidden');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. APPLICATION DEFINITIONS (ALL APPS)
// ═══════════════════════════════════════════════════════════════════════════════
const apps = {
    notepad: {
        title: 'Notepad',
        icon: '📝',
        width: 600,
        height: 400,
        minWidth: 400,
        minHeight: 300,
        content: () => `
            <div class="notepad-container">
                <div class="notepad-menu-bar">
                    <button class="notepad-menu" data-menu="file">File</button>
                    <button class="notepad-menu" data-menu="edit">Edit</button>
                    <button class="notepad-menu" data-menu="view">View</button>
                    <button class="notepad-menu" data-menu="help">Help</button>
                </div>
                
                <!-- File Menu -->
                <div class="notepad-dropdown" data-menu="file">
                    <div class="notepad-menu-item">New</div>
                    <div class="notepad-menu-item">Open</div>
                    <div class="notepad-menu-item">Save</div>
                    <div class="notepad-menu-item">Save As</div>
                    <div class="notepad-menu-divider"></div>
                    <div class="notepad-menu-item">Print</div>
                    <div class="notepad-menu-divider"></div>
                    <div class="notepad-menu-item">Exit</div>
                </div>
                
                <!-- Edit Menu -->
                <div class="notepad-dropdown" data-menu="edit">
                    <div class="notepad-menu-item">Undo</div>
                    <div class="notepad-menu-item">Redo</div>
                    <div class="notepad-menu-divider"></div>
                    <div class="notepad-menu-item">Cut</div>
                    <div class="notepad-menu-item">Copy</div>
                    <div class="notepad-menu-item">Paste</div>
                    <div class="notepad-menu-divider"></div>
                    <div class="notepad-menu-item">Select All</div>
                    <div class="notepad-menu-item">Find</div>
                    <div class="notepad-menu-item">Replace</div>
                </div>
                
                <!-- View Menu -->
                <div class="notepad-dropdown" data-menu="view">
                    <div class="notepad-menu-item">Zoom In</div>
                    <div class="notepad-menu-item">Zoom Out</div>
                    <div class="notepad-menu-item">Reset Zoom</div>
                    <div class="notepad-menu-divider"></div>
                    <div class="notepad-menu-item">Status Bar</div>
                    <div class="notepad-menu-item">Word Wrap</div>
                </div>
                
                <!-- Help Menu -->
                <div class="notepad-dropdown" data-menu="help">
                    <div class="notepad-menu-item">View Help</div>
                    <div class="notepad-menu-divider"></div>
                    <div class="notepad-menu-item">About Notepad</div>
                </div>
                
                <div class="notepad-editor">
                    <textarea class="notepad-textarea" placeholder=""></textarea>
                </div>
                <div class="notepad-statusbar">
                    <span class="notepad-status">Line 1, Column 1</span>
                </div>
            </div>
        `
    },
    calculator: {
        title: 'Calculator',
        icon: '🧮',
        width: 340,
        height: 520,
        minWidth: 300,
        minHeight: 450,
        content: () => `
            <div class="calculator-container">
                <div class="calc-display-panel">
                    <div class="calc-history">0</div>
                    <div class="calc-display">0</div>
                </div>
                <div class="calculator-grid">
                    <button class="calc-btn calc-btn-memory">MC</button>
                    <button class="calc-btn calc-btn-memory">MR</button>
                    <button class="calc-btn calc-btn-memory">M+</button>
                    <button class="calc-btn calc-btn-memory">M-</button>
                    
                    <button class="calc-btn calc-btn-function">C</button>
                    <button class="calc-btn calc-btn-function">⌫</button>
                    <button class="calc-btn calc-btn-function">√</button>
                    <button class="calc-btn calc-btn-operation">÷</button>
                    
                    <button class="calc-btn">7</button>
                    <button class="calc-btn">8</button>
                    <button class="calc-btn">9</button>
                    <button class="calc-btn calc-btn-operation">×</button>
                    
                    <button class="calc-btn">4</button>
                    <button class="calc-btn">5</button>
                    <button class="calc-btn">6</button>
                    <button class="calc-btn calc-btn-operation">−</button>
                    
                    <button class="calc-btn">1</button>
                    <button class="calc-btn">2</button>
                    <button class="calc-btn">3</button>
                    <button class="calc-btn calc-btn-operation">+</button>
                    
                    <button class="calc-btn calc-btn-zero">0</button>
                    <button class="calc-btn">.</button>
                    <button class="calc-btn calc-btn-equals">=</button>
                </div>
            </div>
        `
    },
    settings: {
        title: 'Settings',
        icon: '⚙️',
        width: 800,
        height: 600,
        minWidth: 500,
        minHeight: 400,
        content: () => `
            <div class="settings-container">
                <div class="settings-sidebar">
                    <div class="settings-search">
                        <input type="text" placeholder="Find a setting" class="settings-search-input">
                    </div>
                    <div class="settings-nav">
                        <div class="settings-nav-item active" data-category="system">
                            <span class="settings-nav-icon">💻</span>
                            <span class="settings-nav-text">System</span>
                        </div>
                        <div class="settings-nav-item" data-category="devices">
                            <span class="settings-nav-icon">📱</span>
                            <span class="settings-nav-text">Devices</span>
                        </div>
                        <div class="settings-nav-item" data-category="network">
                            <span class="settings-nav-icon">🌐</span>
                            <span class="settings-nav-text">Network</span>
                        </div>
                        <div class="settings-nav-item" data-category="personalization">
                            <span class="settings-nav-icon">🎨</span>
                            <span class="settings-nav-text">Personalization</span>
                        </div>
                        <div class="settings-nav-item" data-category="privacy">
                            <span class="settings-nav-icon">🔒</span>
                            <span class="settings-nav-text">Privacy & Security</span>
                        </div>
                        <div class="settings-nav-item" data-category="about">
                            <span class="settings-nav-icon">ℹ️</span>
                            <span class="settings-nav-text">About</span>
                        </div>
                    </div>
                </div>
                <div class="settings-main">
                    <div class="settings-category" id="system-category">
                        <h2 class="settings-category-title">System</h2>
                        <div class="settings-group">
                            <h3 class="settings-group-title">Display</h3>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Brightness</div>
                                    <div class="settings-item-desc">Adjust screen brightness</div>
                                </div>
                                <input type="range" class="settings-slider" min="0" max="100" value="70">
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Dark Mode</div>
                                    <div class="settings-item-desc">Use dark theme</div>
                                </div>
                                <div class="toggle-switch active"></div>
                            </div>
                        </div>
                        <div class="settings-group">
                            <h3 class="settings-group-title">Sound</h3>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Volume</div>
                                    <div class="settings-item-desc">Adjust volume level</div>
                                </div>
                                <input type="range" class="settings-slider" min="0" max="100" value="80">
                            </div>
                        </div>
                    </div>
                    <div class="settings-category hidden" id="devices-category">
                        <h2 class="settings-category-title">Devices</h2>
                        <div class="settings-group">
                            <h3 class="settings-group-title">Bluetooth & Devices</h3>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Bluetooth</div>
                                    <div class="settings-item-desc">Connect to Bluetooth devices</div>
                                </div>
                                <div class="toggle-switch active"></div>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Mouse</div>
                                    <div class="settings-item-desc">Configure mouse settings</div>
                                </div>
                                <span class="settings-arrow">›</span>
                            </div>
                        </div>
                    </div>
                    <div class="settings-category hidden" id="network-category">
                        <h2 class="settings-category-title">Network</h2>
                        <div class="settings-group">
                            <h3 class="settings-group-title">Connections</h3>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Wi-Fi</div>
                                    <div class="settings-item-desc">Connect to Wi-Fi networks</div>
                                </div>
                                <div class="toggle-switch active"></div>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Airplane Mode</div>
                                    <div class="settings-item-desc">Disable wireless connections</div>
                                </div>
                                <div class="toggle-switch"></div>
                            </div>
                        </div>
                    </div>
                    <div class="settings-category hidden" id="personalization-category">
                        <h2 class="settings-category-title">Personalization</h2>
                        <div class="settings-group">
                            <h3 class="settings-group-title">Colors</h3>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Accent Color</div>
                                    <div class="settings-item-desc">Choose your preferred accent color</div>
                                </div>
                                <span class="settings-arrow">›</span>
                            </div>
                        </div>
                    </div>
                    <div class="settings-category hidden" id="privacy-category">
                        <h2 class="settings-category-title">Privacy & Security</h2>
                        <div class="settings-group">
                            <h3 class="settings-group-title">General</h3>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Privacy Settings</div>
                                    <div class="settings-item-desc">Manage your privacy preferences</div>
                                </div>
                                <span class="settings-arrow">›</span>
                            </div>
                        </div>
                    </div>
                    <div class="settings-category hidden" id="about-category">
                        <h2 class="settings-category-title">About</h2>
                        <div class="settings-group">
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">Device Name</div>
                                    <div class="settings-item-desc">Windows 11 Desktop</div>
                                </div>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <div class="settings-item-title">System Version</div>
                                    <div class="settings-item-desc">22621.1485</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    'file-explorer': {
        title: 'File Explorer',
        icon: '📁',
        width: 700,
        height: 480,
        minWidth: 500,
        minHeight: 350,
        content: () => `
            <div class="explorer-container">
                <div class="explorer-toolbar">
                    <div class="explorer-nav-buttons">
                        <button class="explorer-nav-btn" title="Back">◀</button>
                        <button class="explorer-nav-btn" title="Forward">▶</button>
                        <button class="explorer-nav-btn" title="Up">⬆</button>
                    </div>
                    <div class="explorer-address-bar">
                        <span class="explorer-path-icon">📂</span>
                        <input type="text" class="explorer-path-input" value="This PC" placeholder="Address bar">
                    </div>
                    <div class="explorer-toolbar-icons">
                        <button class="explorer-view-btn" title="Change view">⊞</button>
                        <button class="explorer-search-btn" title="Search">🔍</button>
                    </div>
                </div>
                
                <div class="explorer-content">
                    <div class="explorer-sidebar">
                        <div class="sidebar-section">
                            <div class="sidebar-title">Quick Access</div>
                            <div class="sidebar-item active">📌 Quick Access</div>
                            <div class="sidebar-item">📁 Desktop</div>
                            <div class="sidebar-item">📄 Documents</div>
                            <div class="sidebar-item">⬇️ Downloads</div>
                            <div class="sidebar-item">🖼️ Pictures</div>
                            <div class="sidebar-item">🎬 Videos</div>
                        </div>
                        
                        <div class="sidebar-section">
                            <div class="sidebar-title">This PC</div>
                            <div class="sidebar-item">🖥️ Local Disk (C:)</div>
                            <div class="sidebar-item">💾 Local Disk (D:)</div>
                        </div>
                    </div>
                    
                    <div class="explorer-main">
                        <div class="explorer-breadcrumb">
                            <span class="breadcrumb-item">This PC</span>
                        </div>
                        
                        <div class="explorer-items-grid">
                            <div class="explorer-item-card">
                                <div class="item-icon">🖥️</div>
                                <div class="item-name">Local Disk (C:)</div>
                                <div class="item-size">238 GB</div>
                            </div>
                            
                            <div class="explorer-item-card">
                                <div class="item-icon">💾</div>
                                <div class="item-name">Local Disk (D:)</div>
                                <div class="item-size">1 TB</div>
                            </div>
                            
                            <div class="explorer-item-card">
                                <div class="item-icon">📁</div>
                                <div class="item-name">Desktop</div>
                                <div class="item-detail">Folder</div>
                            </div>
                            
                            <div class="explorer-item-card">
                                <div class="item-icon">📄</div>
                                <div class="item-name">Documents</div>
                                <div class="item-detail">Folder</div>
                            </div>
                            
                            <div class="explorer-item-card">
                                <div class="item-icon">⬇️</div>
                                <div class="item-name">Downloads</div>
                                <div class="item-detail">Folder</div>
                            </div>
                            
                            <div class="explorer-item-card">
                                <div class="item-icon">🖼️</div>
                                <div class="item-name">Pictures</div>
                                <div class="item-detail">Folder</div>
                            </div>
                            
                            <div class="explorer-item-card">
                                <div class="item-icon">🎬</div>
                                <div class="item-name">Videos</div>
                                <div class="item-detail">Folder</div>
                            </div>
                            
                            <div class="explorer-item-card">
                                <div class="item-icon">🎵</div>
                                <div class="item-name">Music</div>
                                <div class="item-detail">Folder</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="explorer-statusbar">
                    <span class="status-text">8 items</span>
                </div>
            </div>
        `
    },
    browser: {
        title: 'Google Chrome',
        icon: '🌐',
        width: 900,
        height: 650,
        minWidth: 600,
        minHeight: 500,
        content: () => `
            <div class="chrome-container">
                <div class="chrome-toolbar">
                    <div class="chrome-nav-buttons">
                        <button class="chrome-btn chrome-back">◀</button>
                        <button class="chrome-btn chrome-forward">▶</button>
                        <button class="chrome-btn chrome-reload">⟳</button>
                    </div>
                    <div class="chrome-address-bar">
                        <span class="chrome-security">🔒</span>
                        <input type="text" class="chrome-url-input" value="https://sangeerth.dev" placeholder="Search or type a URL">
                    </div>
                    <div class="chrome-toolbar-buttons">
                        <button class="chrome-menu-btn">☰</button>
                    </div>
                </div>
                <div class="chrome-tabs">
                    <div class="chrome-tab active">
                        <span class="chrome-tab-icon">🔍</span>
                        <span class="chrome-tab-title">Sangeerth BS - Portfolio</span>
                        <button class="chrome-tab-close">✕</button>
                    </div>
                    <button class="chrome-new-tab">+</button>
                </div>
                <div class="chrome-page">
                    <div class="google-homepage">
                        <div class="google-logo" style="font-size: 3rem; font-weight: bold; color: #667eea; margin-bottom: 2rem;">Sangeerth BS</div>
                        <div class="google-search-box">
                            <input type="text" id="portfolio-search-input" placeholder="Search portfolio or type name" class="google-search-input">
                        </div>
                        <div class="google-buttons">
                            <button class="google-btn" id="portfolio-search-btn">Search Portfolio</button>
                            <button class="google-btn" id="portfolio-view-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">View Full Portfolio</button>
                        </div>
                        <div class="google-footer">
                            <a href="#">Projects</a>
                            <a href="#">Skills</a>
                            <a href="#">Experience</a>
                            <a href="#">Contact</a>
                            <a href="#">GitHub</a>
                            <a href="#">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    odoo: {
        title: 'Odoo Enterprise',
        icon: '💜',
        width: 850,
        height: 600,
        minWidth: 600,
        minHeight: 450,
        content: () => `
            <div class="odoo-container">
                <div class="odoo-sidebar">
                    <div class="odoo-nav-item active" data-section="dashboard">🏠 Dashboard</div>
                    <div class="odoo-nav-item" data-section="sales">📊 Sales</div>
                    <div class="odoo-nav-item" data-section="inventory">📦 Inventory</div>
                    <div class="odoo-nav-item" data-section="accounting">🧾 Accounting</div>
                    <div class="odoo-nav-item" data-section="crm">👥 CRM</div>
                    <div class="odoo-nav-item" data-section="settings">⚙️ Settings</div>
                </div>
                <div class="odoo-main" id="odoo-main-content">
                    <!-- Dashboard Section (Default) -->
                    <div class="odoo-section active" id="odoo-dashboard">
                        <div class="odoo-header">
                            <h1>Expert Odoo Development</h1>
                            <div class="odoo-stats">
                                <div class="odoo-stat"><span>10+</span> Modules Built</div>
                                <div class="odoo-stat"><span>v17</span> Latest Implementation</div>
                                <div class="odoo-stat"><span>99%</span> Client Retention</div>
                            </div>
                        </div>
                        <div class="odoo-grid">
                            <div class="odoo-card">
                                <h3>Custom Billing Solutions</h3>
                                <p>Implemented highly customized POS and billing modules for enterprise clients.</p>
                            </div>
                            <div class="odoo-card">
                                <h3>Module Development</h3>
                                <p>Standard and custom module development using Python and XML.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Sales Section -->
                    <div class="odoo-section" id="odoo-sales" style="display: none;">
                        <div class="odoo-header">
                            <h1>Sales Management</h1>
                        </div>
                        <div class="odoo-table-wrapper">
                            <table class="odoo-table">
                                <thead>
                                    <tr>
                                        <th>Quotation #</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>S0001</td><td>Alice Corp</td><td>2024-05-20</td><td>$1,500.00</td><td><span class="status-badge sales">Confirmed</span></td></tr>
                                    <tr><td>S0002</td><td>Bob Industries</td><td>2024-05-21</td><td>$3,200.00</td><td><span class="status-badge draft">Draft</span></td></tr>
                                    <tr><td>S0003</td><td>Charlie Ltd</td><td>2024-05-22</td><td>$850.00</td><td><span class="status-badge sales">Confirmed</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Inventory Section -->
                    <div class="odoo-section" id="odoo-inventory" style="display: none;">
                        <div class="odoo-header">
                            <h1>Inventory & Stock</h1>
                        </div>
                        <div class="odoo-grid">
                            <div class="odoo-card">
                                <h3>Main Warehouse</h3>
                                <p>Stock Level: 85%</p>
                                <div class="progress-bar"><div class="progress" style="width: 85%;"></div></div>
                            </div>
                            <div class="odoo-card">
                                <h3>Product Movements</h3>
                                <p>12 Pending Deliveries</p>
                                <p>5 Incoming Shipments</p>
                            </div>
                        </div>
                    </div>

                    <!-- Accounting Section -->
                    <div class="odoo-section" id="odoo-accounting" style="display: none;">
                        <div class="odoo-header">
                            <h1>Accounting & Invoicing</h1>
                        </div>
                        <div class="odoo-stats">
                            <div class="odoo-stat"><span>$45,200</span> Total Revenue</div>
                            <div class="odoo-stat"><span>$12,800</span> Outstanding</div>
                        </div>
                    </div>

                    <!-- CRM Section -->
                    <div class="odoo-section" id="odoo-crm" style="display: none;">
                        <div class="odoo-header">
                            <h1>CRM Pipeline</h1>
                        </div>
                        <div class="odoo-kanban">
                            <div class="kanban-column">
                                <h4>New</h4>
                                <div class="kanban-card">Website Lead - Solar Panel</div>
                                <div class="kanban-card">Referral - Tech Hub</div>
                            </div>
                            <div class="kanban-column">
                                <h4>Qualified</h4>
                                <div class="kanban-card">Enterprise ERP Upgrade</div>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Section -->
                    <div class="odoo-section" id="odoo-settings" style="display: none;">
                        <div class="odoo-header">
                            <h1>Odoo Configuration</h1>
                        </div>
                        <div class="settings-list">
                            <div class="settings-item"><input type="checkbox" checked> Multi-Currency Support</div>
                            <div class="settings-item"><input type="checkbox" checked> Advanced Reporting</div>
                            <div class="settings-item"><input type="checkbox"> External API Integration</div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
};

function setupOdooNavigation(windowEl) {
    const navItems = windowEl.querySelectorAll('.odoo-nav-item');
    const sections = windowEl.querySelectorAll('.odoo-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;

            // Update nav active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show selected section
            sections.forEach(sec => {
                if (sec.id === `odoo-${sectionId}`) {
                    sec.style.display = 'block';
                    sec.classList.add('active');
                } else {
                    sec.style.display = 'none';
                    sec.classList.remove('active');
                }
            });

            log.event(`Odoo section changed: ${sectionId}`);
        });
    });
}



// ═══════════════════════════════════════════════════════════════════════════════
// 7. WINDOW MANAGEMENT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 7.1 GLOBAL STATE VARIABLES
// ─────────────────────────────────────────────────────────────────────────────

// [Global variables already defined in section 2]

// ─────────────────────────────────────────────────────────────────────────────
// 7.2 SYSTEM LOGGING & UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

// [Logger already defined in section 2]

// ─────────────────────────────────────────────────────────────────────────────
// 7.3 OPEN APPLICATION
// ─────────────────────────────────────────────────────────────────────────────
function openApp(appName) {
    log.action(`Opening application: ${appName}`);

    const existingWindow = windows.find(w => w.appName === appName);
    if (existingWindow) {
        log.event(`App '${appName}' is already open - bringing to front`);
        bringToFront(existingWindow.element);
        return;
    }

    const app = apps[appName];
    if (!app) {
        log.error(`App '${appName}' not found!`);
        return;
    }

    const windowEl = document.createElement('div');
    windowEl.className = 'app-window';
    windowEl.style.width = app.width + 'px';
    windowEl.style.height = app.height + 'px';
    windowEl.style.left = offsetX + 'px';
    windowEl.style.top = offsetY + 'px';
    windowEl.style.zIndex = windowZIndex++;

    windowEl.innerHTML = `
        <div class="window-titlebar">
            <span class="window-title">${app.icon} ${app.title}</span>
            <div class="window-controls">
                <button class="window-btn minimize">−</button>
                <button class="window-btn maximize">□</button>
                <button class="window-btn close">✕</button>
            </div>
        </div>
        <div class="window-content">
            ${app.content()}
        </div>
        <div class="window-resize-handle"></div>
    `;

    document.getElementById('windows-container').appendChild(windowEl);

    offsetX += 30;
    offsetY += 30;
    if (offsetX > window.innerWidth - 500) offsetX = 50;
    if (offsetY > window.innerHeight - 400) offsetY = 50;

    const windowObj = {
        appName: appName,
        element: windowEl,
        isMaximized: false,
        previousState: null
    };
    windows.push(windowObj);

    log.info(`✓ App '${appName}' opened successfully (Total windows: ${windows.length})`);
    showNotification(`${app.title} opened`, 'success', 2000);

    setupWindowEvents(windowEl, windowObj);

    // App-specific setup
    if (appName === 'calculator') {
        setupCalculator(windowEl);
    } else if (appName === 'notepad') {
        setupNotepadSaveLoad(windowEl, windowObj);
    } else if (appName === 'browser') {
        setupBrowserSearch(windowEl);
    } else if (appName === 'odoo') {
        setupOdooNavigation(windowEl);
    }

    setupContextMenu(windowEl, windowObj);
    setupWindowResize(windowEl, windowObj);

    document.getElementById('start-menu').classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.4 WINDOW RESIZE FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
function setupWindowResize(windowEl, windowObj) {
    const resizeHandle = windowEl.querySelector('.window-resize-handle');

    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizingWindow = windowObj;
        resizeOffsetX = e.clientX;
        resizeOffsetY = e.clientY;
        const rect = windowEl.getBoundingClientRect();
        windowObj.resizeStartWidth = rect.width;
        windowObj.resizeStartHeight = rect.height;
        log.event(`Resizing window: ${windowObj.appName}`);
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizingWindow) {
            const deltaX = e.clientX - resizeOffsetX;
            const deltaY = e.clientY - resizeOffsetY;

            const newWidth = Math.max(300, isResizingWindow.resizeStartWidth + deltaX);
            const newHeight = Math.max(300, isResizingWindow.resizeStartHeight + deltaY);

            isResizingWindow.element.style.width = newWidth + 'px';
            isResizingWindow.element.style.height = newHeight + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizingWindow) {
            log.event(`Finished resizing: ${isResizingWindow.appName}`);
            isResizingWindow = null;
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.5 WINDOW EVENT HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
function setupWindowEvents(windowEl, windowObj) {
    const titlebar = windowEl.querySelector('.window-titlebar');
    const closeBtn = windowEl.querySelector('.window-btn.close');
    const minimizeBtn = windowEl.querySelector('.window-btn.minimize');
    const maximizeBtn = windowEl.querySelector('.window-btn.maximize');
    const toggles = windowEl.querySelectorAll('.toggle-switch');

    // Drag window by title bar
    titlebar.addEventListener('mousedown', (e) => {
        // Don't drag if clicking on buttons
        if (e.target.closest('.window-controls')) return;

        log.event(`Dragging window: ${windowObj.appName}`);
        draggedWindow = windowObj;
        dragOffsetX = e.clientX - windowEl.offsetLeft;
        dragOffsetY = e.clientY - windowEl.offsetTop;
        bringToFront(windowEl);
        titlebar.style.cursor = 'grabbing';
        windowEl.style.opacity = '0.85';
    });

    document.addEventListener('mousemove', (e) => {
        if (draggedWindow) {
            const newX = e.clientX - dragOffsetX;
            const newY = e.clientY - dragOffsetY;
            draggedWindow.element.style.left = Math.max(0, newX) + 'px';
            draggedWindow.element.style.top = Math.max(0, newY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (draggedWindow) {
            draggedWindow.element.querySelector('.window-titlebar').style.cursor = 'move';
            draggedWindow.element.style.opacity = '1';
            log.event(`Stopped dragging: ${draggedWindow.appName}`);
        }
        draggedWindow = null;
    });

    // Close button - Close the application window
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        log.action(`Closing window: ${windowObj.appName}`);
        showNotification(`${windowObj.appName} closed`, 'info', 1500);
        windowEl.remove();
        windows = windows.filter(w => w !== windowObj);
        log.info(`✓ Window closed. Active windows: ${windows.length}`);
    });

    // Minimize button
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = windowEl.style.display === 'none';
        windowEl.style.display = isHidden ? 'flex' : 'none';
        log.event(`${isHidden ? 'Restoring' : 'Minimizing'} window: ${windowObj.appName}`);
    });

    // Maximize button
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (windowObj.isMaximized) {
            windowEl.style.width = windowObj.previousState.width + 'px';
            windowEl.style.height = windowObj.previousState.height + 'px';
            windowEl.style.left = windowObj.previousState.left + 'px';
            windowEl.style.top = windowObj.previousState.top + 'px';
            windowEl.style.borderRadius = '12px';
            windowObj.isMaximized = false;
            log.event(`Restored window: ${windowObj.appName}`);
        } else {
            windowObj.previousState = {
                width: windowEl.offsetWidth,
                height: windowEl.offsetHeight,
                left: windowEl.offsetLeft,
                top: windowEl.offsetTop
            };
            windowEl.style.width = '100vw';
            windowEl.style.height = 'calc(100vh - 60px)';
            windowEl.style.left = '0';
            windowEl.style.top = '0';
            windowEl.style.borderRadius = '0';
            windowObj.isMaximized = true;
            log.event(`Maximized window: ${windowObj.appName}`);
        }
    });

    // Toggle switches
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle.classList.toggle('active');
            const state = toggle.classList.contains('active') ? 'ON' : 'OFF';
            log.event(`Toggle switched: ${state}`);
        });
    });

    // Settings specific functionality
    if (windowObj.appName === 'settings') {
        const navItems = windowEl.querySelectorAll('.settings-nav-item');
        const categories = windowEl.querySelectorAll('.settings-category');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = item.dataset.category;

                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));

                // Add active class to clicked item
                item.classList.add('active');

                // Hide all categories
                categories.forEach(cat => cat.classList.add('hidden'));

                // Show selected category
                const selectedCategory = windowEl.querySelector(`#${category}-category`);
                if (selectedCategory) {
                    selectedCategory.classList.remove('hidden');
                    log.event(`Settings category opened: ${category}`);
                }
            });
        });

        log.event('Settings navigation initialized');
    }

    // Notepad specific functionality
    if (windowObj.appName === 'notepad') {
        const textarea = windowEl.querySelector('.notepad-textarea');
        const statusBar = windowEl.querySelector('.notepad-status');
        const menuButtons = windowEl.querySelectorAll('.notepad-menu');
        const dropdowns = windowEl.querySelectorAll('.notepad-dropdown');
        const menuItems = windowEl.querySelectorAll('.notepad-menu-item');

        if (textarea) {
            textarea.addEventListener('input', () => {
                updateNotepadStatus(textarea, statusBar);
            });

            textarea.addEventListener('click', () => {
                updateNotepadStatus(textarea, statusBar);
            });

            textarea.addEventListener('keyup', () => {
                updateNotepadStatus(textarea, statusBar);
            });

            textarea.focus();
            log.event('Notepad initialized with cursor tracking');
        }

        // Menu functionality
        menuButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const menuName = btn.dataset.menu;

                // Close other dropdowns
                dropdowns.forEach(dd => dd.classList.remove('active'));

                // Toggle current dropdown
                const dropdown = windowEl.querySelector(`.notepad-dropdown[data-menu="${menuName}"]`);
                if (dropdown) {
                    dropdown.classList.toggle('active');
                    log.event(`Notepad menu opened: ${menuName}`);
                }
            });
        });

        // Menu item clicks
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.textContent.trim();
                log.action(`Notepad menu action: ${action}`);

                // Close all dropdowns
                dropdowns.forEach(dd => dd.classList.remove('active'));

                // Handle specific actions
                switch (action) {
                    case 'New':
                        textarea.value = '';
                        updateNotepadStatus(textarea, statusBar);
                        textarea.focus();
                        break;
                    case 'Select All':
                        textarea.select();
                        break;
                    case 'Cut':
                        document.execCommand('cut');
                        break;
                    case 'Copy':
                        document.execCommand('copy');
                        break;
                    case 'Paste':
                        textarea.focus();
                        break;
                }
            });
        });

        // Close menu when clicking outside
        windowEl.addEventListener('click', (e) => {
            if (!e.target.closest('.notepad-menu') && !e.target.closest('.notepad-dropdown')) {
                dropdowns.forEach(dd => dd.classList.remove('active'));
            }
        });
    }

    // Click to bring to front
    windowEl.addEventListener('mousedown', () => {
        bringToFront(windowEl);
    });
}

// Bring window to front
function bringToFront(windowEl) {
    // Remove focused class from all windows
    windows.forEach(w => w.element.classList.remove('focused'));

    // Add focused class to current window
    windowEl.classList.add('focused');
    windowEl.style.zIndex = windowZIndex++;
    log.event('Window brought to front');

    // Add subtle animation when bringing to front
    windowEl.style.animation = 'none';
    setTimeout(() => {
        windowEl.style.animation = '';
    }, 10);
}

// Update Notepad status bar with cursor position
function updateNotepadStatus(textarea, statusBar) {
    const text = textarea.value;
    const selectionStart = textarea.selectionStart;

    // Calculate line number
    const lineNumber = text.substring(0, selectionStart).split('\n').length;

    // Calculate column number
    const lastNewlineIndex = text.lastIndexOf('\n', selectionStart - 1);
    const columnNumber = selectionStart - lastNewlineIndex;

    statusBar.textContent = `Line ${lineNumber}, Column ${columnNumber}`;
}

// Desktop icon clicks - Double-click to open apps
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const appName = icon.dataset.app;
        log.event(`Desktop icon double-clicked: ${appName}`);
        openApp(appName);
    });
});

// Taskbar app clicks - Click for quick access to apps
document.querySelectorAll('.taskbar-app').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const appName = btn.dataset.app;
        log.event(`Taskbar icon clicked: ${appName}`);
        openApp(appName);
    });
});

// Start menu toggle - Click App Launcher button to open Start Menu
const appLauncherBtn = document.getElementById('app-launcher-btn');
const startMenu = document.getElementById('start-menu');

appLauncherBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = startMenu.classList.contains('hidden');
    startMenu.classList.toggle('hidden');
    log.event(`Start Menu ${isHidden ? 'opened' : 'closed'}`);
});

// Start menu items - Click to launch apps from Start Menu
document.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const appName = item.dataset.app;
        log.event(`Start Menu item clicked: ${appName}`);
        openApp(appName);
    });
});

// Pinned apps in taskbar - Click to launch apps
document.querySelectorAll('.pinned-app').forEach(app => {
    app.addEventListener('click', (e) => {
        e.stopPropagation();
        const appName = app.dataset.app;
        log.event(`Pinned app clicked: ${appName}`);
        openApp(appName);
        // Close start menu if open
        startMenu.classList.add('hidden');
    });
});

// Taskbar search functionality
const taskbarSearchInput = document.getElementById('taskbar-search-input');
if (taskbarSearchInput) {
    taskbarSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = taskbarSearchInput.value.trim();
            log.event(`Taskbar search: ${query}`);
            showNotification(`Searching for: ${query}`, 'info', 2000);
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.6 BRING WINDOW TO FRONT
// ─────────────────────────────────────────────────────────────────────────────

// [Bring to front function defined in window events]

// ─────────────────────────────────────────────────────────────────────────────
// 7.7 DESKTOP INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// [Desktop interactions defined in event handlers section]

// ═══════════════════════════════════════════════════════════════════════════════
// 8. VS CODE EDITOR SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
// VS Code removed

function getWeatherInfo(temp) {
    if (temp > 30) return "Very Hot!";
    if (temp > 20) return "Perfect!";
    return "Cold!";
}



// ═══════════════════════════════════════════════════════════════════════════════
// 9. MODAL SYSTEM (DEVELOPER INFO)
// ═══════════════════════════════════════════════════════════════════════════════
const developerModal = document.getElementById('developerModal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const viewPortfolioBtn = document.getElementById('viewPortfolioBtn');

let modalRepeatTimer = null;
let isModalShowing = false;

function showDeveloperModal() {
    if (isModalShowing) return;

    developerModal.classList.add('show');
    isModalShowing = true;
    log.event('Developer modal displayed');
    showNotification('Check out our developer portfolio!', 'info', 2000);
}

function hideDeveloperModal() {
    developerModal.classList.remove('show');
    isModalShowing = false;
    log.event('Developer modal hidden');
}

function redirectToPortfolio() {
    log.event('Redirecting to portfolio...');
    showNotification('Opening portfolio page...', 'success', 1500);
    setTimeout(() => {
        window.location.href = 'Portfolio/Portfolio.html';
    }, 500);
}

// Modal button event listeners
modalCloseBtn.addEventListener('click', hideDeveloperModal);
cancelModalBtn.addEventListener('click', hideDeveloperModal);
modalBackdrop.addEventListener('click', hideDeveloperModal);
viewPortfolioBtn.addEventListener('click', redirectToPortfolio);

// Prevent modal close when clicking inside content
document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Show modal on page load (after 2 seconds)
window.addEventListener('load', () => {
    setTimeout(() => {
        showDeveloperModal();
    }, 2000);

    // Set up repeat timer (every 10 seconds)
    modalRepeatTimer = setInterval(() => {
        if (!isModalShowing) {
            showDeveloperModal();
        }
    }, 10000);
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalShowing) {
        hideDeveloperModal();
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. SEARCH & INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim().length > 0) {
            const searchQuery = searchInput.value.trim().toLowerCase();
            log.event(`Search query: ${searchQuery}`);

            // Check for portfolio-related keywords
            if (searchQuery.includes('portfolio') ||
                searchQuery.includes('developer') ||
                searchQuery.includes('sangeerth') ||
                searchQuery.includes('sangeerth bs')) {

                showNotification('Redirecting to portfolio...', 'success', 1500);
                setTimeout(() => {
                    window.location.href = 'Portfolio/Portfolio.html';
                }, 800);
            } else {
                // Regular search in new tab/window
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                window.open(googleSearchUrl, '_blank');
                showNotification(`Searching for: ${searchQuery}`, 'info', 2000);
                searchInput.value = '';
            }
        }
    });
}

// Enhanced 3D animations on desktop icons
const desktopIcons = document.querySelectorAll('.desktop-icon');
desktopIcons.forEach((icon, index) => {
    icon.addEventListener('mouseenter', () => {
        icon.style.animation = `pulse3D 0.6s ease-out 1`;
    });

    // Add occasional floating animation
    if (index % 2 === 0) {
        icon.classList.add('floating');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. FINAL EVENT LISTENERS & POLISH
// ═══════════════════════════════════════════════════════════════════════════════

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    if (!appLauncherBtn.contains(e.target) && !startMenu.contains(e.target)) {
        startMenu.classList.add('hidden');
        log.event('Start Menu closed (clicked outside)');
    }
});

// Prevent text selection on desktop
document.querySelector('.desktop').addEventListener('selectstart', (e) => {
    if (e.target.classList.contains('desktop-icon') || e.target.closest('.desktop-icon')) {
        e.preventDefault();
    }
});

// Double click desktop to deselect
document.querySelector('.desktop').addEventListener('dblclick', (e) => {
    if (e.target === document.querySelector('.desktop') || e.target === document.querySelector('.desktop-icons')) {
        // Do nothing or add background animation
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. RESPONSIVE BACKGROUND IMAGE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Setup responsive background image based on screen size
 * Phone screens: asset/wallpapersden.com_windows-11.jpg
 * Other screens: asset/wallpapersd.jpg
 */
function setupResponsiveBackground() {
    function updateBackgroundImage() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const bodyElement = document.body;

        // Determine which image to use based on screen width
        if (screenWidth <= 480) {
            // Phone screen - use phone-optimized image
            bodyElement.style.backgroundImage = "url('asset/wallpapersden.com_windows-11.jpg')";
            bodyElement.style.backgroundSize = '100% 100%';
            bodyElement.style.backgroundPosition = '0 0';
            bodyElement.style.backgroundRepeat = 'no-repeat';
            bodyElement.style.backgroundAttachment = 'scroll';
            log.info(`Background: Phone optimized image loaded (${screenWidth}x${screenHeight})`);
        } else {
            // Desktop, tablet, and larger screens
            bodyElement.style.backgroundImage = "url('asset/wallpapersd.jpg')";
            bodyElement.style.backgroundSize = 'cover';
            bodyElement.style.backgroundPosition = 'center';
            bodyElement.style.backgroundRepeat = 'no-repeat';
            bodyElement.style.backgroundAttachment = screenWidth <= 768 ? 'scroll' : 'fixed';
            log.info(`Background: Desktop image loaded (${screenWidth}x${screenHeight})`);
        }
    }

    // Initial setup
    updateBackgroundImage();

    // Update on window resize
    window.addEventListener('resize', updateBackgroundImage);
    window.addEventListener('orientationchange', updateBackgroundImage);

    log.info('Responsive background image system initialized');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. SYSTEM INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize all systems and start the application
 */
function initializeSystem() {
    log.info('Initializing all systems...');

    // Setup responsive background image
    setupResponsiveBackground();

    // Setup core systems
    setupStartMenuSearch();
    setupWidgetsPanel();


    // Update clock
    updateClock();
    setInterval(updateClock, 1000);

    // Show welcome message
    log.info('All systems initialized and ready');
    showNotification('Welcome to Windows 11', 'success', 3000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. START APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    initializeSystem();
}
