"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Verification.belongsTo(models.User, {
        as: "users",
        foreignKey: "userID",
      });
    }
  }
  Verification.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      secret: DataTypes.UUID,
      userID: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Verification",
    }
  );
  return Verification;
};
