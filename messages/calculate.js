function calculate(obj) {

    /* Inititalizae variables */
    var name = obj.name; //What is your name
    var lastname = obj.lastname; // What is your lastname
    var isLastnameDiff = obj.isLastnameDiff ? 1 : 0; //Is your name is different than on SSN?
    var address = obj.address; //Your street addres
    var city = obj.city; //What is your city?
    var state = obj.state; //What is your state?
    var zip = obj.zip; //What is your zipcode?
    var paymentFrequency = obj.paymentFrequency; /* How frequently are you paid? weekly, bi-weekly, monthly */
    var hasMultipleJobs = obj.hasMultipleJobs; //Do you have more than 1 jobs?
    var isMarried = obj.isMarried; //Are you married?
    var isFilingJointly = obj.isFilingJointly; //if married? -> Are you filling jointly?
    var hasWorkingSpouse = obj.hasWorkingSpouse; //if married? -> Is your spouse working?
    var numberOfKids = obj.numberOfKids; //How many kids do you have? 0 by default 
    var income_first = obj.income_first; //First job income
    var income_second = obj.income_second; // if married or hasmultiple jobs? -> Second job or spouse income. 0 by default.
    var spending = obj.spending; //Are you spending more than 50% of you income to support home for yourself and your and dependents?
    var numberOfOtherDependents = obj.numberOfOtherDependents; //Do you have other than kid dependents? 0 by default 
    var dependentCare = obj.dependentCare; // if has kids or other dependents -> If you plan to spend more than 2000 on child care
    var isDependent = obj.isDependent; //Can someone claim you as dependent?

    /* Derived data */
    var hasMultipleIncome = setMultipleIncome(hasWorkingSpouse, hasMultipleJobs); //If has multiple income: multiple job or working spouse
    var isHeadOfHousehold = setHeadOfHousehold(isMarried, spending);
    // var income = income_first + income_second; //Total household income

    var total_allowances = 0; //Total number of allowances calculated
    var additional_amount = 0; //Additional amount you can withheld from paychek. 0 by default.

    calculateTotalAllowances(
        income_first,
        income_second,
        isMarried,
        numberOfKids,
        hasMultipleIncome,
        isDependent,
        numberOfOtherDependents,
        isHeadOfHousehold,
        dependentCare
    );

    if (shouldProceed(hasMultipleIncome, income_first, income_second, isMarried)) {
        calculateAdditionalAmount(total_allowances, income_first, income_second, paymentFrequency, isMarried, isFilingJointly);
    }

    return {
        name: name,
        lastname: lastname,
        address: address,
        city: [city, state, zip].join(", "),
        filingStatus: filingStatus(isMarried, isFilingJointly),
        isLastnameDiff: isLastnameDiff,
        total_allowances: total_allowances,
        additional_amount: additional_amount
    };

    function setHeadOfHousehold(isMarried, spending) {
        if (!isMarried && spending) {
            return true;
        }
        return false;
    }

    function setMultipleIncome(hasWorkingSpouse, hasMultipleJobs) {
        return hasWorkingSpouse || hasMultipleJobs;
    }

    function A(isDependent) {
        if (isDependent) {
            return 0;
        } else {
            return 1;
        }
    }

    function B(isMarried, hasMultipleIncome, income_low) {
        if (!hasMultipleIncome || income_low <= 1500) {
            return 1;
        } else {
            return 0;
        }
    }

    function C(isMarried, hasMultipleIncome) {
        if (!isMarried && !hasMultipleIncome) {
            return 0;
        } else {
            return 1;
        }
    }

    function D(numberOfOtherDependents, numberOfKids) {
        return numberOfOtherDependents + numberOfKids;
    }

    function E(isHeadOfHousehold) {
        if (isHeadOfHousehold) {
            return 1;
        } else {
            return 0;
        }
    }

    function F(dependentCare) {
        if (dependentCare) {
            return 1;
        } else {
            return 0;
        }
    }

    function G(income, numberOfKids, isMarried) {
        /* Section G personal Allowances Worksheet page 1. 
        Child Tax Credit Calculation */
        var taxCredit = 0;

        if (isMarried) {
            if (income < 100000) {
                taxCredit = numberOfKids * 2;
                if (numberOfKids >= 2 && numberOfKids <= 4) {
                    taxCredit -= 1;
                }
                if (numberOfKids >= 5) {
                    taxCredit -= 2;
                }
            } else if (income < 119000) {
                taxCredit = numberOfKids;
            }
        } else {
            if (income < 70000) {
                taxCredit = numberOfKids * 2;
                if (numberOfKids >= 2 && numberOfKids <= 4) {
                    taxCredit -= 1;
                }
                if (numberOfKids >= 5) {
                    taxCredit -= 2;
                }
            } else if (income < 84000) {
                taxCredit = numberOfKids;
            }
        }

        return taxCredit;
    }

    function setTotalAllowances(new_amount) {
        total_allowances = new_amount;
    }

    function calculateTotalAllowances(income_first, income_second, isMarried, numberOfKids, hasMultipleIncome, isDependent, numberOfOtherDependents, isHeadOfHousehold, dependentCare) {
        var result = 0;
        result += A(isDependent);
        result += B(isMarried, hasMultipleIncome, Math.min(income_first, income_second));
        result += C(isMarried, hasMultipleIncome);
        result += D(numberOfOtherDependents, numberOfKids);
        result += E(isHeadOfHousehold);
        result += F(dependentCare);
        result += G(income_first + income_second, numberOfKids, isMarried);

        setTotalAllowances(result);
    }

    function shouldProceed(hasMultipleIncome, income_first, income_second, isMarried) {
        if (hasMultipleIncome) {
            if (isMarried) {
                if (income_first + income_second > 20000) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (income_first + income_second > 50000) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    function setAdditionalAmount(new_amount) {
        additional_amount = new_amount;
    }

    function numberOfLeftPayments(paymentFrequency) {
        Date.prototype.getWeek = function () {
            var target = new Date(this.valueOf());
            var dayNr = (this.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            var firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() != 4) {
                target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);
            }
            return 1 + Math.ceil((firstThursday - target) / 604800000);
        };

        var todayWeek = new Date();
        var left_week = 52 - todayWeek.getWeek();
        return left_week / paymentFrequency;
    }

    function calculateAdditionalAmount(total_allowances, income_first, income_second, paymentFrequency, isMarried, isFilingJointly) {
        var lowest_paying_job = table1(Math.min(income_first, income_second), isFilingJointly);
        var highest_paying_job = table2(Math.max(income_first, income_second), isFilingJointly);

        if (isFilingJointly) {
            if (Math.max(income_first, income_second) <= 65000) {
                if (lowest_paying_job > 3) {
                    lowest_paying_job = 3;
                }
            }
        }

        if (total_allowances >= lowest_paying_job) {
            setTotalAllowances(total_allowances - lowest_paying_job);
            return;
        } else {
            setTotalAllowances(0);
        }

        var line6 = lowest_paying_job - total_allowances;
        var additiona_annual_withholding = line6 * highest_paying_job;
        var numberOfPayments = numberOfLeftPayments(paymentFrequency);
        setAdditionalAmount(Math.ceil(additiona_annual_withholding / numberOfPayments));

    }

    function filingStatus(isMarried, isFilingJointly) {
        if (!isMarried) {
            return 0;
        } else {
            if (isFilingJointly) {
                return 1;
            } else {
                return 2;
            }
        }
    }

    function table1(income, isFilingJointly) {
        var married = [7000, 14000, 22000, 27000, 35000, 44000, 55000, 65000, 75000, 80000, 95000, 115000, 130000, 140000, 150000];
        var single = [8000, 16000, 26000, 34000, 44000, 70000, 85000, 110000, 125000, 140000];
        var context;

        if (isMarried) {
            context = married;
        } else {
            context = single;
        }

        for (var i = 0; i < context.length; i++) {
            if (income <= context[i]) {
                return i;
            }
        }

        return context.length - 1;
    }

    function table2(income, isFilingJointly) {
        var married = [75000, 135000, 205000, 360000, 405000];
        var married_rate = [610, 1010, 1130, 1340, 1420, 1600];

        var single = [38000, 85000, 185000, 400000];
        var single_rate = [610, 1010, 1130, 1340, 1600];
        var context;
        var context_rate;

        if (isFilingJointly) {
            context = married;
            context_rate = married_rate;
        } else {
            context = single;
            context_rate = single_rate;
        }

        for (var i = 0; i < context.length; i++) {
            if (income <= context[i]) {
                return context_rate[i];
            }
        }

        return context_rate[context.length - 1];
    }

}

// var P = {
//  name: "Mehdi",
//  lastname: "Ahmadov",
//  isLastnameDiff: true,
//  address: "3200 zanker",
//  city: "San Jose",
//  state: "CA",
//  zip: "12312",
//  paymentFrequency: 2,
//  hasMultipleJobs: false,
//  isMarried: true,
//  isFillingJointly: true,
//  hasWorkingSpouse: true,
//  numberOfKids: 2,
//  income_first: 150000,
//  income_second: 1000,
//  spending: false,
//  numberOfOtherDependents: 0,
//  dependentCare: false,
//  isDependent: false
// }

// console.log(calculate(P));

export default calculate;