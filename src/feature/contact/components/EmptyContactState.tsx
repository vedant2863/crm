import { Users } from "lucide-react";

export default function EmptyContactState() {
  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">No contacts found</p>
      <p className="text-sm text-gray-500">
        Try adjusting your search or filters
      </p>
    </div>
  );
}
