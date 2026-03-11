const Order = require('./../models/Order');
const Customer = require('./../models/Customer');
const Tea = require('./../models/Tea');

exports.createOrder = async (req, res) => {
  try {

    let name = req.query.name || 'Guest';
    let email = req.query.email || '';
    let phone = req.query.phone || '';
    // retrieve selected teas and quantities 
    let selection = req.query.selection || [];
    selection = Array.isArray(selection) ? selection : [selection];

    let specialInstructions = req.query.specialInstructions || '';

    // Find or create customer
    let customer = await Customer.findByEmail(email);
   
    if (!customer) {
        customer = await Customer.createAccount({ name, email, phone });
        // console.log(`NewCustomer: ${customer.name}`)
    } 
    // console.log(customer)
    // console.log(customer._id)
  
    // Calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (let teaId of selection) {
        const tea = await Tea.findById(teaId);
        const quantity = parseInt(req.query[`${teaId}_quantity`]) || 0;
        if (quantity <= 0) continue; // Skip if quantity is not valid
        const sugarLevel = req.query[`${teaId}_sugar`] || '50%';
        const iceLevel = req.query[`${teaId}_ice`] || '50%';
        let toppings = req.query[`${teaId}_toppings`] || [];  
        toppings = Array.isArray(toppings) ? toppings : [toppings];
        if (tea) {
            // console.log(tea)
            // each topping is 0.3cent
            const itemPrice = (tea.basePrice + (toppings.length * 0.3)) * quantity;
            console.log(itemPrice)
            orderItems.push({
            tea: tea._id,
            name: tea.name,
            quantity: quantity,
            sugarLevel: sugarLevel,
            iceLevel: iceLevel,
            toppings: toppings || [],
            price: itemPrice
            });
            totalPrice += itemPrice;
       }
    }

    // Create order

    const orderId = 'ORD-' + Date.now();
    const newOrder = {
      orderId: orderId,
      customer: customer._id,
      items: orderItems,
      totalPrice: totalPrice,
      specialInstructions: specialInstructions
    };

    let order = await Order.createOrder(newOrder);
    // console.log(`new order ---- ${order}`)

    await Customer.updateOrderHistory(customer._id, order._id);

    res.render('confirmation', { order, customer, orderItems });
    // res.send('ordered!')
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};


// exports.getCheckout = async (req, res) => {
//   try {
//     const cartData = req.body.cart || [];
//     let totalPrice = 0;
//     const items = [];

//     for (let item of cartData) {
//       const tea = await Tea.findById(item.teaId);
//       if (tea) {
//         const itemPrice = tea.basePrice * item.quantity;
//         items.push({
//           tea: tea,
//           quantity: item.quantity,
//           sugarLevel: item.sugarLevel,
//           iceLevel: item.iceLevel,
//           addOns: item.addOns || [],
//           price: itemPrice
//         });
//         totalPrice += itemPrice;
//       }
//     }

//     res.render('orders/checkout', { items, totalPrice });
//   } catch (error) {
//     res.status(500).render('error', { error: error.message });
//   }
// };


// exports.getOrderHistory = async (req, res) => {
//   try {
//     const customerId = req.params.customerId;
//     const orders = await Order.find({ customer: customerId })
//       .populate('items.tea')
//       .populate('customer')
//       .sort({ createdAt: -1 });

//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId)
//       .populate('items.tea')
//       .populate('customer');

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
