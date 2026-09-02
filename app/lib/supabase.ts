import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vraqvjbuxrlyhzedphwh.supabase.co";

const supabasePublishableKey =
  "sb_publishable_PmDyaXiXAObS4c5oDeJSkw_EnJFunZy";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);