import { Text } from "lucide-react";

interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return (
    <div className="text-red-500">{ message }</div>
  )
}
