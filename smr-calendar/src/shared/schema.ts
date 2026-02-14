import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    contact: z.string().min(7, "Contact number is required"),
    messengerUrl: z.string().optional().or(z.literal("")),
    start: z.string().min(4),
    end: z.string().min(4),

    package: z.string().min(1, "Please select a package"),
    addons: z.array(z.string()).default([]),

    // proof of payment image (optional for now)
    paymentProof: z.string().min(10, "Proof of payment is required"),
    govIdProof: z.string().min(10, "Valid government ID is required"),

    // ✅ NEW
    fulfillment: z.enum(["Pickup", "Delivery"]),
    deliveryAddress: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment === "Delivery") {
      if (!data.deliveryAddress || !data.deliveryAddress.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deliveryAddress"],
          message: "Delivery address is required for Delivery",
        });
      }
    }
  });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
