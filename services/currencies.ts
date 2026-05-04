import { apiClient, ApiResponse } from "./api-client";

export interface Currency {
  code: string;
  country: string;
  iso2: string;
  iso3: string;
}

export const currencyService = {
  getCurrencies() {
    return apiClient.get<ApiResponse<Currency[]>>("/currencies");
  },
};
