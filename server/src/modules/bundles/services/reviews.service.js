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


export const fetchStoreReviews = async (accessToken, options = {}) => {
  try {
    const {
      type = "rating",
      is_published = true,
      product_id = null,
      limit = 15, // Total reviews to fetch (will fetch multiple pages if needed)
    } = options;

    // Calculate date range (last 1 year)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const params = {
      type,
      is_published,
      start_date: startDate.toISOString().split("T")[0], // YYYY-MM-DD
      end_date: endDate.toISOString().split("T")[0],
      page: 1,
    };

    if (product_id) {
      params.products = [product_id];
    }

    // Salla API returns 15 reviews per page (fixed)
    const reviewsPerPage = 15;
    const pagesToFetch = Math.ceil(limit / reviewsPerPage);

    let allReviews = [];
    let currentPage = 1;

    console.log(
      `[fetchStoreReviews]: Fetching ${limit} reviews (${pagesToFetch} pages max)`
    );

    // Fetch multiple pages if needed
    while (allReviews.length < limit && currentPage <= pagesToFetch) {
      params.page = currentPage;

      console.log(
        `[fetchStoreReviews]: Fetching page ${currentPage}...`,
        params
      );

      const response = await axios.get(
        "https://api.salla.dev/admin/v2/reviews",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          params,
        }
      );

      const pageReviews = response.data?.data || [];
      const pagination = response.data?.pagination;

      console.log(
        `[fetchStoreReviews]: Page ${currentPage} returned ${pageReviews.length} reviews`
      );

      if (pageReviews.length === 0) {
        console.log(`[fetchStoreReviews]: No more reviews available`);
        break;
      }

      allReviews = allReviews.concat(pageReviews);

      // Check if we've reached the last page
      if (
        !pagination?.links?.next ||
        currentPage >= (pagination?.totalPages || 1)
      ) {
        console.log(`[fetchStoreReviews]: Reached last available page`);
        break;
      }

      currentPage++;
    }

    // Trim to exact limit requested
    const finalReviews = allReviews.slice(0, limit);

    console.log(
      `[fetchStoreReviews]: Total fetched: ${finalReviews.length} reviews`
    );

    if (finalReviews.length === 0) {
      return {
        success: true,
        data: DUMMY_REVIEWS,
        pagination: {
          count: DUMMY_REVIEWS.length,
          total: DUMMY_REVIEWS.length,
          perPage: 15,
          currentPage: 1,
          totalPages: 1,
          links: {},
        },
        isDummy: true,
      };
    }

    return {
      success: true,
      data: finalReviews,
      pagination: {
        count: finalReviews.length,
        total: finalReviews.length,
        perPage: 15,
        currentPage: 1,
        totalPages: 1,
      },
      isDummy: false,
    };
  } catch (error) {
    console.error("[fetchStoreReviews]: Error:", error.message);
    return {
      success: true,
      data: DUMMY_REVIEWS,
      pagination: {
        count: DUMMY_REVIEWS.length,
        total: DUMMY_REVIEWS.length,
        perPage: 15,
        currentPage: 1,
        totalPages: 1,
        links: {},
      },
      isDummy: true,
    };
  }
};

/**
 * Legacy single-page fetch (kept for backward compatibility)
 */
export const fetchStoreReviewsSinglePage = async (
  accessToken,
  options = {}
) => {
  try {
    const {
      type = "rating",
      is_published = true,
      page = 1,
      product_id = null,
    } = options;

    const params = {
      type,
      is_published,
      page,
    };

    if (product_id) {
      params.products = [product_id];
    }

    const response = await axios.get("https://api.salla.dev/admin/v2/reviews", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params,
    });

    if (response.data && response.data.data) {
      const reviews = response.data.data;

      if (reviews.length === 0) {
        return {
          success: true,
          data: DUMMY_REVIEWS,
          pagination: {
            count: DUMMY_REVIEWS.length,
            total: DUMMY_REVIEWS.length,
            perPage: 15,
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
        perPage: 15,
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

    return {
      success: true,
      data: DUMMY_REVIEWS,
      pagination: {
        count: DUMMY_REVIEWS.length,
        total: DUMMY_REVIEWS.length,
        perPage: 15,
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
