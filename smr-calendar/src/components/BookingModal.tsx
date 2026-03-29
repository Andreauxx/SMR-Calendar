"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bookingRequestSchema,
  type BookingRequestForm,
  type BookingRequest,
} from "@/shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReserve } from "@/hooks/use-availability";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useEffect } from "react";

function calcDaysInclusive(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const endExclusive = new Date(endStr);

  // Normalize to midnight to avoid timezone/DST shifts
  start.setHours(0, 0, 0, 0);
  endExclusive.setHours(0, 0, 0, 0);

  const diffMs = endExclusive.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)); 
  
  // Ensure at least 1 day is charged
  return Math.max(days, 1);
}

function calcDailyRate(days: number) {
  if (days <= 3) return 550;
  if (days <= 6) return 450;
  return 400;
}

function fileToDataUrl(file: File, maxMb = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      reject(new Error(`File too large. Max ${maxMb}MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}



interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  startStr: string;
  endStr: string;
}

const ADDONS = [
  {
    id: "waterproof",
    label: "Waterproof Diving Case",
    price: 100,
    value: "Waterproof Case (+100)",
  },
  {
    id: "nd",
    label: "Lens Kit (ND8, ND32, CPL, Micro)",
    price: 50,
    value: "ND Filters (+50)",
  },
  {
    id: "neck",
    label: "Magnetic Neck Mount",
    price: 80,
    value: "Magnetic Neck Mount (+80)",
  },
];





export function BookingModal({
  isOpen,
  onClose,
  startStr,
  endStr,
}: BookingModalProps) {
  const reserveMutation = useReserve();

const form = useForm<BookingRequestForm>({
  resolver: zodResolver(bookingRequestSchema),
  defaultValues: {
    name: "",
    contact: "",
    messengerUrl: "",
    start: startStr,
    end: endStr,
    package: "",
    addons: [],

    paymentProof: "",
    govIdProof: "",

    fulfillment: "Pickup",
    deliveryAddress: "",
  },
});



  const selectedAddons = form.watch("addons") ?? [];
const selectedPackage = form.watch("package") ?? "";
const PICKUP_LOCATIONS = "Shell Select Catalunan Grande / DMSF 7-Eleven";
const fulfillment = form.watch("fulfillment");

const days = startStr && endStr ? calcDaysInclusive(startStr, endStr) : 0;
const dailyRate = days ? calcDailyRate(days) : 0;

const addonsTotal = selectedAddons.reduce((sum, val) => {
  const found = ADDONS.find((a) => a.value === val);
  return sum + (found?.price ?? 0);
}, 0);

const rentalTotal = days * dailyRate;
const securityDeposit = 500; // Fixed deposit amount
const grandTotal = rentalTotal + addonsTotal + securityDeposit;

  // Update dates when selection changes
  useEffect(() => {
    if (isOpen) {
      form.setValue("start", startStr);
      form.setValue("end", endStr);
    }
  }, [isOpen, startStr, endStr, form]);

// BookingModal.tsx
const onSubmit = (data: BookingRequestForm) => {
  reserveMutation.mutate(data, {
    onSuccess: () => {
      form.reset();
      onClose();
    },
  });
};

useEffect(() => {
  if (!isOpen) return;

  form.reset({
    name: "",
    contact: "",
    messengerUrl: "",
    start: startStr,
    end: endStr,
    package: "",
    addons: [],
    paymentProof: "",
    govIdProof: "",
    fulfillment: "Pickup",
    deliveryAddress: "",
  });
}, [isOpen, startStr, endStr, form]);



  // Safe date formatting
  const formattedDateRange = () => {
    try {
      if (!startStr || !endStr) return "";

      const start = parseISO(startStr);
      const endExclusive = parseISO(endStr);

      // subtract 1 day for display (because FullCalendar end is exclusive)
      const endInclusive = new Date(endExclusive);
      endInclusive.setDate(endInclusive.getDate() - 1);

      const sameDay =
        format(start, "yyyy-MM-dd") === format(endInclusive, "yyyy-MM-dd");

      return sameDay
        ? format(start, "MMM d, yyyy")
        : `${format(start, "MMM d, yyyy")} - ${format(endInclusive, "MMM d, yyyy")}`;
    } catch {
      return `${startStr} - ${endStr}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="
  w-[95vw] sm:w-full
  max-w-2xl
  bg-card border-white/10 text-card-foreground shadow-2xl
  p-0
">
  <div className="p-6 sm:p-7 border-b border-white/10">
    <DialogHeader>
      <DialogTitle className="text-2xl font-display text-primary">
        Request Booking
      </DialogTitle>
      <DialogDescription className="text-muted-foreground flex items-center gap-2 mt-2">
        <CalendarIcon className="w-4 h-4" />
        <span className="font-medium text-foreground">{formattedDateRange()}</span>
      </DialogDescription>
    </DialogHeader>
  </div>

  {/* scrollable body */}
  <div className="max-h-[75vh] overflow-y-auto px-6 sm:px-7 py-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Top inputs: 2 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Juan dela Cruz"
                    className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 0917 123 4567"
                    className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="messengerUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Messenger Link (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="facebook.com/yourprofile"
                    className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Package */}
        <FormField
          control={form.control}
          name="package"
          render={({ field }) => (
            
            <FormItem>
              <FormLabel>Package</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-lg bg-background/50 border border-white/10 px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Package</option>
                  <option value="Action 6 Basic">Action 6 Basic</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
  control={form.control}
  name="fulfillment"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Pickup or Delivery</FormLabel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Pickup */}
        <button
          type="button"
          onClick={() => field.onChange("Pickup")}
          className={`rounded-xl border p-3 text-left transition ${
            field.value === "Pickup"
              ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              checked={field.value === "Pickup"}
              onChange={() => field.onChange("Pickup")}
              className="mt-1"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold">Pickup</div>
              <div className="text-xs text-muted-foreground">
                {PICKUP_LOCATIONS}
              </div>
            </div>
          </div>
        </button>

        {/* Delivery */}
        <button
          type="button"
          onClick={() => field.onChange("Delivery")}
          className={`rounded-xl border p-3 text-left transition ${
            field.value === "Delivery"
              ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              checked={field.value === "Delivery"}
              onChange={() => field.onChange("Delivery")}
              className="mt-1"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold">Delivery</div>
              <div className="text-xs text-muted-foreground">
                Enter delivery address (fees may apply)
              </div>
            </div>
          </div>
        </button>
      </div>

      <FormMessage />
    </FormItem>
  )}
/>

{fulfillment === "Delivery" && (
  <FormField
    control={form.control}
    name="deliveryAddress"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Delivery Address</FormLabel>
        <FormControl>
          <textarea
            {...field}
            rows={3}
            placeholder="House/Unit, Street, Barangay, City, Landmark"
            className="w-full rounded-xl bg-background/50 border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}


        {/* Add-ons: compact grid */}
        <FormField
          control={form.control}
          name="addons"
          render={({ field }) => {
            const selected = field.value ?? [];
            const toggle = (val: string) => {
              const next = selected.includes(val)
                ? selected.filter((x) => x !== val)
                : [...selected, val];
              field.onChange(next);
            };

            return (
              <FormItem>
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>Add-ons (optional)</FormLabel>
                  <div className="text-xs text-muted-foreground">
                    Click to toggle
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADDONS.map((a) => {
                    const checked = selected.includes(a.value);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggle(a.value)}
                        className={`rounded-xl border p-3 text-left transition ${
                          checked
                            ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(a.value)}
                            className="mt-1 h-4 w-4 accent-[var(--gold)]"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">
                              {a.label}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              +₱{a.price}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Days</span>
    <span className="font-semibold">{days}</span>
  </div>

  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Rate / day</span>
    <span className="font-semibold">₱{dailyRate}</span>
  </div>

  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Rental subtotal</span>
    <span className="font-semibold">₱{rentalTotal}</span>
  </div>

  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Add-ons</span>
    <span className="font-semibold">₱{addonsTotal}</span>
  </div>

  {/* NEW: Security Deposit Row */}
  <div className="flex items-center justify-between text-orange-400">
    <span className="text-sm">Security Deposit (Refundable)</span>
    <span className="font-semibold">₱{securityDeposit}</span>
  </div>

  <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
    <span className="text-sm font-semibold">Total to Pay</span>
    <span className="text-lg font-bold text-primary">₱{grandTotal}</span>
  </div>

  <p className="text-xs text-muted-foreground">
    Final amount subject to approval/verification.
  </p>
</div>


        {/* Payment section: responsive */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <div className="font-semibold text-foreground">Reservation Fee</div>
            <p className="text-sm text-muted-foreground mt-1">
              Send <span className="font-semibold text-foreground">₱100</span> via GCash and upload proof.
              Cancellations allowed up to 24 hours before the reserved date with full refund.
              No-shows/late cancellations forfeit the fee.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src="/gcash-qr.png"
              alt="GCash QR"
              className="h-40 w-40 sm:h-28 sm:w-28 rounded-xl border border-white/10 bg-white self-start"
            />
            <div className="text-sm space-y-1">
              <div className="text-muted-foreground">GCash Number</div>
              <div className="font-bold text-foreground">0917 706 5951</div>
              <div className="text-muted-foreground mt-2">Account Name</div>
              <div className="font-semibold text-foreground">SMR Prime Rentals</div>
            </div>
          </div>

          {/* Proof Upload */}
          <FormField
            control={form.control}
            name="paymentProof"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proof of Payment (screenshot)</FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-muted-foreground
                              file:mr-4 file:rounded-lg file:border-0
                              file:bg-white/10 file:px-4 file:py-2 file:text-foreground
                              hover:file:bg-white/20"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = () => field.onChange(String(reader.result));
                      reader.readAsDataURL(file);
                    }}
                  />
                </FormControl>

                {field.value ? (
                  <img
                    src={field.value}
                    alt="Payment proof preview"
                    className="mt-3 w-full max-h-[260px] object-contain rounded-xl border border-white/10 bg-black/20"
                  />
                ) : null}

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
  control={form.control}
  name="govIdProof"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Valid Government ID (required)</FormLabel>
      <FormControl>
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-muted-foreground
                   file:mr-4 file:rounded-lg file:border-0
                   file:bg-white/10 file:px-4 file:py-2 file:text-foreground
                   hover:file:bg-white/20"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
              const dataUrl = await fileToDataUrl(file, 2); // 2MB cap
              field.onChange(dataUrl);
            } catch (err) {
              form.setError("govIdProof", {
                type: "manual",
                message: err instanceof Error ? err.message : "Invalid file",
              });
            }
          }}
        />
      </FormControl>

      {field.value ? (
        <img
          src={field.value}
          alt="Government ID preview"
          className="mt-3 w-full max-h-[260px] object-contain rounded-xl border border-white/10 bg-black/20"
        />
      ) : null}

      <FormMessage />
    </FormItem>
  )}
/>

        </div>

        {/* errors */}
        {reserveMutation.isError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {reserveMutation.error instanceof Error
              ? reserveMutation.error.message
              : "An error occurred"}
          </div>
        )}

        {/* sticky footer buttons */}
        <div className="sticky bottom-0 -mx-6 sm:-mx-7 px-6 sm:px-7 py-4 bg-card/80 backdrop-blur border-t border-white/10">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={reserveMutation.isPending}
              className="hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reserveMutation.isPending}
              className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-semibold shadow-lg shadow-orange-500/20"
            >
              {reserveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  </div>
</DialogContent>

    </Dialog>
  );
}
