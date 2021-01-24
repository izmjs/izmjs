const { model, Types } = require('mongoose');

exports.sanitizeQuery = (modelName) => {
  const Model = model(modelName);
  /**
   * Sanitize the query
   * @controller Sanitize Query
   * @param {import('express').Request} req The request
   * @param {import('express').Response} res The response
   * @param {Function} next Go to the next middleware
   */
  return async function sanitizeQuery(req, res, next) {
    const { $expand = '', $select = '' } = req.query;

    let { $filter } = req.query;

    if (typeof $filter === 'string') {
      try {
        $filter = JSON.parse($filter);
      } catch (e) {
        $filter = {};
      }
    } else if (!$filter || typeof $filter !== 'object') {
      $filter = {};
    }

    req.$query = Model.find($filter).select(
      $select
        .split(',')
        .map((attr) => attr.trim())
        .filter(Boolean)
        .join(' '),
    );

    $expand
      .split(',')
      .map((attr) => attr.trim())
      .filter(Boolean)
      .forEach((attr) => req.$query.populate(attr));

    next();
  };
};

/**
 * List all entities
 * @controller List
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.list = (modelName) => {
  const Model = model(modelName);

  /**
   * Sanitize the query
   * @controller Sanitize Query
   * @param {import('express').Request} req The request
   * @param {import('express').Response} res The response
   * @param {Function} next Go to the next middleware
   */
  return async function list(req, res, next) {
    let { $query } = req;
    const { query } = req;
    const { $top: top = 10, $skip: skip = 0 } = query;

    if (!$query) {
      $query = Model.find({});
    }

    try {
      const result = await $query.paginate({ top, skip });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  };
};

exports.create = (modelName) => {
  const Model = model(modelName);
  /**
   * Create new entity
   * @controller Create
   * @param {import('express').Request} req The request
   * @param {import('express').Response} res The response
   * @param {Function} next Go to the next middleware
   */
  return async function create(req, res, next) {
    const { body } = req;
    const entity = new Model(body);

    try {
      const result = await entity.save({ new: true });
      return res.status(201).json(result);
    } catch (e) {
      return next(e);
    }
  };
};

/**
 * Get a specific entity
 * @controller Get one
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.getOne = async function getOne(req, res) {
  const { entity } = req;
  return res.json(entity);
};

/**
 * Get a specific entity
 * @controller Get one
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.removeOne = async function removeOne(req, res, next) {
  const { entity } = req;
  try {
    await entity.remove();
    return res.status(204).end();
  } catch (e) {
    return next(e);
  }
};

/**
 * Get a specific entity
 * @controller Get one
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.updateOne = async function updateOne(req, res, next) {
  const { entity, body } = req;
  try {
    entity.set(body);
    const result = await entity.save({ new: true });
    return res.json(result);
  } catch (e) {
    return next(e);
  }
};

exports.getById = (modelName) => {
  const Model = model(modelName);
  /**
   * Get entity by ID
   * @controller GetById
   * @param {import('express').Request} req The request
   * @param {import('express').Response} res The response
   * @param {Function} next Go to the next middleware
   */
  async function getById(req, res, next, id) {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: req.t('INVALID_ENTITY_ID', {
          id,
          modelName,
        }),
      });
    }

    let entity;
    const { $filter = '' } = req.query;

    try {
      entity = await Model
        .findById(id)
        .select(
          $filter
            .map(attr => attr.trim())
            .filter(Boolean)
            .join(' '),
        );
    } catch (e) {
      return next(e);
    }

    if (!entity) {
      return res.status(404).send({
        message: req.t('ENTITY_NOT_FOUND', {
          id,
          modelName,
        }),
      });
    }

    req.entity = entity;
    return next();
  };

  return getById;
};

/**
 * @decorator
 * @param {'$filter' | 'body'} type The type of the object to mutate
 * @param {object} payload The payload
 * @param {boolean} isMerge true to merge with the existing payload, false otherwise
 * @returns {Function} The middleware
 */
exports.set = (type = '$filter', payload = {}, isMerge = false) =>
  /**
   * Sets an object of the request
   * @controller Set
   * @param {import('express').Request} req The request
   * @param {import('express').Response} res The response
   * @param {Function} next Go to the next middleware
   */
  function set(req, res, next) {
    let { body } = req;
    let { $filter = {} } = req.query;

    switch (type) {
      case '$filter':
        if (typeof $filter === 'string') {
          try {
            $filter = JSON.parse($filter);
          } catch (e) {
            $filter = payload;
          }
        } else if (!$filter || typeof $filter !== 'object') {
          $filter = payload;
        }

        if (isMerge === true) {
          $filter = Object.assign($filter, payload);
        } else {
          $filter = payload;
        }

        break;
      case 'body':
        if (!body || typeof body !== 'object') {
          body = payload;
        }

        if (isMerge === true) {
          body = Object.assign(body, payload);
        } else {
          body = payload;
        }
        break;
      default:
        break;
    }

    return next();
  };
