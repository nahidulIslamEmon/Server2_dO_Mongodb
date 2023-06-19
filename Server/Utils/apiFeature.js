class ApiFeature {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.keyword ? {
      name: {
        $regex: this.queryStr.keyword,
        $options: 'i'
      }
    } : {}
    this.query = this.query.find({ ...keyword })
    return this;
  }

  filter() {
    /**
     * *normal filter by category name
     */
    const queryCopy = { ...this.queryStr }
    const fieldsToRemove = ['keyword', 'limit', 'page',]
    fieldsToRemove.forEach(field => delete queryCopy[field])

    /**
     * *filter for price and rating
     */
    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(/\b(gt|gte|lte|lt)\b/g, (key) => `$${key}`)

    this.query = this.query.find(JSON.parse(queryStr))
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1)

    this.query.limit(resultPerPage).skip(skip)
    return this;
  }

}


module.exports = ApiFeature;