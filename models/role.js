module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define('role', {
      roleName: {
        type: Sequelize.STRING,
        field: "role_name",
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: "description"
      },
    }, {
      freezeTableName: true,
      tableName: "role",
      timestamps: false
    })
  
    Role.associate = function (models) {
      Role.hasMany(models.user,{foreignKey: "role_id"});
    }
  
    return Role
  }