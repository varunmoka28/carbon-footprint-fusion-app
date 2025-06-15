
import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { LocationInfo } from '@/hooks/usePincodeData';

interface LocationInputProps {
  locations: LocationInfo[];
  onLocationSelect: (location: LocationInfo) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  Icon: React.ElementType;
  disabled?: boolean;
}

export function LocationInput({ locations, onLocationSelect, value, onChange, placeholder, Icon, disabled }: LocationInputProps) {
  const [open, setOpen] = React.useState(false);

  const filteredLocations = React.useMemo(() => {
    if (!value) return [];
    const lowercasedSearch = value.toLowerCase();
    if (lowercasedSearch.length < 2) return [];
    return locations.filter(location =>
      location.searchableString.includes(lowercasedSearch)
    ).slice(0, 10);
  }, [value, locations]);

  React.useEffect(() => {
    setOpen(filteredLocations.length > 0 && !disabled);
  }, [filteredLocations.length, disabled]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            className="pl-10"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => { if (filteredLocations.length > 0) setOpen(true); }}
            disabled={disabled}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-[--radix-popover-anchor-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup>
              {filteredLocations.map((location) => (
                <CommandItem
                  key={`${location.pincode}-${location.name}`}
                  onSelect={() => {
                    onLocationSelect(location);
                    setOpen(false);
                  }}
                >
                  {location.name}, {location.district} - {location.pincode}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
