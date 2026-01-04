import { LoaderPinwheel } from "lucide-react";

export const AppLoader = () => (
    <div className="h-screen flex items-center justify-center bg-blue-50">
        <LoaderPinwheel className="w-20 h-20 animate-spin" />
    </div>
);