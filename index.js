'use strict';
const { 
    handleBasicComparator,
    handleBetweenOperation,
    handleInComparator
} = require('./operations');

class SequelizeQS {
    #opMaps = {
        '$in': handleInComparator, 
        '$nin': handleInComparator, 
        '$': handleBasicComparator, 
        '!': handleBasicComparator, 
        '|': handleBetweenOperation, 
        '^': handleBasicComparator, 
        '~': handleBasicComparator, 
        '>=': handleBasicComparator, 
        '>': handleBasicComparator, 
        '<=': handleBasicComparator, 
        '<': handleBasicComparator
    };

    constructor(options) {
        this.opt = options || {}
        this.ops = this.opt.ops || Object.keys(this.#opMaps);
        this.defaultPaginationLimit = this.opt.defaultPaginationLimit || 25;
        this.maximumPageSize = this.opt.maximumPageSize || 100;

        if (!this.opt.dateFields) {
            this.opt.dateFields = ['createdAt', 'updatedAt'];
        }

        if (!(typeof(this.opt.dateOnlyCompare) === 'boolean')) {
            this.opt.dateOnlyCompare = false;
        }
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

    #parseWhereProperties(properties) {
        let where = {};
        Object.keys(properties).forEach((k) => {
            let key = k;
            let value = properties[key];

            // check we have an actual value set here
            if (!value 
                || value.length === 0 
                || (
                    typeof (value) === 'string' 
                    && value.toLowerCase() === 'null'
                )) {
                // checks the value to see if it is null
                let { operation } = handleBasicComparator('is', key, null, this.opt);
                value = operation;
            }
            else if (typeof (value) === 'string') {
                if (value === '!' || value.toLowerCase() === '!null') {
                    // checks to see if the field IS NOT NULL
                    let { operation } = handleBasicComparator('is not', key, null, this.opt);
                    value = operation;
                }
                else if (this.ops.some(op => value.startsWith(op))) {
                    let op = this.ops.find(op => value.startsWith(op));
                    let fn = this.#opMaps[op];

                    if (!fn || !typeof (fn) === 'function') {
                        throw 'Operation is not a function';
                    }
                    
                    const { operation } = fn(op, key, value, this.opt);
                    value = operation;
                }
                else {
                    // this is just a straight up value/equals key-value pair
                    let { operation } = handleBasicComparator('=', key, value, this.opt);
                    value = operation;
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