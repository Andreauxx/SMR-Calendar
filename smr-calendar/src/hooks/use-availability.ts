import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/routes";
import { type BookingRequestForm } from "@/shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAvailability() {
  return useQuery({
    queryKey: [api.availability.list.path],
    queryFn: async () => {
      const res = await fetch(api.availability.list.path, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch availability");

      const data = await res.json();
      return api.availability.list.responses[200].parse(data);
    },

    // refresh every 10 seconds
    refetchInterval: 10000,

    // refresh when user switches back to tab
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}


export function useReserve() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BookingRequestForm) => {
  const res = await fetch(api.reserve.create.path, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});


      if (!res.ok) {
        // Try to parse specific error message if available
        let errorMessage = "Failed to submit reservation";
        try {
          const errorData = await res.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
          // ignore parsing error
        }
        
        if (res.status === 409) {
          throw new Error("Dates are already reserved. Please refresh availability.");
        }
        throw new Error(errorMessage);
      }
      
      return await res.json(); // returns { success: boolean, message: string }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.availability.list.path] });
      toast({
        title: "Request Sent!",
        description: data.message || "We will review your booking request shortly.",
        variant: "default", // Using default styling but it will look good with our theme
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
