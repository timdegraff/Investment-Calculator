<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Investment Calculator</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        <!-- Styles / Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-gray-50 dark:bg-gray-900">
        <div class="container mx-auto p-4 sm:p-6 lg:p-8">
            <div class="max-w-4xl mx-auto">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div class="p-6 sm:p-8">
                        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Investment Calculator</h1>
                        <p class="text-gray-600 dark:text-gray-400 mb-8">Estimate the future value of your investments with our easy-to-use calculator.</p>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div class="space-y-6">
                                <div>
                                    <label for="birthYear" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Birth Year</label>
                                    <input type="number" id="birthYear" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="1990">
                                </div>
                                <div>
                                    <label for="initialInvestment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Investment ($)</label>
                                    <input type="number" id="initialInvestment" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="1000">
                                </div>
                                <div>
                                    <label for="monthlyContribution" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Contribution ($)</label>
                                    <input type="number" id="monthlyContribution" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="500">
                                </div>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <label for="retirementAge" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retirement Age</label>
                                    <input type="number" id="retirementAge" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="65">
                                </div>
                                <div>
                                    <label for="investmentGrowthRate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Growth Rate (%)</label>
                                    <input type="number" id="investmentGrowthRate" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="7">
                                </div>
                                <div>
                                    <label for="inflationRate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inflation Rate (%)</label>
                                    <input type="number" id="inflationRate" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="3">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6">
                         <canvas id="investmentChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
