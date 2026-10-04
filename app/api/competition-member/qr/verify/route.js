import { NextResponse } from "next/server";
import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";

export async function POST(request) {
  try {
    // -----------------------------------------
    // 1. Get access token
    // -----------------------------------------
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // 2. Get QR token
    // -----------------------------------------
    const body = await request.json();

    const qrToken = body.qrToken;

    if (!qrToken) {
      return NextResponse.json(
        {
          error: "QR token is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 3. Authenticate user
    // -----------------------------------------
    const authClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            userError?.message ||
            "Authentication failed.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // 4. Supabase client with user's JWT
    // -----------------------------------------
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    // -----------------------------------------
    // 5. Verify QR
    // -----------------------------------------
    const {
      data,
      error,
    } = await supabase.rpc(
      "verify_eventnest_qr",
      {
        target_qr_token: qrToken,
      }
    );

    if (error) {
      console.error(
        "QR verification RPC error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    const result = Array.isArray(data)
      ? data[0]
      : data;

    if (!result) {
      return NextResponse.json(
        {
          error:
            "QR verification returned no result.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 6. Return verification result
    // -----------------------------------------
    return NextResponse.json({
      success: result.result_success,
      message: result.result_message,

      ticket: {
        id: result.result_ticket_id,
        ticket_number:
          result.result_ticket_number,
      },

      registration: {
        id: result.result_registration_id,
        registration_number:
          result.result_registration_number,
      },

      participant: {
        name:
          result.result_participant_name,
      },

      competition: {
        name:
          result.result_competition_name,
      },

      checked_in_at:
        result.result_checked_in_at || null,
    });
  } catch (error) {
    console.error(
      "QR verification API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}