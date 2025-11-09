import axios from "axios";

/**
 * Dummy reviews to display when no real reviews exist
 */
const DUMMY_REVIEWS = [
  {
    id: 9999001,
    type: "rating",
    rating: 5,
    content: "منتج رائع جداً، جودة ممتازة والتوصيل كان سريع. أنصح بشدة!",
    order_id: null,
    is_published: true,
    created_at: "2025-09-15 14:23:10",
    customer: {
      id: 1001,
      name: "نورة العتيبي",
      mobile: 966500000001,
      email: "noura@example.com",
      avatar:
        "https://cdn.assets.salla.network/admin/cp/assets/images/avatar_male.png",
      country: "السعودية",
      city: "الرياض",
    },
  },
  {
    id: 9999002,
    type: "rating",
    rating: 5,
    content: "ممتاز! استخدمته كل يوم. الجودة عالية والسعر معقول جداً.",
    order_id: null,
    is_published: true,
    created_at: "2025-09-22 10:45:33",
    customer: {
      id: 1002,
      name: "عبدالرحمن السالم",
      mobile: 966500000002,
      email: "abdulrahman@example.com",
      avatar:
        "https://cdn.assets.salla.network/admin/cp/assets/images/avatar_male.png",
      country: "السعودية",
      city: "جدة",
    },
  },
  {
    id: 9999003,
    type: "rating",
    rating: 4,
    content: "جيد جداً. الجودة ممتازة، التغليف كان احترافي. سعيدة بالشراء.",
    order_id: null,
    is_published: true,
    created_at: "2025-09-28 16:12:45",
    customer: {
      id: 1003,
      name: "مها الشمري",
      mobile: 966500000003,
      email: "maha@example.com",
      avatar:
        "https://cdn.assets.salla.network/admin/cp/assets/images/avatar_male.png",
      country: "السعودية",
      city: "الدمام",
    },
  },
  {
    id: 9999004,
    type: "rating",
    rating: 5,
    content:
      "أفضل عملية شراء! المنتج فاق توقعاتي، التوصيل سريع والخدمة ممتازة.",
    order_id: null,
    is_published: true,
    created_at: "2025-10-03 09:30:22",
    customer: {
      id: 1004,
      name: "فيصل القحطاني",
      mobile: 966500000004,
      email: "faisal@example.com",
      avatar:
        "https://cdn.assets.salla.network/admin/cp/assets/images/avatar_male.png",
      country: "السعودية",
      city: "الخبر",
    },
  },
];

/**
 * Fetch reviews from Salla API
 * @param {string} accessToken - Salla merchant access token
 * @param {object} options - Query options
 * @returns {Promise<object>} Reviews data
 */
export const fetchStoreReviews = async (accessToken, options = {}) => {
  try {
    const {
      type = "rating", // rating, ask, shipping, testimonial
      is_published = true,
      per_page = 10,
      page = 1,
      product_id = null,
    } = options;

    const params = {
      type,
      is_published,
      per_page,
      page,
      sort: "created_at", // Sort by creation date
      order: "desc", // Latest first
    };

    // Add product_id filter if provided
    if (product_id) {
      params.products = product_id;
    }

    const response = await axios.get("https://api.salla.dev/admin/v2/reviews", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params,
    });

    if (response.data && response.data.data) {
      // Return all reviews without filtering by rating
      // This ensures we get the full count requested in per_page
      const reviews = response.data.data;

      if (reviews.length === 0) {
        return {
          success: true,
          data: DUMMY_REVIEWS,
          pagination: {
            count: DUMMY_REVIEWS.length,
            total: DUMMY_REVIEWS.length,
            perPage: 20,
            currentPage: 1,
            totalPages: 1,
            links: {},
          },
          isDummy: true,
        };
      }

      return {
        success: true,
        data: reviews,
        pagination: response.data.pagination || null,
        isDummy: false,
      };
    }

    // If API response has no data, return dummy reviews
    return {
      success: true,
      data: DUMMY_REVIEWS,
      pagination: {
        count: DUMMY_REVIEWS.length,
        total: DUMMY_REVIEWS.length,
        perPage: 20,
        currentPage: 1,
        totalPages: 1,
        links: {},
      },
      isDummy: true,
    };
  } catch (error) {
    console.error(
      "Fetch reviews error:",
      error.response?.data || error.message
    );

    // Return dummy reviews on error
    return {
      success: true,
      data: DUMMY_REVIEWS,
      pagination: {
        count: DUMMY_REVIEWS.length,
        total: DUMMY_REVIEWS.length,
        perPage: 20,
        currentPage: 1,
        totalPages: 1,
        links: {},
      },
      isDummy: true,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Format review for display
 * @param {object} review - Raw review from Salla API
 * @returns {object} Formatted review
 */
export const formatReview = (review) => {
  return {
    id: review.id,
    rating: review.rating || 5,
    content: review.content || "",
    customerName: review.customer?.name || "عميل مجهول",
    customerAvatar: review.customer?.avatar || null,
    customerCity: review.customer?.city || null,
    createdAt: review.created_at,
    // Calculate relative time
    timeAgo: calculateTimeAgo(review.created_at),
  };
};

/**
 * Calculate relative time ago
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time in Arabic
 */
const calculateTimeAgo = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 60) {
      return `منذ ${diffMins} دقيقة`;
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else if (diffDays < 30) {
      return `منذ ${diffDays} يوم`;
    } else {
      return `منذ ${diffMonths} شهر`;
    }
  } catch (error) {
    return "مؤخراً";
  }
};

/**
 * Get reviews statistics
 * @param {array} reviews - Array of reviews
 * @returns {object} Statistics
 */
export const getReviewsStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      total: 0,
      averageRating: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  reviews.forEach((review) => {
    const rating = review.rating || 0;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
      totalRating += rating;
    }
  });

  return {
    total: reviews.length,
    averageRating: (totalRating / reviews.length).toFixed(1),
    distribution,
  };
};
