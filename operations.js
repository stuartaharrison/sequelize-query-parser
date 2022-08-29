'use strict';
const { col, fn, Op, where } = require('sequelize');
const { isColumnDateField } = require('./comparer');
const { formatDate, formatValue } = require('./formatter');

const nonFormattingComparators = ['^', '$', '~'];
const comparatorMap = {
    '$in': Op.in,
    '$nin': Op.notIn,
    '=': Op.eq,
    '!': Op.ne,
    '!=': Op.ne,
    '<>': Op.ne,
    '>': Op.gt,
    '>=': Op.gte,
    '<': Op.lt,
    '<=': Op.lte,
    'is': Op.is,
    'is not': Op.not,
    '^': Op.startsWith,
    '$': Op.endsWith,
    '~': Op.substring
};

const handleBasicComparator = (operationStr, column, value, options) => {
    // check & strip if we have the comparator at the start
    console.log('VALUE', value);
    let strippedValue = (value && typeof(value) === 'string' && value.startsWith(operationStr))
        ? value.substring(operationStr.length)
        : value;

    // handle getting the value into the correct format
    // TODO: maybe tidy this up a litte? Make it more readable?
    let formattedValue = (nonFormattingComparators.some(el => el === operationStr)) 
        ? strippedValue
        : (isColumnDateField(column, options) && options.dateOnlyCompare === true) 
            ? formatDate(formatValue(strippedValue))
            : formatValue(strippedValue);

    // handle creating the correct operation
    let sequelizeOp = comparatorMap[operationStr];
    let operation = (isColumnDateField(column, options) && options.dateOnlyCompare === true)
        ? where(fn('date', col(column)), {
            [sequelizeOp]: formattedValue
        })
        : { [sequelizeOp]: formattedValue };

    return {
        op: operationStr,
        column,
        value: formattedValue,
        operation
    };
};

const handleBetweenOperation = (operationStr, column, value, options) => {
    // check & strip if we have the comparator at the start
    let strippedValue = (value && value.startsWith(operationStr))
        ? value.substring(operationStr.length)
        : value;

    // split the array so we can get the two values to compare on
    let splitValue = strippedValue.split('|');
    let formattedMinValue = formatValue(splitValue[0]);
    let formattedMaxValue = formatValue(splitValue[1]);

    // handle creating the correct operation for the date fields
    if (isColumnDateField(column, options) && options.dateOnlyCompare === true) {
        let dateMin = formatDate(formattedMinValue);
        let dateMax = formatDate(formattedMaxValue);

        return {
            op: operationStr,
            column,
            value: [dateMin, dateMax],
            operation: {
                [Op.and]: [
                    where(fn('date', col(column)), '>=', dateMin),
                    where(fn('date', col(column)), '<=', dateMax)
                ]
            }
        };
    }
    else {
        return {
            op: operationStr,
            column,
            value: [formattedMinValue, formattedMaxValue],
            operation: { [Op.between]: [formattedMinValue, formattedMaxValue] }
        };
    }
};

const handleInComparator = (operationStr, column, value, options) => {
    // check & strip if we have the comparator at the start
    let strippedValue = (value && value.startsWith(operationStr))
        ? value.substring(operationStr.length)
        : value;

    // handle getting the value into the correct format
    let formattedArray = strippedValue.split('|').map((e) => {
        let formattedValue = formatValue(e);
        return (isColumnDateField(column, options) && options.dateOnlyCompare === true)
            ? formatDate(formattedValue)
            : formattedValue;
    });

    // handle creating the correct operation
    let sequelizeOp = comparatorMap[operationStr];
    let operation = (isColumnDateField(column, options) && options.dateOnlyCompare === true)
        ? where(fn('date', col(column)), {
            [sequelizeOp]: formattedArray
        })
        : { [sequelizeOp]: formattedArray };

    
    return {
        op: operationStr,
        column,
        value: formattedArray,
        operation
    };
};

module.exports = {
    handleBasicComparator,
    handleBetweenOperation,
    handleInComparator
};