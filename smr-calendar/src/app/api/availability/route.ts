import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export const dynamic = "force-dynamic";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function addOneDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function GET() {
  try {
    const database_id = process.env.NOTION_DATABASE_ID!;

    const response = await notion.databases.query({
      database_id,
      page_size: 100,
    });

    const events = response.results
      .map((page: any) => {
        const props = page.properties;

        const dateProp = props["Booking Dates"]?.date;
        if (!dateProp?.start) return null;

        const status = props["Return Status"]?.select?.name ?? "Requested";

        const start = dateProp.start.slice(0, 10);
        const endInclusive = (dateProp.end ?? dateProp.start).slice(0, 10);

        // ✅ FullCalendar expects end EXCLUSIVE for allDay ranges
        const endExclusive = addOneDay(endInclusive);

        return {
          id: page.id,
          title: status === "Approved" ? "Reserved" : "On Hold",
          start,
          end: endExclusive,
          allDay: true,
          extendedProps: { status },
        };
      })
      .filter(Boolean);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("availability route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
