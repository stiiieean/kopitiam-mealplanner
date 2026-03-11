const Tea = require('./../models/Tea');

exports.getAllTeas = async (req, res) => {
  try {
    const teas = await Tea.retrieveAll();
    // console.log(teas)
    res.render('menu', { teas });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};

// exports.featuredTeas = async (req, res) => {
//   try {
//     const featuredTeas = await Tea.find({ isAvailable: true }).limit(6);
//     res.render('index', { featuredTeas });
//   } catch (error) {
//     res.status(500).render('error', { error: error.message });
//   }
// };

// exports.getTeaById = async (req, res) => {
//   try {
//     const tea = await Tea.findById(req.params.id);
//     if (!tea) {
//       return res.status(404).render('error', { error: 'Tea not found' });
//     }
//     res.json(tea);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getTeasByCategory = async (req, res) => {
//   try {
//     const teas = await Tea.find({ 
//       category: req.params.category,
//       isAvailable: true 
//     });
//     res.json(teas);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.searchTeas = async (req, res) => {
//   try {
//     const query = req.query.q;
//     const teas = await Tea.find({
//       $or: [
//         { name: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//         { tags: { $in: [new RegExp(query, 'i')] } }
//       ],
//       isAvailable: true
//     });
//     res.json(teas);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
