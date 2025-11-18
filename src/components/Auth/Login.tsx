import supabase from "./supabaseClient";

supabase.from("your_table_name").select("*").limit(1)
  .then(res => console.log("Supabase Connected:", res))
  .catch(err => console.log("Supabase Error:", err));
