const formatDate = (date) => {
    var mm = date.getMonth() + 1;
    var dd = date.getDate();

    return [
        date.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};

const formatValue = (value) => {
    if (typeof (value) === 'string') {
        if (!value || value === null || value === undefined || value.length === 0 || value.toLowerCase() === 'null') {
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
};

module.exports = {
    formatDate,
    formatValue
};