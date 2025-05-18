import api from "@/lib/api";

export interface Statistics {
  totalItems: number;
  itemsByTemplate: {
    varietyShow: number;
    movie: number;
    music: number;
    podcast: number;
    book: number;
    tvSeries: number;
  };
  overallStatistics: {
    averageRating: number;
    totalRatings: number;
  };
}

export const getStatistics = (): Promise<Statistics> => 
  api.get("v1/statistics/total").json(); 