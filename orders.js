// orders.js
const cuid = require('cuid')

const db = require('./db')

const Order = db.model('Order', {
  _id: { type: String, default: cuid },
  buyerEmail: { type: String, required: true },
  products: [{
    type: String,
    ref: 'Product', // ref will automatically fetch associated products for us
    index: true,
    required: true
  }],
  status: {
    type: String,
    index: true,
    default: 'CREATED',
    enum: ['CREATED', 'PENDING', 'COMPLETED']
  }
})


async function list(options = {}) {
    const { offset = 0, limit = 25, productId, status } = options;
  
    const productQuery = productId ? {
      products: productId
    } : {}
  
    const statusQuery = status ? {
      status,
    } : {}
  
    const query = {
      ...productQuery,
      ...statusQuery
    }
  
    const orders = await Order.find(query)
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit)
  
    return orders
}

  async function get (_id) {
    const order = await Order.findById(_id)
    .populate('product')
    .exec()
  
  return order
 }

 async function create (fields) {
    const order = await new Order(fields).save()
    await order.populate('products')
    return order
}


/**
 * Edit an order
 * @param {string} _id - The ID of the order to update
 * @param {object} change - The changes to apply
 * @returns {Promise<object>} - The updated order
 */
async function edit(_id, change) {
  const order = await get(_id);

  if (!order) {
    throw new Error(`Order with ID ${_id} not found`);
  }

  Object.keys(change).forEach((key) => {
    order[key] = change[key];
  });

  await order.save();
  return order;
}

/**
 * Delete an order
 * @param {string} _id - The ID of the order to delete
 * @returns {Promise<void>} - No return value
 */
async function destroy(_id) {
  const result = await Order.deleteOne({ _id });
  if (result.deletedCount === 0) {
    throw new Error(`Order with ID ${_id} not found`);
  }
}

module.exports = {
  create,
  get,
  list,
  edit,
  destroy,
};