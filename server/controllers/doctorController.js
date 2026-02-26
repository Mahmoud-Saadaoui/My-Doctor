const { Sequelize } = require('sequelize');
const models = require('../models');


const Op = Sequelize.Op;

exports.index = async (req, res) => {
    let {q} = req.query;

    // Case-insensitive search using Op.iLike
    const searchQuery = q ? {
        [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { '$profile.specialization$': { [Op.iLike]: `%${q}%` } },
            { email: { [Op.iLike]: `%${q}%` } }
        ]
    } : {};

    try {
        const doctors = await models.User.findAll({
            where: {userType: 'doctor', ...searchQuery},
            include: [{model: models.Profile, as: "profile"}],
            attributes: {exclude: ['password']}
        })

        res.status(200).json(doctors)
    } catch (e) {
        console.log("Error fetching doctors:", e);
        res.status(500).json({errors: [{message: e.message || "حدث خطأ أثناء البحث"}]})
    }
}
