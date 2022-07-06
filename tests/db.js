const { DataTypes, Sequelize } = require('sequelize');

const customers = [
    { name: 'Leesa Tex', age: 22, totalWealth: 50, lastLogin: new Date('2022-07-06'), isActive: true },
    { name: 'Gabby Fitz', age: 22, totalWealth: 128.65, lastLogin: new Date('2022-07-06'), isActive: false  },
    { name: 'Malvina Al', age: 19, totalWealth: 79.01, lastLogin: new Date('2022-07-06'), isActive: false },
    { name: 'Topher Gage', age: 18, totalWealth: 12.50, lastLogin: null, isActive: true },
    { name: 'Percival Emery', age: 26, totalWealth: 697.02, lastLogin: new Date('2022-05-28'), isActive: true },
    { name: 'Rosalind Edmund', age: 31, totalWealth: 1024, lastLogin: new Date('2022-06-12'), isActive: false },
    { name: 'Sherlyn Axel', age: 44, totalWealth: 10000.99, lastLogin: new Date('2021-12-18'), isActive: false },
    { name: 'Satchel Veva', age: 49, totalWealth: 10001.12, lastLogin: new Date('2021-11-03'), isActive: true },
    { name: 'Eileen Myrna', age: 55, totalWealth: 760, lastLogin: new Date('2022-04-22'), isActive: true },
    { name: 'Abbi Xanthia', age: 27, totalWealth: 99999, lastLogin: null, isActive: true }
];

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

const connect = async () => {
    try {
        // connect to the sqlite database
        await sequelize.authenticate();

        // setup our test model
        let Customers = sequelize.define("customers", {
            name: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            age: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 18
            },
            totalWealth: {
                type: DataTypes.FLOAT(11, 2),
                allowNull: false,
                defaultValue: 0
            },
            lastLogin: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                defaultValue: null
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        });

        // seed the database
        await seedCustomers(Customers);

        return sequelize;
    }
    catch (err) {
        console.error('Unable to connect to the database: ', err);
        process.exit(1);
    }
};

const seedCustomers = async (Customers) => {
    // sync the changes to the model if required
    await Customers.sync({ force: true });

    // check to see if there is any records in the db or we need to seed additional users
    let customerCount = await Customers.count();
    if (customerCount === 0 || customerCount != customers.length) {
        await Customers.destroy({ truncate: true });
        for (var i = 0; i < customers.length; i++) {
            let customer = await Customers.create(customers[i]);
            await customer.save();
        }
    }
};

module.exports = connect;