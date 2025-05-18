import api from "@/lib/api";

export interface Statistics {
  totalItems: number;
  itemsByTemplate: {
    movie: number;
    tvSeries: number;
    varietyShow: number;
    book: number;
    music: number;
    podcast: number;
  };
  overallStatistics: {
    averageRating: number;
    totalRatings: number;
  };
}

export const getStatistics = (): Promise<Statistics> => 
  api.get("v1/statistics/total").json(); 