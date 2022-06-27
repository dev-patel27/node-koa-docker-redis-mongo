import { userModel } from "../models";

const userQuery = async (filter) => {
  let query = {
    $or: [{ name: filter.name }, { username: filter.username }],
  };
  filter = filter && filter.orQuery ? query : filter;
  return userModel.findOne(filter);
};

const userFindOneUpdateQuery = async (filter, update) => {
  let options = { new: true, fields: { password: 0 } };

  return userModel.findOneAndUpdate(filter, update, options);
};

const findAllQuery = async (query) => {
  let { search, _id, limit, page } = query;
  let whereClause = {};
  if (search) {
    search = new RegExp(search, "ig");
    whereClause = {
      $or: [{ username: search }, { name: search }],
    };
  }
  if (_id) {
    whereClause = { ...whereClause, _id };
  }
  const users = await userModel
    .find(whereClause, { password: 0 })
    .skip(page > 0 ? +limit * (+page - 1) : 0)
    .limit(+limit || 20);
  const totalCount = await userModel.find().countDocuments();
  return { users, totalCount };
};

const updateOneQuery = async (filter, update) => {
  return userModel.updateOne(filter, { $set: update });
};

export default {
  userQuery,
  userFindOneUpdateQuery,
  findAllQuery,
  updateOneQuery,
};
