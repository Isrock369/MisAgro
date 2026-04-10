import FinanceClient from "@/components/FinanceClient";
import { getFinanceData } from "@/actions/finance";

export const metadata = {
  title: "Pembukuan Keuangan - Toko Obat MisAgro",
};

export default async function FinancePage() {
  const financeData = await getFinanceData();
  
  return <FinanceClient initialData={financeData} />;
}
