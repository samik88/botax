/* Initital variables */
const name; //What is your name
const lastname; // What is your lastname
const isLastnameDiff; //Is your name is different than on SSN?
const address; //Your street addres
const city; //What is your city?
const state; //What is your state?
const zip; //What is your zipcode?
const paymentFrequency; /* How frequently are you paid? weekly, bi-weekly, monthly */
const hasMultipleJobs;  //Do you have more than 1 jobs?

const isMarried; //Are you married?
    const isFillingJointly; //if married? -> Are you filling jointly?
    const hasWorkingSpouse; //if married? -> Is your spouse working?
const numberOfKids;     //How many kids do you have? 0 by default 

const income_first; //First job income
    const income_second; // if married or hasmultiple jobs? -> Second job or spouse income. 0 by default.
 
const spending; //Are you spending more than 50% of you income to support home for yourself and your and dependents?

const numberOfOtherDependents; //Do you have other than kid dependents? 0 by default 
    const dependentCare; // if has kids or other dependents -> If you plan to spend more than 2000 on child care
const isDependent; //Can someone claim you as dependent?

/* Derived data */
const hasMultipleIncome = setMultipleIncome(hasWorkingSpouse, hasMultipleJobs); //If has multiple income: multiple job or working spouse
const isHeadOfHousehold = setHeadOfHousehold(isMarried, spending);
// const income = income_first + income_second; //Total household income

const total_allowances = calculateTotalAllowances(income_first, income_second, isMarried, numberOfKids, hasMultipleIncome, isDependent, numberOfOtherDependents, isHeadOfHousehold, dependentCare); //Total number of allowances calculated
const additional_amount; //Additional amount you can withheld from paychek. 0 by default.

if(shouldProceed) {
    calculateAdditionalAmount = calculateAdditionalAmount();
} else {
    calculateAdditionalAmount = 0;
}

function A(isDependent) {
    if(isDependent){
        return 0;
    } else {
        return 1;
    }
}
function B(isMarried, hasMultipleIncome, income_low) {
    /* Section B personal Allowances Worksheet page 1 */
    if (!hasMultipleIncome || income_low <= 1500) {
        return 1;
    } else {
        return 0;
    }
}
function C(isMarried, hasMultipleIncome) {
    /* Section C personal Allowances Worksheet page 1 */
    if (isMarried || hasMultipleIncome) {
        return 0;
    } else {
        return 1;
    }
}
function D(numberOfOtherDependents, numberOfKids) {
    return numberOfOtherDependents + numberOfKids;
}
function E(isHeadOfHousehold) {
    if(isHeadOfHousehold) {
        return 1;
    } else {
        return 0;
    }
}
function F(dependentCare) {
    if(dependentCare) {
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
function setHeadOfHousehold(isMarried, spending) {
    if(!isMarried && spending) {
        return true;
    } 
    return false;
}
function setMultipleIncome(hasWorkingSpouse, hasMultipleJobs) {
    return hasWorkingSpouse || hasMultipleJobs;
}
function calculateTotalAllowances(income_first, income_second, isMarried, numberOfKids, hasMultipleIncome, isDependent, numberOfOtherDependents, isHeadOfHousehold, dependentCare) {
    result += A(isDependent);
    result += B(isMarried, hasMultipleIncome, Math.min(income_first, income_second));
    result += C(isMarried, hasMultipleIncome);
    result += D(numberOfOtherDependents, numberOfKids);
    result += E(isHeadOfHousehold);
    result += F(dependentCare);
    result += G(income_first + income_second, numberOfKids, isMarried);

    return result;
}
function shouldProceed(hasMultipleIncome, income_first, income_second, isMarried) {
    if(hasMultipleIncome) {
        if(isMarried) {
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
function calculateAdditionalAmount(total_allowances, income_first, income_second, paymentFrequency, isMarried, isFillingJointly) {
    var lowest_paying_job = table1(Math.min(income_first, income_second), isFillingJointly);
    var highest_paying_job = table2(Math.max(income_first, income_second), isFillingJointly);

    if(isFillingJointly) {
        if(Math.max(income_first, income_second) <= 65000) {
            if(lowest_paying_job > 3) {
                lowest_paying_job = 3;
            }
        }    
    }

    if(total_allowances >= lowest_paying_job) {
        
    }

}
var Person = {
    name: name,
    lastname: lastname,
    address: address,
    city: city,
    state: state,
    zipcode: zipcode,
    isLastnameDiff: isLastnameDiff,
    total_allowances: total_allowances,
    additional_amount: additional_amount,
}

function table1(income, isFillingJointly) {
    var married = [7000, 14000, 22000, 27000, 35000, 44000, 55000, 65000, 75000, 80000, 95000, 115000, 130000, 140000, 150000];
    var single = [8000, 16000, 26000, 34000, 44000, 70000, 85000, 110000, 125000, 140000];
    var context;
    
    if(isMarried){
        context = married;
    } else {
        context = single;
    }

    for(var i = 0; i < context.length; i++) {
        if(income <= context[i]){
            return i;
        }
    }

    return context.length - 1;
}

function table2(income, isFillingJointly) {
    var married = [75000, 135000, 205000, 360000, 405000];
    var married_rate = [610, 1010, 1130, 1340, 1420, 1600];

    var single = [38000, 85000, 185000, 400000];
    var single_rate = [610, 1010, 1130, 1340, 1600];
    var context;
    var context_rate;
    
    if(isFillingJointly){
        context = married;
        context_rate = married_rate;
    } else {
        context = single;
        context_rate = single_rate;
    }

    for(var i = 0; i < context.length; i++) {
        if(income <= context[i]){
            return context_rate[i];
        }
    }

    return context_rate[context.length - 1];
}