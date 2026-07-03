// Get DOM elements
const tempInput = document.getElementById('temp-input');
const convertBtn = document.getElementById('convert-btn');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const resultsContainer = document.getElementById('results');

// Result display
const celsiusValue = document.getElementById('celsius-value');
const fahrenheitValue = document.getElementById('fahrenheit-value');
const kelvinValue = document.getElementById('kelvin-value');

// Thermometer elements
const thermometerFill = document.getElementById('thermometer-fill');
const bulbFill = document.getElementById('bulb-fill');
const displayTemp = document.getElementById('display-temp');
const displayUnit = document.getElementById('display-unit');
const tempStatus = document.getElementById('temp-status');
const colorDot = document.querySelector('.dot');

// Get selected unit
function getSelectedUnit() {
    const selected = document.querySelector('input[name="unit"]:checked');
    return selected ? selected.value : 'celsius';
}

// Validate input
function validateInput(value) {
    if (value.trim() === '') {
        return { valid: false, message: 'Please enter a temperature value' };
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
        return { valid: false, message: 'Please enter a valid number' };
    }
    return { valid: true, value: num };
}

// Check absolute zero
function checkAbsoluteZero(value, unit) {
    const absZero = {
        celsius: -273.15,
        fahrenheit: -459.67,
        kelvin: 0
    };
    if (value < absZero[unit]) {
        return {
            violation: true,
            message: `⚠️ Below absolute zero! (${absZero[unit]}${unit === 'celsius' ? '°C' : unit === 'fahrenheit' ? '°F' : 'K'})`
        };
    }
    return { violation: false };
}

// Convert temperature
function convertTemperature(value, fromUnit) {
    let celsius, fahrenheit, kelvin;
    switch (fromUnit) {
        case 'celsius':
            celsius = value;
            fahrenheit = (value * 9 / 5) + 32;
            kelvin = value + 273.15;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5 / 9;
            fahrenheit = value;
            kelvin = (value - 32) * 5 / 9 + 273.15;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            fahrenheit = (value - 273.15) * 9 / 5 + 32;
            kelvin = value;
            break;
        default:
            return null;
    }
    return { celsius, fahrenheit, kelvin };
}

// Update thermometer visualization
function updateThermometer(celsius) {
    // Clamp between -50 and 100 for visualization
    const clamped = Math.max(-50, Math.min(100, celsius));
    const percentage = ((clamped + 50) / 150) * 100;
    
    thermometerFill.style.height = percentage + '%';
    
    // Color based on temperature
    let color;
    let status;
    if (celsius <= -10) {
        color = '#3b82f6'; // Cold - Blue
        status = '❄️ Freezing';
    } else if (celsius <= 10) {
        color = '#8b5cf6'; // Cool - Purple
        status = '🥶 Cold';
    } else if (celsius <= 25) {
        color = '#10b981'; // Mild - Green
        status = '🌤️ Pleasant';
    } else if (celsius <= 35) {
        color = '#f59e0b'; // Warm - Orange
        status = '🌞 Warm';
    } else {
        color = '#ef4444'; // Hot - Red
        status = '🔥 Hot!';
    }
    
    thermometerFill.style.background = `linear-gradient(to top, ${color}, ${color}dd)`;
    bulbFill.style.background = color;
    colorDot.style.background = color;
    tempStatus.textContent = status;
    
    // Update display temp
    displayTemp.textContent = celsius.toFixed(1);
}

// Display results
function displayResults(results, selectedUnit) {
    // Round to 2 decimals
    const c = results.celsius;
    const f = results.fahrenheit;
    const k = results.kelvin;
    
    celsiusValue.textContent = c.toFixed(2);
    fahrenheitValue.textContent = f.toFixed(2);
    kelvinValue.textContent = k.toFixed(2);
    
    // Update thermometer
    updateThermometer(c);
    
    // Set display unit
    const unitMap = { celsius: '°C', fahrenheit: '°F', kelvin: 'K' };
    displayUnit.textContent = unitMap[selectedUnit];
    
    // Show results
    resultsContainer.classList.add('visible');
    
    // Highlight active
    const resultItems = document.querySelectorAll('.result-item');
    resultItems.forEach(item => item.classList.remove('active'));
    
    const idMap = {
        celsius: 'result-celsius',
        fahrenheit: 'result-fahrenheit',
        kelvin: 'result-kelvin'
    };
    const activeResult = document.getElementById(idMap[selectedUnit]);
    if (activeResult) activeResult.classList.add('active');
}

// Show error
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('visible');
    tempInput.classList.add('error');
    resultsContainer.classList.remove('visible');
    displayTemp.textContent = '--';
    displayUnit.textContent = '°C';
    tempStatus.textContent = 'Invalid input';
    colorDot.style.background = '#ef4444';
    thermometerFill.style.height = '0%';
    bulbFill.style.background = '#ef4444';
}

// Hide error
function hideError() {
    errorMessage.classList.remove('visible');
    tempInput.classList.remove('error');
}

// Main convert function
function handleConversion() {
    const inputValue = tempInput.value;
    const selectedUnit = getSelectedUnit();
    
    const validation = validateInput(inputValue);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    hideError();
    
    const absCheck = checkAbsoluteZero(validation.value, selectedUnit);
    if (absCheck.violation) {
        showError(absCheck.message);
        return;
    }
    
    const results = convertTemperature(validation.value, selectedUnit);
    if (results) {
        displayResults(results, selectedUnit);
    }
}

// Event Listeners
convertBtn.addEventListener('click', handleConversion);

tempInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleConversion();
});

tempInput.addEventListener('input', () => {
    if (errorMessage.classList.contains('visible')) hideError();
    if (tempInput.value.trim() === '') {
        resultsContainer.classList.remove('visible');
        displayTemp.textContent = '--';
        displayUnit.textContent = '°C';
        tempStatus.textContent = 'Enter a temperature';
        colorDot.style.background = '#3b82f6';
        thermometerFill.style.height = '0%';
        bulbFill.style.background = '#3b82f6';
        document.querySelectorAll('.result-item').forEach(item => item.classList.remove('active'));
    }
});

// Auto-convert on unit change
document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if (tempInput.value.trim() !== '' && !errorMessage.classList.contains('visible')) {
            handleConversion();
        }
    });
});

// Initial focus
tempInput.focus();

console.log('🌡️ Temperature Converter Pro loaded!');