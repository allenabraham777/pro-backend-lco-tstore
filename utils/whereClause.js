class WhereClause {
  constructor(base, unformattedQuery) {
    this.base = base;
    this.unformattedQuery = unformattedQuery;
  }

  search() {
    const searchWord = this.unformattedQuery.search
      ? {
          name: {
            $regex: this.unformattedQuery.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });
    return this;
  }

  filter() {
    let query = { ...this.unformattedQuery };
    delete query["search"];
    delete query["limit"];
    delete query["page"];

    let queryString = JSON.stringify(query);

    queryString = queryString.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (str) => `$${str}`
    );

    query = JSON.parse(queryString);

    this.base = this.base.find(query);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = 1;
    if (this.unformattedQuery.page) {
      currentPage = this.unformattedQuery.page;
    }

    const skipPage = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(skipPage);
    return this;
  }
}

module.exports = WhereClause;
