// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { COUNTRY_NAME_TO_ISO } from "@/libs/maps/country_name_to_iso";

export const genreOptions = [
  { value: "", label: "All" },
  { value: "rock", label: "Rock" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "pop", label: "Pop" },
  { value: "electronic", label: "Electronic" },
];

export const countryOptions = [
  { value: "", label: "All" },
  ...Object.entries(COUNTRY_NAME_TO_ISO).map(([iso, labels]) => ({
    value: iso,
    label: labels[0],
  })),
];
