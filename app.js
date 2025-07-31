// Secure Password Generator Application
class PasswordGenerator {
    constructor() {
        this.init();
        this.bindEvents();
        this.initializeTheme();
        this.handleMethodChange();
    }

    init() {
        // Character sets based on provided data
        this.charSets = {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
            numbers: '0123456789',
            symbols: '!@%$&*()-_=+[]{};:,.?/<>'
        };

        // Word list for passphrases
        this.wordList = [
            'apple', 'brave', 'cloud', 'dance', 'eagle', 'flame', 'grace', 'heart',
            'ideal', 'jolly', 'kindle', 'light', 'magic', 'noble', 'ocean', 'peace',
            'quiet', 'rapid', 'swift', 'trust', 'unity', 'vivid', 'wonder', 'bright',
            'young', 'zesty', 'secure', 'random', 'strong', 'crypto', 'safety', 'private',
            'protect', 'access', 'digital', 'modern', 'quick', 'simple', 'smart', 'clean',
            'fresh', 'clear', 'sharp', 'mountain', 'forest', 'river', 'storm', 'sunset',
            'thunder', 'lightning', 'rainbow', 'journey', 'adventure', 'discovery', 'freedom'
        ];

        // Default settings from provided data
        this.defaultSettings = {
            length: 16,
            pin_length: 6,
            passphrase_words: 4,
            popup_width: 350,
            popup_height: 320
        };

        // Current password and popup reference
        this.currentPassword = '';
        this.popupWindow = null;

        // Get DOM elements
        this.elements = {
            passwordMethod: document.getElementById('password-method'),
            passwordLength: document.getElementById('password-length'),
            lengthValue: document.getElementById('length-value'),
            generateBtn: document.getElementById('generate-btn'),
            popupBtn: document.getElementById('popup-btn'),
            passwordOutput: document.getElementById('password-output'),
            passwordActions: document.getElementById('password-actions'),
            copyBtn: document.getElementById('copy-btn'),
            regenerateBtn: document.getElementById('regenerate-btn'),
            characterSets: document.getElementById('character-sets'),
            themeToggle: document.getElementById('theme-toggle'),
            toast: document.getElementById('toast'),
            popupContent: document.getElementById('popup-content'),
            checkboxes: {
                lowercase: document.getElementById('lowercase'),
                uppercase: document.getElementById('uppercase'),
                numbers: document.getElementById('numbers'),
                symbols: document.getElementById('symbols')
            }
        };

        console.log('Password generator initialized');
    }

    bindEvents() {
        // Password method change - using addEventListener instead of inline handlers
        if (this.elements.passwordMethod) {
            this.elements.passwordMethod.addEventListener('change', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleMethodChange();
            });
        }

