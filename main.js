class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForNewInput = false;
        this.justCalculated = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Button click events
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
                this.addPressEffect(e.target);
            });
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Prevent context menu on buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });
    }
    
    addPressEffect(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }
    
    handleButtonClick(button) {
        const action = button.dataset.action;
        const number = button.dataset.number;
        const operator = button.dataset.operator;
        
        if (number !== undefined) {
            this.inputNumber(number);
        } else if (operator) {
            this.inputOperator(operator);
        } else if (action) {
            this.handleAction(action);
        }
    }
    
    handleKeyPress(e) {
        e.preventDefault();
        
        const key = e.key;
        
        // Numbers
        if (/^[0-9]$/.test(key)) {
            this.inputNumber(key);
            this.highlightButton(`[data-number="${key}"]`);
        }
        // Operators
        else if (key === '+') {
            this.inputOperator('+');
            this.highlightButton('[data-operator="+"]');
        }
        else if (key === '-') {
            this.inputOperator('-');
            this.highlightButton('[data-operator="-"]');
        }
        else if (key === '*') {
            this.inputOperator('*');
            this.highlightButton('[data-operator="*"]');
        }
        else if (key === '/') {
            this.inputOperator('/');
            this.highlightButton('[data-operator="/"]');
        }
        // Actions
        else if (key === 'Enter' || key === '=') {
            this.handleAction('equals');
            this.highlightButton('[data-action="equals"]');
        }
        else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.handleAction('clear');
            this.highlightButton('[data-action="clear"]');
        }
        else if (key === 'Backspace') {
            this.handleAction('delete');
            this.highlightButton('[data-action="delete"]');
        }
        else if (key === '.' || key === ',') {
            this.handleAction('decimal');
            this.highlightButton('[data-action="decimal"]');
        }
    }
    
    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            this.addPressEffect(button);
        }
    }
    
    inputNumber(num) {
        if (this.waitingForNewInput || this.justCalculated) {
            this.currentInput = num;
            this.waitingForNewInput = false;
            this.justCalculated = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        
        this.updateDisplay();
        this.clearError();
    }
    
    inputOperator(op) {
        if (this.operator && !this.waitingForNewInput) {
            this.calculate();
        }
        
        this.previousInput = this.currentInput;
        this.operator = op;
        this.waitingForNewInput = true;
        this.justCalculated = false;
        
        this.updateOperatorButtons(op);
        this.clearError();
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.calculate();
                break;
        }
        
        this.clearError();
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForNewInput = false;
        this.justCalculated = false;
        this.updateDisplay();
        this.updateOperatorButtons();
    }
    
    delete() {
        if (this.justCalculated) {
            this.clear();
            return;
        }
        
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForNewInput || this.justCalculated) {
            this.currentInput = '0.';
            this.waitingForNewInput = false;
            this.justCalculated = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }
    
    calculate() {
        if (!this.operator || this.waitingForNewInput) {
            return;
        }
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) {
            this.showError('Invalid input');
            return;
        }
        
        let result;
        
        try {
            switch (this.operator) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) {
                        this.showError('Cannot divide by zero');
                        return;
                    }
                    result = prev / current;
                    break;
                default:
                    return;
            }
            
            // Handle floating point precision issues
            if (Number.isFinite(result)) {
                // Round to 10 decimal places to avoid floating point errors
                result = Math.round(result * 10000000000) / 10000000000;
                
                // Format the result
                if (Math.abs(result) > 999999999999 || (Math.abs(result) < 0.000000001 && result !== 0)) {
                    result = result.toExponential(6);
                } else {
                    result = result.toString();
                }
                
                this.currentInput = result;
                this.previousInput = '';
                this.operator = null;
                this.waitingForNewInput = false;
                this.justCalculated = true;
                
                this.updateDisplay();
                this.updateOperatorButtons();
            } else {
                this.showError('Result is too large');
            }
        } catch (error) {
            this.showError('Calculation error');
        }
    }
    
    updateDisplay() {
        // Limit display length
        let displayValue = this.currentInput;
        if (displayValue.length > 12) {
            displayValue = parseFloat(displayValue).toExponential(6);
        }
        
        this.display.value = displayValue;
    }
    
    updateOperatorButtons(activeOperator = null) {
        document.querySelectorAll('.btn.operator').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (activeOperator) {
            const activeBtn = document.querySelector(`[data-operator="${activeOperator}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
    }
    
    showError(message) {
        this.display.classList.add('error');
        this.display.value = 'Error';
        
        setTimeout(() => {
            this.clear();
        }, 1500);
    }
    
    clearError() {
        this.display.classList.remove('error');
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any animations or intervals if needed
    } else {
        // Resume operations if needed
    }
});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});
