"use client";

import { useQuery } from "@tanstack/react-query";
import { currencyService } from "@/services/currencies";
import InfiniteSelect from "@/components/ui/infinite-select";

interface CurrencySelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencySelect({ name, label, placeholder = "Select Currency", disabled }: CurrencySelectProps) {
  const { data: currenciesRes, isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => currencyService.getCurrencies(),
  });

  const options = currenciesRes?.data?.map((c) => ({
    name: `${c.code} - ${c.country}`,
    value: c.code,
  })) || [];

  return (
    <InfiniteSelect
      name={name}
      label={label}
      placeholder={placeholder}
      options={options}
      loading={isLoading}
      disabled={disabled}
    />
  );
}
