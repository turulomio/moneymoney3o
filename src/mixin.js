import {
    arrayofintegers_to_stringofintegers,
    arrayobjects_to_array,
    localtime,
    id_from_hyperlinked_url,
    hyperlinked_url,
    ifnullempty,
    myheaders,
    myheaders_noauth,
    parseResponse,
    parseResponseError,
    listobjects_sum,
    listobjects_average_ponderated,
    parseNumber,
    myheaders_formdata,
    my_round,
    store,
    getConceptsForDividends,
    getInvestmentsActive,
    getInvestmentsByProduct,
    getOperationstypesForNewConcepts,
    getOperationstypesForInvestmentsOperations,
    getObjectByUrl,
    getObjectById,
    getObjectPropertyByUrl,
    getObjectPropertyById,
    getCurrencyByCode,
    getCurrencyPropertyByCode,
    currency_generic_string,
    getCountryNameByCode,
    currency_string,
    currency_html,
    percentage_string,
    percentage_generic_html,
    percentage_generic_string, 
    percentage_html,
    localcurrency_string,
    localcurrency_html,
    console_log
} from './my_commons.js'
  
import {
    zulu2date,
    date2zulu,
    amount_to_invest,
} from './functions.js'

import {
    RulesFloat,
    RulesDate,
    RulesDatetime,
    RulesEmail,
    RulesInteger,
    RulesPassword,
    RulesString,
    RulesSelection, 
    RulesFloatGZ, 
    RulesFloatGEZ, 
    RulesFloatLEZ, 
} from './rules.js'



const mixin = {
    data: function () {
        return {
        }
    },
    methods: {
        amount_to_invest,
        arrayofintegers_to_stringofintegers,
        arrayobjects_to_array,
        id_from_hyperlinked_url,
        hyperlinked_url,
        ifnullempty,
        localtime,
        myheaders,
        myheaders_noauth,
        my_round,
        myheaders_formdata,
        parseNumber,
        parseResponse,
        parseResponseError,
        zulu2date,
        date2zulu,
        listobjects_average_ponderated,
        listobjects_sum,
        RulesDate,
        RulesDatetime,
        RulesEmail,
        RulesFloat,
        RulesInteger,
        RulesPassword,
        RulesString,
        RulesSelection,
        RulesFloatGZ,
        RulesFloatGEZ,
        RulesFloatLEZ,
        store,
        currency_generic_string,
        getConceptsForDividends,
        getInvestmentsActive,
        getInvestmentsByProduct,
        getOperationstypesForNewConcepts,
        getOperationstypesForInvestmentsOperations,
        getObjectByUrl,
        getObjectById,
        getObjectPropertyByUrl,
        getObjectPropertyById,
        getCurrencyByCode,
        getCurrencyPropertyByCode,
        getCountryNameByCode,
        currency_string,
        currency_html,
        percentage_string,
        percentage_generic_html,
        percentage_generic_string, 
        percentage_html,
        localcurrency_string,
        localcurrency_html,
        console_log,

    }
  }

  
  

export default mixin