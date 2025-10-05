export const useAnalytics = () => {
  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    console.log('Analytics Event:', eventName, properties);
  };

  return { trackEvent };
};
