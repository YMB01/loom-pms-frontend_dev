import { api } from "@/lib/api";

export async function downloadReportPdf(
  path: string,
  params: Record<string, string | number | undefined>,
  filename: string,
): Promise<void> {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  ) as Record<string, string | number>;
  const { data } = await api.get(path, {
    params: clean,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
