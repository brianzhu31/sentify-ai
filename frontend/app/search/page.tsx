import { Button } from "@/components/ui/button";
import { logout } from "./actions";

export default function Search() {
    return (
        <div className="flex-1 flex min-h-screen justify-center items-center">
            <form action={logout}>
                <Button type="submit">Logout</Button>
            </form>
        </div>
    );
}
