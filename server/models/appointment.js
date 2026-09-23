const { DataTypes } = require('sequelize');
const db = require('./database');

const Appointment = db.define('appointment', {
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startsAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
    allowNull: false,
    defaultValue: 'pending',
  },
  reason: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'appointments',
  timestamps: true,
});

Appointment.associate = models => {
  Appointment.belongsTo(models.User, { as: 'patient', foreignKey: 'patientId' });
  Appointment.belongsTo(models.User, { as: 'doctor', foreignKey: 'doctorId' });
};

module.exports = Appointment;
