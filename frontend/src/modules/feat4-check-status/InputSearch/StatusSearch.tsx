import { useState, type FormEvent } from "react";
import { searchApplications } from "../../../api/client"; // adjust path to your client.ts
import {
  StatusTabFilter,
  type StatusTypeFilter,
  type StatusStatusFilter,
} from "./StatusTabFilter";
import { StatusTabTable, type StatusTabSearchState } from "./StatusTabTable";

export function StatusSearch() {
  const [name, setName] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [typeFilter, setTypeFilter] = useState<StatusTypeFilter>("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusStatusFilter>("");

  const [search, setSearch] = useState<StatusTabSearchState>({
    status: "idle",
  });

  async function runSearch() {
    setSearch({ status: "loading" });
    try {
      const rows = await searchApplications({
        name: name.trim() || undefined,
        applicationId: applicationId.trim() || undefined,
        type: typeFilter || undefined,
        date: dateFilter || undefined,
        status: statusFilter || undefined,
      });
      setSearch({ status: "success", rows });
    } catch {
      setSearch({
        status: "error",
        message: "Something went wrong while searching applications.",
      });
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch();
  }

  return (
    <>
      <StatusTabFilter
        name={name}
        onNameChange={setName}
        applicationId={applicationId}
        onApplicationIdChange={setApplicationId}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSubmit={handleSubmit}
      />

      <StatusTabTable search={search} />
    </>
  );
}