        // Length slider
        if (this.elements.passwordLength) {
            this.elements.passwordLength.addEventListener('input', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.elements.lengthValue.textContent = e.target.value;
            });
        }

        // Generate button - ensure it's properly bound
        if (this.elements.generateBtn) {
            this.elements.generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.generatePassword();
            });
        }

        // Popup button - ensure it's properly bound
        if (this.elements.popupBtn) {
            this.elements.popupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openPopup();
            });
        }

        // Action buttons
        if (this.elements.copyBtn) {
            this.elements.copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.copyPassword(this.currentPassword);
            });
        }

        if (this.elements.regenerateBtn) {
            this.elements.regenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.generatePassword();
            });
        }

        // Theme toggle - ensure it's properly bound
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTheme();
            });
        }

        // Character set validation
        Object.values(this.elements.checkboxes).forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.validateCharacterSets(e);
                });
            }
        });

        console.log('Events bound successfully');
    }

    initializeTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDark ? 'dark' : 'light';
        this.setTheme(initialTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        const icon = this.elements.themeToggle?.querySelector('.theme-toggle__icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        this.currentTheme = theme;
        console.log('Theme set to:', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showToast(`Switched to ${newTheme} theme`, 'success');
    }

    handleMethodChange() {
        const method = this.elements.passwordMethod?.value || 'random';
        const characterSets = this.elements.characterSets;
        const lengthSlider = this.elements.passwordLength;

        console.log('Method changed to:', method);

        // Show/hide character sets based on method
        if (method === 'random') {
            if (characterSets) characterSets.style.display = 'block';
            if (lengthSlider) {
                lengthSlider.min = 4;
                lengthSlider.max = 128;
                lengthSlider.value = this.defaultSettings.length;
            }
        } else if (method === 'pin') {
            if (characterSets) characterSets.style.display = 'none';
            if (lengthSlider) {
                lengthSlider.min = 4;
                lengthSlider.max = 16;
                lengthSlider.value = this.defaultSettings.pin_length;
            }
        } else if (method === 'passphrase') {
            if (characterSets) characterSets.style.display = 'none';
            if (lengthSlider) {
                lengthSlider.min = 2;
                lengthSlider.max = 8;
                lengthSlider.value = this.defaultSettings.passphrase_words;
            }
        }

        if (this.elements.lengthValue && lengthSlider) {
            this.elements.lengthValue.textContent = lengthSlider.value;
        }
    }

    validateCharacterSets(event) {
        const checkedBoxes = Object.values(this.elements.checkboxes).filter(cb => cb && cb.checked);
        if (checkedBoxes.length === 0) {
            event.target.checked = true;
            this.showToast('At least one character set must be selected', 'error');
        }
    }

    // Cryptographically secure random number generation
    getSecureRandom(max) {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            return array[0] % max;
        } else {
            // Fallback for environments without crypto API
            return Math.floor(Math.random() * max);
        }
    }

    getRandomChar(str) {
        if (!str || str.length === 0) return '';
        return str[this.getSecureRandom(str.length)];
    }

    getRandomElement(arr) {
        if (!arr || arr.length === 0) return '';
        return arr[this.getSecureRandom(arr.length)];
    }

    // Build character set based on user selection
    buildCharacterSet() {
        let charSet = '';
        
        Object.entries(this.elements.checkboxes).forEach(([key, checkbox]) => {
            if (checkbox && checkbox.checked) {
                charSet += this.charSets[key];
            }
        });

        return charSet;
    }

    // Generate random password (equivalent to PHP random() method)
    generateRandomPassword(length) {
        const charSet = this.buildCharacterSet();
        if (!charSet) {
            this.showToast('Please select at least one character set', 'error');
            return '';
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += this.getRandomChar(charSet);
        }
        return password;
    }

    // Generate PIN (equivalent to PHP pin() method)
    generatePIN(length) {
        let pin = '';
        for (let i = 0; i < length; i++) {
            pin += this.getSecureRandom(10).toString();
        }
        return pin;
    }

    // Generate passphrase (equivalent to PHP passphrase() method)
    generatePassphrase(wordCount) {
        const words = [];
        const separators = ['-', '_', '.', ' '];
        const separator = this.getRandomElement(separators);

        for (let i = 0; i < wordCount; i++) {
            let word = this.getRandomElement(this.wordList);
            
            // Randomly capitalize first letter
            if (this.getSecureRandom(2) === 0) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            
            words.push(word);
        }

        let passphrase = words.join(separator);

        // Randomly add numbers
        if (this.getSecureRandom(2) === 0) {
            passphrase += this.getSecureRandom(100);
        }

        // Randomly add a symbol
        if (this.getSecureRandom(3) === 0) {
            passphrase += this.getRandomChar('!@#$%^&*');
        }

        return passphrase;
    }

    // Main password generation function
    generatePassword() {
        console.log('Generate password called');
        
        const method = this.elements.passwordMethod?.value || 'random';
        const length = parseInt(this.elements.passwordLength?.value || '16');

        // Show loading state
        if (this.elements.generateBtn) {
            this.elements.generateBtn.classList.add('loading');
            this.elements.generateBtn.textContent = 'Generating...';
            this.elements.generateBtn.disabled = true;
        }

        setTimeout(() => {
            try {
                let password = '';
                
                switch (method) {
                    case 'random':
                        password = this.generateRandomPassword(length);
                        break;
                    case 'pin':
                        password = this.generatePIN(length);
                        break;
                    case 'passphrase':
                        password = this.generatePassphrase(length);
                        break;
                    default:
                        password = this.generateRandomPassword(length);
                }

                if (password) {
                    this.currentPassword = password;
                    this.displayPassword(password);
                    this.showToast(`${method.toUpperCase()} password generated successfully!`, 'success');
                }
                
            } catch (error) {
                this.showToast('Error generating password', 'error');
                console.error('Password generation error:', error);
            } finally {
                if (this.elements.generateBtn) {
                    this.elements.generateBtn.classList.remove('loading');
                    this.elements.generateBtn.textContent = 'Generate Password';
                    this.elements.generateBtn.disabled = false;
                }
            }
        }, 100);
    }

    // Display generated password in main window
    displayPassword(password) {
        const output = this.elements.passwordOutput;
        const actions = this.elements.passwordActions;

        if (!password) {
            if (output) {
                output.innerHTML = `
                    <div class="password-placeholder">
                        <div class="password-placeholder__icon">🔑</div>
                        <p class="password-placeholder__text">
                            Click "Generate Password" to create secure passwords
                        </p>
                        <p class="password-placeholder__help">
                            Or use "Popup Mode" for a focused experience
                        </p>
                    </div>
                `;
            }
            if (actions) actions.style.display = 'none';
            return;
        }

        if (output) {
            output.innerHTML = `<div class="password-display">${password}</div>`;
        }
        if (actions) {
            actions.style.display = 'flex';
        }
    }

    // Open popup window
    openPopup() {
        console.log('Opening popup window');
        
        const popupFeatures = [
            `width=${this.defaultSettings.popup_width}`,
            `height=${this.defaultSettings.popup_height}`,
            `top=${Math.max(0, (screen.height - this.defaultSettings.popup_height) / 2)}`,
            `left=${Math.max(0, (screen.width - this.defaultSettings.popup_width) / 2)}`,
            'toolbar=no',
            'menubar=no',
            'scrollbars=no',
            'resizable=yes',
            'status=no',
            'location=no',
            'directories=no'
        ].join(',');

        // Create popup content HTML
        const popupHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Generator</title>
                <style>
                    ${this.getPopupCSS()}
                </style>
            </head>
            <body data-color-scheme="${this.currentTheme || 'light'}">
                <div class="popup-content">
                    <div class="popup-header">
                        <h2 class="popup-title">🔐 Password Generator</h2>
                    </div>
                    <div class="popup-body">
                        <div class="password-display-popup">
                            <div class="password-text" id="popup-password-text">Click Generate to create password</div>
                        </div>
                        <div class="popup-actions">
                            <button class="btn btn--primary btn--full-width" onclick="generatePassword()">
                                Generate Password
                            </button>
                            <div class="popup-button-row">
                                <button class="btn btn--outline" onclick="copyPassword()">
                                    📋 Copy
                                </button>
                                <button class="btn btn--secondary" onclick="generatePassword()">
                                    🔄 Regenerate
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="popup-footer">
                        <div class="popup-info" id="popup-info">Configure settings in main window, then generate here</div>
                    </div>
                </div>
                <script>
                    ${this.getPopupJS()}
                </script>
            </body>
            </html>
        `;

        try {
            // Close existing popup if it exists
            if (this.popupWindow && !this.popupWindow.closed) {
                this.popupWindow.close();
            }

            this.popupWindow = window.open('', 'passwordPopup', popupFeatures);
            
            if (this.popupWindow) {
                this.popupWindow.document.open();
                this.popupWindow.document.write(popupHTML);
                this.popupWindow.document.close();
                this.popupWindow.focus();
                
                // Keep reference and handle popup close
                this.popupWindow.addEventListener('beforeunload', () => {
                    this.popupWindow = null;
                });
                
                this.showToast('Popup window opened! Configure settings here, then generate in popup.', 'success');
            } else {
                this.showToast('Popup blocked! Please allow popups for this site.', 'error');
            }
        } catch (error) {
            console.error('Failed to open popup:', error);
            this.showToast('Failed to open popup window. Please check popup settings.', 'error');
        }
    }

    // Get CSS for popup window
    getPopupCSS() {
        return `
            :root {
                --color-primary: #21809d;
                --color-surface: #ffffff;
                --color-background: #fcfcf9;
                --color-text: #134252;
                --color-text-secondary: #626c71;
                --color-border: rgba(94, 82, 64, 0.2);
                --color-btn-primary-text: #fcfcf9;
                --color-bg-1: rgba(59, 130, 246, 0.08);
                --color-bg-2: rgba(245, 158, 11, 0.08);
                --color-bg-3: rgba(34, 197, 94, 0.08);
                --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                --font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                --radius-base: 8px;
                --radius-lg: 12px;
                --space-8: 8px;
                --space-12: 12px;
                --space-16: 16px;
                --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
            }

            [data-color-scheme="dark"] {
                --color-primary: #32b8c6;
                --color-surface: #262828;
                --color-background: #1f2121;
                --color-text: #f5f5f5;
                --color-text-secondary: rgba(167, 169, 169, 0.7);
                --color-border: rgba(119, 124, 124, 0.3);
                --color-btn-primary-text: #134252;
                --color-bg-1: rgba(29, 78, 216, 0.15);
                --color-bg-2: rgba(180, 83, 9, 0.15);
                --color-bg-3: rgba(21, 128, 61, 0.15);
            }

            * { box-sizing: border-box; }
            body {
                margin: 0;
                padding: 0;
                font-family: var(--font-family-base);
                background: var(--color-background);
                color: var(--color-text);
                overflow: hidden;
            }

            .popup-content {
                height: 100vh;
                display: flex;
                flex-direction: column;
                background: var(--color-surface);
            }

            .popup-header {
                background: var(--color-bg-1);
                padding: var(--space-12) var(--space-16);
                border-bottom: 1px solid var(--color-border);
            }

            .popup-title {
                margin: 0;
                text-align: center;
                font-size: 16px;
                font-weight: 550;
            }

            .popup-body {
                flex: 1;
                padding: var(--space-16);
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: var(--space-16);
            }

            .password-display-popup {
                background: var(--color-bg-2);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-base);
                padding: var(--space-16);
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            .password-text {
                font-family: var(--font-family-mono);
                font-size: 14px;
                word-break: break-all;
                line-height: 1.4;
            }

            .popup-actions {
                display: flex;
                flex-direction: column;
                gap: var(--space-8);
            }

            .popup-button-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-8);
            }

            .popup-footer {
                background: var(--color-bg-3);
                padding: var(--space-8) var(--space-16);
                border-top: 1px solid var(--color-border);
            }

            .popup-info {
                font-size: 11px;
                color: var(--color-text-secondary);
                text-align: center;
            }

            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: var(--space-8) var(--space-16);
                border-radius: var(--radius-base);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                border: none;
                text-decoration: none;
                transition: all 0.2s ease;
            }

            .btn--primary {
                background: var(--color-primary);
                color: var(--color-btn-primary-text);
            }

            .btn--primary:hover {
                opacity: 0.9;
            }

            .btn--outline {
                background: transparent;
                border: 1px solid var(--color-border);
                color: var(--color-text);
            }

            .btn--outline:hover {
                background: var(--color-bg-1);
            }

            .btn--secondary {
                background: var(--color-bg-2);
                color: var(--color-text);
            }

            .btn--secondary:hover {
                opacity: 0.9;
            }

            .btn--full-width {
                width: 100%;
            }
        `;
    }

    // Get JavaScript for popup window
    getPopupJS() {
        return `
            function generatePassword() {
                try {
                    if (!window.opener || !window.opener.passwordGen) {
                        document.getElementById('popup-info').textContent = 'Connection to main window lost. Please reopen popup.';
                        return;
                    }

                    const method = window.opener.passwordGen.elements.passwordMethod.value;
                    const length = parseInt(window.opener.passwordGen.elements.passwordLength.value);
                    
                    let password = '';
                    
                    switch (method) {
                        case 'random':
                            password = window.opener.passwordGen.generateRandomPassword(length);
                            break;
                        case 'pin':
                            password = window.opener.passwordGen.generatePIN(length);
                            break;
                        case 'passphrase':
                            password = window.opener.passwordGen.generatePassphrase(length);
                            break;
                        default:
                            password = window.opener.passwordGen.generateRandomPassword(length);
                    }

                    if (password) {
                        document.getElementById('popup-password-text').textContent = password;
                        document.getElementById('popup-info').textContent = 
                            method.toUpperCase() + ' • Length: ' + password.length + ' • Click copy to use';
                    }
                } catch (error) {
                    console.error('Error generating password:', error);
                    document.getElementById('popup-info').textContent = 'Error generating password. Please try again.';
                }
            }
            
            function copyPassword() {
                const passwordText = document.getElementById('popup-password-text').textContent;
                if (passwordText && passwordText !== 'Click Generate to create password') {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(passwordText).then(() => {
                            document.getElementById('popup-info').textContent = 'Password copied to clipboard!';
                            setTimeout(() => {
                                document.getElementById('popup-info').textContent = 
                                    'Configure settings in main window, then generate here';
                            }, 2000);
                        }).catch(() => {
                            fallbackCopy(passwordText);
                        });
                    } else {
                        fallbackCopy(passwordText);
                    }
                } else {
                    document.getElementById('popup-info').textContent = 'No password to copy. Generate one first.';
                }
            }

            function fallbackCopy(text) {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    document.getElementById('popup-info').textContent = 'Password copied to clipboard!';
                } catch (err) {
                    document.getElementById('popup-info').textContent = 'Failed to copy password.';
                }
                document.body.removeChild(textArea);
            }
        `;
    }

    // Copy password to clipboard
    copyPassword(password) {
        if (!password) {
            this.showToast('No password to copy', 'error');
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(password).then(() => {
                this.showToast('Password copied to clipboard', 'success');
            }).catch(() => {
                this.fallbackCopyTextToClipboard(password);
            });
        } else {
            this.fallbackCopyTextToClipboard(password);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Password copied to clipboard', 'success');
        } catch (err) {
            this.showToast('Failed to copy password', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Show toast notifications
    showToast(message, type = 'success') {
        const toast = this.elements.toast;
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast toast--${type}`;
        toast.classList.add('toast--show');

        setTimeout(() => {
            toast.classList.remove('toast--show');
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Secure Password Generator...');
    window.passwordGen = new PasswordGenerator();
});

// Security: Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    if (window.passwordGen) {
        window.passwordGen.currentPassword = '';
    }
});

// Handle page visibility for security
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.passwordGen) {
        // Optional: Clear password when page becomes hidden
        setTimeout(() => {
            if (document.hidden && window.passwordGen) {
                window.passwordGen.currentPassword = '';
                window.passwordGen.displayPassword('');
            }
        }, 300000); // Clear after 5 minutes of being hidden
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordGenerator;
}
