'use strict';
const { Op } = require('sequelize');

class SequelizeQS {
    constructor(options) {
        this.opt = options || {}
        this.ops = this.opt.ops || ['$in', '$nin', '$', '!', '|', '^', '~', '>=', '>', '<=', '<'];
        this.defaultPaginationLimit = this.opt.defaultPaginationLimit || 25;
        this.maximumPageSize = this.opt.maximumPageSize || 100;
    }

    parse(queryObj) {
        const { page, limit, sort, ...rest } = queryObj;

        // parse & build the where condition from the query object
        const where = this.#parseWhereProperties(rest);
        let retval = { where };

        // check the ordering
        if (sort) {
            var order = this.#parseSort(sort);
            retval['order'] = order;
        }

        // check if we are including some kind of pagination
        if (page || limit) {
            const pagination = this.#parsePagination(page, limit);
            retval['offset'] = ((pagination.page - 1) * pagination.limit);
            retval['limit'] = pagination.limit;
        }

        return retval;
    }

    #parseOperation(valueString) {
        // find the operation we are going to apply to this value
        // then strip the operation from the actual value we want to compare
        const op = this.ops.find((el) => valueString.startsWith(el));
        const strippedValue = valueString.substring(op.length);

        // parse the value correctly and then setup our return object that contains the parsed information
        const value = this.#parseToCorrectValueType(strippedValue);
        const retval = { op, value };

        // this flag helps adjust how the parsed object returning looks like
        // some where operations will be slightly more complex and require an object of operations instead of "field not in", etc
        let fieldIsOperation = true;
        switch (op) {
            case '$in':
                // IN array
                retval.field = Op.in;
                retval.value = strippedValue.split('|').map((e) => this.#parseToCorrectValueType(e));
                break;
            case '$nin':
                // NOT IN array
                retval.field = Op.notIn;
                retval.value = strippedValue.split('|').map((e) => this.#parseToCorrectValueType(e));
                break;
            case '$':
                // ends with
                retval.field = Op.endsWith;
                break;
            case '!':
                // unequal
                retval.field = Op.ne;
                break;
            case '|':
                // between a min & max value
                let aValue = strippedValue.split('|');
                let minValue = this.#parseToCorrectValueType(aValue[0]);
                let maxValue = this.#parseToCorrectValueType(aValue[1]);

                fieldIsOperation = false;
                retval.field = {
                    [Op.gte]: minValue,
                    [Op.lte]: maxValue
                };
                break;
            case '^':
                // starts with
                retval.field = Op.startsWith;
                break;
            case '~':
                // contains value
                retval.field = Op.like;
                retval.value = `%${retval.value}%`;
                break;
            case '>':
                // greater than
                retval.field = Op.gt;
                break;
            case '>=':
                // greater than or equal
                retval.field = Op.gte;
                break;
            case '<':
                // less than
                retval.field = Op.lt;
                break;
            case '<=':
                // less than or equal
                retval.field = Op.lte;
                break;
            default:
                // default to equals
                retval.field = Op.eq;
        }

        // setup the operation object structure that mongoose (and mongodb in general) is looking for
        if (fieldIsOperation === true) {
            retval.parsed = {};
            retval.parsed[retval.field] = retval.value;
        }
        else {
            retval.parsed = retval.field;
        }
        
        return retval;
    }

    #parsePagination(page, limit) {
        let realPage = page || 1;
        let realLimit = limit || this.defaultPaginationLimit;

        // prevent negative page number
        try {
            realPage = parseInt(page);
            if (isNaN(realPage) || realPage < 1) {
                realPage = 1;
            }
        }
        catch {
            realPage = 1;
        }

        // prevent negative limit value or trying to get too many
        try {
            realLimit = parseInt(limit);
            if (isNaN(realLimit) || realLimit < 1 || (this.maximumPageSize && realLimit > this.maximumPageSize)) {
                realLimit = this.defaultPaginationLimit;
            }
        }
        catch {
            realLimit = this.defaultPaginationLimit;
        }

        return { page: realPage, limit: realLimit };
    }

    #parseSort(sort) {
        let retval = [];
        let aSort = sort.split('|');

        for (var i = 0; i < aSort.length; i++) {
            console.log('aSort', aSort[i]);
            let value = aSort[i];
            let direction = value.startsWith('!') ? 'DESC' : 'ASC';

            if (value.startsWith('!')) {
                retval = [ ...retval, [ value.substring(1), direction ] ];
            }
            else {
                retval = [ ...retval, [ value, direction ] ];
            }
        }

        return retval;
    }

    #parseToCorrectValueType(value) {
        if (typeof (value) === 'string') {
            if (!value || value.length === 0 || value.toLowerCase() === 'null') {
                return null;
            }
            else if (value.toLowerCase() === 'false') {
                return false;
            }
            else if (value.toLowerCase() === 'true') {
                return true;
            }
            else if (!isNaN(value)) {
                return Number(value);
            }
            else if (new Date(value) !== "Invalid Date" && !isNaN(new Date(value))) {
                return new Date(value);
            }
            return value;
        }
        return value;
    }

    #parseWhereProperties(properties) {
        let where = {};

        Object.keys(properties).forEach((k) => {
            let key = k;
            let value = properties[key];

            // check we have an actual value set here
            if (!value || value.length === 0) {
                value = {
                    [Op.is]: null
                };
            }
            else if (typeof (value) === 'string') {
                if (value.toLowerCase() === 'null') {
                    // this means check if the value IS NULL
                    value = {
                        [Op.is]: null
                    };
                }
                else if (value === '!' || value.toLowerCase() === '!null') {
                    // checks to see if the field IS NOT NULL
                    value = {
                        [Op.not]: null
                    };
                }
                else if (this.ops.some(op => value.startsWith(op))) {
                    // checks to see if our value has a modifier to adjust the query in some way
                    let op = this.#parseOperation(value);
                    value = op.parsed;
                }
                else {
                    // this is just a straight up value/equals key-value pair
                    value = this.#parseToCorrectValueType(value);
                }
            }
            
            where = {
                ...where,
                [key]: value
            };
        });

        return where;
    }
}

module.exports = SequelizeQS;