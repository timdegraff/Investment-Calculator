import './bootstrap';
import Chart from 'chart.js/auto';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { firebaseConfig } from '../../firebase-config.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Firebase initialization
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const calculatorDataRef = doc(db, "calculator", "data");

    const birthYearInput = document.getElementById('birthYear');
    const initialInvestmentInput = document.getElementById('initialInvestment');
    const monthlyContributionInput = document.getElementById('monthlyContribution');
    const retirementAgeInput = document.getElementById('retirementAge');
    const investmentGrowthRateInput = document.getElementById('investmentGrowthRate');
    const inflationRateInput = document.getElementById('inflationRate');

    const investmentChartCanvas = document.getElementById('investmentChart');
    let investmentChart;

    // Load data from Firestore
    async function loadData() {
        try {
            const docSnap = await getDoc(calculatorDataRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                birthYearInput.value = data.birthYear || '';
                initialInvestmentInput.value = data.initialInvestment || '';
                monthlyContributionInput.value = data.monthlyContribution || '';
                retirementAgeInput.value = data.retirementAge || '';
                investmentGrowthRateInput.value = data.investmentGrowthRate || '';
                inflationRateInput.value = data.inflationRate || '';
                calculateAndDisplayResults();
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error getting document:", error);
        }
    }


    function calculateAndDisplayResults() {
        const birthYear = parseInt(birthYearInput.value) || new Date().getFullYear();
        const initialInvestment = parseFloat(initialInvestmentInput.value) || 0;
        const monthlyContribution = parseFloat(monthlyContributionInput.value) || 0;
        const retirementAge = parseInt(retirementAgeInput.value) || 65;
        const investmentGrowthRate = parseFloat(investmentGrowthRateInput.value) || 7;
        const inflationRate = parseFloat(inflationRateInput.value) || 3;

        const currentAge = new Date().getFullYear() - birthYear;
        const yearsToGrow = retirementAge - currentAge;
        const realGrowthRate = (1 + investmentGrowthRate / 100) / (1 + inflationRate / 100) - 1;

        let futureValue = initialInvestment;
        const chartData = [];
        const labels = [];

        for (let i = 0; i <= yearsToGrow; i++) {
            labels.push(new Date().getFullYear() + i);
            chartData.push(futureValue);
            futureValue = (futureValue * (1 + realGrowthRate)) + (monthlyContribution * 12);
        }

        if (investmentChart) {
            investmentChart.destroy();
        }

        investmentChart = new Chart(investmentChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Investment Growth (in today\'s dollars)',
                    data: chartData,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        ticks: {
                            callback: function(value, index, values) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    let debounceTimer;
    async function autoSave() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const data = {
                birthYear: birthYearInput.value,
                initialInvestment: initialInvestmentInput.value,
                monthlyContribution: monthlyContributionInput.value,
                retirementAge: retirementAgeInput.value,
                investmentGrowthRate: investmentGrowthRateInput.value,
                inflationRate: inflationRateInput.value,
            };
            try {
                await setDoc(calculatorDataRef, data, { merge: true });
                console.log("Document successfully written!");
            } catch (error) {
                console.error("Error writing document: ", error);
            }
        }, 500); // 500ms debounce
        calculateAndDisplayResults();
    }

    [birthYearInput, initialInvestmentInput, monthlyContributionInput, retirementAgeInput, investmentGrowthRateInput, inflationRateInput].forEach(input => {
        input.addEventListener('input', autoSave);
    });

    // Initial load
    await loadData();
    calculateAndDisplayResults();
});
