const { DataTypes } = require('sequelize');
const db = require('./database');

const Availability = db.define('availability', {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 6 },
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  timezone: {
    type: DataTypes.STRING(80),
    allowNull: false,
    defaultValue: 'Africa/Tunis',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'availabilities',
  timestamps: true,
});

Availability.associate = models => {
  Availability.belongsTo(models.User, { as: 'doctor', foreignKey: 'doctorId' });
};

module.exports = Availability;
