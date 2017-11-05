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
    const numberOfKids;     //if married? -> How many kids do you have?

const income_first; //First job income
    const income_second; // if married or hasmultiple jobs? -> Second job or spouse income

const spending; //Are you spending more than 50% of you income to support home for yourself and your and dependents?

const numberOfOtherDependents; //Do you have other than kid dependents?
const dependentCare; // If you plan to spend more than 2000 on child care
const isDependent; //Can someone claim you as dependent?

/* Derived data */
const hasMultipleIncome = setMultipleIncome(hasWorkingSpouse, hasMultipleJobs); //If has multiple income: multiple job or working spouse
const isHeadOfHousehold = setHeadOfHousehold(isMarried, spending);
const income = income_first + income_second; //Total household income

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
function isHeadOfHousehold(isMarried, spending) {
    if(!isMarried && spending) {
        return true;
    } 
    return false;
}
function setMultipleIncome(hasWorkingSpouse, hasMultipleJobs) {
    return hasWorkingSpouse && hasMultipleJobs;
}