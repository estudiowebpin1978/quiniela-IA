import { getSupabase } from '../libsupabase'
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = getSupabase()
  if (!supabase) return <div>Supabase no configurado</div>
  const { data: instruments } = await supabase.from("instruments").select();

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}