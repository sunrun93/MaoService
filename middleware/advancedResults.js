const advancedResults = (model, populate) => async(req, res, next) => {
    console.log(req.query);
    // Copy request query 
    const reqQuery = {...res.query };

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop the removedFields and delete them from reqQuery
    removeFields.forEach(field => delete reqQuery[field])

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $lt, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    // {{env}}/api/v1/{modeName}?count[gt]=1000

    // Finding resource
    let query = model.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort fields
    if (req.query.sort) {
        const fields = req.query.sort.split(',').join(' ');
        query = query.sort(fields);
    } else {
        query = query.sort('-name');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20; // count for each page
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination reqult
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        data: results,
        pagination
    }

    next();
}

module.exports = advancedResults;