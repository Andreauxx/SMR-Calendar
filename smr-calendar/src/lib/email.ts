import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function dataUrlToAttachment(dataUrl?: string, filenameBase = "attachment") {
  if (!dataUrl) return null;

  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;

  const contentType = match[1];
  const content = match[2];

  const ext =
    contentType === "image/png" ? "png" :
    contentType === "image/jpeg" ? "jpg" :
    contentType === "image/webp" ? "webp" :
    "png";

  return {
    filename: `${filenameBase}.${ext}`,
    content,
    contentType,
  };
}


export async function sendNewBookingEmail(input: {
  name: string;
  contact: string;
  messengerUrl?: string;
  start: string;
  end: string;

  package: string;
  addons: string[];

  fulfillment: "Pickup" | "Delivery";
  deliveryAddress?: string;

  // required proofs
  paymentProof: string;
  govIdProof: string;

  // totals
  days: number;
  dailyRate: number;
  rentalSubtotal: number;
  addonsTotal: number;
  grandTotal: number;

  notionPageUrl?: string;
}) {
  const to = process.env.NOTIFY_EMAIL_TO!;
  const from = process.env.RESEND_FROM!;

  const subject = `New Booking Request: ${input.start} → ${input.end}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2 style="margin:0 0 12px">New Booking Request</h2>

      <p><b>Name:</b> ${input.name}</p>
      <p><b>Contact:</b> ${input.contact}</p>
      <p><b>Messenger:</b> ${input.messengerUrl || "-"}</p>
      <p><b>Dates:</b> ${input.start} → ${input.end}</p>
      <p><b>Package:</b> ${input.package}</p>
      <p><b>Add-ons:</b> ${input.addons.length ? input.addons.join(", ") : "-"}</p>

      <p><b>Fulfillment:</b> ${input.fulfillment}</p>
      ${
        input.fulfillment === "Delivery"
          ? `<p><b>Delivery Address:</b> ${input.deliveryAddress || "-"}</p>`
          : `<p><b>Pickup Location:</b> Shell Select Bangkal / 7-Eleven Tahimik Avenue</p>`
      }

      <hr />

      <p><b>Days:</b> ${input.days}</p>
      <p><b>Rate / Day:</b> ₱${input.dailyRate}</p>
      <p><b>Rental Subtotal:</b> ₱${input.rentalSubtotal}</p>
      <p><b>Add-ons Total:</b> ₱${input.addonsTotal}</p>

      <p style="font-size:18px;">
        <b>Total Amount: ₱${input.grandTotal}</b>
      </p>

      ${input.notionPageUrl ? `<p><a href="${input.notionPageUrl}">Open in Notion</a></p>` : ""}

      <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
      <p style="color:#666;font-size:12px;margin:0">
        SMR Prime Rentals — Availability Site
      </p>
    </div>
  `;

 const attachments = [
  dataUrlToAttachment(input.paymentProof, "payment-proof"),
  dataUrlToAttachment(input.govIdProof, "government-id"),
].filter(Boolean);


  await resend.emails.send({
    from,
    to,
    subject,
    html,
    attachments: attachments.length ? (attachments as any) : undefined,
  });
}
