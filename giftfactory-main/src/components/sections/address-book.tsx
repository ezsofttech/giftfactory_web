"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { AddressForm, type AddressFormSubmitData } from "../form";
import { fetchAddresses, addAddress, updateAddress, deleteAddress, type UpdateCustomerAddressBody } from "@/lib/api";
import type { ApiAddress } from "@/types/api";
import { apiAddressPostalCode, apiAddressStreet } from "@/types/api";
import { toast } from "sonner";

export function AddressBook() {
  const [editingAddress, setEditingAddress] = useState<ApiAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: fetchAddresses,
  });
  const addresses = (res?.data ?? []) as ApiAddress[];

  const addMutation = useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      setShowForm(false);
      toast.success("Address added");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to add address");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCustomerAddressBody }) =>
      updateAddress(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      setShowForm(false);
      setEditingAddress(null);
      toast.success("Address updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update address");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      toast.success("Address removed");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to remove address");
    },
  });

  const handleSubmit = (data: AddressFormSubmitData) => {
  const addressLine1 = (data.line ?? "").trim();
  const addressLine2 = ""; // no separate field yet
  const postalCode = (data.postal_code ?? "").trim();
  const isDefault = data.isDefault ?? false;

  const payload = {
    fullName: data.fullName,
    phone: data.phone,
    addressLine1,
    addressLine2,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode,
    isDefault,
  };
  console.log(payload);
  if (editingAddress) {
    updateMutation.mutate({ id: editingAddress._id, body: payload });
  } else {
    addMutation.mutate(payload);
  }
};

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pb-1 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" /> Saved Addresses
        </h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="rounded-full w-full sm:w-auto shrink-0"
        >
          <Plus className="h-4 w-4 mr-2 shrink-0" />
          Add New Address
        </Button>
      </div>

      {showForm ? (
        <div className="mb-6 sm:mb-8">
          <AddressForm
            initialData={
              editingAddress
                ? {
                  fullName: editingAddress.fullName,
                  phone: editingAddress.phone,
                  type:
                    editingAddress.type?.toLowerCase() === "billing"
                      ? "billing"
                      : editingAddress.type
                        ? "shipping"
                        : "billing",
                  address: apiAddressStreet(editingAddress),
                  city: editingAddress.city,
                  state: editingAddress.state,
                  zipCode: apiAddressPostalCode(editingAddress),
                  country: editingAddress.country,
                  isDefault: editingAddress.is_default,
                }
                : undefined
            }
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`rounded-xl border p-4 sm:p-5 relative transition-colors ${address.is_default ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-border/80"
                }`}
            >
              {address.is_default && (
                <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                  Default
                </span>
              )}
              <div className="font-medium text-foreground mb-2 pr-20 break-words">{apiAddressStreet(address)}</div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <div>
                  {address.city}, {address.state} {apiAddressPostalCode(address)}
                </div>
                <div>{address.country}</div>
              </div>
              <div className="flex mt-4 flex-wrap gap-2">
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateMutation.mutate({
                        id: address._id,
                        body: { isDefault: true },
                      })
                    }
                    disabled={updateMutation.isPending}
                    className="rounded-full"
                  >
                    <Star className="h-4 w-4 mr-1.5 shrink-0" />
                    Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAddress(address);
                    setShowForm(true);
                  }}
                  className="rounded-full"
                >
                  <Edit className="h-4 w-4 mr-1.5 shrink-0" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive rounded-full"
                  onClick={() => deleteMutation.mutate(address._id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="h-4 w-4 mr-1.5 shrink-0" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-10 sm:py-12 rounded-xl border border-dashed border-border bg-muted/20">
          <h3 className="text-lg font-semibold text-foreground mb-2">No saved address</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Add an address for faster checkout.</p>
          <Button onClick={() => setShowForm(true)} className="rounded-full px-6">
            Add Address
          </Button>
        </div>
      )}
    </div>
  );
}
