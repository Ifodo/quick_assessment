// Mobile Navigation
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Checklist functionality
class ChecklistManager {
    constructor() {
        this.checklist = JSON.parse(localStorage.getItem('buyerChecklist')) || {};
    }

    toggleItem(category, itemId) {
        if (!this.checklist[category]) {
            this.checklist[category] = {};
        }
        this.checklist[category][itemId] = !this.checklist[category][itemId];
        this.saveToStorage();
        this.updateProgress();
    }

    saveToStorage() {
        localStorage.setItem('buyerChecklist', JSON.stringify(this.checklist));
    }

    updateProgress() {
        const categories = document.querySelectorAll('.checklist-category');
        categories.forEach(category => {
            const items = category.querySelectorAll('.checklist-item');
            const checked = category.querySelectorAll('.checklist-item input:checked').length;
            const progress = (checked / items.length) * 100;
            
            const progressBar = category.querySelector('.progress-bar-fill');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        });
    }
}

// Budget Calculator v2 (NGN only)
(function(){
    function fmt(amount){ return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0); }

    function calc(){
        const price = Math.max(0, parseFloat(document.getElementById('property-price')?.value) || 0);
        const downPct = Math.max(0, Math.min(100, parseFloat(document.getElementById('down-percent')?.value) || 0));
        const apr = Math.max(0, parseFloat(document.getElementById('interest-rate')?.value) || 0) / 100;
        const years = Math.max(1, parseInt(document.getElementById('loan-tenor')?.value, 10) || 1);

        // Fees (indicative typicals)
        const legal = price * 0.05;
        const agent = price * 0.03;
        const stamp = price * 0.015;
        const survey = Math.min(Math.max(price * 0.005, 300000), 1500000);
        const registration = price * 0.01;

        const totalCost = price + legal + agent + stamp + survey + registration;

        const down = price * (downPct / 100);
        const loan = Math.max(0, price - down);

        // Mortgage monthly
        const r = apr / 12; const n = years * 12;
        const monthly = (apr === 0) ? (loan / n) : (loan * r) / (1 - Math.pow(1 + r, -n));

        const upfront = down + legal + agent + stamp + survey + registration;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('down-payment', fmt(down));
        set('loan-amount', fmt(loan));
        set('monthly-payment', fmt(monthly));
        set('legal-fees', fmt(legal));
        set('agent-fees', fmt(agent));
        set('stamp-duty', fmt(stamp));
        set('survey-fees', fmt(survey));
        set('registration-fees', fmt(registration));
        set('upfront-total', fmt(upfront));
        set('total-cost', fmt(totalCost));
    }

    function init(){
        const ids = ['property-price','down-percent','interest-rate','loan-tenor'];
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', calc); });
        calc();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Update highlight cards for calculator
(function(){
    // Extend sync to observe metric-cards container
    const sync = () => {
        const m = document.getElementById('monthly-payment')?.textContent || '₦0';
        const u = document.getElementById('upfront-total')?.textContent || '₦0';
        const mh = document.getElementById('monthly-highlight');
        const uh = document.getElementById('upfront-highlight');
        if (mh) mh.textContent = m; if (uh) uh.textContent = u;
    };
    const obs = new MutationObserver(sync);
    document.addEventListener('DOMContentLoaded', () => {
        const box1 = document.querySelector('#calculator .metric-cards');
        const box2 = document.querySelector('#calculator .calculator-results');
        if (box1) obs.observe(box1, { subtree: true, childList: true, characterData: true });
        if (box2) obs.observe(box2, { subtree: true, childList: true, characterData: true });
        sync();
    });
})();

// Location Insights
class LocationInsights {
    constructor() {
        this.locationSelect = document.getElementById('location-select');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.locationSelect.addEventListener('change', (e) => this.updateLocationInfo(e.target.value));
    }

    updateLocationInfo(location) {
        const locationData = {
            lekki: {
                safety: 'High',
                infrastructure: 'Modern',
                transport: 'Moderate',
                amenities: 'Excellent',
                description: 'Modern estates, gated communities, occasional traffic.'
            },
            ikeja: {
                safety: 'High',
                infrastructure: 'Good',
                transport: 'Excellent',
                amenities: 'Good',
                description: 'Commercial hub, great infrastructure, near airport.'
            },
            yaba: {
                safety: 'Moderate',
                infrastructure: 'Good',
                transport: 'Good',
                amenities: 'Good',
                description: 'Youthful, tech-focused, good transport.'
            }
        };

        const data = locationData[location];
        if (!data) return;

        Object.keys(data).forEach(key => {
            const element = document.getElementById(`location-${key}`);
            if (element) element.textContent = data[key];
        });
    }
}

// Extend location data for more areas with AI-style generation
(function(){
    const original = LocationInsights.prototype.updateLocationInfo;
    const STARS = (score) => '★★★★★☆☆☆☆☆'.slice(5 - score, 10 - score); // render 1–5 stars visually

    function aiSynthesize(location, spec){
        // Compose richer, human-like strings from numeric ratings and traits
        const safetyTxt = `${spec.safetyScore}/5 ${STARS(spec.safetyScore)} – ${spec.safetyNote}`;
        const infraTxt = `${spec.infraScore}/5 – ${spec.infraNote}`;
        const transportTxt = `${spec.transportScore}/5 – ${spec.transportNote}`;
        const amenitiesTxt = `${spec.amenitiesScore}/5 – ${spec.amenitiesNote}`;
        const overviewTxt = spec.overview || `A popular area with ${spec.safetyNote.toLowerCase()} and ${spec.infraNote.toLowerCase()}. ${spec.extra || ''}`;
        return { safetyTxt, infraTxt, transportTxt, amenitiesTxt, overviewTxt };
    }

    LocationInsights.prototype.updateLocationInfo = function(location){
        const extended = {
            lekki: { safetyScore: 4, infraScore: 4, transportScore: 3, amenitiesScore: 5,
                safetyNote: 'Estate security and private patrols are common',
                infraNote: 'modern estates, decent drainage; some pockets still developing',
                transportNote: 'good arterial roads but peak-hour congestion',
                amenitiesNote: 'beaches, malls, schools, healthcare close by',
                overview: 'Lekki/Ajah blends coastal living with modern estates; great lifestyle, but plan around rush-hour traffic.' },
            ikeja: { safetyScore: 4, infraScore: 4, transportScore: 5, amenitiesScore: 4,
                safetyNote: 'well-policed commercial zones',
                infraNote: 'strong road network and services near the airport',
                transportNote: 'excellent access via major roads and local transit',
                amenitiesNote: 'malls, offices, hotels, hospitals within minutes',
                overview: 'Ikeja is a vibrant commercial hub with reliable infrastructure and excellent connectivity.' },
            yaba: { safetyScore: 3, infraScore: 4, transportScore: 4, amenitiesScore: 4,
                safetyNote: 'mixed residential/commercial; generally moderate risk',
                infraNote: 'improving roads and services around tech corridors',
                transportNote: 'good BRT and main-road access',
                amenitiesNote: 'universities, hubs, eateries, clinics',
                overview: 'Yaba offers a youthful tech vibe with improving infrastructure and solid transport links.' },
            maitama: { safetyScore: 5, infraScore: 5, transportScore: 4, amenitiesScore: 5,
                safetyNote: 'diplomatic enclave with high-grade security',
                infraNote: 'top-tier roads, utilities, and urban services',
                transportNote: 'good access; light congestion by comparison',
                amenitiesNote: 'premium restaurants, embassies, parks',
                overview: 'Maitama is exclusive and secure with premium services and serene ambience.' },
            asokoro: { safetyScore: 5, infraScore: 5, transportScore: 4, amenitiesScore: 5,
                safetyNote: 'high-security government/official residences',
                infraNote: 'excellent roads and utilities',
                transportNote: 'reliable access; low noise',
                amenitiesNote: 'embassies, parks, upscale services',
                overview: 'Asokoro is pristine and secure, ideal for tranquil premium living.' },
            gwarinpa: { safetyScore: 4, infraScore: 4, transportScore: 4, amenitiesScore: 4,
                safetyNote: 'generally safe estates; vary by cluster',
                infraNote: 'extensive estate planning; services fairly reliable',
                transportNote: 'good internal and connecting roads',
                amenitiesNote: 'neighborhood malls, schools, clinics',
                overview: 'Gwarinpa offers diverse housing in a large, well-planned estate environment.' },
            wuse: { safetyScore: 4, infraScore: 5, transportScore: 5, amenitiesScore: 5,
                safetyNote: 'central district with active security presence',
                infraNote: 'excellent roads, lighting, utilities',
                transportNote: 'superb connectivity to all parts of Abuja',
                amenitiesNote: 'top retail, offices, healthcare',
                overview: 'Wuse balances residential comfort with central accessibility and amenities.' },
            ph_gra: { safetyScore: 4, infraScore: 4, transportScore: 4, amenitiesScore: 4,
                safetyNote: 'upscale with estates and private security',
                infraNote: 'good roads and services in most parts',
                transportNote: 'solid access to business areas',
                amenitiesNote: 'restaurants, lounges, clinics',
                overview: 'Port Harcourt GRA is quiet and upscale with convenient access to services.' },
            trans_amadi: { safetyScore: 3, infraScore: 4, transportScore: 4, amenitiesScore: 4,
                safetyNote: 'mixed commercial/industrial; varies by street',
                infraNote: 'good road links to industrial zones',
                transportNote: 'reliable access to city nodes',
                amenitiesNote: 'essential services nearby',
                overview: 'Trans-Amadi is practical for work access with improving liveability around key roads.' }
        };

        const spec = extended[location];
        if (spec){
            const ai = aiSynthesize(location, spec);
            const map = {
                safety: ai.safetyTxt,
                infrastructure: ai.infraTxt,
                transport: ai.transportTxt,
                amenities: ai.amenitiesTxt,
                description: ai.overviewTxt
            };
            Object.keys(map).forEach(k => {
                const el = document.getElementById(`location-${k}`);
                if (el) el.textContent = map[k];
            });
            return;
        }
        return original.call(this, location);
    };
})();

// Financial Assessment
class FinancialAssessment {
    constructor() {
        this.form = document.getElementById('financial-assessment-form');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('input', () => this.calculateAssessment());
    }

    calculateAssessment() {
        const values = {
            monthlyIncome: parseFloat(document.getElementById('monthly-income').value) || 0,
            additionalIncome: parseFloat(document.getElementById('additional-income').value) || 0,
            currentRent: parseFloat(document.getElementById('current-rent').value) || 0,
            utilities: parseFloat(document.getElementById('utilities').value) || 0,
            otherExpenses: parseFloat(document.getElementById('other-expenses').value) || 0,
            currentSavings: parseFloat(document.getElementById('current-savings').value) || 0,
            monthlySavings: parseFloat(document.getElementById('monthly-savings').value) || 0,
            targetPrice: parseFloat(document.getElementById('target-price').value) || 0
        };

        // Calculate total monthly income and expenses
        const totalIncome = values.monthlyIncome + values.additionalIncome;
        const totalExpenses = values.currentRent + values.utilities + values.otherExpenses;
        const disposableIncome = totalIncome - totalExpenses;

        // Calculate payment capacity (using 33% rule)
        const maxMonthlyPayment = totalIncome * 0.33;
        const paymentCapacity = this.formatCurrency(maxMonthlyPayment);
        document.getElementById('payment-capacity').textContent = paymentCapacity;

        // Calculate down payment status (assuming 20% down payment needed)
        const requiredDownPayment = values.targetPrice * 0.2;
        const downPaymentPercentage = (values.currentSavings / requiredDownPayment) * 100;
        const cappedPercentage = Math.min(downPaymentPercentage, 100);
        
        document.getElementById('down-payment-progress').style.background = 
            `conic-gradient(var(--color-primary) ${cappedPercentage}%, var(--color-border) 0)`;
        document.getElementById('down-payment-progress').querySelector('.progress-text').textContent = 
            `${Math.round(cappedPercentage)}%`;

        // Calculate time to goal
        const remainingDownPayment = Math.max(requiredDownPayment - values.currentSavings, 0);
        const monthsToGoal = values.monthlySavings > 0 ? 
            Math.ceil(remainingDownPayment / values.monthlySavings) : Infinity;

        const timeToGoal = this.formatTimeToGoal(monthsToGoal);
        document.getElementById('time-to-goal').textContent = timeToGoal;

        // Update capacity indicator
        const capacityPercentage = (disposableIncome / maxMonthlyPayment) * 100;
        document.getElementById('capacity-indicator').style.width = `${Math.min(capacityPercentage, 100)}%`;

        // Generate recommendations and action plan
        this.updateRecommendations({
            disposableIncome,
            maxMonthlyPayment,
            downPaymentPercentage,
            monthsToGoal,
            values
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    }

    formatTimeToGoal(months) {
        if (!isFinite(months)) return 'Increase savings to calculate timeline';
        if (months <= 0) return 'Down payment goal achieved!';
        
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        if (years === 0) return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }

    updateRecommendations(data) {
        const recommendations = [];
        const actionItems = [];

        // Analyze financial situation
        if (data.disposableIncome < 0) {
            recommendations.push('Your expenses exceed your income. Consider reducing expenses or increasing income.');
            actionItems.push('Create a budget to reduce non-essential expenses');
            actionItems.push('Look for additional income sources');
        }

        if (data.downPaymentPercentage < 20) {
            recommendations.push('Continue building your down payment savings.');
            actionItems.push('Set up automatic monthly savings transfers');
            actionItems.push('Consider a high-yield savings account');
        }

        if (data.monthsToGoal > 36) {
            recommendations.push('Consider a more affordable property or increase savings rate.');
            actionItems.push('Research properties in different areas');
            actionItems.push('Look for ways to increase monthly savings');
        }

        if (data.values.monthlyIncome === 0) {
            recommendations.push('Please enter your income details for a complete assessment.');
            actionItems.push('Fill in all income fields in the form');
        }

        // Update recommendation display
        document.getElementById('financial-recommendation').textContent = 
            recommendations.length > 0 ? recommendations[0] : 'Your financial plan looks good!';

        // Update action plan
        const actionList = document.getElementById('action-plan-list');
        actionList.innerHTML = actionItems
            .map(item => `<li>${item}</li>`)
            .join('') || '<li>Complete the assessment form to get personalized recommendations</li>';
    }
}

// Smart Financial Advisor
class SmartFinancialAdvisor {
    constructor() {
        this.propertyData = {
            lekki: {
                flat: { minPrice: 25000000, maxPrice: 45000000, growth: 15, rental: 8 },
                house: { minPrice: 45000000, maxPrice: 120000000, growth: 18, rental: 7 },
                duplex: { minPrice: 65000000, maxPrice: 150000000, growth: 20, rental: 6 },
                terrace: { minPrice: 55000000, maxPrice: 100000000, growth: 16, rental: 7 }
            },
            ikeja: {
                flat: { minPrice: 20000000, maxPrice: 35000000, growth: 12, rental: 9 },
                house: { minPrice: 35000000, maxPrice: 80000000, growth: 14, rental: 8 },
                duplex: { minPrice: 45000000, maxPrice: 100000000, growth: 15, rental: 7 },
                terrace: { minPrice: 40000000, maxPrice: 75000000, growth: 13, rental: 8 }
            },
            yaba: {
                flat: { minPrice: 18000000, maxPrice: 30000000, growth: 14, rental: 10 },
                house: { minPrice: 30000000, maxPrice: 70000000, growth: 16, rental: 9 },
                duplex: { minPrice: 40000000, maxPrice: 90000000, growth: 17, rental: 8 },
                terrace: { minPrice: 35000000, maxPrice: 65000000, growth: 15, rental: 9 }
            }
        };

        this.lifestyleData = {
            minimal: { expenseRatio: 0.4, savingsRatio: 0.3 },
            moderate: { expenseRatio: 0.5, savingsRatio: 0.2 },
            comfort: { expenseRatio: 0.6, savingsRatio: 0.15 },
            luxury: { expenseRatio: 0.7, savingsRatio: 0.1 }
        };

        this.salaryRanges = {
            junior: { min: 150000, max: 300000 },
            mid: { min: 300000, max: 600000 },
            senior: { min: 600000, max: 1200000 },
            executive: { min: 1200000, max: 5000000 }
        };

        this.aiConversation = {
            salary: {
                prompt: "👋 Hi! I'll help you find your dream home. Let's start with your salary range.",
                options: [
                    { text: "₦150k - ₦300k/month", value: "junior" },
                    { text: "₦300k - ₦600k/month", value: "mid" },
                    { text: "₦600k - ₦1.2M/month", value: "senior" },
                    { text: "₦1.2M+/month", value: "executive" }
                ]
            },
            location: {
                prompt: "Great! Now, which area interests you?",
                options: [
                    { text: "Lekki/Ajah", value: "lekki" },
                    { text: "Ikeja", value: "ikeja" },
                    { text: "Yaba", value: "yaba" },
                    { text: "Other Areas", value: "other" }
                ]
            },
            lifestyle: {
                prompt: "Finally, what's your preferred lifestyle?",
                options: [
                    { text: "Minimal Living", value: "minimal" },
                    { text: "Moderate Lifestyle", value: "moderate" },
                    { text: "Comfort Seeker", value: "comfort" },
                    { text: "Luxury Living", value: "luxury" }
                ]
            }
        };

        this.steps = ['salary', 'location', 'lifestyle'];
        this.currentStep = 'salary';
        this.selections = {};
        
        this.initializeAssessment();
        this.setupSelectionHandlers();
        this.setupReportManagement();
        this.initializeLocalStorage();
    }

    setupEventListeners() {
        // Salary Range Selection
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateSelection('range-btn', e.target);
                this.updatePredictions();
            });
        });

        // Location Selection
        document.querySelectorAll('.location-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateSelection('location-btn', e.target);
                this.updatePredictions();
            });
        });

        // Lifestyle Selection
        document.querySelectorAll('.profile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateSelection('profile-btn', e.target);
                this.updatePredictions();
            });
        });
    }

    setupSelectionHandlers() {
        // Selection buttons
        document.querySelectorAll('.selection-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const step = e.target.dataset.step;
                const value = e.target.dataset.value;
                this.handleSelection(step, value, e.target);
            });
        });

        // Control buttons
        document.getElementById('start-assessment').addEventListener('click', () => this.startFreshAssessment());
        document.getElementById('load-last-assessment').addEventListener('click', () => this.loadLastAssessment());
    }

    initializeAssessment() {
        // Activate first step
        this.updateActiveStep();
        this.updateProgressSteps();
        
        // Initialize AI message
        document.getElementById('ai-prompt').textContent = this.getStepPrompt('salary');
    }

    handleSelection(step, value, button) {
        // Update button states
        const stepButtons = document.querySelectorAll(`.selection-btn[data-step="${step}"]`);
        stepButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');

        // Save selection
        this.selections[step] = value;

        // Mark current step as completed
        document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('completed');

        // Move to next step
        this.moveToNextStep(step);
    }

    moveToNextStep(currentStep) {
        const currentIndex = this.steps.indexOf(currentStep);
        const nextStep = this.steps[currentIndex + 1];

        if (nextStep) {
            // Move to next step
            this.currentStep = nextStep;
            this.updateActiveStep();
            this.updateProgressSteps();
            document.getElementById('ai-prompt').textContent = this.getStepPrompt(nextStep);
        } else {
            // Assessment complete
            this.showCompletionMessage();
            this.generateRecommendations();
        }
    }

    updateActiveStep() {
        // Update step visibility
        document.querySelectorAll('.selection-group').forEach(group => {
            group.classList.remove('active');
        });
        
        const activeGroup = document.getElementById(`${this.currentStep}-selection`);
        if (activeGroup) {
            activeGroup.classList.add('active');
            // Smooth scroll to active group
            activeGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateProgressSteps() {
        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active');
            if (step.dataset.step === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    startFreshAssessment() {
        // Clear all selections
        this.selections = {};
        document.querySelectorAll('.selection-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Reset progress steps
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });

        // Reset to first step
        this.currentStep = 'salary';
        this.updateActiveStep();
        this.updateProgressSteps();
        document.getElementById('ai-prompt').textContent = this.getStepPrompt('salary');

        // Clear any existing recommendations
        this.clearRecommendations();
    }

    loadLastAssessment() {
        const savedProfile = localStorage.getItem('financialProfile');
        if (!savedProfile) {
            this.showMessage('No previous assessment found');
            return;
        }

        try {
            const profile = JSON.parse(savedProfile);
            this.selections = profile.selections;

            // Restore button states
            Object.entries(this.selections).forEach(([step, value]) => {
                const button = document.querySelector(`.selection-btn[data-step="${step}"][data-value="${value}"]`);
                if (button) {
                    button.classList.add('selected');
                }
            });

            // Show completion if all steps are done
            if (Object.keys(this.selections).length === this.steps.length) {
                this.showCompletionMessage();
                this.generateRecommendations();
            } else {
                // Continue from last incomplete step
                const lastCompleteStep = this.steps.find(step => !this.selections[step]);
                this.currentStep = lastCompleteStep || this.steps[0];
                this.updateActiveStep();
                this.updateProgressSteps(); // Ensure progress steps are updated
            }
        } catch (error) {
            console.error('Error loading previous assessment:', error);
            this.showMessage('Error loading previous assessment');
        }
    }

    showCompletionMessage() {
        document.getElementById('ai-prompt').innerHTML = `
            ✨ Excellent! I've analyzed your preferences:
            <br>
            💰 ${this.getSelectionText('salary')}
            <br>
            📍 ${this.getSelectionText('location')}
            <br>
            🌟 ${this.getSelectionText('lifestyle')}
            <br><br>
            Let me generate your personalized recommendations...
        `;
    }

    generateRecommendations() {
        if (!this.selections.salary || !this.selections.location || !this.selections.lifestyle) {
            return;
        }

        const predictions = this.generatePredictions(this.selections);
        this.updateUI(predictions);
        this.saveToLocalStorage(this.selections, predictions);
    }

    clearRecommendations() {
        // Reset all prediction displays
        document.getElementById('ai-property-type').textContent = 'Select preferences above';
        document.getElementById('ai-price-range').textContent = 'Select preferences above';
        document.getElementById('ai-suggested-areas').textContent = 'Select preferences above';
        
        // Reset progress bars
        document.querySelectorAll('.confidence-fill').forEach(fill => {
            fill.style.width = '0%';
        });

        // Reset score
        const scoreElement = document.getElementById('affordability-score');
        if (scoreElement) {
            scoreElement.querySelector('.score-text').textContent = '0';
            scoreElement.style.borderColor = '#E5E7EB'; // Use actual color value instead of CSS variable
        }
    }

    setupReportManagement() {
        document.getElementById('save-report').addEventListener('click', () => this.saveReport());
        document.getElementById('export-pdf').addEventListener('click', () => this.showReportPreview());
        document.getElementById('share-report').addEventListener('click', () => this.showShareOptions());
        
        // Modal controls
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        document.getElementById('confirm-export').addEventListener('click', () => this.exportReport());
        
        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleShare(e.target.dataset.type));
        });

        this.loadSavedReports();
    }

    saveReport() {
        const selections = this.getCurrentSelections();
        const predictions = this.generatePredictions(selections);
        
        const report = {
            id: Date.now(),
            date: new Date().toISOString(),
            selections,
            predictions,
            title: `Home Assessment - ${new Date().toLocaleDateString()}`
        };

        const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
        savedReports.push(report);
        localStorage.setItem('savedReports', JSON.stringify(savedReports));

        this.showMessage('Report saved successfully!');
        this.loadSavedReports();
    }

    loadSavedReports() {
        const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
        const reportsList = document.querySelector('.reports-list');

        reportsList.innerHTML = savedReports.map(report => `
            <div class="report-item" data-id="${report.id}">
                <div class="report-info">
                    <h4>${report.title}</h4>
                    <p>${new Date(report.date).toLocaleDateString()}</p>
                </div>
                <div class="report-actions">
                    <button class="btn btn-secondary" onclick="smartAdvisor.loadReport(${report.id})">
                        Load
                    </button>
                    <button class="btn btn-secondary" onclick="smartAdvisor.deleteReport(${report.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('') || '<p>No saved reports yet</p>';
    }

    loadReport(id) {
        const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
        const report = savedReports.find(r => r.id === id);
        
        if (report) {
            this.applySelections(report.selections);
            this.updatePredictions();
            this.showMessage('Report loaded successfully!');
        }
    }

    deleteReport(id) {
        const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
        const updatedReports = savedReports.filter(r => r.id !== id);
        localStorage.setItem('savedReports', JSON.stringify(updatedReports));
        
        this.loadSavedReports();
        this.showMessage('Report deleted successfully!');
    }

    showReportPreview() {
        const selections = this.getCurrentSelections();
        const predictions = this.generatePredictions(selections);
        
        const reportModal = document.getElementById('report-modal');
        const reportPreview = document.getElementById('report-preview');

        reportPreview.innerHTML = this.generateReportHTML(selections, predictions);
        reportModal.classList.add('active');
    }

    generateReportHTML(selections, predictions) {
        return `
            <div class="report-section">
                <h4>Profile Summary</h4>
                <div class="metric-row">
                    <span>Income Range:</span>
                    <span>${this.aiConversation.salary.options.find(o => o.value === selections.salary)?.text}</span>
                </div>
                <div class="metric-row">
                    <span>Location:</span>
                    <span>${this.aiConversation.location.options.find(o => o.value === selections.location)?.text}</span>
                </div>
                <div class="metric-row">
                    <span>Lifestyle:</span>
                    <span>${this.aiConversation.lifestyle.options.find(o => o.value === selections.lifestyle)?.text}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>Property Recommendations</h4>
                <div class="metric-row">
                    <span>Recommended Type:</span>
                    <span>${predictions.propertyType}</span>
                </div>
                <div class="metric-row">
                    <span>Price Range:</span>
                    <span>${predictions.priceRange}</span>
                </div>
                <div class="metric-row">
                    <span>Suggested Areas:</span>
                    <span>${predictions.suggestedAreas.join(', ')}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>Financial Analysis</h4>
                <div class="metric-row">
                    <span>Affordability Score:</span>
                    <span>${predictions.affordabilityScore}/100</span>
                </div>
                <div class="metric-row">
                    <span>Monthly Mortgage:</span>
                    <span>${this.formatCurrency(predictions.paymentPlans.mortgage.monthly)}</span>
                </div>
                <div class="metric-row">
                    <span>Investment Growth Potential:</span>
                    <span>${predictions.investmentMetrics.growth}%</span>
                </div>
            </div>
        `;
    }

    exportReport() {
        // In a real implementation, we would use a PDF library like jsPDF
        // For now, we'll just download as HTML
        const reportContent = document.getElementById('report-preview').innerHTML;
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'financial-assessment-report.html';
        a.click();
        window.URL.revokeObjectURL(url);
        this.closeModals();
    }

    showShareOptions() {
        document.getElementById('share-modal').classList.add('active');
    }

    handleShare(type) {
        const reportUrl = window.location.href;
        
        switch(type) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(reportUrl)}`);
                break;
            case 'email':
                window.location.href = `mailto:?subject=Property Assessment Report&body=${encodeURIComponent(reportUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(reportUrl);
                this.showMessage('Link copied to clipboard!');
                break;
        }
        
        this.closeModals();
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showMessage(message) {
        // In a real implementation, use a proper toast/notification system
        alert(message);
    }

    clearSelections() {
        document.querySelectorAll('.range-btn, .location-btn, .profile-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    applySelections(selections) {
        this.clearSelections();
        Object.entries(selections).forEach(([key, value]) => {
            const btn = document.querySelector(`[data-${key}="${value}"]`);
            if (btn) btn.classList.add('active');
        });
    }

    updateSelection(className, selectedBtn) {
        document.querySelectorAll(`.${className}`).forEach(btn => btn.classList.remove('active'));
        selectedBtn.classList.add('active');
    }

    initializeLocalStorage() {
        if (!localStorage.getItem('financialProfile')) {
            localStorage.setItem('financialProfile', JSON.stringify({
                selections: {},
                predictions: {},
                timeline: []
            }));
        }
    }

    updatePredictions() {
        const selections = this.getCurrentSelections();
        if (!selections.salary || !selections.location || !selections.lifestyle) return;

        const predictions = this.generatePredictions(selections);
        this.updateUI(predictions);
        this.saveToLocalStorage(selections, predictions);
    }

    getCurrentSelections() {
        return {
            salary: document.querySelector('.range-btn.active')?.dataset.range,
            location: document.querySelector('.location-btn.active')?.dataset.location,
            lifestyle: document.querySelector('.profile-btn.active')?.dataset.profile
        };
    }

    generatePredictions(selections) {
        const salaryRange = this.salaryRanges[selections.salary];
        const avgMonthlyIncome = (salaryRange.min + salaryRange.max) / 2;
        const lifestyle = this.lifestyleData[selections.lifestyle];
        const locationData = this.propertyData[selections.location];

        // Calculate affordability
        const monthlyExpenses = avgMonthlyIncome * lifestyle.expenseRatio;
        const monthlySavings = avgMonthlyIncome * lifestyle.savingsRatio;
        const availableForHousing = avgMonthlyIncome - monthlyExpenses - monthlySavings;

        // Determine suitable property types
        const suitableProperties = this.findSuitableProperties(availableForHousing, locationData);
        const affordabilityScore = this.calculateAffordabilityScore(availableForHousing, suitableProperties);

        // Generate investment metrics
        const investmentMetrics = this.calculateInvestmentMetrics(selections.location, suitableProperties[0]);

        return {
            propertyType: suitableProperties[0],
            priceRange: this.formatPriceRange(locationData[suitableProperties[0]]),
            suggestedAreas: this.suggestAreas(selections.location, availableForHousing),
            affordabilityScore,
            investmentMetrics,
            paymentPlans: this.calculatePaymentPlans(locationData[suitableProperties[0]].minPrice)
        };
    }

    findSuitableProperties(monthlyCapacity, locationData) {
        const maxLoanAmount = monthlyCapacity * 12 * 25; // 25-year mortgage calculation
        return Object.entries(locationData)
            .filter(([_, data]) => data.minPrice <= maxLoanAmount * 1.2)
            .map(([type]) => type)
            .sort((a, b) => locationData[a].minPrice - locationData[b].minPrice);
    }

    calculateAffordabilityScore(monthlyCapacity, suitableProperties) {
        const baseScore = Math.min(monthlyCapacity / 500000 * 100, 100);
        const propertyFactor = suitableProperties.length * 25;
        return Math.min(Math.round((baseScore + propertyFactor) / 2), 100);
    }

    calculateInvestmentMetrics(location, propertyType) {
        if (!location || !propertyType) return { growth: 0, rental: 0 };
        const data = this.propertyData[location][propertyType];
        return {
            growth: data.growth,
            rental: data.rental
        };
    }

    calculatePaymentPlans(propertyPrice) {
        return {
            mortgage: {
                monthly: Math.round(propertyPrice * 0.8 * 0.0075), // 80% loan at 9% annual interest
                term: 30
            },
            installment: {
                monthly: Math.round(propertyPrice / 60), // 5-year plan
                term: 5
            }
        };
    }

    formatPriceRange(propertyData) {
        const formatter = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        });
        return `${formatter.format(propertyData.minPrice)} - ${formatter.format(propertyData.maxPrice)}`;
    }

    suggestAreas(mainLocation, budget) {
        const suggestions = {
            lekki: ['Chevron', 'Ikate', 'Agungi'],
            ikeja: ['GRA', 'Maryland', 'Oregun'],
            yaba: ['Abule-Oja', 'Alagomeji', 'Sabo']
        };
        return suggestions[mainLocation] || ['Select a location'];
    }

    updateUI(predictions) {
        // Update Property Type
        document.getElementById('ai-property-type').textContent = 
            predictions.propertyType ? 
            predictions.propertyType.charAt(0).toUpperCase() + predictions.propertyType.slice(1) : 
            'Select preferences';
        document.getElementById('property-confidence').style.width = '85%';

        // Update Price Range
        document.getElementById('ai-price-range').textContent = predictions.priceRange;
        document.getElementById('price-confidence').style.width = '90%';

        // Update Suggested Areas
        document.getElementById('ai-suggested-areas').textContent = predictions.suggestedAreas.join(', ');
        document.getElementById('area-confidence').style.width = '75%';

        // Update Affordability Score
        const scoreElement = document.getElementById('affordability-score');
        scoreElement.querySelector('.score-text').textContent = predictions.affordabilityScore;
        scoreElement.style.borderColor = this.getScoreColor(predictions.affordabilityScore);

        // Update Investment Potential
        document.getElementById('growth-potential').style.width = `${predictions.investmentMetrics.growth * 5}%`;
        document.getElementById('rental-potential').style.width = `${predictions.investmentMetrics.rental * 10}%`;

        // Update Payment Options
        document.querySelector('#mortgage-option .monthly-amount').textContent = 
            this.formatCurrency(predictions.paymentPlans.mortgage.monthly);
        document.querySelector('#installment-option .monthly-amount').textContent = 
            this.formatCurrency(predictions.paymentPlans.installment.monthly);

        // Generate and update timeline
        this.updateTimeline(predictions);
    }

    getScoreColor(score) {
        if (score >= 80) return '#4CAF50';
        if (score >= 60) return '#FFC107';
        return '#FF5722';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    }

    updateTimeline(predictions) {
        const timeline = document.getElementById('action-timeline');
        const steps = this.generateTimelineSteps(predictions);
        
        timeline.innerHTML = steps.map((step, index) => `
            <div class="timeline-item" style="animation-delay: ${index * 0.2}s">
                <div class="timeline-content ${index % 2 === 0 ? 'left' : 'right'}">
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>
                    ${step.metric ? `<div class="timeline-metric">${step.metric}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    generateTimelineSteps(predictions) {
        return [
            {
                title: 'Start Saving',
                description: 'Begin with the down payment goal',
                metric: `Target: ${this.formatCurrency(predictions.paymentPlans.mortgage.monthly * 30)}`
            },
            {
                title: 'Property Search',
                description: `Focus on ${predictions.suggestedAreas[0]} area`,
                metric: `Budget: ${predictions.priceRange}`
            },
            {
                title: 'Financial Planning',
                description: 'Prepare mortgage documentation',
                metric: `Monthly Payment: ${this.formatCurrency(predictions.paymentPlans.mortgage.monthly)}`
            },
            {
                title: 'Property Inspection',
                description: 'Schedule viewings and assessments'
            }
        ];
    }

    saveToLocalStorage(selections, predictions) {
        const profile = {
            selections,
            predictions,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('financialProfile', JSON.stringify(profile));
    }

    getSelectionText(step) {
        const selections = {
            salary: {
                junior: "₦150k - ₦300k monthly income",
                mid: "₦300k - ₦600k monthly income",
                senior: "₦600k - ₦1.2M monthly income",
                executive: "₦1.2M+ monthly income"
            },
            location: {
                lekki: "Lekki/Ajah area",
                ikeja: "Ikeja area",
                yaba: "Yaba area",
                other: "Other areas"
            },
            lifestyle: {
                minimal: "Minimal Living lifestyle",
                moderate: "Moderate Lifestyle",
                comfort: "Comfort Seeker",
                luxury: "Luxury Living"
            }
        };
        
        return selections[step][this.selections[step]] || "Not selected";
    }
}

class QuickAssessment {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.selections = {};
        
        this.initializeAssessment();
    }

    initializeAssessment() {
        // Show first step
        document.getElementById('step-salary').classList.add('active');
        this.updateProgress();

        // Setup event listeners
        this.setupOptionButtons();
        this.setupNavigationButtons();
    }

    setupOptionButtons() {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const step = e.target.closest('.assessment-step').id.split('-')[1];
                this.handleSelection(step, e.target);
            });
        });
    }

    setupNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn.addEventListener('click', () => this.navigateStep('prev'));
        nextBtn.addEventListener('click', () => this.navigateStep('next'));
    }

    handleSelection(step, button) {
        // Clear previous selection in this step
        button.closest('.step-options').querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Select current option
        button.classList.add('selected');
        
        // Save selection
        this.selections[step] = {
            value: button.dataset.value,
            text: button.textContent
        };

        // Enable next button
        document.getElementById('next-btn').disabled = false;
    }

    navigateStep(direction) {
        const currentStepEl = document.querySelector('.assessment-step.active');
        currentStepEl.classList.remove('active');

        if (direction === 'next') {
            this.currentStep++;
        } else {
            this.currentStep--;
        }

        // Show appropriate step
        const nextStepId = this.getStepId(this.currentStep);
        document.getElementById(nextStepId).classList.add('active');

        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Update progress
        this.updateProgress();

        // Show results if completed
        if (this.currentStep > this.totalSteps) {
            this.showResults();
        }
    }

    getStepId(stepNumber) {
        const steps = {
            1: 'step-salary',
            2: 'step-location',
            3: 'step-lifestyle'
        };
        return steps[stepNumber];
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        // Previous button
        prevBtn.disabled = this.currentStep === 1;

        // Next button
        if (this.currentStep > this.totalSteps) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
            nextBtn.disabled = !this.selections[this.getStepId(this.currentStep).split('-')[1]];
        }
    }

    updateProgress() {
        const progress = ((this.currentStep - 1) / this.totalSteps) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.getElementById('current-step').textContent = Math.min(this.currentStep, this.totalSteps);
    }

    showResults() {
        // Update summary
        document.getElementById('income-summary').textContent = this.selections.salary.text;
        document.getElementById('location-summary').textContent = this.selections.location.text;
        document.getElementById('lifestyle-summary').textContent = this.selections.lifestyle.text;

        // Show results section
        const resultsPreview = document.getElementById('results-preview');
        resultsPreview.style.display = 'block';
        resultsPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Setup view recommendations button
        document.getElementById('view-recommendations').addEventListener('click', () => {
            this.generateRecommendations();
        });
    }

    generateRecommendations() {
        // Here you can integrate with your existing recommendation system
        // For now, we'll just scroll to the recommendations section
        document.querySelector('.ai-predictions').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

class WizardAssessment {
    constructor() {
        this.state = { step: 1, total: 6, selections: {}, budget: 35000000, downPct: 20, bedrooms: 3 };
        this.propertyData = {
            lekki: { flat: [25000000, 45000000], house: [45000000, 120000000], duplex: [65000000, 150000000], terrace: [55000000, 100000000] },
            ikeja: { flat: [20000000, 35000000], house: [35000000, 80000000], duplex: [45000000, 100000000], terrace: [40000000, 75000000] },
            yaba:  { flat: [18000000, 30000000], house: [30000000, 70000000], duplex: [40000000, 90000000], terrace: [35000000, 65000000] }
        };
        this.bind();
    }

    bind() {
        this.overlay = document.getElementById('assessment-wizard');
        this.progressFill = document.getElementById('wizard-progress-fill');
        this.btnOpen = document.getElementById('get-started-btn');
        this.btnClose = document.getElementById('wizard-close');
        this.btnBack = document.getElementById('wizard-back');
        this.btnNext = document.getElementById('wizard-next');
        this.summaryCards = document.getElementById('summary-cards');
        this.downSlider = document.getElementById('downpayment-slider');
        this.downLabel = document.getElementById('downpayment-value');
        this.budgetSlider = document.getElementById('budget-slider');
        this.budgetLabel = document.getElementById('budget-value');
        this.mortgageMonthly = document.getElementById('mortgage-monthly');
        this.btnSave = document.getElementById('save-assessment');
        this.btnExport = document.getElementById('export-assessment');
        this.btnSendAgent = document.getElementById('send-agent');
        this.btnFinish = document.getElementById('finish-assessment');
        this.reportDate = document.getElementById('report-date');
        this.reportSections = document.getElementById('report-sections');
        this.agentModal = document.getElementById('agent-modal');
        this.agentClose = document.getElementById('agent-close');
        this.userName = document.getElementById('user-name');
        this.userEmail = document.getElementById('user-email');
        this.userPhone = document.getElementById('user-phone');
        this.userNotes = document.getElementById('user-notes');
        this.agentWhatsApp = document.getElementById('agent-send-whatsapp');
        this.agentEmail = document.getElementById('agent-send-email');
        this.bedroomsSlider = document.getElementById('bedrooms-slider');
        this.bedroomsValue = document.getElementById('bedrooms-value');

        if (this.btnOpen) this.btnOpen.addEventListener('click', () => this.open());
        if (this.btnClose) this.btnClose.addEventListener('click', () => this.close());
        if (this.btnBack) this.btnBack.addEventListener('click', () => this.prev());
        if (this.btnNext) this.btnNext.addEventListener('click', () => this.next());
        if (this.downSlider) this.downSlider.addEventListener('input', () => this.updateDownPct());
        if (this.budgetSlider) this.budgetSlider.addEventListener('input', () => this.updateBudget());
        if (this.btnSave) this.btnSave.addEventListener('click', () => this.save());
        if (this.btnExport) this.btnExport.addEventListener('click', () => this.export());
        if (this.btnSendAgent) this.btnSendAgent.addEventListener('click', () => this.openAgent());
        if (this.btnFinish) this.btnFinish.addEventListener('click', () => this.finish());
        if (this.agentClose) this.agentClose.addEventListener('click', () => this.closeAgent());
        if (this.agentWhatsApp) this.agentWhatsApp.addEventListener('click', () => this.sendAgent('whatsapp'));
        if (this.agentEmail) this.agentEmail.addEventListener('click', () => this.sendAgent('email'));
        if (this.bedroomsSlider) this.bedroomsSlider.addEventListener('input', () => this.updateBedrooms());

        document.querySelectorAll('.chip-group').forEach(group => {
            group.addEventListener('click', (e) => {
                const chip = e.target.closest('.chip'); if (!chip) return;
                const field = group.dataset.field;
                group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                this.state.selections[field] = chip.dataset.value;
                // show Next when fields are satisfied
                this.autoPredict();
                this.updateNavState();
            });
        });

        this.restore();
        this.render();
    }

    updateBedrooms() { this.state.bedrooms = parseInt(this.bedroomsSlider.value, 10); this.bedroomsValue.textContent = this.state.bedrooms; }

    open() { this.overlay.classList.add('active'); this.state.step = 1; this.render(); }
    close() { this.overlay.classList.remove('active'); }

    prev() { if (this.state.step > 1) { this.state.step--; this.render(); } }
    next() { if (this.state.step < this.state.total) { this.state.step++; this.render(); if (this.state.step === this.state.total) { this.buildSummary(); this.buildReport(); } } }

    updateDownPct() { this.state.downPct = parseInt(this.downSlider.value, 10); this.downLabel.textContent = `${this.state.downPct}%`; this.updateMortgage(); }
    updateBudget() { this.state.budget = parseInt(this.budgetSlider.value, 10); this.budgetLabel.textContent = this.formatCurrency(this.state.budget); this.updateMortgage(); }

    updateMortgage() {
        const P = Math.max(this.state.budget * (1 - this.state.downPct / 100), 0);
        const r = 0.09 / 12; const n = 30 * 12;
        const m = P === 0 ? 0 : (P * r) / (1 - Math.pow(1 + r, -n));
        this.mortgageMonthly.textContent = this.formatCurrency(Math.round(m));
    }

    autoPredict() {
        const s = this.state.selections.salary || '';
        if (!s || !this.budgetSlider) return;
        let avgIncome = 300000;
        if (s.includes('150000-300000')) avgIncome = 225000; else if (s.includes('300000-600000')) avgIncome = 450000; else if (s.includes('600000-1200000')) avgIncome = 900000; else if (s.includes('>1200000')) avgIncome = 1500000;
        const monthlyCapacity = avgIncome * 0.33; const affordPrice = monthlyCapacity * 12 * 25;
        const min = parseInt(this.budgetSlider.min, 10); const max = parseInt(this.budgetSlider.max, 10);
        const predicted = Math.max(min, Math.min(max, Math.round(affordPrice / 100000) * 100000));
        this.state.budget = predicted; this.budgetSlider.value = predicted; this.budgetLabel.textContent = this.formatCurrency(predicted);
        this.updateMortgage();
    }

    updateNavState() {
        const requirements = { 1: ['buyerType','salary'], 2: ['location'], 3: ['propertyType'], 4: ['paymentMethod'], 5: ['lifestyle','timeframe'] };
        const need = requirements[this.state.step] || [];
        const hasAll = need.every(k => this.state.selections[k]);
        this.btnNext.disabled = !hasAll && this.state.step < this.state.total;
        this.btnBack.disabled = this.state.step === 1;
        this.progressFill.style.width = `${(this.state.step - 1) / (this.state.total - 1) * 100}%`;
    }

    render() {
        document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
        const active = document.querySelector(`.wizard-step[data-step="${this.state.step}"]`);
        if (active) active.classList.add('active');
        this.updateNavState();
        if (this.state.step === 4) { this.updateMortgage(); }
        if (this.reportDate) { this.reportDate.textContent = new Date().toLocaleString(); }
    }

    buildSummary() {
        const s = this.state.selections;
        const priceRange = this.getPriceRange(s.location, s.propertyType, this.state.budget);
        const areas = this.suggestAreas(s.location);
        const summary = [
            { title: 'Buyer Profile', lines: [this.pretty('buyerType', s.buyerType), this.pretty('salary', s.salary)] },
            { title: 'Location', lines: [this.pretty('location', s.location), `Suggested: ${areas.join(', ')}`] },
            { title: 'Property', lines: [`Type: ${this.pretty('propertyType', s.propertyType)}`, `${this.state.bedrooms} bedrooms`, `Target: ${this.formatCurrency(this.state.budget)}`, `Market Range: ${priceRange}`] },
            { title: 'Financing', lines: [`Method: ${this.pretty('paymentMethod', s.paymentMethod)}`, `Down Payment: ${this.state.downPct}%`, `Est. Monthly: ${this.mortgageMonthly.textContent}`] },
            { title: 'Lifestyle & Priorities', lines: [this.pretty('lifestyle', s.lifestyle), `Priority: ${this.pretty('priority', s.priority)}`, `Timeframe: ${this.pretty('timeframe', s.timeframe)}`] },
            { title: 'Next Steps', lines: ['Verify titles (C of O / Consent)', 'Legal + survey checks', 'Physical inspection', 'Secure payment & documentation'] }
        ];
        this.summaryCards.innerHTML = summary.map(card => `<div class="summary-card"><h5>${card.title}</h5>${card.lines.map(l => `<p>${l}</p>`).join('')}</div>`).join('');
    }

    buildReport() {
        const s = this.state.selections;
        const sections = [
            { h: 'Profile Summary', rows: [ ['Buyer Type', this.pretty('buyerType', s.buyerType)], ['Income Range', this.pretty('salary', s.salary)], ['Timeframe', this.pretty('timeframe', s.timeframe)] ] },
            { h: 'Location & Areas', rows: [ ['Preferred Location', this.pretty('location', s.location)], ['Suggested Areas', this.suggestAreas(s.location).join(', ')] ] },
            { h: 'Property Target', rows: [ ['Type', this.pretty('propertyType', s.propertyType)], ['Bedrooms', `${this.state.bedrooms}`], ['Target Price', this.formatCurrency(this.state.budget)], ['Market Range', this.getPriceRange(s.location, s.propertyType, this.state.budget)] ] },
            { h: 'Financing Plan', rows: [ ['Payment Method', this.pretty('paymentMethod', s.paymentMethod)], ['Down Payment', `${this.state.downPct}%`], ['Estimated Monthly', this.mortgageMonthly.textContent], ['Tenor', '30 years'], ['Rate', '9% APR'] ] },
            { h: 'Lifestyle & Priorities', rows: [ ['Lifestyle', this.pretty('lifestyle', s.lifestyle)], ['Priority', this.pretty('priority', s.priority)] ] },
            { h: 'Action Checklist', rows: [ ['1', 'Verify titles (C of O / Consent)'], ['2', 'Legal + survey checks'], ['3', 'Physical inspection + utilities'], ['4', 'Secure payment & documents'] ] }
        ];
        this.reportSections.innerHTML = sections.map(sec => `
            <div class="section">
                <h5>${sec.h}</h5>
                ${sec.rows.map(r => `<p><strong>${r[0]}:</strong> ${r[1]}</p>`).join('')}
            </div>
        `).join('');
    }

    getPriceRange(location, type, fallbackBudget) {
        const data = this.propertyData[location]?.[type];
        if (!data) return `${this.formatCurrency(fallbackBudget * 0.8)} – ${this.formatCurrency(fallbackBudget * 1.2)}`;
        return `${this.formatCurrency(data[0])} – ${this.formatCurrency(data[1])}`;
    }

    suggestAreas(location) { const map = { lekki: ['Chevron','Ikate','Agungi'], ikeja: ['GRA','Maryland','Oregun'], yaba: ['Abule-Oja','Alagomeji','Sabo'] }; return map[location] || ['Discuss with advisor']; }

    pretty(field, value) {
        const map = {
            buyerType: { first_time: 'First-time buyer', upgrader: 'Upgrading', investor: 'Investor' },
            salary: { '150000-300000': '₦150k–₦300k', '300000-600000': '₦300k–₦600k', '600000-1200000': '₦600k–₦1.2M', '>1200000': '₦1.2M+' },
            location: { lekki: 'Lekki/Ajah', ikeja: 'Ikeja', yaba: 'Yaba', other: 'Other' },
            propertyType: { flat: 'Flat/Apartment', house: 'House', duplex: 'Duplex', terrace: 'Terrace' },
            paymentMethod: { cash: 'Cash', mortgage: 'Mortgage', installment: 'Installment Plan' },
            lifestyle: { minimal: 'Minimal', moderate: 'Moderate', comfort: 'Comfort', luxury: 'Luxury' },
            priority: { schools: 'Near schools', transport: 'Transport access', security: 'High security', amenities: 'Amenities' },
            timeframe: { '0-3m': '0–3 months', '3-6m': '3–6 months', '6-12m': '6–12 months', '>12m': '12+ months' }
        };
        return map[field]?.[value] || (value || '-')
    }

    save() { const payload = { ...this.state, savedAt: new Date().toISOString() }; localStorage.setItem('assessmentReport', JSON.stringify(payload)); alert('Assessment saved locally.'); }

    export() {
        const report = document.getElementById('report-content');
        if (window.html2pdf && report) {
            const opt = { filename: 'iGetHouse_Assessment.pdf', margin: 10, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
            window.html2pdf().from(report).set(opt).save();
        } else { window.print(); }
    }

    openAgent() { this.agentModal.classList.add('active'); }
    closeAgent() { this.agentModal.classList.remove('active'); }

    sendAgent(method) {
        const name = (this.userName?.value || '').trim();
        const email = (this.userEmail?.value || '').trim();
        const phone = (this.userPhone?.value || '').trim();
        const notes = (this.userNotes?.value || '').trim();
        const payload = { ...this.state.selections, budget: this.state.budget, bedrooms: this.state.bedrooms, downPct: this.state.downPct, monthly: this.mortgageMonthly.textContent, notes, name, email, phone };
        const summary = `iGetHouse Assessment\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${this.pretty('location', payload.location)}\nType: ${this.pretty('propertyType', payload.propertyType)} (${payload.bedrooms} beds)\nBudget: ${this.formatCurrency(payload.budget)}\nPayment: ${this.pretty('paymentMethod', payload.paymentMethod)} (Down ${payload.downPct}%)\nEst. Monthly: ${payload.monthly}\nLifestyle: ${this.pretty('lifestyle', payload.lifestyle)} | Priority: ${this.pretty('priority', payload.priority)}\nTimeframe: ${this.pretty('timeframe', payload.timeframe)}\nNotes: ${notes}`;
        if (method === 'whatsapp') {
            const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
            window.open(url, '_blank');
        } else if (method === 'email') {
            const subj = 'iGetHouse Assessment';
            const mailto = `mailto:agent@igethouse.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(summary)}`;
            window.location.href = mailto;
        }
        this.closeAgent();
    }

    finish() { this.close(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

    restore() {
        try {
            const saved = JSON.parse(localStorage.getItem('assessmentReport') || 'null');
            if (!saved) return;
            this.state = { ...this.state, ...saved };
            Object.entries(this.state.selections).forEach(([field, val]) => {
                const group = document.querySelector(`.chip-group[data-field="${field}"]`);
                if (!group) return;
                const chip = group.querySelector(`.chip[data-value="${val}"]`);
                if (chip) chip.classList.add('selected');
            });
            if (this.budgetSlider && this.state.budget) { this.budgetSlider.value = this.state.budget; this.budgetLabel.textContent = this.formatCurrency(this.state.budget); }
            if (this.downSlider && this.state.downPct) { this.downSlider.value = this.state.downPct; this.downLabel.textContent = `${this.state.downPct}%`; }
            if (this.bedroomsSlider && this.state.bedrooms) { this.bedroomsSlider.value = this.state.bedrooms; this.bedroomsValue.textContent = this.state.bedrooms; }
            this.updateMortgage();
        } catch {}
    }

    formatCurrency(amount) { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount); }
}

// Extend WizardAssessment with marketplace deep-link and personalized checklist
(function(){
    const CHECKLIST_SECTIONS = [
        { title: 'Financial', items: ['Define budget range', 'Plan 20% down payment', 'Calculate extra costs (legal, agent, stamp duty, survey, moving)'] },
        { title: 'Location', items: ['Check crime/security', 'Assess commute & road access', 'Check flood/erosion risk', 'Proximity to schools/hospitals/markets'] },
        { title: 'Property Inspection', items: ['Structure (walls, roof, foundation)', 'Electrical wiring & breakers', 'Plumbing & water pressure', 'Drainage & sewage', 'Ventilation & lighting'] },
        { title: 'Legal Verification', items: ['C of O / Consent / Deed', 'Survey Plan matches property', 'Building plan approval', 'No disputes or liens'] },
        { title: 'Lifestyle & Amenities', items: ['Internet availability', 'Noise level acceptable', 'Waste disposal', 'Delivery/logistics access'] }
    ];

    function buildChecklistHTML(){
        return `
            <div class="checklist-header">
                <h5>Personalized Checklist</h5>
                <small>Auto-generated from your assessment. Save or export to keep a copy.</small>
            </div>
            <div class="checklist-items-grid">
                ${CHECKLIST_SECTIONS.map(sec => `
                    <div>
                        <h5>${sec.title}</h5>
                        ${sec.items.map(item => `<div class="checklist-item-row"><input type="checkbox"> <label>${item}</label></div>`).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function marketUrlFor(location, type, budget){
        // Placeholder: construct a future marketplace query link
        const base = 'https://igethouse.com/marketplace/search';
        const params = new URLSearchParams();
        if (location) params.set('location', location);
        if (type) params.set('type', type);
        if (budget) params.set('maxPrice', budget);
        return `${base}?${params.toString()}`;
    }

    // Patch WizardAssessment methods when instance exists
    const patch = (inst) => {
        const origBuildSummary = inst.buildSummary.bind(inst);
        inst.buildSummary = function(){
            origBuildSummary();
            // Marketplace link
            const s = this.state.selections; const link = document.getElementById('marketplace-link');
            if (link) link.href = marketUrlFor(s.location, this.state.propertyType, this.state.budget);
            // Checklist block
            const checklist = document.getElementById('checklist-block');
            if (checklist) checklist.innerHTML = buildChecklistHTML();
        };
    };

    // Try to patch existing or future instance
    document.addEventListener('DOMContentLoaded', () => {
        try { const maybe = new WizardAssessment(); patch(maybe); } catch{}
    });
})();

// Single bootstrap: create one wizard instance and wire UX fixes
(function(){
    function setupSingleton() {
        if (window.__wizard_bootstrapped) return;
        window.__wizard_bootstrapped = true;
        try {
            const wizard = new WizardAssessment();
            window.wizard = wizard;

            // Wire hero and nav buttons to open wizard
            const startHero = document.getElementById('start-journey-btn');
            const startNav = document.getElementById('get-started-btn');
            const open = (e) => { if (e) e.preventDefault(); wizard.open(); };
            if (startHero) startHero.addEventListener('click', open);
            if (startNav) startNav.addEventListener('click', open);

            // Step-4: auto-advance after payment method selection
            document.querySelectorAll('.chip-group[data-field="paymentMethod"] .chip').forEach(ch => {
                ch.addEventListener('click', () => {
                    // ensure selection saved
                    wizard.state.selections.paymentMethod = ch.dataset.value;
                    wizard.btnNext.disabled = false;
                    if (wizard.state.step === 4) wizard.next();
                });
            });

            // Step-5: allow Next when timeframe only; default lifestyle if missing
            const originalUpdate = wizard.updateNavState.bind(wizard);
            wizard.updateNavState = function(){
                if (this.state.step === 5) {
                    if (!this.state.selections.lifestyle) {
                        const g = document.querySelector('.chip-group[data-field="lifestyle"]');
                        const def = g?.querySelector('.chip[data-value="moderate"]');
                        if (def) { g.querySelectorAll('.chip').forEach(c => c.classList.remove('selected')); def.classList.add('selected'); this.state.selections.lifestyle = 'moderate'; }
                    }
                    const ok = !!this.state.selections.timeframe;
                    this.btnNext.disabled = !ok && this.state.step < this.state.total;
                    this.btnBack.disabled = this.state.step === 1;
                    this.progressFill.style.width = `${(this.state.step - 1) / (this.state.total - 1) * 100}%`;
                    return;
                }
                return originalUpdate();
            };

            // Contextual tips per step
            const tipsEl = document.getElementById('wizard-tips');
            const tips = {
                1: 'Tip: If you are a first-time buyer, target emergency funds and a 20% down payment to reduce monthly costs.',
                2: "Tip: Consider commute, security, and flood history. We'll suggest nearby areas automatically.",
                3: 'Tip: You can adjust Target price; we prefilled based on income to keep it realistic.',
                4: 'Tip: A higher down payment reduces your monthly mortgage. Typical minimum is 20%.',
                5: 'Tip: Your timeframe helps us prioritize options and negotiation strategy.',
                6: 'Tip: Save, Export or Send to an agent. You can resume later from this device.'
            };
            const originalRender = wizard.render.bind(wizard);
            wizard.render = function(){ originalRender(); if (tipsEl) tipsEl.textContent = tips[this.state.step] || ''; };

            // Inject checklist + marketplace link after summary build
            const originalSummary = wizard.buildSummary.bind(wizard);
            wizard.buildSummary = function(){
                originalSummary();
                // marketplace link
                const s = this.state.selections;
                const link = document.getElementById('marketplace-link');
                if (link) {
                    const base = 'https://igethouse.com/marketplace/search';
                    const qs = new URLSearchParams();
                    if (s.location) qs.set('location', s.location);
                    if (s.propertyType) qs.set('type', s.propertyType);
                    if (this.state.budget) qs.set('maxPrice', this.state.budget);
                    link.href = `${base}?${qs.toString()}`;
                }
                // checklist content (simple)
                const checklist = document.getElementById('checklist-block');
                if (checklist) {
                    const sections = [
                        { t: 'Financial', i: ['Define budget range', 'Plan 20% down payment', 'Calculate extra costs (legal, agent, stamp duty, survey, moving)'] },
                        { t: 'Location', i: ['Check crime/security', 'Assess commute & access', 'Check flood/erosion risk', 'Near schools/hospitals/markets'] },
                        { t: 'Inspection', i: ['Structure (roof/walls/foundation)', 'Electrical & breakers', 'Plumbing & pressure', 'Drainage & sewage'] },
                        { t: 'Legal', i: ['C of O / Consent / Deed', 'Survey plan matches', 'Building plan approval', 'No liens/disputes'] }
                    ];
                    checklist.innerHTML = `
                        <div class="checklist-header">
                            <h5>Personalized Checklist</h5>
                            <small>Auto-generated from your assessment.</small>
                        </div>
                        <div class="checklist-items-grid">
                            ${sections.map(sec => `
                                <div>
                                    <h5>${sec.t}</h5>
                                    ${sec.i.map(item => `<div class="checklist-item-row"><input type="checkbox"> <label>${item}</label></div>`).join('')}
                                </div>
                            `).join('')}
                        </div>`;
                }
            };
        } catch (e) { console.error(e); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSingleton);
    } else { setupSingleton(); }
})(); 

// Bootstrap Location Insights
(function(){
    function boot(){ try { new LocationInsights(); } catch(e){ console.error(e); } }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(); 

// Knowledge Hub: accordion + wizard opener
(function(){
	function initKnowledge(){
		// Accordion toggles
		document.querySelectorAll('.accordion-header').forEach(btn => {
			btn.addEventListener('click', () => {
				const expanded = btn.getAttribute('aria-expanded') === 'true';
				btn.setAttribute('aria-expanded', String(!expanded));
				const content = btn.parentElement.querySelector('.accordion-content');
				if (content) content.classList.toggle('open');
			});
		});
		// Wizard open from knowledge section
		const openBtn = document.getElementById('open-wizard-knowledge');
		if (openBtn && window.wizard && typeof window.wizard.open === 'function') {
			openBtn.addEventListener('click', (e) => { e.preventDefault(); window.wizard.open(); });
		} else if (openBtn) {
			openBtn.addEventListener('click', (e) => {
				e.preventDefault();
				const evt = new Event('click');
				document.getElementById('get-started-btn')?.dispatchEvent(evt);
			});
		}
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initKnowledge); else initKnowledge();
})();