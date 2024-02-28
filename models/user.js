const bcrypt = require("bcryptjs")

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      field: "name"
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      field: "email"
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      field: "password"
    },
    mobilenumber: {
      type: Sequelize.BIGINT,
      allowNull: false,
      field: "mobile_number"
    },
    fileName: {
      type: Sequelize.STRING,
      field: "file_name"
    },
    isActive: {
      type: Sequelize.BOOLEAN
    }
  }, {
    freezeTableName: true,
    tableName: "user",
    modelName: 'user',
  });

  //associations
  User.associate = function (models) {
    User.belongsToMany(models.role, { through: models.userRole });
  }


  User.beforeCreate(function (user, options, cb) {
    if (user.password) {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
          if (err) return err
          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return err
            user.password = hash
            return resolve(user, options)
          })
        })
      })
    }
  })

  //compare password
  User.prototype.comparePassword = function (passw, cb) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) return err
        return resolve(isMatch)
      })
    })
  }
  return User;
};