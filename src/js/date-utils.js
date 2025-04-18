import { format, getHours } from "date-fns";

export const DateUtils = (() => {
    const getDayMoment = () => {
      const hour = getHours(new Date());
      if (hour < 6) return "night";
      if (hour < 12) return "morning";
      if (hour < 18) return "afternoon";
      return "evening";
    }

    const _getCurrentYear = () => {
      return new Date().getFullYear();
    }

    const getFormattedDate = (date) => {
      if (!(date instanceof Date)){
        console.error("Please pass a valid Date");
        return;
      }

      const currentYear = _getCurrentYear();

      if (date.getFullYear() > currentYear) {
        return format(date, "MMM d yyyy");
      } else {
        return format(date, "MMM d");
      }
    }

    return {
        getDayMoment,
        getFormattedDate,
    }
})();