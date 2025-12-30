import './bootstrap';
import Chart from 'chart.js/auto';
import { initializeApp } from "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";
import { firebaseConfig } from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Firebase initialization
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const calculatorDataRef = doc(db, "calculator", "data");

    const birthYearInput = document.getElementById('user-birth-year'); // Corrected ID
    const retirementAgeInput = document.getElementById('input-retAge'); // Corrected ID
    const stockGrowthRateInput = document.getElementById('input-stockGrowth');
    const reAppreciationInput = document.getElementById('input-reAppreciation');
    const inflationRateInput = document.getElementById('input-inflation');
    const drawEarlyInput = document.getElementById('input-drawEarly');


    const investmentChartCanvas = document.getElementById('growthChart'); // Corrected ID
    let investmentChart;

    // Load data from Firestore
    async function loadData() {
        try {
            const docSnap = await getDoc(calculatorDataRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                birthYearInput.value = data.birthYear || '';
                retirementAgeInput.value = data.retAge || '';
                stockGrowthRateInput.value = data.stockGrowth || '';
                reAppreciationInput.value = data.reAppreciation || '';
                inflationRateInput.value = data.inflationRate || '';
                drawEarlyInput.value = data.drawEarly || '';

                // Update slider displays
                document.getElementById('val-stockGrowth').innerText = stockGrowthRateInput.value + '%';
                document.getElementById('val-reAppreciation').innerText = reAppreciationInput.value + '%';
                document.getElementById('val-inflation').innerText = inflationRateInput.value + '%';
                document.getElementById('val-drawEarly').innerText = drawEarlyInput.value + '%';
                
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
        const initialInvestment = 0; // These will come from other tabs now
        const monthlyContribution = 0; // These will come from other tabs now
        const retirementAge = parseInt(retirementAgeInput.value) || 65;
        const investmentGrowthRate = parseFloat(stockGrowthRateInput.value) || 7;
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
                retAge: retirementAgeInput.value,
                stockGrowth: stockGrowthRateInput.value,
                reAppreciation: reAppreciationInput.value,
                inflation: inflationRateInput.value,
                drawEarly: drawEarlyInput.value
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

    [birthYearInput, retirementAgeInput, stockGrowthRateInput, reAppreciationInput, inflationRateInput, drawEarlyInput].forEach(input => {
        input.addEventListener('input', autoSave);
    });

    // Initial load
    await loadData();
    calculateAndDisplayResults();
});
