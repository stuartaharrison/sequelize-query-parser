const { DataTypes } = require('sequelize');

const isColumnDateField = (column, options, model = null) => {
    let dateFields = options.dateFields && Array.isArray(options.dateFields)
        ? options.dateFields
        : [];

    if (dateFields.some(el => el === column)) {
        return true;
    }

    // TODO: finish passing in the model and checking that way
    if (model && model.tableAttributes[column].type.constructor.key === DataTypes.DATE) {
        return true;
    }

    return false;
};

const isDate = (value) => {
    return value && typeof value.getMonth === 'function' && !isNaN(value.getMonth());
};

module.exports = {
    isColumnDateField,
    isDate
};