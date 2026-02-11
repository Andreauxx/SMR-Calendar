"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingRequestSchema, type BookingRequest } from "@/shared/schema";
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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  startStr: string;
  endStr: string;
}

export function BookingModal({ isOpen, onClose, startStr, endStr }: BookingModalProps) {
  const reserveMutation = useReserve();
  
  const form = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      name: "",
      contact: "",
      messengerUrl: "",
      start: startStr,
      end: endStr,
    },
  });

  // Update dates when selection changes
  useEffect(() => {
    if (isOpen) {
      form.setValue("start", startStr);
      form.setValue("end", endStr);
    }
  }, [isOpen, startStr, endStr, form]);

  const onSubmit = (data: BookingRequest) => {
    reserveMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  // Safe date formatting
 const formattedDateRange = () => {
  try {
    if (!startStr || !endStr) return "";

    const start = parseISO(startStr);
    const endExclusive = parseISO(endStr);

    // subtract 1 day for display (because FullCalendar end is exclusive)
    const endInclusive = new Date(endExclusive);
    endInclusive.setDate(endInclusive.getDate() - 1);

    const sameDay = format(start, "yyyy-MM-dd") === format(endInclusive, "yyyy-MM-dd");

    return sameDay
      ? format(start, "MMM d, yyyy")
      : `${format(start, "MMM d, yyyy")} - ${format(endInclusive, "MMM d, yyyy")}`;
  } catch {
    return `${startStr} - ${endStr}`;
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-white/10 text-card-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">
            Request Booking
          </DialogTitle>
          <DialogDescription className="text-muted-foreground flex items-center gap-2 mt-2">
            <CalendarIcon className="w-4 h-4" />
            <span className="font-medium text-foreground">{formattedDateRange()}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
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
                  <FormLabel>Messenger Profile Link (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="m.me/username" 
                      className="bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {reserveMutation.isError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {reserveMutation.error instanceof Error ? reserveMutation.error.message : "An error occurred"}
              </div>
            )}

            <DialogFooter className="pt-4">
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
