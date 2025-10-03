// ROI Calculator Logic
// Based on industry benchmarks and typical scenario assumptions

class ROICalculator {
    constructor() {
        this.inputs = {
            employees: 500,
            avgSalary: 82160,
            turnoverRate: 10.1,
            managers: 50,
            avgManagerSalary: 85280,
            absenteeismRate: 2.2
        };
        
        // Industry benchmark constants
        this.constants = {
            participationRate: 0.40, // 40% program participation rate
            turnoverReplacementCost: 0.50, // 50% of salary
            absenteeismDisruptionFactor: 1.3, // Disruption factor
            gstRate: 0.10, // 10% GST
            programBaseCost: 250000, // Base program cost before GST
            managerTimePerEmployee: 2, // Hours per employee per year
            productivityImprovementRate: 0.05 // 5% productivity improvement
        };
        
        this.initializeEventListeners();
        this.calculate();
    }
    
    initializeEventListeners() {
        // Add event listeners to all input fields
        const inputs = ['employees', 'avgSalary', 'turnoverRate', 'managers', 'avgManagerSalary', 'absenteeismRate'];
        
        inputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.updateInput(inputId, e.target.value);
                });
                element.addEventListener('blur', (e) => {
                    this.formatInput(inputId, e.target);
                });
            }
        });
    }
    
    updateInput(inputId, value) {
        // Parse numeric value, handling commas and dollar signs
        const numericValue = parseFloat(value.replace(/[$,%]/g, '')) || 0;
        this.inputs[inputId] = numericValue;
        this.calculate();
    }
    
    formatInput(inputId, element) {
        // Format input values for display
        const value = this.inputs[inputId];
        
        if (inputId === 'avgSalary' || inputId === 'avgManagerSalary') {
            element.value = this.formatNumber(value, 0);
        } else if (inputId === 'turnoverRate' || inputId === 'absenteeismRate') {
            element.value = value.toFixed(1);
        } else {
            element.value = Math.round(value).toString();
        }
    }
    
    // Calculate turnover savings
    calculateTurnoverSavings() {
        const { employees, avgSalary, turnoverRate } = this.inputs;
        const { participationRate, turnoverReplacementCost } = this.constants;
        
        // Annual turnover without program
        const annualTurnover = employees * (turnoverRate / 100);
        
        // Turnover reduction from program (assuming 30% reduction for participants)
        const turnoverReduction = annualTurnover * participationRate * 0.30;
        
        // Cost savings from reduced turnover
        const turnoverSavings = turnoverReduction * avgSalary * turnoverReplacementCost;
        
        return Math.round(turnoverSavings);
    }
    
    // Calculate absenteeism savings
    calculateAbsenteeismSavings() {
        const { employees, avgSalary, absenteeismRate } = this.inputs;
        const { participationRate, absenteeismDisruptionFactor } = this.constants;
        
        // Annual absenteeism days without program
        const annualAbsenteeismDays = employees * (absenteeismRate / 100) * 250; // 250 working days
        
        // Absenteeism reduction from program (assuming 25% reduction for participants)
        const absenteeismReduction = annualAbsenteeismDays * participationRate * 0.25;
        
        // Cost savings from reduced absenteeism (daily salary + disruption factor)
        const dailySalary = avgSalary / 250;
        const absenteeismSavings = absenteeismReduction * dailySalary * absenteeismDisruptionFactor;
        
        return Math.round(absenteeismSavings);
    }
    
    // Calculate manager time savings
    calculateManagerTimeSavings() {
        const { employees, avgManagerSalary } = this.inputs;
        const { participationRate, managerTimePerEmployee } = this.constants;
        
        // Time saved per year (hours) from reduced financial stress issues
        const timeSavedHours = employees * participationRate * managerTimePerEmployee * 0.40; // 40% reduction
        
        // Hourly manager rate (assuming 2000 working hours per year)
        const hourlyRate = avgManagerSalary / 2000;
        
        // Manager time savings
        const managerTimeSavings = timeSavedHours * hourlyRate;
        
        return Math.round(managerTimeSavings);
    }
    
    // Calculate productivity gains
    calculateProductivityGains() {
        const { employees, avgSalary } = this.inputs;
        const { participationRate, productivityImprovementRate } = this.constants;
        
        // Productivity gains from reduced financial stress
        const productivityGains = employees * participationRate * avgSalary * productivityImprovementRate;
        
        return Math.round(productivityGains);
    }
    
    // Calculate program cost
    calculateProgramCost() {
        const { employees } = this.inputs;
        const { gstRate } = this.constants;
        
        // Base cost calculation (simplified - could be more complex based on employee tiers)
        const baseCost = Math.max(250000, employees * 500); // Minimum $250k or $500 per employee
        const programCost = baseCost * (1 + gstRate);
        
        return Math.round(programCost);
    }
    
    // Main calculation method
    calculate() {
        const turnoverSavings = this.calculateTurnoverSavings();
        const absenteeismSavings = this.calculateAbsenteeismSavings();
        const managerTimeSavings = this.calculateManagerTimeSavings();
        const productivityGains = this.calculateProductivityGains();
        const programCost = this.calculateProgramCost();
        
        const totalReturn = turnoverSavings + absenteeismSavings + managerTimeSavings + productivityGains;
        const netBenefit = totalReturn - programCost;
        const roiPercent = programCost > 0 ? Math.round((netBenefit / programCost) * 100) : 0;
        
        // Update display
        this.updateDisplay({
            totalReturn,
            turnoverSavings,
            absenteeismSavings,
            managerTimeSavings,
            productivityGains,
            programCost,
            netBenefit,
            roiPercent
        });
    }
    
    // Update display elements
    updateDisplay(results) {
        const elements = {
            totalReturn: document.getElementById('totalReturn'),
            turnoverSavings: document.getElementById('turnoverSavings'),
            absenteeismSavings: document.getElementById('absenteeismSavings'),
            managerTimeSaved: document.getElementById('managerTimeSaved'),
            productivityGains: document.getElementById('productivityGains'),
            programCost: document.getElementById('programCost'),
            netBenefit: document.getElementById('netBenefit'),
            roiPercent: document.getElementById('roiPercent')
        };
        
        // Update monetary values
        if (elements.totalReturn) elements.totalReturn.textContent = this.formatCurrency(results.totalReturn);
        if (elements.turnoverSavings) elements.turnoverSavings.textContent = this.formatCurrency(results.turnoverSavings);
        if (elements.absenteeismSavings) elements.absenteeismSavings.textContent = this.formatCurrency(results.absenteeismSavings);
        if (elements.managerTimeSaved) elements.managerTimeSaved.textContent = this.formatCurrency(results.managerTimeSavings);
        if (elements.productivityGains) elements.productivityGains.textContent = this.formatCurrency(results.productivityGains);
        if (elements.programCost) elements.programCost.textContent = this.formatCurrency(results.programCost);
        if (elements.netBenefit) elements.netBenefit.textContent = this.formatCurrency(results.netBenefit);
        if (elements.roiPercent) elements.roiPercent.textContent = results.roiPercent + '%';
    }
    
    // Format currency with Australian formatting
    formatCurrency(amount) {
        return '$' + this.formatNumber(amount, 0);
    }
    
    // Format number with thousands separators (Australian style)
    formatNumber(number, decimals = 0) {
        return number.toLocaleString('en-AU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ROICalculator();
    
    // Add download button functionality (placeholder)
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('PDF download functionality would be implemented here');
        });
    }
});

// Add input formatting for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Format salary inputs as user types
    const salaryInputs = ['avgSalary', 'avgManagerSalary'];
    salaryInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value) {
                    // Add thousands separators as user types
                    value = parseInt(value).toLocaleString('en-AU');
                    e.target.value = value;
                }
            });
        }
    });
    
    // Format percentage inputs
    const percentInputs = ['turnoverRate', 'absenteeismRate'];
    percentInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^0-9.]/g, '');
                // Limit to one decimal place
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts[1];
                }
                if (parts[1] && parts[1].length > 1) {
                    value = parts[0] + '.' + parts[1].substring(0, 1);
                }
                e.target.value = value;
            });
        }
    });
});
