const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const ALLOWED_STATUS = ["available", "sold"];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback, fieldName, errors) => {
  if (value === undefined) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a positive integer`,
    });
    return fallback;
  }

  return parsedValue;
};

const parseNumericBound = (value, fieldName, errors) => {
  if (value === undefined) {
    return null;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a valid number`,
    });
    return null;
  }

  return parsedValue;
};

const buildVehicleFilters = (query = {}) => {
  const errors = [];
  const filters = {};

  const normalizedBrand = query.brand ? String(query.brand).trim() : "";
  const normalizedModel = query.model ? String(query.model).trim() : "";

  if (normalizedBrand) {
    filters.brand = {
      $regex: escapeRegex(normalizedBrand),
      $options: "i",
    };
  }

  if (normalizedModel) {
    filters.model = {
      $regex: escapeRegex(normalizedModel),
      $options: "i",
    };
  }

  if (query.status) {
    const normalizedStatus = String(query.status).trim().toLowerCase();

    if (!ALLOWED_STATUS.includes(normalizedStatus)) {
      errors.push({
        field: "status",
        message: "status must be either available or sold",
      });
    } else {
      filters.status = normalizedStatus;
    }
  }

  const yearMin = parseNumericBound(query.yearMin, "yearMin", errors);
  const yearMax = parseNumericBound(query.yearMax, "yearMax", errors);
  const priceMin = parseNumericBound(query.priceMin, "priceMin", errors);
  const priceMax = parseNumericBound(query.priceMax, "priceMax", errors);

  if (yearMin !== null || yearMax !== null) {
    filters.year = {};

    if (yearMin !== null) {
      filters.year.$gte = yearMin;
    }

    if (yearMax !== null) {
      filters.year.$lte = yearMax;
    }

    if (
      filters.year.$gte !== undefined &&
      filters.year.$lte !== undefined &&
      filters.year.$gte > filters.year.$lte
    ) {
      errors.push({
        field: "yearRange",
        message: "yearMin cannot be greater than yearMax",
      });
    }
  }

  if (priceMin !== null || priceMax !== null) {
    filters.price = {};

    if (priceMin !== null) {
      filters.price.$gte = priceMin;
    }

    if (priceMax !== null) {
      filters.price.$lte = priceMax;
    }

    if (
      filters.price.$gte !== undefined &&
      filters.price.$lte !== undefined &&
      filters.price.$gte > filters.price.$lte
    ) {
      errors.push({
        field: "priceRange",
        message: "priceMin cannot be greater than priceMax",
      });
    }
  }

  const page = parsePositiveInteger(query.page, DEFAULT_PAGE, "page", errors);
  const requestedLimit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT,
    "limit",
    errors
  );
  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);

  return {
    filters,
    pagination: {
      page,
      limit,
      skip: (page - 1) * limit,
    },
    errors,
  };
};

module.exports = buildVehicleFilters;
