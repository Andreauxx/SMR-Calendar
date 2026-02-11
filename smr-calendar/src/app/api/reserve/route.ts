import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function POST(req: Request) {
  try {
    const database_id = process.env.NOTION_DATABASE_ID!;
    const { name, contact, messengerUrl, start, end } = await req.json();

    if (!name || !contact || !start || !end) {
return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await notion.pages.create({
      parent: { database_id },
      properties: {
  "Renter Name": { title: [{ text: { content: name } }] },

  // ✅ Phone property must be phone_number
  "Contact Number": { phone_number: contact },

  // ✅ URL property must be url
  "Facebook / Messenger Profile": messengerUrl ? { url: messengerUrl } : { url: null },

  "Booking Dates": { date: { start, end } },

  "Return Status": { select: { name: "Requested" } },
},
    });

    return NextResponse.json({
  success: true,
  message: "Request received! We will review and confirm via your provided contact information. Thanks for choosing us!.",
});

  } catch (error) {
    console.error("reserve route error:", error);
return NextResponse.json({ message: "Failed to submit request" }, { status: 500 });
  }
}
