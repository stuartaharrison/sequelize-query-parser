const connect = require('./db');
const assert = require('assert');
const SequelizeQS = require('../index');

let models = null;
let sequelize = null;
let sequelizeQS = null;
let sequelizeDateQS = null;

before(async () => {
    sequelize = await connect();
    models = sequelize.models;
});

beforeEach(() => {
    sequelizeQS = new SequelizeQS();
    sequelizeDateQS = new SequelizeQS({
        dateOnlyCompare: true,
        dateFields: ['createdAt', 'updatedAt', 'lastLogin']
    });
});

describe('Basic Operations', () => {
    describe('Equal', () => {
        it('should return 0', async () => {
            let options = sequelizeQS.parse({
                lastLogin: '2022-05-28'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 0);
        });

        it('should return 2', async () => {
            let options = sequelizeQS.parse({
                age: '22'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });

        it('should check booleans', async () => {
            let options = sequelizeQS.parse({
                isActive: 'false'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 4);
        });

        it('should return 2 "null" last logged in', async () => {
            let options = sequelizeQS.parse({
                lastLogin: 'null'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });

        it('should be able to check to the decimal point', async () => {
            let options = sequelizeQS.parse({
                totalWealth: '10000.99'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 1);
        });
    });

    describe('Not Equal', () => {
        it('should return 8', async () => {
            let options = sequelizeQS.parse({
                age: '!22'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 8);
        });

        it('should check booleans', async () => {
            let options = sequelizeQS.parse({
                isActive: '!false'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 6);
        });

        it('should return 8 NOT "null" last logged in', async () => {
            let options = sequelizeQS.parse({
                lastLogin: '!null'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 8);
        });
    });

    describe('Between', () => {
        it('should return 4', async () => {
            let options = sequelizeQS.parse({
                age: '|20|30'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 4);
        });

        it('should return 3', async () => {
            let options = sequelizeQS.parse({
                lastLogin: '|2022-04-22|2022-06-12'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 3);
        });

        it('should be able to check to the decimal point', async () => {
            let options = sequelizeQS.parse({
                totalWealth: '|0|99.99'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 3);
        });
    });

    describe('Starts With', () => {
        it('should return 2', async () => {
            let options = sequelizeQS.parse({
                name: '^s'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });
    });

    describe('Ends With', () => {
        it('should return 3', async () => {
            let options = sequelizeQS.parse({
                name: '$a'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 3);
        });
    });

    describe('Contains', () => {
        it('should return 2', async () => {
            let options = sequelizeQS.parse({
                name: '~ab'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });
    });

    describe('Greater Than', () => {
        it('should return 4', async () => {
            let options = sequelizeQS.parse({
                lastLogin: '>2022-06-01'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 4);
        });
    });

    describe('Greater Than or Equal', () => {
        it('should return 4', async () => {
            let options = sequelizeQS.parse({
                lastLogin: '>=2022-06-12'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 4);
        });
    });

    describe('Less Than', () => {
        it('should return 2', async () => {
            let options = sequelizeQS.parse({
                lastLogin: '<2022-01-01'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });
    });

    describe('Less Than or Equal', () => {
        it('should return 4', async () => {
            let options = sequelizeQS.parse({
                lastLogin: '<=2022-06-01'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 4);
        });
    });

    describe('In Array', () => {
        it('should return 5', async () => {
            let options = sequelizeQS.parse({
                age: '$in18|19|20|22|31'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 5);
        });
    });

    describe('Not In Array', () => {
        it('should return 7', async () => {
            let options = sequelizeQS.parse({
                age: '$nin44|49|55'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 7);
        });
    });
});

describe('Operations - non String', () => {
    describe('Equal', () => {
        it('should return 2', async () => {
            let options = sequelizeQS.parse({
                age: 22
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });

        it('should check booleans', async () => {
            let options = sequelizeQS.parse({
                isActive: true
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 6);
        });

        it('should return 2 "null" last logged in', async () => {
            let options = sequelizeQS.parse({
                lastLogin: null
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });

        it('should be able to check to the decimal point', async () => {
            let options = sequelizeQS.parse({
                totalWealth: 10000.99
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 1);
        });
    });
});

describe('Operations - Date Only', () => {
    describe('Equal', () => {
        it('should return 3', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '2022-07-06'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 3);
        });
    });

    describe('Not Equal', () => {
        it('should return 5', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '!2022-07-06'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 5);
        });
    });

    describe('Between', () => {
        it('should return 2', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '|2022-05-10|2022-06-30'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });
    });

    describe('Starts With', () => {
        it('should return 2', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '^2021-'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 2);
        });
    });

    describe('Ends With', () => {
        it('should return 1', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '$-03'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 1);
        });
    });

    describe('Contains', () => {
        it('should return 3', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '~-07-'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 3);
        });
    });

    describe('In Array', () => {
        it('should return 5', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '$in2022-07-06|2021-11-03|2021-12-18'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 5);
        });
    });

    describe('Not In Array', () => {
        it('should return 3', async () => {
            let options = sequelizeDateQS.parse({
                lastLogin: '$nin2022-07-06|2022-05-28|2022-06-12'
            });
            let countResult = await models.customers.count(options);
            assert.equal(countResult, 3);
        });
    });
});

describe('Pagination', () => {
    // no limit defined
    describe('No Limits', () => {
        it('should return no results', async () => {
            let options = sequelizeQS.parse({ page: 2 });
            let customers = await models.customers.findAll(options);
            assert.equal(customers.length, 0);
        });

        it('should return all results', async () => {
            let options = sequelizeQS.parse({ page: 1 });
            let customers = await models.customers.findAll(options);
            assert.equal(customers.length, 10);
        });
    });

    // no page defined
    describe('No Page', () => {
        it('should return all results', async () => {
            let options = sequelizeQS.parse({ limit: 10 });
            let customers = await models.customers.findAll(options);
            assert.equal(customers.length, 10);
        });

        it('should return half the results', async () => {
            let options = sequelizeQS.parse({ limit: 5 });
            let customers = await models.customers.findAll(options);
            assert.equal(customers.length, 5);
        });
    });
});

describe('Sort', () => {
    it('standard single column sort ASC', async () => {
        let options = sequelizeQS.parse({ sort: 'name' });
        let customers = await models.customers.findAll(options);
        assert.equal(customers[0].name, 'Abbi Xanthia');
    });

    it('standard single column sort DESC', async () => {
        let options = sequelizeQS.parse({ sort: '!name' });
        let customers = await models.customers.findAll(options);
        assert.equal(customers[0].name, 'Topher Gage');
    });

    it('multiple sort', async () => {
        let options = sequelizeQS.parse({ sort: 'age|name' });
        let customers = await models.customers.findAll(options);
        assert.equal(customers[2].name, 'Gabby Fitz');
    });

    it('multiple sort', async () => {
        let options = sequelizeQS.parse({ sort: 'age|!name' });
        let customers = await models.customers.findAll(options);
        assert.equal(customers[2].name, 'Leesa Tex');
    });
});