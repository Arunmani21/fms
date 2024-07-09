const pagination = (page = 1, items = 5) => {
  const limit = +items;
  const newPage = +page;
  const offset = (newPage - 1) * limit;

  return { limit, offset };
};

module.exports = { pagination };
