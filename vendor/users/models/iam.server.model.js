/**
 * Module dependencies.
 */
const mongoose = require('mongoose');

const {
  Schema,
} = mongoose;

const IAMSchema = new Schema({
  iam: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  title: String,
  description: String,
  resource: String,
  permission: String,
  module: String,
  affectable: {
    type: Boolean,
    default: true,
    required: true,
  },
  system: {
    type: Boolean,
    default: false,
    required: true,
  },
  children: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'IAM',
    }],
    default: [],
  },
  excluded: {
    type: Boolean,
    default: false,
  },
  groups: {
    type: [{
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    }],
    default: [],
  },
}, {
  collection: 'iams',
});

IAMSchema.statics.getChildren = async function getChildren(ids = [], cache = []) {
  let list = ids
    // Convert all IDs to strings
    .map((id) => id.toString())
    // Remove dupplicated
    .filter((id, index, arr) => index === arr.indexOf(id))
    // Filter uncached IDs
    .filter((id) => {
      const found = cache.find((one) => one.id === id);
      return !found;
    });

  if (list.length === 0) {
    return cache;
  }

  list = await this.find({ _id: list });

  const children = list
    .map((iam) => iam.children)
    .filter(Boolean)
    .flat();

  list = cache.concat(list);

  if (children.length === 0) {
    return list;
  }

  list = await this.getChildren(children, list);

  return list;
};

const IAMModel = mongoose.model('IAM', IAMSchema);
IAMModel.createIndexes();

module.exports = IAMModel;
