export const listOfRelevantCountries = [
{ US: "United States" },
{ CN: "China" },
{ CA: "Canada" },
{ GB: "United Kingdom" },
{ JP: "Japan" },
{ IL: "Israel" },
{ BR: "Brazil" },
{ FR: "France" },
{ IE: "Ireland" },
{ DE: "Germany" },
{ MX: "Mexico" },
{ IN: "India" },
{ AU: "Australia" },
{ KR: "South Korea" },
{ SE: "Sweden" },
{ NL: "Netherlands" },
{ CH: "Switzerland" },
{ TW: "Taiwan" },
{ ZA: "South Africa" },
{ HK: "Hong Kong" },
{ SG: "Singapore" },
{ AR: "Argentina" },
{ CL: "Chile" },
{ PH: "Philippines" },
{ TR: "Turkey" },
{ IT: "Italy" },
{ ID: "Indonesia" },
{ MY: "Malaysia" },
{ LU: "Luxembourg" },
{ VN: "Vietnam" },
{ NZ: "New Zealand" },
{ DK: "Denmark" },
{ NO: "Norway" },
{ FI: "Finland" },
{ RU: "Russia" },
{ AE: "United Arab Emirates" },
];

const countryMap = Object.fromEntries(
  listOfRelevantCountries?.map((entry) => {
    const [code, name] = Object.entries(entry)[0];
    return [name, code];
  })
);

onmessage = async (event: MessageEvent) => {
  const rawData = event.data?.rawData;
  const filterList: (string | number)[] = event.data?.filterList;

  // Separate importance filters and country filters
  const importanceFilters = filterList.filter(
    (item) => typeof item === "number" && [1, 2, 3]?.includes(item as number)
  ) as number[];
  const countryFilters = filterList?.filter(
    (item) => typeof item === "string"
  ) as string[];

  // Map filterList country names to abbreviations
  const filterCodes = countryFilters?.map((name) => countryMap[name]) || [];

  // Filter rawData based on the mapped country codes and importance
  const output = rawData?.map((subArray) =>
    subArray?.filter((item) => {
      const countryMatch =
        filterCodes.length === 0 || filterCodes.includes(item?.country);
      const importanceMatch =
        importanceFilters?.length === 0 ||
        importanceFilters?.includes(item?.importance);
      return countryMatch && importanceMatch;
    })
  );

  let finalData = { output };
  postMessage({ message: "success", finalData });
};

export {};
