export const CHATBOT_KNOWLEDGE = {
  policies: {
    returns: {
      general: "All sales are final unless item arrives significantly damaged or incorrect",
      timeframe: "Returns must be requested within 3 days of delivery",
      process: "Email doppelsells@gmail.com with order number and photos",
      shipping: "Customers responsible for return shipping unless error is ours",
      refund: "Refunds processed within 7-10 business days after inspection",
      eligibility: "Items must be unused and in original condition with all packaging",
      nonReturnable: "Items purchased in error, due to size/color preference, or normal wear and tear are not eligible"
    },
    shipping: {
      timeframe: "5-9 days for all orders",
      cost: "FREE shipping on all orders",
      tracking: "Tracking provided via email",
      method: "Standard shipping via reliable carriers"
    },
    payment: {
      methods: "Stripe payment processing",
      security: "PCI compliant, encrypted transactions",
      requirements: "Must be signed in to purchase",
      processing: "Payment processed securely at checkout"
    }
  },
  business: {
    contact: "doppelsells@gmail.com",
    website: "https://cralluxsells.com",
    hours: "24/7 online support",
    location: "Online business",
    name: "Crallux Sells"
  },
  features: {
    referral: {
      description: "Earn credits by sharing referral links",
      percentage: "10% back in credits for referrer",
      discount: "10% off for new customers using referral",
      link: "https://cralluxsells.com/ref/[code]",
      process: "Share your unique referral link, earn credits when friends purchase"
    },
    credits: {
      description: "Use credits for discounts on purchases",
      earning: "Earn through referrals and promotions",
      usage: "Apply at checkout for instant savings",
      value: "Credits can be used for any purchase on the site"
    },
    social: {
      description: "Connect social media accounts to share content",
      platforms: "Instagram, YouTube, TikTok integration",
      features: "Link posts, track engagement, earn rewards"
    }
  },
  authenticity: {
    description: "All products are high-quality alternatives sourced from premium suppliers",
    quality: "Premium materials and construction standards",
    sourcing: "Carefully selected suppliers with quality assurance",
    disclaimer: "Products are high-quality alternatives, not claiming to be original brand items"
  }
};

export const FAQ_DATA = {
  shipping: {
    question: "How long does shipping take?",
    answer: "FREE 5-9 day shipping on all orders. Tracking provided via email."
  },
  returns: {
    question: "What's your return policy?",
    answer: "All sales are final unless item arrives damaged or incorrect. 3-day return window. Email doppelsells@gmail.com with order number and photos."
  },
  payment: {
    question: "What payment methods do you accept?",
    answer: "We use Stripe for secure payment processing. Must be signed in to purchase."
  },
  referral: {
    question: "How does the referral system work?",
    answer: "Share your referral link, earn 10% back in credits when friends purchase. They get 10% off their first order."
  },
  credits: {
    question: "How do I use credits?",
    answer: "Credits can be applied at checkout for instant discounts. Earn them through referrals and promotions."
  },
  authenticity: {
    question: "Are these authentic?",
    answer: "All products are high-quality alternatives sourced from premium suppliers with quality assurance standards."
  },
  contact: {
    question: "How do I contact support?",
    answer: "Email doppelsells@gmail.com for any questions or support needs."
  }
}; 