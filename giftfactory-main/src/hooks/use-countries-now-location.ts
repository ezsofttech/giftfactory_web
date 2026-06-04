"use client";

import { useQuery } from "@tanstack/react-query";

type CountriesNowResponse<T> = {
  error?: boolean;
  msg?: string;
  data?: T;
};

type CountryRow = { name?: string };
type StateRow = { name?: string };

export function useCountriesNowLocation(selectedCountry: string | undefined, selectedState: string | undefined) {
  const countriesQuery = useQuery({
    queryKey: ["location", "countries"],
    queryFn: async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
      if (!res.ok) throw new Error("Failed to load countries");
      const json = (await res.json()) as CountriesNowResponse<CountryRow[]>;
      const names = (json.data ?? [])
        .map((c) => c.name?.trim())
        .filter((name): name is string => Boolean(name));
      return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const statesQuery = useQuery({
    queryKey: ["location", "states", selectedCountry],
    queryFn: async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry }),
      });
      if (!res.ok) throw new Error("Failed to load states");
      const json = (await res.json()) as CountriesNowResponse<{ states?: StateRow[] }>;
      const names = (json.data?.states ?? [])
        .map((s) => s.name?.trim())
        .filter((name): name is string => Boolean(name));
      return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    },
    enabled: Boolean(selectedCountry),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const districtsQuery = useQuery({
    queryKey: ["location", "districts", selectedCountry, selectedState],
    queryFn: async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry, state: selectedState }),
      });
      if (!res.ok) throw new Error("Failed to load districts");
      const json = (await res.json()) as CountriesNowResponse<string[]>;
      const names = (json.data ?? [])
        .map((d) => d?.trim())
        .filter((name): name is string => Boolean(name));
      return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    },
    enabled: Boolean(selectedCountry && selectedState),
    staleTime: 24 * 60 * 60 * 1000,
  });

  return {
    countries: countriesQuery.data ?? [],
    states: statesQuery.data ?? [],
    districts: districtsQuery.data ?? [],
    loadingCountries: countriesQuery.isLoading,
    loadingStates: statesQuery.isLoading,
    loadingDistricts: districtsQuery.isLoading,
  };
}
