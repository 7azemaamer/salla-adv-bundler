import axios from "axios";

export const fetchPaymentMethods = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.salla.dev/admin/v2/payment/methods",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data && response.data.data) {
      // Map to simpler format with icons
      const methods = response.data.data.map((method) => ({
        id: method.id,
        name: method.name,
        slug: method.slug,
        code: method.code || method.id,
        logo: method.logo || null,
        isEnabled: method.is_enabled !== false,
      }));

      // Filter only enabled methods
      const enabledMethods = methods.filter((m) => m.isEnabled);

      return {
        success: true,
        data: enabledMethods,
      };
    }

    return {
      success: true,
      data: getDefaultPaymentMethods(), // Fallback to common methods
    };
  } catch (error) {
    console.error(
      "Fetch payment methods error:",
      error.response?.data || error.message
    );

    // Return common Saudi payment methods as fallback
    return {
      success: false,
      data: getDefaultPaymentMethods(),
      error: error.response?.data?.message || error.message,
    };
  }
};

const getDefaultPaymentMethods = () => {
  return [
    {
      id: "mada",
      name: "مدى",
      code: "mada",
      logo: null,
      isEnabled: true,
    },
    {
      id: "visa",
      name: "فيزا",
      code: "visa",
      logo: null,
      isEnabled: true,
    },
    {
      id: "mastercard",
      name: "ماستركارد",
      code: "mastercard",
      logo: null,
      isEnabled: true,
    },
    {
      id: "apple_pay",
      name: "Apple Pay",
      code: "apple_pay",
      logo: null,
      isEnabled: true,
    },
    {
      id: "stc_pay",
      name: "STC Pay",
      code: "stc_pay",
      logo: null,
      isEnabled: true,
    },
    {
      id: "tabby",
      name: "Tabby",
      code: "tabby",
      logo: null,
      isEnabled: true,
    },
    {
      id: "tamara",
      name: "Tamara",
      code: "tamara",
      logo: null,
      isEnabled: true,
    },
  ];
};

export const getPaymentMethodBadge = (method) => {
  const iconMap = {
    mada: "💳",
    visa: "💳",
    mastercard: "💳",
    apple_pay: "🍎",
    stc_pay: "📱",
    tabby: "🟡",
    tamara: "🟢",
  };

  const icon = iconMap[method.code] || "💳";

  return `
    <div class="payment-method-badge" data-method="${method.code}">
      ${
        method.logo
          ? `<img src="${method.logo}" alt="${method.name}" />`
          : `<span class="payment-icon">${icon}</span>`
      }
      <span class="payment-name">${method.name}</span>
    </div>
  `;
};


export const formatPaymentMethodsHTML = (methods) => {
  if (!methods || methods.length === 0) {
    return "";
  }

  return methods.map((method) => getPaymentMethodBadge(method)).join("");
};
