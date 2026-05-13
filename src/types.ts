export interface LocationValue {
  state: string;
  city: string;
  locality: string;
}

export interface PickerProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  errorFields?: string[];
}
