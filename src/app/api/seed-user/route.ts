import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  const email = "tarunkumarz211286@gmail.com";
  const password = "Dare2devil1@";

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY on server" },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Tarun Kumar" },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, data });
}


