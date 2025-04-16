import { getHours } from "date-fns";

export const DateUtils = (() => {
    const getDayMoment = () => {
      const hour = getHours(new Date());
      if (hour < 6) return "night";
      if (hour < 12) return "morning";
      if (hour < 18) return "afternoon";
      return "evening";
    }

    return {
        getDayMoment,
    }
})();