import { apiClient, ApiResponse } from "./api-client";

export interface Country {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  phone_code: string;
  currency: string;
  flag: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export const countryService = {
  getCountries() {
    return apiClient.get<ApiResponse<Country[]>>("/countries");
  },
};
