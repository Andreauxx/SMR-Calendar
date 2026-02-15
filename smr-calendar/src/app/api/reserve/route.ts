import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { sendNewBookingEmail } from "@/lib/email";
import { bookingRequestSchema } from "@/shared/schema";

export const runtime = "nodejs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function calcDaysInclusive(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const endExclusive = new Date(endStr);
  const endInclusive = new Date(endExclusive);
  endInclusive.setDate(endInclusive.getDate() - 1);

  start.setHours(0, 0, 0, 0);
  endInclusive.setHours(0, 0, 0, 0);

  const diffMs = endInclusive.getTime() - start.getTime();
  return Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1, 1);
}



function calcDailyRate(days: number) {
  if (days <= 3) return 550;
  if (days <= 6) return 450;
  return 400;
}

const ADDON_PRICES: Record<string, number> = {
  "Waterproof Case (+100)": 100,
  "ND Filters (+50)": 50,
  "Magnetic Neck Mount (+80)": 80,
};

export async function POST(req: Request) {
  try {
    const database_id = process.env.NOTION_DATABASE_ID!;
    const body = await req.json();

    const parsed = bookingRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid form data", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

  const {
  name,
  contact,
  messengerUrl,
  start,
  end,
  package: pkg,
  addons,
  paymentProof,
  fulfillment,
  govIdProof,
  deliveryAddress,
} = parsed.data;


    // ✅ totals (backend is source of truth)
    const days = calcDaysInclusive(start, end);
    const dailyRate = calcDailyRate(days);
    const rentalSubtotal = days * dailyRate;

    const addonsTotal = (addons ?? []).reduce(
      (sum, a) => sum + (ADDON_PRICES[a] ?? 0),
      0
    );

    const grandTotal = rentalSubtotal + addonsTotal;

    // ✅ Create page in Notion
    const createdPage = await notion.pages.create({
      parent: { database_id },
      properties: {
        "Renter Name": { title: [{ text: { content: name } }] },

        "Contact Number": { phone_number: contact },

        "Facebook / Messenger Profile": messengerUrl
          ? { url: messengerUrl }
          : { url: null },

        "Booking Dates": { date: { start, end } },

        "Return Status": { select: { name: "Requested" } },

        "Package": { select: { name: pkg } },

        "Add-ons": {
          multi_select: (addons ?? []).map((a) => ({ name: a })),
        },

        "Payment Proof Received": { checkbox: Boolean(paymentProof) },

        "Fulfillment": { select: { name: fulfillment } },

"Delivery Address":
  fulfillment === "Delivery"
    ? { rich_text: [{ text: { content: deliveryAddress || "" } }] }
    : { rich_text: [{ text: { content: "" } }] },


        // (Optional but recommended if you create these properties in Notion)
        // "Days": { number: days },
        // "Daily Rate": { number: dailyRate },
        // "Rental Subtotal": { number: rentalSubtotal },
        // "Add-ons Total": { number: addonsTotal },
        // "Grand Total": { number: grandTotal },
      },
    });

    // ✅ email
    try {
      await sendNewBookingEmail({
        name,
        contact,
        messengerUrl,
        start,
        end,
        package: pkg,
        addons: addons ?? [],
        days,
        dailyRate,
        rentalSubtotal,
        addonsTotal,
        grandTotal,
        paymentProof,
        fulfillment,
        govIdProof,
  deliveryAddress,
        notionPageUrl: (createdPage as any).url,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message:
        "Request received! We will review and confirm via your provided contact information. Thanks for choosing us!",
    });
  } catch (error) {
    console.error("reserve route error:", error);
    return NextResponse.json(
      { message: "Failed to submit request" },
      { status: 500 }
    );
  }
}
