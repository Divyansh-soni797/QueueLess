import "dotenv/config";
import { supabase } from "./supabase.js";

async function testConnection() {
  const { data, error } = await supabase
    .from("shops")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase connection failed:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log("Supabase connection successful.");
  console.log("Query executed successfully.");
}

testConnection();