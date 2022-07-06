# Sequelize Qquery Parser

Accept query parameters in express or similar libraries and convert them into syntax easily recognised by the [Sequelize Library](https://sequelize.org/). Useful for when building quick and simple API's for accepting varied user queries and searches.

## Features

* Handles basic operations to build queries from query parameters.
* Basic pagination support to tag on `offset` and `limit` to your queries.
* Basic & Multiple-Column Sorting support. Query and sort your results by 1-or-more columns.
* Parses string input to integers, floats, booleans and dates.
* Accepts non-string values (though from express it will likely come through as a string type anyway).

### Operations

| operation                 | query string         | query object |
|---------------------------|----------------------|--------------|
| equal                     | `?foo=bar`           | `{ foo: "bar" }` |
| unequal                   | `?foo=!bar`          | `{ foo: { [Op.ne]: "bar" } }` |
| between                   | `?age=\|20\|30`      | `{ age: { [Op.gte]: 20, [Op.lte]: 30 }` 
| is null                   | `?foo=`              | `{ foo: { [Op.is]: null } }` |
| is not null               | `?foo=!`             | `{ foo: { [Op.not]: null } }` |
| greater than              | `?foo=>10`           | `{ foo: { [Op.gt]: 10 } }` |
| greater than or equal to  | `?foo=>=10`          | `{ foo: { [Op.gte]: 10 } }` |
| less than                 | `?foo=<10`           | `{ foo: { [Op.lt]: 10 } }` |
| less than or equal to     | `?foo=<=10`          | `{ foo: { [Op.lte]: 10 } }` |
| starts with               | `?foo=^bar`          | `{ foo: { [Op.startsWith]: "bar" } }` |
| ends with                 | `?foo=$bar`          | `{ foo: { [Op.endsWith]: "bar" } }` |
| contains                  | `?foo=~bar`          | `{ foo: { [Op.like]: '%bar%' } }` |
| in array                  | `?foo=$inbar\|baz`   | `{ foo: { [Op.in]: ['bar', 'baz'] }}` |
| not in array              | `?foo=$nin!bar\|baz` | `{ foo: { [Op.notIn]: ['bar', 'baz'] }}` |

_You can see the configuration section to see how the operations can be configured_

_**Note:** I use `[Op.gte]` & `[Op.lte]` instead of `[Op.between]` to handle dates and other types better. I will investigate if the latter is a better option._

### Pagination

This library contains some basics for parsing pagination and setting default values. There is checks in place to ensure no negative pages are set and also that not *too many* records are pulled down. The `default maximum page size is 100` but this can be configured in the options. You can also omit `page` and `limit` from the parameters and no paging will take place. Though, setting 1 or both will have an effect or enabling pagination.

| Param name | Default Value |
|------------|---------------|
| page | 1 |
| limit | 25 |

_You can see the configuration section to see how to adjust defaults for parameters_

### Sorting

You can also configure your options to sort the results of your query by 1 or more columns.

| operation                  | query string         | query object |
|----------------------------|----------------------|--------------|
| single column in asc       | `?sort=name`         | `order: [ [ 'name', 'ASC' ] ]` |
| single column in desc      | `?sort=!name`        | `order: [ [ 'name', 'DESC' ] ]` |
| multiple columns           | `?sort=age\|name`    | `order: [ [ 'age', 'ASC' ], [ 'name', 'ASC' ] ]` |
| multiple columns with desc | `?sort=age\|!name`   | `order: [ [ 'age', 'ASC' ], [ 'name', 'DESC' ] ]` |

## Install

> Please not that you will need [Sequelize](https://www.npmjs.com/package/sequelize) for this to work.

```
npm i --save sequelize
npm i --save sequelizeqp
```

## How to Use

```javascript
const SequelizeQS = require('sequelizeqp');
const sequelizeParser = SequelizeQS();
```

### Configuration Options

You can pass additional configuration options into the constructor for the parser. This will change how the parser operations. **This is currently pretty experimental and does not have all the options available. You should be cautious with the order of operations otherwise you might get some unintended results!**

| property               | decription                                                                   | default |
|------------------------|------------------------------------------------------------------------------|--------------|
| ops                    | The available operations.                                                    | `['$in', '$nin', '$', '!', '\|', '^', '~', '>=', '>', '<=', '<']` |
| defaultPaginationLimit | Limit to default too when no limit is set or maximum size has been exceeded. | `25` |
| maximumPageSize        | The maximum page size allowed.                  | `100` |

### Parse

`fetch me the first page of 25 where the age of the customer is between 20 & 30 and the order total is more or equal to £100`

```javascript
var parser = SequelizeQS();
var query = parser.parse({
    page: 1,
    limit: 25,
    age: '|20|30',
    orderTotal: '>=100'
});

// if using express:
// var query = parser.parse(req.query);

await models.customers.findAll(query);
```

## Why build this Library?

There is a lot of questions out there that point to a libary like this being desired. However, equally there is calls that a library like this should not be required and to "put in the work" for each of your queries. Recently, I've found myself building small API's in express with MongoDB that included a react front-end in a CRM style front-end/web-application. There is a great small library for processing parameters into a mongoose query [here](https://www.npmjs.com/package/mongo-querystring) that I drew a lot of inspiration from. I found myself working with MySQL and Sequelize and could not find a library to do the queries I needed, so to save time now and in the future, I built this library for myself. Sharing is caring, so I want to make this library publicly available for anyone else who is seeking a solution like this.

## Future of the Library (Roadmap)

This library was primarily built for myself when building multiple small API's and finding myself duplicating the code for querying & pagination. I do have plans to extend some of the features to include more complex AND & OR operations, though this might take time for me to complete. Feel free to fork and submit a PR if you want to contribute to these features.

Some features that I have thought about but not necessarily implemented include;

* complex queries with AND & OR operators.
* white & blacklist for specific parameter names.
* custom functions that execute when a specific parameter is included.
* advanced sorting by functions (e.g. ordering by max(age))

## Collaborators

Collaborating in a significant way will get you added to the collaborators list with higher access to make commits/changes.

* Stuart Harrison - [@stuartaharrison](https://www.stuart-harrison.com/)

## Licence

This project is licenced under the [GNU GPLv3](https://raw.githubusercontent.com/stuartaharrison/sequelize-query-parser/main/LICENSE) licence. Primarily to enable full-oper source and contribution but to keep closed sources from being generated.