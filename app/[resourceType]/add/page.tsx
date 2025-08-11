// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import ErrorMessage from "@/components/common/ErrorMessage";
import { AddGenericForm } from "@/components/form/AddGenericForm";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import useAddHandleSubmit from "@/hooks/useAddHandleSubmit";
import useGenerateQueryParams from "@/hooks/useGenerateQueryParams";
import useHandleSearch from "@/hooks/useHandleSearch";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { resourceDataMap } from "@/types/formDataMap";
import { Box } from "@chakra-ui/react";
import { useParams } from "next/navigation";

export default function AddResource() {
  const params = useParams();
  const resourceType = Object.values(RESOURCE_TYPE).includes(
    params.resourceType as RESOURCE_TYPE
  )
    ? (params.resourceType as RESOURCE_TYPE)
    : null;

  const { authToken } = useFetcherParams();

  const handleSearch = useHandleSearch(resourceType);
  const handleSubmit = useAddHandleSubmit(resourceType, authToken);
  const generateQueryParams = useGenerateQueryParams(resourceType);

  const returnPage =
    typeof window !== "undefined"
      ? sessionStorage.getItem("returnPageNumber")
      : null;

  const breadcrumbBackHref = returnPage
    ? `/${resourceType}?page=${returnPage}`
    : `/${resourceType}`;

  return (
    <Box p={6}>
      <DynamicBreadcrumb backLinkOverride={breadcrumbBackHref} />
      {!resourceType ? (
        <ErrorMessage
          message={"Invalid resource type provided. Please check the URL."}
        />
      ) : handleSearch && handleSubmit && generateQueryParams ? (
        <>
          <h1>{resourceType.toUpperCase()} Registration</h1>
          <AddGenericForm
            fields={resourceDataMap[resourceType]}
            handleSearch={handleSearch}
            handleSubmit={handleSubmit}
            generateQueryParams={generateQueryParams}
          />
        </>
      ) : (
        <ErrorMessage message="An internal error occurred: Required functions are missing." />
      )}
    </Box>
  );
}
