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
        // check and configure all the options are okay
        this.opt = options || {}

        if (!this.opt.ops || !Array.isArray(this.opt.ops)) {
            this.opt.ops = Object.keys(this.#opMaps);
        }

        if (!this.opt.alias || typeof(this.opt.alias) !== 'object') {
            this.opt.alias = {};
        }

        if (!this.opt.blacklist || !Array.isArray(this.opt.blacklist)) {
            this.opt.blacklist = [];
        }

        if (!this.opt.customHandlers || typeof(this.opt.customHandlers) !== 'object') {
            this.opt.customHandlers = {};
        }

        if (!this.opt.defaultPaginationLimit || isNaN(this.opt.defaultPaginationLimit)) {
            this.opt.defaultPaginationLimit = 25;
        }

        if (!this.opt.maximumPageSize || isNaN(this.opt.maximumPageSize)) {
            this.opt.maximumPageSize = 100;
        }

        if (!this.opt.dateFields || !Array.isArray(this.opt.dateFields)) {
            this.opt.dateFields = ['createdAt', 'updatedAt'];
        }

        if (!this.opt.dateOnlyCompare || typeof(this.opt.dateOnlyCompare) !== 'boolean') {
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
        const { defaultPaginationLimit, maximumPageSize } = this.opt;

        let realPage = page || 1;
        let realLimit = limit || defaultPaginationLimit;

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
            if (isNaN(realLimit) || realLimit < 1 || (maximumPageSize && realLimit > maximumPageSize)) {
                realLimit = defaultPaginationLimit;
            }
        }
        catch {
            realLimit = defaultPaginationLimit;
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
        let columns = Object.keys(properties);
        const { alias, blacklist, customHandlers, ops } = this.opt;

        for (const column of columns) {
            let key = alias[column] || column; // handles an alias
            let value = properties[column];

            // check the blacklist
            if (blacklist.some(el => el === key)) {
                break;
            }

            // TODO: do we need to check for whitelist & let more dangerous query run?

            // handles a custom function when we want to override the base functionality
            if (customHandlers[key] && typeof(customHandlers[key]) === 'function') {
                // call the custom handler function and get the operation to apply
                let customOperation = customHandlers[key](key, value, this.opt);
                where = {
                    ...where,
                    ...customOperation
                };

                break;
            }

            // handle when no value is supplied (e.g. `?maxAge=`)
            if (!value || value.length === 0 || (typeof(value) === 'string' && value.toLowerCase() === 'null')) {
                let { operation } = handleBasicComparator('is', key, null, this.opt);
                where = {
                    ...where,
                    [key]: operation
                };

                break;
            }

            // handle when a NOT value is supplied (so when not null sort of a thing) (e.g. `?maxAge=!` or `?maxAge=!null`)
            if (typeof(value) === 'string' && (value === '!' || value.toLowerCase() === '!null')) {
                let { operation } = handleBasicComparator('is not', key, null, this.opt);
                where = {
                    ...where,
                    [key]: operation
                };

                break;
            }

            // check if we have an operator to handle a special type (not a basic `=` equals basically)
            if (typeof(value) === 'string' && ops.some(op => value.startsWith(op))) {
                let op = ops.find(op => value.startsWith(op));
                let fn = this.#opMaps[op];

                if (!fn || !typeof (fn) === 'function') {
                    throw 'Operation is not a function';
                }
                
                let { operation } = fn(op, key, value, this.opt);
                where = {
                    ...where,
                    [key]: operation
                };

                break;
            }

            // finally, we will just default to the basic equals operation
            let { operation } = handleBasicComparator('=', key, value, this.opt);
            where = {
                ...where,
                [key]: operation
            };
        }

        return where;
    }
}

module.exports = SequelizeQS;