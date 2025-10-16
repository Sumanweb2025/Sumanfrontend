
/**
 * Fetch active offer from backend
 */
export const fetchActiveOffer = async () => {
  try {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const response = await fetch(`${API_URL}api/offers/active`);
    const data = await response.json();

    if (data.success && data.data) {
      const offer = data.data;
      const now = new Date();
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);

      // Check if offer is active and within date range
      if (offer.isActive && now >= startDate && now <= endDate) {
        return offer;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching active offer:', error);
    return null;
  }
};

/**
 * Check if a product is eligible for the offer
 * @param {Object} product - The product object
 * @param {Object} offer - The offer object
 * @returns {boolean} - Whether the product is eligible
 */
export const isProductEligibleForOffer = (product, offer) => {
  if (!offer) return false;

  // Check if offer has reached usage limit
  if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
    return false;
  }

  // PRIORITY 1: If specific products are selected, only those products are eligible
  if (offer.applicableProducts && offer.applicableProducts.length > 0) {
    const productId = product._id || product.product_id || product.id;
    // Handle both ObjectId strings and populated objects
    return offer.applicableProducts.some(p => {
      const offerId = p._id || p;
      return offerId.toString() === productId.toString();
    });
  }

  // PRIORITY 2: If no specific products but categories specified, check category
  if (offer.applicableCategories && offer.applicableCategories.length > 0) {
    const productCategory = product.category || product.Category || '';
    return offer.applicableCategories.some(
      cat => cat.toLowerCase() === productCategory.toLowerCase()
    );
  }

  // PRIORITY 3: If neither products nor categories specified, offer applies to all
  return true;
};

/**
 * Calculate discounted price based on offer
 * @param {number} originalPrice - Original product price
 * @param {Object} offer - The offer object
 * @returns {number} - Discounted price
 */
export const calculateDiscountedPrice = (originalPrice, offer) => {
  if (!offer || !originalPrice) return originalPrice;

  let discountedPrice = originalPrice;

  if (offer.discountType === 'percentage') {
    // Percentage discount
    const discountAmount = (originalPrice * offer.discount) / 100;
    discountedPrice = originalPrice - discountAmount;
  } else if (offer.discountType === 'fixed') {
    // Fixed amount discount
    discountedPrice = originalPrice - offer.discount;
  }

  // Ensure price doesn't go below 0
  return Math.max(0, discountedPrice);
};

/**
 * Get offer discount for display
 * @param {Object} offer - The offer object
 * @returns {string} - Discount display string (e.g., "20% OFF" or "$5 OFF")
 */
export const getOfferDiscountDisplay = (offer) => {
  if (!offer) return '';

  if (offer.discountType === 'percentage') {
    return `${offer.discount}% OFF`;
  } else {
    return `$${offer.discount} OFF`;
  }
};

/**
 * Check if order total meets minimum order requirement
 * @param {number} orderTotal - Total order amount
 * @param {Object} offer - The offer object
 * @returns {boolean} - Whether minimum is met
 */
export const meetsMinimumOrderAmount = (orderTotal, offer) => {
  if (!offer || !offer.minimumOrderAmount) return true;
  return orderTotal >= offer.minimumOrderAmount;
};
