import { userModel } from "../models";

const userQuery = (filter) => {
  let query = {
    $or: [
      { first_name: filter.first_name },
      { middle_name: filter.middle_name },
      { last_name: filter.last_name },
    ],
  };
  filter = filter && filter.orQuery ? query : filter;
  return userModel.findOne(filter);
};

const userFindOneUpdateQuery = (filter, update) => {
  let options = { new: true, fields: { password_hash: 0 } };

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
    .find(whereClause, { password_hash: 0 })
    .skip(page > 0 ? +limit * (+page - 1) : 0)
    .limit(+limit || 20);
  const totalCount = await userModel.find().countDocuments();
  return { users, totalCount };
};

const updateOneQuery = (filter, update) => {
  return userModel.updateOne(filter, { $set: update });
};

export default {
  userQuery,
  userFindOneUpdateQuery,
  findAllQuery,
  updateOneQuery,
};
