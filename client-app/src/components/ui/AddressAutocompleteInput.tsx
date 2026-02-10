import { useEffect, useRef, type ComponentProps } from "react";
import { Input } from "./Input";

type AddressSelection = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

type AddressAutocompleteInputProps = ComponentProps<typeof Input> & {
  country?: "US" | "CA";
  onSelect?: (selection: AddressSelection) => void;
};

type GooglePlace = {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
};

const getComponentValue = (
  components: GooglePlace["address_components"],
  type: string,
  useShort = false
) => {
  const match = components?.find((component) => component.types.includes(type));
  if (!match) return "";
  return useShort ? match.short_name : match.long_name;
};

const parsePlaceAddress = (place: GooglePlace): AddressSelection => {
  const streetNumber = getComponentValue(place.address_components, "street_number");
  const route = getComponentValue(place.address_components, "route");
  const city =
    getComponentValue(place.address_components, "locality") ||
    getComponentValue(place.address_components, "postal_town") ||
    getComponentValue(place.address_components, "sublocality") ||
    getComponentValue(place.address_components, "sublocality_level_1");
  const state = getComponentValue(
    place.address_components,
    "administrative_area_level_1",
    true
  );
  const postalCode = getComponentValue(place.address_components, "postal_code");

  return {
    street: [streetNumber, route].filter(Boolean).join(" ").trim(),
    city,
    state,
    postalCode,
  };
};

export function AddressAutocompleteInput({
  country,
  onSelect,
  ...props
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const google = (window as any)?.google;
    if (!google?.maps?.places || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: country ? { country } : undefined,
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace() as GooglePlace;
      if (!place?.address_components) return;
      onSelect?.(parsePlaceAddress(place));
    });

    return () => {
      if (typeof listener?.remove === "function") {
        listener.remove();
      } else if (google?.maps?.event?.removeListener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [country, onSelect]);

  return <Input ref={inputRef} autoComplete="off" {...props} />;
}
